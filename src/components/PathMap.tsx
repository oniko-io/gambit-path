import { useState } from 'react'
import { LESSON_ICON } from '../lessons/icons.ts'
import { LATER_STAGES, STAGE1 } from '../lessons/stage1.ts'
import type { GameStats } from '../lib/games.ts'
import { isLessonDone, lessonStars, type Progress } from '../lib/progress.ts'
import { OPENINGS, PRINCIPLES } from '../openings/lines.ts'
import { BackupPanel } from './BackupPanel.tsx'
import { Icon } from './Icon.tsx'

interface Props {
  progress: Progress
  games: GameStats
  onOpen: (lessonId: string) => void
  onOpening: (openingId: string) => void
  onPlay: () => void
}

export function PathMap({ progress, games, onOpen, onOpening, onPlay }: Props) {
  const done = STAGE1.map((l) => isLessonDone(progress, l))
  const doneCount = done.filter(Boolean).length
  const nextIdx = done.indexOf(false)
  const stageDone = nextIdx === -1
  // a finished stage folds away, so the screen leads with what is still open
  const [showLessons, setShowLessons] = useState(!stageDone)
  const totalStars = [...STAGE1, ...OPENINGS].reduce((sum, item) => sum + lessonStars(progress, item.id), 0)
  const record = `${games.wins}W ${games.losses}L ${games.draws}D`

  return (
    <main className="screen path-screen">
      <header className="topbar">
        <h1 className="brand">
          <span className="logo">{LESSON_ICON.knight}</span>
          Gambit Path
        </h1>
        <span className="total-stars">★ {totalStars}</span>
      </header>

      {stageDone ? (
        <button className="hero" onClick={onPlay}>
          <span className="hero-text">
            <span className="eyebrow">Ready when you are</span>
            <span className="hero-title">Play a game</span>
            <span className="hero-sub">You vs Bot · {record}</span>
          </span>
          <span className="hero-go">
            <Icon name="play" size={22} />
          </span>
        </button>
      ) : (
        <button className="hero" onClick={() => onOpen(STAGE1[nextIdx].id)}>
          <span className="hero-text">
            <span className="eyebrow">{doneCount === 0 ? 'Start here' : 'Continue'}</span>
            <span className="hero-title">{STAGE1[nextIdx].title}</span>
            <span className="hero-sub">
              Lesson {nextIdx + 1} of {STAGE1.length}
            </span>
          </span>
          <span className="hero-go">
            <Icon name="next" size={22} />
          </span>
        </button>
      )}

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Stage 1</h2>
            <p className="card-title">Pieces</p>
          </div>
          <span className={`pill${stageDone ? ' gold' : ''}`}>
            {stageDone ? 'Complete' : `${doneCount}/${STAGE1.length}`}
          </span>
        </div>
        <div className="meter" aria-hidden="true">
          <i style={{ width: `${(doneCount / STAGE1.length) * 100}%` }} />
        </div>
        {showLessons && (
          <ol className="rows">
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
                    <span className="badge">{LESSON_ICON[lesson.id]}</span>
                    <span className="node-title">{lesson.title}</span>
                    <span className="node-meta">
                      {locked ? <Icon name="lock" size={16} /> : `★ ${lessonStars(progress, lesson.id)}/${lesson.levels.length * 3}`}
                    </span>
                  </button>
                </li>
              )
            })}
            {!stageDone && (
              <li>
                <button className="node locked" disabled>
                  <span className="badge">
                    <Icon name="play" size={16} />
                  </span>
                  <span className="node-title">Play a game</span>
                  <span className="node-meta">
                    <Icon name="lock" size={16} />
                  </span>
                </button>
              </li>
            )}
          </ol>
        )}
        {stageDone && (
          <button className="link" onClick={() => setShowLessons(!showLessons)}>
            {showLessons ? 'Hide lessons' : `Review all ${STAGE1.length} lessons`}
          </button>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Openings</h2>
            <p className="card-title">How to start a game</p>
          </div>
          {!stageDone && (
            <span className="pill">
              <Icon name="lock" size={14} />
            </span>
          )}
        </div>
        {stageDone && (
          <ol className="principles">
            {PRINCIPLES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        )}
        <ol className="rows">
          {OPENINGS.map((opening) => {
            const stars = lessonStars(progress, opening.id)
            return (
              <li key={opening.id}>
                <button
                  className={`node ${!stageDone ? 'locked' : stars ? 'done' : 'open'}`}
                  disabled={!stageDone}
                  onClick={() => onOpening(opening.id)}
                >
                  <span className={`badge side ${opening.side}`} />
                  <span className="node-title">
                    {opening.title}
                    <small>as {opening.side}</small>
                  </span>
                  <span className="node-meta">{stageDone ? `★ ${stars}/3` : <Icon name="lock" size={16} />}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="card quiet">
        <div className="card-head">
          <div>
            <h2>Ahead</h2>
            <p className="card-title">Later stages</p>
          </div>
        </div>
        <ol className="rows compact">
          {LATER_STAGES.map((title, i) => (
            <li key={title}>
              <button className="node locked" disabled>
                <span className="badge">{i + 2}</span>
                <span className="node-title">{title}</span>
                <span className="node-meta">
                  <Icon name="lock" size={16} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <BackupPanel />
    </main>
  )
}
