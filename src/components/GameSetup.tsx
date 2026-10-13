import { MAX_LEVEL } from '../lib/bot.ts'
import type { GameStats, SideChoice } from '../lib/games.ts'
import { ScreenHeader } from './ScreenHeader.tsx'

const SIDES: SideChoice[] = ['white', 'black', 'random']
const LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)

interface Props {
  stats: GameStats
  onChange: (stats: GameStats) => void
  onStart: () => void
  onExit: () => void
}

export function GameSetup({ stats, onChange, onStart, onExit }: Props) {
  return (
    <main className="screen">
      <ScreenHeader title="New game" onBack={onExit} aside={`${stats.wins}W ${stats.losses}L ${stats.draws}D`} />

      <section className="card">
        <h2>Your side</h2>
        <div className="choices">
          {SIDES.map((side) => (
            <button
              key={side}
              className={stats.side === side ? 'chosen' : ''}
              aria-pressed={stats.side === side}
              onClick={() => onChange({ ...stats, side })}
            >
              <span className={`badge side ${side}`} />
              {side[0].toUpperCase() + side.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Difficulty</h2>
        <div className="choices">
          <button
            className={stats.difficulty === 'auto' ? 'chosen' : ''}
            aria-pressed={stats.difficulty === 'auto'}
            onClick={() => onChange({ ...stats, difficulty: 'auto' })}
          >
            Auto
          </button>
        </div>
        <div className="choices grid">
          {LEVELS.map((level) => (
            <button
              key={level}
              className={stats.difficulty === level ? 'chosen' : ''}
              aria-pressed={stats.difficulty === level}
              onClick={() => onChange({ ...stats, difficulty: level })}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="muted hint">
          {stats.difficulty === 'auto'
            ? `Auto is at level ${stats.level} now. It goes up when you win and down when you lose.`
            : `Fixed at level ${stats.difficulty} of ${MAX_LEVEL}. Results will not change it.`}
        </p>
      </section>

      <section className="card">
        <h2>Blunder warnings</h2>
        <div className="choices">
          <button
            className={stats.guard ? 'chosen' : ''}
            aria-pressed={stats.guard}
            onClick={() => onChange({ ...stats, guard: true })}
          >
            On
          </button>
          <button
            className={!stats.guard ? 'chosen' : ''}
            aria-pressed={!stats.guard}
            onClick={() => onChange({ ...stats, guard: false })}
          >
            Off
          </button>
        </div>
        <p className="muted hint">
          Stops you before a move that gives a piece away or allows checkmate in one.
        </p>
      </section>

      <div className="actions stacked">
        <button className="primary" onClick={onStart}>
          Start game
        </button>
      </div>
    </main>
  )
}
