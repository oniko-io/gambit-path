import { useState } from 'react'
import type { Lesson } from '../lessons/stage1.ts'
import { CollectLevel } from './CollectLevel.tsx'
import { PositionLevel } from './PositionLevel.tsx'

interface Props {
  lesson: Lesson
  onLevelCleared: (level: number, rating: number) => void
  /** Ratings of every level, in order, once the last one is cleared. */
  onRunFinished: (ratings: number[]) => void
  onExit: () => void
}

type Phase = 'intro' | 'play' | 'finished'

export function LessonPlayer({ lesson, onLevelCleared, onRunFinished, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [levelIdx, setLevelIdx] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ rating: number; note: string } | null>(null)
  const [run, setRun] = useState<number[]>([])
  const level = lesson.levels[levelIdx]
  const isTest = lesson.passStars !== undefined
  const runTotal = run.reduce((sum, r) => sum + r, 0)
  const passed = runTotal >= (lesson.passStars ?? 0)

  const startLevel = (idx: number) => {
    if (idx === 0) setRun([])
    setLevelIdx(idx)
    setAttempt(attempt + 1)
    setResult(null)
    setPhase('play')
  }

  const handleCleared = (rating: number, note: string) => {
    const ratings = [...run]
    ratings[levelIdx] = rating
    setRun(ratings)
    setResult({ rating, note })
    onLevelCleared(levelIdx, rating)
    if (levelIdx === lesson.levels.length - 1) onRunFinished(ratings)
  }

  const finishedTitle = !isTest ? 'Lesson complete' : passed ? 'Stage 1 complete' : 'Not yet'
  const finishedText = !isTest
    ? lesson.outro
    : passed
      ? `Score: ${runTotal}/${lesson.levels.length * 3}. You know the rules. Time to play real games.`
      : `Score: ${runTotal}/${lesson.levels.length * 3}. You need ${lesson.passStars}. Replay the lessons that felt shaky, then try again.`

  if (phase !== 'play') {
    return (
      <main className="screen card-screen">
        <h1>{phase === 'intro' ? lesson.title : finishedTitle}</h1>
        {phase === 'intro' ? (
          lesson.intro.map((line) => <p key={line}>{line}</p>)
        ) : (
          <p>{finishedText}</p>
        )}
        <div className="actions">
          {phase === 'intro' ? (
            <button className="primary" onClick={() => startLevel(0)}>
              Start
            </button>
          ) : (
            <button className="primary" onClick={onExit}>
              Back to path
            </button>
          )}
          {phase === 'intro' && <button onClick={onExit}>Back</button>}
        </div>
      </main>
    )
  }

  const isLast = levelIdx === lesson.levels.length - 1
  const levelKey = `${levelIdx}-${attempt}`

  return (
    <main className="screen">
      <header className="lesson-bar">
        <button className="ghost" onClick={onExit} aria-label="Back to path">
          ←
        </button>
        <span>{lesson.title}</span>
        <span className="muted">
          {levelIdx + 1}/{lesson.levels.length}
        </span>
      </header>

      {'fen' in level ? (
        <PositionLevel key={levelKey} level={level} onCleared={handleCleared} />
      ) : (
        <CollectLevel
          key={levelKey}
          level={level}
          piece={level.piece ?? lesson.piece ?? 'rook'}
          onCleared={handleCleared}
        />
      )}

      {result && (
        <div className="result">
          <div className="rating" aria-label={`${result.rating} of 3 stars`}>
            {'★'.repeat(result.rating)}
            <span className="dim">{'★'.repeat(3 - result.rating)}</span>
          </div>
          <p>{result.note}</p>
          <div className="actions">
            <button
              className="primary"
              onClick={() => (isLast ? setPhase('finished') : startLevel(levelIdx + 1))}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
            {result.rating < 3 && !isTest && <button onClick={() => startLevel(levelIdx)}>Try again</button>}
          </div>
        </div>
      )}
    </main>
  )
}
