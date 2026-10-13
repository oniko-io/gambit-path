import { LATER_STAGES, STAGE1 } from '../lessons/stage1.ts'
import { OPENINGS, PRINCIPLES } from '../openings/lines.ts'
import type { GameStats } from '../lib/games.ts'
import { BackupPanel } from './BackupPanel.tsx'
import { isLessonDone, lessonStars, type Progress } from '../lib/progress.ts'

interface Props {
  progress: Progress
  games: GameStats
  onOpen: (lessonId: string) => void
  onOpening: (openingId: string) => void
  onPlay: () => void
}

export function PathMap({ progress, games, onOpen, onOpening, onPlay }: Props) {
  const done = STAGE1.map((l) => isLessonDone(progress, l))
  const nextIdx = done.indexOf(false)
  const stageDone = nextIdx === -1

  return (
    <main className="screen">
      <h1 className="brand">Gambit Path</h1>

      <section>
        <h2>Stage 1 · Pieces</h2>
        <ol className="path">
          {STAGE1.map((lesson, i) => {
            const locked = i > 0 && !done[i - 1]
            const state = done[i] ? 'done' : locked ? 'locked' : 'open'
            return (
              <li key={lesson.id}>
                <button
                  className={`node ${state}${i === nextIdx ? ' next' : ''}`}
                  disabled={locked}
                  onClick={() => onOpen(lesson.id)}
                >
                  <span>{lesson.title}</span>
                  <span className="muted">
                    {locked ? 'Locked' : `★ ${lessonStars(progress, lesson.id)}/${lesson.levels.length * 3}`}
                  </span>
                </button>
              </li>
            )
          })}
          <li>
            <button
              className={`node ${stageDone ? 'open next' : 'locked'}`}
              disabled={!stageDone}
              onClick={onPlay}
            >
              <span>Play a game</span>
              <span className="muted">
                {stageDone
                  ? `${games.wins}W ${games.losses}L ${games.draws}D`
                  : 'Locked'}
              </span>
            </button>
          </li>
        </ol>
      </section>

      <section>
        <h2>Openings · how to start a game</h2>
        {stageDone && (
          <ul className="principles">
            {PRINCIPLES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        )}
        <ol className="path">
          {OPENINGS.map((opening) => (
            <li key={opening.id}>
              <button
                className={`node ${!stageDone ? 'locked' : lessonStars(progress, opening.id) ? 'done' : 'open'}`}
                disabled={!stageDone}
                onClick={() => onOpening(opening.id)}
              >
                <span>{opening.title}</span>
                <span className="muted">
                  {stageDone
                    ? `as ${opening.side} · ★ ${lessonStars(progress, opening.id)}/3`
                    : 'Locked'}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Ahead</h2>
        <ol className="path">
          {LATER_STAGES.map((title, i) => (
            <li key={title}>
              <button className="node locked" disabled>
                <span>
                  Stage {i + 2} · {title}
                </span>
                <span className="muted">Locked</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <BackupPanel />
    </main>
  )
}
