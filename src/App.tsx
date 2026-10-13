import { useState } from 'react'
import { GameScreen, type GameConfig } from './components/GameScreen.tsx'
import { GameSetup } from './components/GameSetup.tsx'
import { LessonPlayer } from './components/LessonPlayer.tsx'
import { OpeningTrainer } from './components/OpeningTrainer.tsx'
import { PathMap } from './components/PathMap.tsx'
import { STAGE1 } from './lessons/stage1.ts'
import { loadGameStats, saveGameStats, withMistakes, withOutcome, type GameStats } from './lib/games.ts'
import { OPENINGS } from './openings/lines.ts'
import { loadProgress, saveProgress, withRating, withTestRun, type Progress } from './lib/progress.ts'

type Screen =
  | { name: 'path' }
  | { name: 'lesson'; id: string }
  | { name: 'opening'; id: string }
  | { name: 'setup' }
  | { name: 'game'; id: number; config: GameConfig }

function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [games, setGames] = useState(loadGameStats)
  const [screen, setScreen] = useState<Screen>({ name: 'path' })
  const toPath = () => setScreen({ name: 'path' })
  const lesson = screen.name === 'lesson' ? STAGE1.find((l) => l.id === screen.id) : undefined

  const store = (next: Progress) => {
    setProgress(next)
    saveProgress(next)
  }

  const storeGames = (next: GameStats) => {
    setGames(next)
    saveGameStats(next)
  }

  if (screen.name === 'setup') {
    return (
      <GameSetup
        stats={games}
        onChange={storeGames}
        onExit={toPath}
        onStart={() =>
          setScreen({
            name: 'game',
            id: Date.now(),
            config: {
              color: games.side === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : games.side,
              level: games.difficulty === 'auto' ? games.level : games.difficulty,
              guard: games.guard,
            },
          })
        }
      />
    )
  }

  if (screen.name === 'game') {
    return (
      <GameScreen
        key={screen.id}
        config={screen.config}
        onExit={toPath}
        onNewGame={() => setScreen({ name: 'setup' })}
        onGameOver={(outcome) => storeGames(withOutcome(games, outcome))}
        // functional update: the review finishes long after the result was stored
        onReviewed={(tags) =>
          setGames((current) => {
            const next = withMistakes(current, tags)
            saveGameStats(next)
            return next
          })
        }
      />
    )
  }

  const opening = screen.name === 'opening' ? OPENINGS.find((o) => o.id === screen.id) : undefined
  if (opening) {
    return (
      <OpeningTrainer
        key={opening.id}
        opening={opening}
        onExit={toPath}
        onDone={(rating) => store(withRating(progress, opening.id, 0, rating))}
      />
    )
  }

  if (!lesson) {
    return (
      <PathMap
        progress={progress}
        games={games}
        onOpen={(id) => setScreen({ name: 'lesson', id })}
        onOpening={(id) => setScreen({ name: 'opening', id })}
        onPlay={() => setScreen({ name: 'setup' })}
      />
    )
  }

  // a test only counts as a whole run, so its levels are not stored one by one
  const isTest = lesson.passStars !== undefined
  return (
    <LessonPlayer
      key={lesson.id}
      lesson={lesson}
      onExit={toPath}
      onLevelCleared={(level, rating) => {
        if (!isTest) store(withRating(progress, lesson.id, level, rating))
      }}
      onRunFinished={(ratings) => {
        if (isTest) store(withTestRun(progress, lesson.id, ratings))
      }}
    />
  )
}

export default App
