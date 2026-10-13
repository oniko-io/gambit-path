import { useEffect, useState } from 'react'
import type { Color, Move } from 'chess.js'
import { reviewGame, type GameReview, type MistakeTag, type MoveReview } from '../lib/analysis.ts'
import type { Engine } from '../lib/engine.ts'

interface Props {
  resultText: string
  moves: Move[]
  color: Color
  engine: Engine | null
  /** Show one reviewed move on the board, or null to return to the final position. */
  onInspect: (move: MoveReview | null) => void
  onReviewed: (tags: MistakeTag[]) => void
  onNewGame: () => void
  onExit: () => void
}

type State = { status: 'working'; done: number; total: number } | { status: 'failed' } | { status: 'ready'; review: GameReview }

const count = (review: GameReview, kind: MoveReview['kind'], one: string, many: string) => {
  const n = review.moves.filter((m) => m.kind === kind).length
  return `${n} ${n === 1 ? one : many}`
}

export function GameSummary({ resultText, moves, color, engine, onInspect, onReviewed, onNewGame, onExit }: Props) {
  const [state, setState] = useState<State>({ status: 'working', done: 0, total: moves.length + 1 })
  const [open, setOpen] = useState<MoveReview | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const review = engine
        ? await reviewGame(moves, color, engine, (done, total) => !cancelled && setState({ status: 'working', done, total }), () => cancelled)
        : null
      if (cancelled) return
      if (!review) return setState({ status: 'failed' })
      setState({ status: 'ready', review })
      onReviewed(review.moves.filter((m) => m.kind === 'mistake' || m.kind === 'blunder').map((m) => m.tag))
    }
    void run()
    return () => {
      cancelled = true
    }
    // one review per finished game: the component is mounted once the game is over
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inspect = (move: MoveReview | null) => {
    setOpen(move)
    onInspect(move)
  }

  return (
    <div className="result summary">
      <p>
        <strong>{resultText}</strong>
      </p>

      {state.status === 'working' && (
        <p className="muted">
          Reviewing your moves… {state.done}/{state.total}
        </p>
      )}
      {state.status === 'failed' && <p className="muted">The review is not available on this device.</p>}

      {state.status === 'ready' && (
        <>
          <p className="muted">
            {state.review.moves.length} moves · {count(state.review, 'blunder', 'blunder', 'blunders')} ·{' '}
            {count(state.review, 'mistake', 'mistake', 'mistakes')} · {count(state.review, 'inaccuracy', 'slip', 'slips')}
          </p>
          {state.review.moments.length > 0 && (
            <ol className="moments">
              {state.review.moments.map((m) => (
                <li key={`${m.moveNumber}${m.san}`}>
                  <button
                    className={open === m ? 'chosen' : ''}
                    aria-pressed={open === m}
                    onClick={() => inspect(open === m ? null : m)}
                  >
                    <span>
                      Move {m.moveNumber}: you played <strong>{m.san}</strong>
                    </span>
                    <span className="muted">
                      {m.text}
                      {m.best && ` Better: ${m.best.san}.`}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
          {state.review.moments.length > 0 && (
            <p className="muted hint">Tap a move to see it. Red is what you played, green is the better move.</p>
          )}
          <p>{state.review.takeaway}</p>
        </>
      )}

      <div className="actions">
        <button className="primary" onClick={onNewGame}>
          New game
        </button>
        <button onClick={onExit}>Back to path</button>
      </div>
    </div>
  )
}
