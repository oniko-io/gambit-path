import { useState } from 'react'
import { LESSON_ICON } from '../lessons/icons.ts'
import type { Lesson } from '../lessons/stage1.ts'
import { CollectLevel } from './CollectLevel.tsx'
import { PositionLevel } from './PositionLevel.tsx'
import { ScreenHeader } from './ScreenHeader.tsx'

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
    const success = phase === 'finished' && (!isTest || passed)
    return (
      <main className="screen card-screen">
        <div className="intro">
          <span className={`badge big${success ? ' gold' : ''}`}>{success ? '★' : LESSON_ICON[lesson.id]}</span>
          <h1>{phase === 'intro' ? lesson.title : finishedTitle}</h1>
          {phase === 'intro' ? (
            lesson.intro.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p>{finishedText}</p>
          )}
        </div>
        <div className="actions stacked">
          {phase === 'intro' ? (
            <button className="primary" onClick={() => startLevel(0)}>
              Start
            </button>
          ) : (
            <button className="primary" onClick={onExit}>
              Back to path
            </button>
          )}
          {phase === 'intro' && (
            <button className="quiet" onClick={onExit}>
              Back
            </button>
          )}
        </div>
      </main>
    )
  }

  const isLast = levelIdx === lesson.levels.length - 1
  const levelKey = `${levelIdx}-${attempt}`

  return (
    <main className="screen">
      <ScreenHeader
        title={lesson.title}
        onBack={onExit}
        aside={`${levelIdx + 1}/${lesson.levels.length}`}
        steps={{ count: lesson.levels.length, current: result ? levelIdx + 1 : levelIdx }}
      />

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
            {result.rating < 3 && !isTest && (
              <button className="quiet" onClick={() => startLevel(levelIdx)}>
                Try again
              </button>
            )}
            <button
              className="primary"
              onClick={() => (isLast ? setPhase('finished') : startLevel(levelIdx + 1))}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
