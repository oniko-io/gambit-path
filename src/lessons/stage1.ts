import type { Key, Role } from 'chessground/types'
import type { Goal } from '../lib/position.ts'

/** Move one piece around an otherwise empty board. */
export interface CollectLevel {
  /** Overrides the lesson piece for this level. */
  piece?: Role
  start: Key
  /** Squares to visit. With no stars, the goal is to capture every foe. */
  stars: Key[]
  /** Own pawns: they block and never move. */
  walls?: Key[]
  /** Black pieces: they never move and can be captured. */
  foes?: Partial<Record<Key, Role>>
  tip?: string
}

/** A real chess position, white to move, solved by one move that meets the goal. */
export interface PositionLevel {
  fen: string
  goal: Goal
  /** Black's previous move, highlighted on the board. */
  lastMove?: [Key, Key]
  tip?: string
}

export type Level = CollectLevel | PositionLevel

export interface Lesson {
  id: string
  title: string
  /** Default piece for the lesson's collect levels. */
  piece?: Role
  intro: string[]
  outro: string
  levels: Level[]
  /** Marks a test: no retries, passed once a single run earns this many stars. */
  passStars?: number
}

export const STAGE1: Lesson[] = [
  {
    id: 'rook',
    title: 'The Rook',
    piece: 'rook',
    intro: [
      'The rook moves in straight lines: up, down, left, right.',
      'It can go as far as it wants, but it cannot jump over pieces.',
    ],
    outro: 'You know how the rook moves.',
    levels: [
      { start: 'e4', stars: ['e7'], tip: 'Tap the rook, then tap a dot.' },
      { start: 'a1', stars: ['a8', 'h8'] },
      { start: 'd4', stars: ['d7', 'g7', 'g2'] },
      {
        start: 'a1',
        stars: ['a6', 'f3'],
        walls: ['a3', 'd3'],
        tip: 'Pawns block the way. Go around them.',
      },
    ],
  },
  {
    id: 'bishop',
    title: 'The Bishop',
    piece: 'bishop',
    intro: [
      'The bishop moves diagonally, as far as it wants.',
      'It never leaves the square color it starts on.',
    ],
    outro: 'You know how the bishop moves.',
    levels: [
      { start: 'c1', stars: ['h6'] },
      { start: 'c1', stars: ['a3', 'f8'] },
      { start: 'd4', stars: ['a7', 'g7', 'g1'] },
      {
        start: 'f1',
        stars: ['a6', 'h3', 'c8'],
        walls: ['d3'],
        tip: 'All stars sit on light squares. A dark-square star would be out of reach forever.',
      },
    ],
  },
  {
    id: 'queen',
    title: 'The Queen',
    piece: 'queen',
    intro: [
      'The queen is a rook and a bishop in one piece.',
      'Straight or diagonal, any distance. She is your strongest piece.',
    ],
    outro: 'You know how the queen moves.',
    levels: [
      { start: 'd1', stars: ['d8', 'h4'] },
      { start: 'd1', stars: ['a4', 'e8', 'h5'] },
      { start: 'a1', stars: ['h8', 'h1', 'a8', 'd5'] },
      {
        start: 'd1',
        stars: ['b6', 'g6', 'e3'],
        walls: ['d2', 'c2', 'e2', 'd5'],
        tip: 'Even the queen cannot jump over pieces.',
      },
    ],
  },
  {
    id: 'king',
    title: 'The King',
    piece: 'king',
    intro: [
      'The king moves one square in any direction.',
      'He is slow, but he is the piece you must never lose.',
    ],
    outro: 'You know how the king moves.',
    levels: [
      { start: 'e1', stars: ['e2', 'f3'] },
      { start: 'e1', stars: ['d2', 'c3', 'c5'] },
      {
        start: 'e1',
        stars: ['e4', 'g3'],
        walls: ['d2', 'e2', 'e3'],
        tip: 'Diagonal steps are just as fast as straight ones.',
      },
    ],
  },
  {
    id: 'knight',
    title: 'The Knight',
    piece: 'knight',
    intro: [
      'The knight moves in an L: two squares one way, then one to the side.',
      'It is the only piece that jumps over others.',
    ],
    outro: 'You know how the knight moves.',
    levels: [
      { start: 'g1', stars: ['f3'], tip: 'Two squares, then one to the side.' },
      { start: 'b1', stars: ['c3', 'e4', 'g5'] },
      {
        start: 'e4',
        stars: ['f6', 'd7'],
        walls: ['d3', 'e3', 'f3', 'd4', 'f4', 'd5', 'e5', 'f5'],
        tip: 'Boxed in? The knight jumps right over.',
      },
      { start: 'a1', stars: ['c2', 'e3', 'd5', 'h8'] },
    ],
  },
  {
    id: 'pawn',
    title: 'The Pawn',
    piece: 'pawn',
    intro: [
      'The pawn moves one square forward, and never goes back.',
      'It captures differently from how it moves: one square diagonally forward.',
    ],
    outro: 'You know how the pawn moves, captures and promotes.',
    levels: [
      { start: 'e2', stars: ['e4'], tip: 'On its first move a pawn may go two squares.' },
      { start: 'd2', stars: ['d6'], tip: 'After the first move: one square at a time.' },
      {
        start: 'c3',
        stars: ['d5'],
        foes: { d4: 'pawn' },
        tip: 'Pawns capture one square diagonally forward.',
      },
      {
        start: 'e3',
        stars: ['d6'],
        foes: { e4: 'knight', d4: 'pawn' },
        tip: 'A piece straight ahead blocks the pawn. It cannot capture forward.',
      },
      {
        start: 'b6',
        stars: ['h8', 'h2'],
        tip: 'Reach the last row and the pawn becomes a queen.',
      },
    ],
  },
  {
    id: 'capturing',
    title: 'Capturing',
    piece: 'rook',
    intro: [
      'To capture, move onto a square that holds an enemy piece. It leaves the board.',
      'You stop on the square where you capture, and you can never capture your own pieces.',
    ],
    outro: 'You can capture with every piece.',
    levels: [
      { start: 'a1', stars: [], foes: { a7: 'pawn', f7: 'knight' }, tip: 'Tap the rook, then tap a black piece.' },
      {
        piece: 'bishop',
        start: 'c1',
        stars: [],
        foes: { f4: 'pawn', h6: 'rook' },
        tip: 'You cannot move through a piece. Capture it first.',
      },
      { piece: 'knight', start: 'g1', stars: [], foes: { f3: 'pawn', e5: 'bishop', c4: 'rook' } },
      {
        piece: 'queen',
        start: 'd1',
        stars: [],
        walls: ['c2', 'e2'],
        foes: { d7: 'pawn', d8: 'rook', h4: 'bishop', a4: 'knight' },
        tip: 'Your own pawns are in the way. They cannot be captured.',
      },
      { piece: 'king', start: 'e1', stars: [], foes: { e2: 'pawn', f3: 'pawn', g4: 'knight' } },
    ],
  },
  {
    id: 'check',
    title: 'Check',
    intro: [
      'Check means a king is under attack. The player in check must fix it right away.',
      'There are three ways out: move the king, block the attack, or capture the attacker.',
    ],
    outro: 'You can give check and escape it three ways.',
    levels: [
      { fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1', goal: 'check', tip: 'Aim the rook at the black king.' },
      { fen: '4k3/8/8/8/4N3/8/8/6K1 w - - 0 1', goal: 'check' },
      {
        fen: '4r1k1/8/8/8/8/8/8/4K3 w - - 0 1',
        goal: 'any',
        tip: 'Way 1: step the king off the attacked line.',
      },
      {
        fen: '4r1k1/8/8/8/8/8/3P1P2/3QKB2 w - - 0 1',
        goal: 'any',
        tip: 'Way 2: the king has no free square. Put a piece in between.',
      },
      {
        fen: '6k1/8/8/8/8/8/5nPP/6BK w - - 0 1',
        goal: 'any',
        tip: 'Way 3: a knight check cannot be blocked. Capture the knight.',
      },
    ],
  },
  {
    id: 'checkmate',
    title: 'Checkmate',
    intro: [
      'Checkmate is check with no way out: the king cannot move, block or capture.',
      'It ends the game. Whoever gives checkmate wins.',
    ],
    outro: 'You can finish a game. That is the whole point of chess.',
    levels: [
      {
        fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
        goal: 'mate',
        tip: 'His own pawns trap the black king.',
      },
      { fen: '7k/R7/1R6/8/8/8/8/6K1 w - - 0 1', goal: 'mate', tip: 'One rook guards a row. The other gives check.' },
      { fen: '7k/Q7/6K1/8/8/8/8/8 w - - 0 1', goal: 'mate', tip: 'Your king covers the escape squares.' },
      {
        fen: '7k/8/5K2/6Q1/8/8/8/8 w - - 0 1',
        goal: 'mate',
        tip: 'A queen next to the king must be protected, or the king takes her.',
      },
      { fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', goal: 'mate', tip: 'The knight jumps where nothing can stop it.' },
    ],
  },
  {
    id: 'special',
    title: 'Special moves',
    intro: [
      'Castling: the king goes two squares toward a rook and the rook hops over him. Allowed only if neither has moved, nothing stands between them, and the king is not in check and does not cross an attacked square.',
      'En passant: when an enemy pawn jumps two squares and lands beside your pawn, you may capture it as if it had moved only one. Only on the very next move.',
    ],
    outro: 'You know every rule of chess now.',
    levels: [
      {
        fen: '4k3/8/8/8/8/8/PPPPPPPP/4K2R w K - 0 1',
        goal: 'castle',
        tip: 'Tap the king, then the square two steps to the right.',
      },
      { fen: '4k3/8/8/8/8/8/PPPPPPPP/R3K3 w Q - 0 1', goal: 'castle', tip: 'Castling works on the long side too.' },
      {
        fen: '4kr2/8/8/8/8/8/PPPPP1PP/R3K2R w KQ - 0 1',
        goal: 'castle',
        tip: 'The black rook attacks a square on the short side. The king may not cross it.',
      },
      {
        fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
        goal: 'enpassant',
        lastMove: ['d7', 'd5'],
        tip: 'The black pawn just jumped two squares. Capture it as if it had moved one.',
      },
    ],
  },
  {
    id: 'stage1-test',
    title: 'Stage test',
    intro: [
      'Ten positions, no hints, no retries.',
      'Every wrong try costs a star. Score 24 of 30 to finish Stage 1 and unlock real games.',
    ],
    outro: '',
    passStars: 24,
    levels: [
      { fen: '6k1/5ppp/8/8/8/8/8/3Q2K1 w - - 0 1', goal: 'mate' },
      { fen: '4k3/8/8/8/8/8/8/4KB2 w - - 0 1', goal: 'check' },
      { fen: '3rk3/8/8/8/8/8/PPP1PPPP/R3K2R w KQ - 0 1', goal: 'castle' },
      { fen: '4k3/8/8/5Pp1/8/8/8/4K3 w - g6 0 1', goal: 'enpassant', lastMove: ['g7', 'g5'] },
      { fen: 'k7/7R/8/8/8/8/8/6RK w - - 0 1', goal: 'mate' },
      { fen: '8/3k4/8/4P3/8/8/8/4K3 w - - 0 1', goal: 'check' },
      { fen: '6k1/5ppp/8/8/8/2B5/8/6QK w - - 0 1', goal: 'mate' },
      { fen: '7k/4P1pp/8/8/8/8/8/6K1 w - - 0 1', goal: 'mate' },
      { fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1', goal: 'mate' },
      { fen: 'k7/2Q5/1K6/8/8/8/8/8 w - - 0 1', goal: 'mate' },
    ],
  },
]

export const LATER_STAGES = ['Survive', 'Tactics', 'Endgames & Strategy', 'Mastery']
