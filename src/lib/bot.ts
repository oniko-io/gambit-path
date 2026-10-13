import type { Chess } from 'chess.js'
import type { Engine } from './engine.ts'

interface BotLevel {
  /** Chance of playing a random legal move instead of asking the engine. */
  random: number
  skill: number
  depth: number
}

// Even Stockfish's weakest setting crushes a beginner, so low levels mix in random moves.
const LEVELS: BotLevel[] = [
  { random: 0.6, skill: 0, depth: 1 },
  { random: 0.45, skill: 0, depth: 1 },
  { random: 0.3, skill: 0, depth: 1 },
  { random: 0.2, skill: 0, depth: 1 },
  { random: 0.1, skill: 0, depth: 1 },
  { random: 0, skill: 0, depth: 2 },
  { random: 0, skill: 2, depth: 4 },
  { random: 0, skill: 4, depth: 6 },
]

export const MAX_LEVEL = LEVELS.length

export interface BotMove {
  from: string
  to: string
  promotion?: string
}

/** Move for the side to play. `level` runs from 1 to MAX_LEVEL. */
export async function pickBotMove(chess: Chess, level: number, engine: Engine | null): Promise<BotMove> {
  const cfg = LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1]
  const legal = chess.moves({ verbose: true })
  const random = legal[Math.floor(Math.random() * legal.length)]
  if (!engine || Math.random() < cfg.random) return random
  try {
    const uci = await engine.bestMove(chess.fen(), cfg.skill, cfg.depth)
    return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }
  } catch {
    // engine unavailable: keep the game going
    return random
  }
}
