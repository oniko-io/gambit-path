import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

interface Props {
  title: string
  onBack: () => void
  /** Short text on the right, such as a level or a score. */
  aside?: ReactNode
  /** Progress through a lesson: `current` is the 0-based step being played. */
  steps?: { count: number; current: number }
}

export function ScreenHeader({ title, onBack, aside, steps }: Props) {
  return (
    <>
      <header className="lesson-bar">
        <button className="icon-button" onClick={onBack} aria-label="Back to path">
          <Icon name="back" />
        </button>
        <span className="lesson-title">{title}</span>
        <span className="aside">{aside}</span>
      </header>
      {steps && (
        <div className="steps" role="img" aria-label={`Step ${steps.current + 1} of ${steps.count}`}>
          {Array.from({ length: steps.count }, (_, i) => (
            <i key={i} className={i < steps.current ? 'done' : i === steps.current ? 'current' : ''} />
          ))}
        </div>
      )}
    </>
  )
}
