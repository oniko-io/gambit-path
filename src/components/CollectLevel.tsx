import { useMemo, useState } from 'react'
import type { DrawShape } from 'chessground/draw'
import type { Key, Role } from 'chessground/types'
import type { CollectLevel as CollectLevelData } from '../lessons/stage1.ts'
import { isCleared, lessonFen, minMoves, pieceMoves, roleAfterMove } from '../lib/moves.ts'
import { Board } from './Board.tsx'

const STAR_SVG =
  '<polygon points="50,14 61,39 88,41 67,59 74,86 50,71 26,86 33,59 12,41 39,39" fill="#f5c542" stroke="#8a6500" stroke-width="3" stroke-linejoin="round"/>'

const foeKeys = (level: CollectLevelData) => Object.keys(level.foes ?? {}) as Key[]

interface Props {
  level: CollectLevelData
  piece: Role
  onCleared: (rating: number, note: string) => void
}

export function CollectLevel({ level, piece, onCleared }: Props) {
  const [pos, setPos] = useState<Key>(level.start)
  const [role, setRole] = useState<Role>(piece)
  const [stars, setStars] = useState<Key[]>(level.stars)
  const [foes, setFoes] = useState<Key[]>(() => foeKeys(level))
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)

  const walls = useMemo(() => new Set(level.walls), [level])
  const best = useMemo(
    () => minMoves(piece, level.start, level.stars, walls, foeKeys(level)),
    [piece, level, walls],
  )
  const fen = useMemo(
    () => lessonFen(role, pos, walls, new Map(foes.map((k) => [k, level.foes![k]!]))),
    [role, pos, walls, foes, level],
  )
  const dests = useMemo(
    () => new Map<Key, Key[]>(done ? [] : [[pos, pieceMoves(role, pos, walls, new Set(foes))]]),
    [role, pos, walls, foes, done],
  )
  const shapes = useMemo<DrawShape[]>(
    () => stars.map((orig) => ({ orig, customSvg: { html: STAR_SVG } })),
    [stars],
  )

  const reset = () => {
    setPos(level.start)
    setRole(piece)
    setStars(level.stars)
    setFoes(foeKeys(level))
    setMoves(0)
  }

  const handleMove = (_from: Key, to: Key) => {
    const left = stars.filter((s) => s !== to)
    const alive = foes.filter((f) => f !== to)
    const used = moves + 1
    setPos(to)
    setRole(roleAfterMove(role, to))
    setStars(left)
    setFoes(alive)
    setMoves(used)
    if (isCleared(level.stars.length, left.length, alive.length)) {
      setDone(true)
      const rating = used <= best ? 3 : used <= best + 2 ? 2 : 1
      onCleared(rating, rating === 3 ? 'Perfect.' : `Done in ${used}. Best is ${best}.`)
    }
  }

  return (
    <>
      <p className="goal">
        {level.stars.length > 0 ? 'Collect every star.' : 'Capture every black piece.'} Best: {best}{' '}
        {best === 1 ? 'move' : 'moves'}.
      </p>
      <Board fen={fen} dests={dests} shapes={shapes} onMove={handleMove} />
      <div className="status">
        <span>Moves: {moves}</span>
        {!done && (
          <button onClick={reset} disabled={moves === 0}>
            Reset
          </button>
        )}
      </div>
      {!done && level.tip && <p className="tip">{level.tip}</p>}
    </>
  )
}
