// U+FE0E keeps Android from drawing chess symbols as emoji
const TEXT = '︎'

/** Badge shown next to each lesson. Chess pieces, or the notation sign for the idea. */
export const LESSON_ICON: Record<string, string> = {
  rook: '♜' + TEXT,
  bishop: '♝' + TEXT,
  queen: '♛' + TEXT,
  king: '♚' + TEXT,
  knight: '♞' + TEXT,
  pawn: '♟' + TEXT,
  capturing: '×',
  check: '+',
  checkmate: '#',
  special: '⇄',
  'stage1-test': '★',
}

export const OPENING_ICON = '♞' + TEXT
