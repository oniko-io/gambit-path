// Verifies all lesson and opening data with the rules engine. Run: npm run check
import { Chess } from 'chess.js'
import { STAGE1 } from '../src/lessons/stage1.ts'
import { minMoves } from '../src/lib/moves.ts'
import { goalMet } from '../src/lib/position.ts'
import { OPENINGS } from '../src/openings/lines.ts'

const problems: string[] = []

for (const lesson of STAGE1) {
  lesson.levels.forEach((level, i) => {
    const where = `${lesson.id} level ${i + 1}`
    if ('fen' in level) {
      // position level: white to move, at least one move meets the goal
      const start = new Chess(level.fen)
      if (start.turn() !== 'w') problems.push(`${where}: black to move`)
      const solutions = start.moves().filter((san) => {
        const after = new Chess(level.fen)
        return goalMet(level.goal, after.move(san), after)
      })
      if (solutions.length === 0) problems.push(`${where}: no move meets goal "${level.goal}"`)
      return
    }
    // collect level: squares do not overlap and the level can be cleared
    const piece = level.piece ?? lesson.piece
    if (!piece) return problems.push(`${where}: no piece set on level or lesson`)
    const foes = Object.keys(level.foes ?? {})
    const used = [level.start, ...level.stars, ...(level.walls ?? []), ...foes]
    if (new Set(used).size !== used.length) problems.push(`${where}: two things on one square`)
    const best = minMoves(piece, level.start, level.stars, new Set(level.walls), foes as typeof level.stars)
    if (!Number.isFinite(best)) problems.push(`${where}: cannot be cleared`)
  })
  if (lesson.passStars && lesson.passStars > lesson.levels.length * 3) {
    problems.push(`${lesson.id}: passStars is higher than the maximum score`)
  }
}

for (const opening of OPENINGS) {
  const chess = new Chess()
  for (const [i, move] of opening.moves.entries()) {
    try {
      const played = chess.move(move.san)
      if (played.san !== move.san) problems.push(`${opening.id} ply ${i + 1}: write "${played.san}", not "${move.san}"`)
    } catch {
      problems.push(`${opening.id} ply ${i + 1}: "${move.san}" is not legal`)
      break
    }
  }
}

const levels = STAGE1.reduce((sum, l) => sum + l.levels.length, 0)
if (problems.length > 0) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`OK: ${STAGE1.length} lessons (${levels} levels), ${OPENINGS.length} openings`)
