import type { Key, Role } from 'chessground/types'

const FILES = 'abcdefgh'
const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
const NONE: ReadonlySet<Key> = new Set()

const toXY = (k: Key): [number, number] => [FILES.indexOf(k[0]), Number(k[1]) - 1]
const toKey = (x: number, y: number) => `${FILES[x]}${y + 1}` as Key
const inside = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8

/**
 * Squares a lone white piece can reach in one move.
 * Walls block and cannot be captured. Foes never move and can be captured.
 */
export function pieceMoves(
  role: Role,
  from: Key,
  walls: ReadonlySet<Key>,
  foes: ReadonlySet<Key> = NONE,
): Key[] {
  const [x, y] = toXY(from)
  const out: Key[] = []
  const walk = (dirs: number[][], slide: boolean) => {
    for (const [dx, dy] of dirs) {
      let nx = x + dx
      let ny = y + dy
      while (inside(nx, ny) && !walls.has(toKey(nx, ny))) {
        out.push(toKey(nx, ny))
        if (!slide || foes.has(toKey(nx, ny))) break
        nx += dx
        ny += dy
      }
    }
  }
  const free = (fx: number, fy: number) =>
    inside(fx, fy) && !walls.has(toKey(fx, fy)) && !foes.has(toKey(fx, fy))
  switch (role) {
    case 'rook':
      walk(ROOK, true)
      break
    case 'bishop':
      walk(BISHOP, true)
      break
    case 'queen':
      walk([...ROOK, ...BISHOP], true)
      break
    case 'king':
      walk([...ROOK, ...BISHOP], false)
      break
    case 'knight':
      walk(KNIGHT, false)
      break
    case 'pawn':
      if (free(x, y + 1)) {
        out.push(toKey(x, y + 1))
        if (y === 1 && free(x, y + 2)) out.push(toKey(x, y + 2))
      }
      for (const dx of [-1, 1]) {
        if (inside(x + dx, y + 1) && foes.has(toKey(x + dx, y + 1))) out.push(toKey(x + dx, y + 1))
      }
      break
  }
  return out
}

/** A pawn that reaches the last rank becomes a queen. */
export const roleAfterMove = (role: Role, to: Key): Role =>
  role === 'pawn' && to[1] === '8' ? 'queen' : role

/** Stars are the goal when a level has any; otherwise every foe must be captured. */
export const isCleared = (levelStars: number, starsLeft: number, foesLeft: number) =>
  starsLeft === 0 && (levelStars > 0 || foesLeft === 0)

/** Fewest moves needed to clear a level, or Infinity if impossible. */
export function minMoves(
  role: Role,
  start: Key,
  stars: readonly Key[],
  walls: ReadonlySet<Key>,
  foes: readonly Key[] = [],
): number {
  type Node = [pos: Key, role: Role, starMask: number, foeMask: number]
  const allStars = (1 << stars.length) - 1
  const allFoes = (1 << foes.length) - 1
  const seen = new Set<string>([`${start}|${role}|0|0`])
  let frontier: Node[] = [[start, role, 0, 0]]
  for (let depth = 1; frontier.length > 0; depth++) {
    const next: Node[] = []
    for (const [pos, r, sMask, fMask] of frontier) {
      const alive = new Set(foes.filter((_, i) => !(fMask & (1 << i))))
      for (const to of pieceMoves(r, pos, walls, alive)) {
        const si = stars.indexOf(to)
        const fi = foes.indexOf(to)
        const s = si >= 0 ? sMask | (1 << si) : sMask
        const f = fi >= 0 ? fMask | (1 << fi) : fMask
        if (s === allStars && (stars.length > 0 || f === allFoes)) return depth
        const nr = roleAfterMove(r, to)
        const id = `${to}|${nr}|${s}|${f}`
        if (seen.has(id)) continue
        seen.add(id)
        next.push([to, nr, s, f])
      }
    }
    frontier = next
  }
  return Infinity
}

const LETTER: Record<Role, string> = {
  king: 'k',
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
  pawn: 'p',
}

/** Board part of a FEN: one white piece, white pawns as walls, black foes. */
export function lessonFen(
  role: Role,
  pos: Key,
  walls: ReadonlySet<Key>,
  foes: ReadonlyMap<Key, Role> = new Map(),
): string {
  const ranks: string[] = []
  for (let y = 7; y >= 0; y--) {
    let row = ''
    let empty = 0
    for (let x = 0; x < 8; x++) {
      const k = toKey(x, y)
      const foe = foes.get(k)
      const ch = k === pos ? LETTER[role].toUpperCase() : walls.has(k) ? 'P' : foe ? LETTER[foe] : ''
      if (!ch) {
        empty++
        continue
      }
      if (empty) row += empty
      empty = 0
      row += ch
    }
    ranks.push(row + (empty || ''))
  }
  return ranks.join('/')
}
