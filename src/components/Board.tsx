import { useEffect, useRef } from 'react'
import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import type { DrawShape } from 'chessground/draw'
import type { Color, Key } from 'chessground/types'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

interface Props {
  fen: string
  dests: Map<Key, Key[]>
  /** Side the learner plays: it sits at the bottom and is the only one that can move. */
  color?: Color
  shapes?: DrawShape[]
  lastMove?: Key[]
  /** Side whose king is shown as attacked. */
  check?: Color | false
  onMove: (from: Key, to: Key) => void
}

export function Board({ fen, dests, color = 'white', shapes, lastMove, check = false, onMove }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const onMoveRef = useRef(onMove)

  useEffect(() => {
    onMoveRef.current = onMove
  })

  useEffect(() => {
    const cg = Chessground(el.current!, {
      coordinates: true,
      movable: {
        free: false,
        showDests: true,
        events: { after: (from, to) => onMoveRef.current(from, to) },
      },
      premovable: { enabled: false },
      drawable: { enabled: false, visible: true },
    })
    api.current = cg
    return () => {
      cg.destroy()
      api.current = null
    }
  }, [])

  useEffect(() => {
    // turnColor is reset every time: chessground flips it after each move
    api.current?.set({
      fen,
      orientation: color,
      turnColor: color,
      lastMove,
      check,
      movable: { color, dests },
    })
    api.current?.setAutoShapes(shapes ?? [])
  }, [fen, dests, color, shapes, lastMove, check])

  return <div className="board" ref={el} />
}
