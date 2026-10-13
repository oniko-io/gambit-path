import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type PieceSymbol } from 'chess.js'
import type { DrawShape } from 'chessground/draw'
import type { Color, Key } from 'chessground/types'
import type { MistakeTag, MoveReview } from '../lib/analysis.ts'
import { pickBotMove } from '../lib/bot.ts'
import { Engine } from '../lib/engine.ts'
import type { Outcome } from '../lib/games.ts'
import { findHazard, PIECE_VALUE, type Hazard } from '../lib/hazards.ts'
import { legalDests } from '../lib/position.ts'
import { Board } from './Board.tsx'
import { GameSummary } from './GameSummary.tsx'

// a bot that answers instantly is hard to follow
const BOT_DELAY_MS = 600

// U+FE0E keeps Android from drawing these as emoji
const GLYPH: Record<PieceSymbol, string> = {
  p: '♟︎',
  n: '♞︎',
  b: '♝︎',
  r: '♜︎',
  q: '♛︎',
  k: '♚︎',
}

export interface GameConfig {
  /** Side the learner plays. */
  color: Color
  level: number
  guard: boolean
}

interface Props {
  config: GameConfig
  onGameOver: (outcome: Outcome) => void
  onReviewed: (tags: MistakeTag[]) => void
  onNewGame: () => void
  onExit: () => void
}

interface Pending {
  from: Key
  to: Key
  fen: string
  hazard: Hazard
}

/** Pieces one side has captured, plus how far that side is ahead in material. */
function Tray({ label, pieces, color, lead }: { label: string; pieces: PieceSymbol[]; color: Color; lead: number }) {
  return (
    <div className="tray">
      <span className="muted">{label}</span>
      {pieces.length > 0 && (
        <span className={`tray-pieces ${color}`}>{pieces.map((p) => GLYPH[p]).join('')}</span>
      )}
      {lead > 0 && <span className="muted">+{lead}</span>}
    </div>
  )
}

function describeEnd(chess: Chess, me: 'w' | 'b'): { outcome: Outcome; text: string } {
  if (chess.isCheckmate()) {
    return chess.turn() === me
      ? { outcome: 'loss', text: 'Checkmate. You lost this one.' }
      : { outcome: 'win', text: 'Checkmate. You won.' }
  }
  if (chess.isStalemate()) {
    return { outcome: 'draw', text: 'Stalemate: no legal move, but no check. A draw.' }
  }
  if (chess.isInsufficientMaterial()) {
    return { outcome: 'draw', text: 'Draw: not enough pieces left to checkmate.' }
  }
  if (chess.isThreefoldRepetition()) {
    return { outcome: 'draw', text: 'Draw: the same position came up three times.' }
  }
  return { outcome: 'draw', text: 'Draw: fifty moves without a capture or pawn move.' }
}

export function GameScreen({ config, onGameOver, onReviewed, onNewGame, onExit }: Props) {
  const { color, level, guard } = config
  const me = color === 'white' ? 'w' : 'b'
  const bot: Color = color === 'white' ? 'black' : 'white'
  const game = useRef(new Chess())
  const engine = useRef<Engine | null>(null)
  // bumped on undo and unmount, so a late bot move is dropped
  const turnToken = useRef(0)
  const [fen, setFen] = useState(() => game.current.fen())
  const [pending, setPending] = useState<Pending | null>(null)
  const [thinking, setThinking] = useState(false)
  const [end, setEnd] = useState<string | null>(null)
  const [inspected, setInspected] = useState<MoveReview | null>(null)

  const finishIfOver = () => {
    if (!game.current.isGameOver()) return false
    const { outcome, text } = describeEnd(game.current, me)
    setEnd(text)
    onGameOver(outcome)
    return true
  }

  const botTurn = async () => {
    const token = ++turnToken.current
    setThinking(true)
    const [move] = await Promise.all([
      pickBotMove(game.current, level, engine.current),
      new Promise((resolve) => setTimeout(resolve, BOT_DELAY_MS)),
    ])
    if (token !== turnToken.current) return
    game.current.move(move)
    setFen(game.current.fen())
    setThinking(false)
    finishIfOver()
  }

  useEffect(() => {
    const token = turnToken
    let worker: Engine | null = null
    try {
      worker = new Engine()
    } catch {
      // no worker support: the bot falls back to random moves
    }
    engine.current = worker
    if (game.current.turn() !== me) void botTurn()
    return () => {
      token.current++
      worker?.dispose()
    }
    // runs once: the screen is remounted for every new game
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const boardFen = inspected?.fenBefore ?? pending?.fen ?? fen
  const shown = useMemo(() => new Chess(boardFen), [boardFen])
  const canMove = !pending && !thinking && !end
  const dests = useMemo(
    () => (canMove ? legalDests(shown) : new Map<Key, Key[]>()),
    [shown, canMove],
  )
  const history = useMemo(
    () => game.current.history({ verbose: true }),
    // fen changes whenever the game history does
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [fen],
  )
  const lastMove = useMemo<Key[] | undefined>(() => {
    if (inspected) return undefined
    if (pending) return [pending.from, pending.to]
    const last = history.at(-1)
    return last && [last.from, last.to]
  }, [inspected, pending, history])
  const taken = useMemo(() => {
    const byValue = (a: PieceSymbol, b: PieceSymbol) => PIECE_VALUE[b] - PIECE_VALUE[a]
    const by = (side: 'w' | 'b') =>
      history.flatMap((m) => (m.color === side && m.captured ? [m.captured] : [])).sort(byValue)
    // counted on the board, so a promoted pawn is worth what it became
    let lead = 0
    for (const piece of new Chess(fen).board().flat()) {
      if (piece) lead += piece.color === me ? PIECE_VALUE[piece.type] : -PIECE_VALUE[piece.type]
    }
    return { byMe: by(me), byBot: by(me === 'w' ? 'b' : 'w'), lead }
  }, [history, fen, me])
  const shapes = useMemo<DrawShape[]>(() => {
    if (inspected) {
      const played: DrawShape = { orig: inspected.played[0] as Key, dest: inspected.played[1] as Key, brush: 'red' }
      const best = inspected.best
      return best ? [played, { orig: best.from as Key, dest: best.to as Key, brush: 'green' }] : [played]
    }
    return pending ? [{ orig: pending.hazard.square, brush: 'red' }] : []
  }, [inspected, pending])
  const check = shown.isCheck() ? (shown.turn() === 'w' ? 'white' : 'black') : false

  const commit = (from: Key, to: Key) => {
    game.current.move({ from, to, promotion: 'q' })
    setPending(null)
    setFen(game.current.fen())
    if (!finishIfOver()) void botTurn()
  }

  const handleMove = (from: Key, to: Key) => {
    if (guard) {
      const trial = new Chess(fen)
      const played = trial.move({ from, to, promotion: 'q' })
      const hazard = trial.isGameOver() ? null : findHazard(trial, played)
      if (hazard) {
        setPending({ from, to, fen: trial.fen(), hazard })
        return
      }
    }
    commit(from, to)
  }

  const undo = () => {
    turnToken.current++
    game.current.undo()
    game.current.undo()
    setFen(game.current.fen())
  }

  // as black the bot's first move stays on the board
  const canUndo = canMove && history.length >= (me === 'w' ? 2 : 3)

  return (
    <main className="screen">
      <header className="lesson-bar">
        <button className="ghost" onClick={onExit} aria-label="Back to path">
          ←
        </button>
        <span>You vs Bot</span>
        <span className="muted">Level {level}</span>
      </header>

      <p className="goal">
        {inspected
          ? `Move ${inspected.moveNumber}, before you played ${inspected.san}.`
          : end
            ? 'Game over.'
            : thinking
              ? 'Bot is thinking…'
              : pending
                ? 'Wait. Look again.'
                : `Your move. You are ${color}.`}
      </p>

      <Tray label="Bot took" pieces={taken.byBot} color={color} lead={-taken.lead} />

      <Board
        fen={boardFen}
        color={color}
        dests={dests}
        shapes={shapes}
        lastMove={lastMove}
        check={check}
        onMove={handleMove}
      />

      <Tray label="You took" pieces={taken.byMe} color={bot} lead={taken.lead} />

      {pending && (
        <div className="result">
          <p>{pending.hazard.text}</p>
          <div className="actions">
            <button className="primary" onClick={() => setPending(null)}>
              Take back
            </button>
            <button onClick={() => commit(pending.from, pending.to)}>Play it anyway</button>
          </div>
        </div>
      )}

      {end && (
        <GameSummary
          resultText={end}
          moves={history}
          color={me}
          engine={engine.current}
          onInspect={setInspected}
          onReviewed={onReviewed}
          onNewGame={onNewGame}
          onExit={onExit}
        />
      )}

      {!pending && !end && (
        <div className="status">
          <button onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button onClick={onNewGame}>Quit game</button>
        </div>
      )}
    </main>
  )
}
