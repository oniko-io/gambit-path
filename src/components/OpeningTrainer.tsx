import { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import type { Opening } from '../openings/lines.ts'
import { legalDests } from '../lib/position.ts'
import { Board } from './Board.tsx'

const REPLY_DELAY_MS = 700
const WRONG_MOVE_MS = 900

interface Props {
  opening: Opening
  onDone: (rating: number) => void
  onExit: () => void
}

/** intro → learn (moves shown) → recap → quiz (from memory) */
type Mode = 'intro' | 'learn' | 'quiz'

const ratingFor = (mistakes: number) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1)

export function OpeningTrainer({ opening, onDone, onExit }: Props) {
  const { moves, side } = opening
  const [mode, setMode] = useState<Mode>('intro')
  const [ply, setPly] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [hint, setHint] = useState(false)
  const [wrong, setWrong] = useState<{ fen: string; move: Key[] } | null>(null)

  const position = useMemo(() => {
    const chess = new Chess()
    for (const m of moves.slice(0, ply)) chess.move(m.san)
    return chess
  }, [moves, ply])
  const finished = ply === moves.length
  const myTurn = !finished && (ply % 2 === 0) === (side === 'white')
  const expected = useMemo(() => {
    if (finished) return null
    const { from, to } = new Chess(position.fen()).move(moves[ply].san)
    return [from, to] as Key[]
  }, [position, moves, ply, finished])

  useEffect(() => {
    if (mode === 'intro' || finished || myTurn) return
    const timer = setTimeout(() => {
      setPly(ply + 1)
      if (mode === 'quiz' && ply + 1 === moves.length) onDone(ratingFor(mistakes))
    }, REPLY_DELAY_MS)
    return () => clearTimeout(timer)
  }, [mode, finished, myTurn, ply, moves.length, mistakes, onDone])

  useEffect(() => {
    if (!wrong) return
    const timer = setTimeout(() => setWrong(null), WRONG_MOVE_MS)
    return () => clearTimeout(timer)
  }, [wrong])

  const start = (next: Mode) => {
    setMode(next)
    setPly(0)
    setMistakes(0)
    setHint(false)
    setWrong(null)
  }

  const handleMove = (from: Key, to: Key) => {
    const trial = new Chess(position.fen())
    const played = trial.move({ from, to, promotion: 'q' })
    if (played.san !== moves[ply].san) {
      setWrong({ fen: trial.fen(), move: [from, to] })
      setMistakes(mistakes + 1)
      setHint(true)
      return
    }
    setHint(false)
    setPly(ply + 1)
    if (mode === 'quiz' && ply + 1 === moves.length) onDone(ratingFor(mistakes))
  }

  const dests = useMemo(
    () => (myTurn && !wrong && mode !== 'intro' ? legalDests(position) : new Map<Key, Key[]>()),
    [position, myTurn, wrong, mode],
  )
  const showMove = myTurn && !wrong && (mode === 'learn' || hint)
  const shapes = useMemo<DrawShape[]>(
    () => (showMove && expected ? [{ orig: expected[0], dest: expected[1], brush: 'green' }] : []),
    [showMove, expected],
  )
  const lastMove = useMemo<Key[] | undefined>(() => {
    if (wrong) return wrong.move
    const last = position.history({ verbose: true }).at(-1)
    return last && [last.from, last.to]
  }, [position, wrong])

  if (mode === 'intro') {
    return (
      <main className="screen card-screen">
        <h1>{opening.title}</h1>
        <p className="muted">You play {side}.</p>
        <p>{opening.idea}</p>
        <p className="muted">
          Moves are written short: N knight, B bishop, R rook, Q queen, K king, no letter for a pawn. x means
          takes, O-O means castle.
        </p>
        <div className="actions">
          <button className="primary" onClick={() => start('learn')}>
            Start
          </button>
          <button onClick={onExit}>Back</button>
        </div>
      </main>
    )
  }

  const previous = ply > 0 ? moves[ply - 1] : null
  const previousWasMine = (ply % 2 === 1) === (side === 'white')
  const opponent = side === 'white' ? 'Black' : 'White'
  const rating = ratingFor(mistakes)

  return (
    <main className="screen">
      <header className="lesson-bar">
        <button className="ghost" onClick={onExit} aria-label="Back to path">
          ←
        </button>
        <span>{opening.title}</span>
        <span className="muted">{mode === 'learn' ? 'Learn' : 'From memory'}</span>
      </header>

      <p className="goal">
        Move {Math.min(Math.floor(ply / 2) + 1, Math.ceil(moves.length / 2))} of {Math.ceil(moves.length / 2)}
      </p>

      <Board
        fen={wrong?.fen ?? position.fen()}
        color={side}
        dests={dests}
        shapes={shapes}
        lastMove={lastMove}
        onMove={handleMove}
      />

      {wrong && <p className="tip wrong">Not the plan here. Watch the arrow.</p>}

      {!wrong && previous && (
        <p className="tip">
          <strong>
            {previousWasMine ? 'You' : opponent} played {previous.san}.
          </strong>{' '}
          {previous.note}
        </p>
      )}

      {!wrong && myTurn && (
        <p className="tip">
          {showMove ? (
            <>
              <strong>Play {moves[ply].san}.</strong> {moves[ply].note}
            </>
          ) : (
            'Your move. What comes next?'
          )}
        </p>
      )}

      {finished && mode === 'learn' && (
        <div className="result">
          <p>That is the whole line. Now play it without the arrows.</p>
          <div className="actions">
            <button className="primary" onClick={() => start('quiz')}>
              From memory
            </button>
            <button onClick={() => start('learn')}>Once more</button>
          </div>
        </div>
      )}

      {finished && mode === 'quiz' && (
        <div className="result">
          <div className="rating" aria-label={`${rating} of 3 stars`}>
            {'★'.repeat(rating)}
            <span className="dim">{'★'.repeat(3 - rating)}</span>
          </div>
          <p>{mistakes === 0 ? 'Perfect. You know this line.' : `${mistakes} wrong ${mistakes === 1 ? 'move' : 'moves'}.`}</p>
          <div className="actions">
            <button className="primary" onClick={onExit}>
              Back to path
            </button>
            {rating < 3 && <button onClick={() => start('quiz')}>Try again</button>}
          </div>
        </div>
      )}
    </main>
  )
}
