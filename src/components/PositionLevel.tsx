import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { Key } from 'chessground/types'
import type { PositionLevel as PositionLevelData } from '../lessons/stage1.ts'
import { GOAL_TEXT, goalMet, legalDests, wrongText } from '../lib/position.ts'
import { Board } from './Board.tsx'

const WRONG_MOVE_MS = 1100

interface Props {
  level: PositionLevelData
  onCleared: (rating: number, note: string) => void
}

export function PositionLevel({ level, onCleared }: Props) {
  const [fen, setFen] = useState(level.fen)
  const [lastMove, setLastMove] = useState<Key[] | undefined>(level.lastMove)
  const [status, setStatus] = useState<'play' | 'wrong' | 'done'>('play')
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState('')
  const undoTimer = useRef<number>(undefined)

  useEffect(() => () => clearTimeout(undoTimer.current), [])

  const chess = useMemo(() => new Chess(fen), [fen])
  const dests = useMemo(
    () => (status === 'play' ? legalDests(chess) : new Map<Key, Key[]>()),
    [chess, status],
  )
  const check = chess.isCheck() ? (chess.turn() === 'w' ? 'white' : 'black') : false

  const handleMove = (from: Key, to: Key) => {
    const after = new Chess(level.fen)
    const move = after.move({ from, to, promotion: 'q' })
    setFen(after.fen())
    setLastMove([from, to])
    if (goalMet(level.goal, move, after)) {
      setStatus('done')
      setFeedback('')
      onCleared(
        mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1,
        mistakes === 0 ? 'Perfect.' : `Solved after ${mistakes} wrong ${mistakes === 1 ? 'try' : 'tries'}.`,
      )
      return
    }
    setStatus('wrong')
    setMistakes(mistakes + 1)
    setFeedback(wrongText(level.goal, after))
    undoTimer.current = setTimeout(() => {
      setFen(level.fen)
      setLastMove(level.lastMove)
      setStatus('play')
    }, WRONG_MOVE_MS)
  }

  return (
    <>
      <p className="goal">{GOAL_TEXT[level.goal]}</p>
      <Board fen={fen} dests={dests} lastMove={lastMove} check={check} onMove={handleMove} />
      <div className="status">
        <span>Wrong tries: {mistakes}</span>
      </div>
      {status !== 'done' && feedback && <p className="tip wrong">{feedback}</p>}
      {status !== 'done' && !feedback && level.tip && <p className="tip">{level.tip}</p>}
    </>
  )
}
