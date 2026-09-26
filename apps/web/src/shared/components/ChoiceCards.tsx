import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export interface Choice<T extends string> {
  value: T
  label: string
  icon?: ReactNode
  hint?: string
}

/** A radio group drawn as large tappable cards: icon + label, so the choice can be made without much reading. */
export function ChoiceCards<T extends string>({
  name,
  legend,
  value,
  onChange,
  choices,
  columns = 2,
  error,
  describedBy,
}: {
  name: string
  legend: string
  value: T | undefined
  onChange: (v: T) => void
  choices: Choice<T>[]
  columns?: 1 | 2 | 3
  error?: string
  describedBy?: string
}) {
  const errorId = `${name}-error`
  return (
    <fieldset aria-describedby={[error && errorId, describedBy].filter(Boolean).join(' ') || undefined}>
      <legend className="mb-2 font-medium">{legend}</legend>
      <div className={cn('grid gap-2', columns === 1 && 'grid-cols-1', columns === 2 && 'grid-cols-2', columns === 3 && 'grid-cols-3')}>
        {choices.map((c) => {
          const checked = value === c.value
          return (
            <label
              key={c.value}
              className={cn(
                'relative flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl border-2 bg-card px-3 py-2.5 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring',
                checked ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50',
              )}
            >
              <input type="radio" name={name} value={c.value} checked={checked} onChange={() => onChange(c.value)} className="sr-only" />
              {c.icon && <span aria-hidden className={cn('shrink-0', checked ? 'text-primary' : 'text-muted-foreground')}>{c.icon}</span>}
              <span className="leading-tight">
                <span className="block">{c.label}</span>
                {c.hint && <span className="block text-sm text-muted-foreground">{c.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-blocked">
          {error}
        </p>
      )}
    </fieldset>
  )
}
