import { Chess, type Move } from 'chess.js'
import type { Key } from 'chessground/types'

/** What the one move played in a position level has to achieve. */
export type Goal = 'any' | 'check' | 'mate' | 'castle' | 'enpassant'

export const GOAL_TEXT: Record<Goal, string> = {
  any: 'You are in check. Get out of it.',
  check: 'Give check: attack the black king.',
  mate: 'Checkmate in one move.',
  castle: 'Castle your king.',
  enpassant: 'Capture en passant.',
}

/** `after` is the position once `move` has been played. */
export function goalMet(goal: Goal, move: Move, after: Chess): boolean {
  switch (goal) {
    case 'any':
      return true
    case 'check':
      return after.isCheck()
    case 'mate':
      return after.isCheckmate()
    case 'castle':
      return move.flags.includes('k') || move.flags.includes('q')
    case 'enpassant':
      return move.flags.includes('e')
  }
}

export function wrongText(goal: Goal, after: Chess): string {
  switch (goal) {
    case 'check':
      return 'That does not attack the king.'
    case 'mate':
      return after.isCheck()
        ? 'Check, but not mate: black still has a way out.'
        : 'That is not even check.'
    case 'castle':
      return 'That is not castling. Move the king two squares toward a rook.'
    case 'enpassant':
      return 'Not en passant. Move your pawn diagonally, behind the black pawn.'
    case 'any':
      return ''
  }
}

export function legalDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map<Key, Key[]>()
  for (const m of chess.moves({ verbose: true })) {
    const list = dests.get(m.from)
    if (list) list.push(m.to)
    else dests.set(m.from, [m.to])
  }
  return dests
}
