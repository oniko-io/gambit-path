import type { Chess, Move, PieceSymbol, Square } from 'chess.js'

export const PIECE_VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
export const PIECE_NAME: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

export interface Hazard {
  square: Square
  text: string
  /** True when the danger is a mate in one, not a lost piece. */
  mate: boolean
}

/**
 * What the side to move can punish right now: a mate in one, or else the most
 * valuable piece that is undefended or attacked by something cheaper. Pawns are ignored.
 * `position` is the board after the learner's move `played`, opponent to play.
 */
export function findHazard(position: Chess, played: Move): Hazard | null {
  const defender = position.turn() === 'w' ? 'b' : 'w'
  const replies = position.moves({ verbose: true })
  for (const m of replies) {
    position.move(m)
    const mate = position.isCheckmate()
    position.undo()
    if (mate) return { square: m.to, mate: true, text: 'This lets your opponent checkmate you on the next move.' }
  }
  let worst: { square: Square; victim: PieceSymbol; free: boolean } | null = null
  for (const m of replies) {
    if (!m.captured || m.captured === 'p' || m.isEnPassant()) continue
    const free = !position.isAttacked(m.to, defender)
    if (!free && PIECE_VALUE[m.piece] >= PIECE_VALUE[m.captured]) continue
    // a recapture after the learner took something at least as valuable is a fair trade
    if (m.to === played.to && played.captured && PIECE_VALUE[played.captured] >= PIECE_VALUE[m.captured]) continue
    if (!worst || PIECE_VALUE[m.captured] > PIECE_VALUE[worst.victim]) {
      worst = { square: m.to, victim: m.captured, free }
    }
  }
  if (!worst) return null
  return {
    square: worst.square,
    mate: false,
    text: worst.free
      ? `Your ${PIECE_NAME[worst.victim]} on ${worst.square} is undefended and can be captured.`
      : `Your ${PIECE_NAME[worst.victim]} on ${worst.square} can be captured by a cheaper piece.`,
  }
}
