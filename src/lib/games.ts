import type { MistakeTag } from './analysis.ts'
import { MAX_LEVEL } from './bot.ts'

const STORAGE_KEY = 'gambit-path:games'

export type Outcome = 'win' | 'loss' | 'draw'
export type SideChoice = 'white' | 'black' | 'random'

export interface GameStats {
  /** Bot level the automatic difficulty has reached, 1 to MAX_LEVEL. */
  level: number
  wins: number
  losses: number
  draws: number
  /** Serious mistakes found in reviewed games, by cause. */
  mistakes: Partial<Record<MistakeTag, number>>
  /** Last choices on the setup screen. */
  side: SideChoice
  /** 'auto' follows `level`; a number pins the bot to that level. */
  difficulty: 'auto' | number
  /** Warn before a move that gives a piece away or allows mate in one. */
  guard: boolean
}

const FRESH: GameStats = {
  level: 1,
  wins: 0,
  losses: 0,
  draws: 0,
  mistakes: {},
  side: 'white',
  difficulty: 'auto',
  guard: true,
}

export function loadGameStats(): GameStats {
  try {
    return { ...FRESH, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return FRESH
  }
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // storage unavailable: stats last for this visit only
  }
}

/** On automatic difficulty a win makes the bot one level stronger, a loss one level weaker. */
export function withOutcome(stats: GameStats, outcome: Outcome): GameStats {
  const step = stats.difficulty !== 'auto' ? 0 : outcome === 'win' ? 1 : outcome === 'loss' ? -1 : 0
  return {
    ...stats,
    level: Math.min(Math.max(stats.level + step, 1), MAX_LEVEL),
    wins: stats.wins + (outcome === 'win' ? 1 : 0),
    losses: stats.losses + (outcome === 'loss' ? 1 : 0),
    draws: stats.draws + (outcome === 'draw' ? 1 : 0),
  }
}

export function withMistakes(stats: GameStats, tags: MistakeTag[]): GameStats {
  const mistakes = { ...stats.mistakes }
  for (const tag of tags) mistakes[tag] = (mistakes[tag] ?? 0) + 1
  return { ...stats, mistakes }
}
