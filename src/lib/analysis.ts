import { Chess, type Color, type Move } from 'chess.js'
import type { Engine } from './engine.ts'
import { findHazard, PIECE_NAME, PIECE_VALUE } from './hazards.ts'

const DEPTH = 10
// evaluations are capped so that "winning" versus "winning even more" does not count as a mistake
const CAP = 1000
const INACCURACY = 70
const MISTAKE = 150
const BLUNDER = 300

export type MoveKind = 'good' | 'inaccuracy' | 'mistake' | 'blunder'
/** Why a move was bad. Counted across games to find what the learner should practise. */
export type MistakeTag = 'hung' | 'allowed-mate' | 'missed-mate' | 'missed-win' | 'other'

export interface MoveReview {
  moveNumber: number
  san: string
  fenBefore: string
  played: [string, string]
  best: { san: string; from: string; to: string } | null
  /** Centipawns given away by this move, 0 or more. */
  loss: number
  kind: MoveKind
  tag: MistakeTag
  text: string
}

export interface GameReview {
  moves: MoveReview[]
  /** The worst moves, at most three, biggest loss first. */
  moments: MoveReview[]
  takeaway: string
}

const TAKEAWAY: Record<MistakeTag, string> = {
  hung: 'Main lesson: before you let go of a piece, ask what your opponent can capture next.',
  'allowed-mate': 'Main lesson: before each move, check whether your opponent has a check that ends the game.',
  'missed-mate': 'Main lesson: when the enemy king is short of squares, look at every check first.',
  'missed-win': 'Main lesson: each turn, scan for enemy pieces you can take for free.',
  other: 'Main lesson: when you have time, compare two or three moves before choosing.',
}

/** Engine score for the side to move, capped, with finished games scored directly. */
async function scoreOf(fen: string, engine: Engine) {
  const chess = new Chess(fen)
  if (chess.isCheckmate()) return { score: -CAP, mate: null, best: null }
  if (chess.isGameOver()) return { score: 0, mate: null, best: null }
  const { cp, mate, best } = await engine.analyse(fen, DEPTH)
  const score = mate !== null ? Math.sign(mate) * CAP : Math.max(-CAP, Math.min(CAP, cp))
  return { score, mate, best }
}

/**
 * Reviews every move `color` played. `moves` is the verbose game history.
 * Returns null if `isCancelled` turns true or the engine fails.
 */
export async function reviewGame(
  moves: Move[],
  color: Color,
  engine: Engine,
  onProgress: (done: number, total: number) => void,
  isCancelled: () => boolean,
): Promise<GameReview | null> {
  const fens = moves.length ? [moves[0].before, ...moves.map((m) => m.after)] : []
  const scores: Awaited<ReturnType<typeof scoreOf>>[] = []
  try {
    for (const fen of fens) {
      if (isCancelled()) return null
      scores.push(await scoreOf(fen, engine))
      onProgress(scores.length, fens.length)
    }
  } catch {
    return null
  }

  const reviews: MoveReview[] = []
  moves.forEach((move, i) => {
    if (move.color !== color) return
    const before = scores[i]
    // the next position is scored for the opponent, so flip it
    const loss = Math.max(0, before.score + scores[i + 1].score)
    const bestUci = before.best
    const bestMove =
      bestUci && bestUci !== move.lan
        ? new Chess(move.before).move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci[4] })
        : null
    const kind: MoveKind =
      !bestMove || loss < INACCURACY ? 'good' : loss < MISTAKE ? 'inaccuracy' : loss < BLUNDER ? 'mistake' : 'blunder'

    let tag: MistakeTag = 'other'
    let text = 'A stronger move was available.'
    const hazard = move.after && !new Chess(move.after).isGameOver() ? findHazard(new Chess(move.after), move) : null
    if (hazard) {
      tag = hazard.mate ? 'allowed-mate' : 'hung'
      text = hazard.text
    } else if (before.mate !== null && before.mate > 0) {
      tag = 'missed-mate'
      text = before.mate === 1 ? 'You had checkmate in one move.' : `You had a forced checkmate in ${before.mate} moves.`
    } else if (bestMove?.captured && PIECE_VALUE[bestMove.captured] >= 3) {
      tag = 'missed-win'
      text = `You could have captured the ${PIECE_NAME[bestMove.captured]} on ${bestMove.to}.`
    }

    reviews.push({
      moveNumber: Math.floor(i / 2) + 1,
      san: move.san,
      fenBefore: move.before,
      played: [move.from, move.to],
      best: bestMove && { san: bestMove.san, from: bestMove.from, to: bestMove.to },
      loss,
      kind,
      tag,
      text,
    })
  })

  const moments = reviews
    .filter((r) => r.kind !== 'good')
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 3)
  const serious = reviews.filter((r) => r.kind === 'mistake' || r.kind === 'blunder')
  const counts = new Map<MistakeTag, number>()
  for (const r of serious) counts.set(r.tag, (counts.get(r.tag) ?? 0) + 1)
  const top = [...counts].sort((a, b) => b[1] - a[1])[0]
  return {
    moves: reviews,
    moments,
    takeaway: top ? TAKEAWAY[top[0]] : 'No serious mistakes. A clean game.',
  }
}
