import { formatINR } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

export type MoneyKind = 'own' | 'grant' | 'subsidy' | 'loan'

export interface MoneySegment {
  kind: MoneyKind
  amount: number
  label: string
}

const fill: Record<MoneyKind, string> = {
  own: 'bg-own',
  grant: 'bg-grant',
  subsidy: 'bg-grant',
  loan: 'bg-loan',
}

/** Splits a project cost into who pays what. Grant/subsidy is always haldi: money that is given, not lent. */
export function MoneyBar({ segments, summary, className }: { segments: MoneySegment[]; summary: string; className?: string }) {
  const total = segments.reduce((s, x) => s + x.amount, 0) || 1
  const visible = segments.filter((s) => s.amount > 0)
  return (
    <figure className={cn('space-y-3', className)}>
      <div role="img" aria-label={summary} className="flex h-5 w-full overflow-hidden rounded-full bg-muted">
        {visible.map((s) => (
          <div key={s.kind} className={cn('h-full', fill[s.kind])} style={{ width: `${(s.amount / total) * 100}%` }} />
        ))}
      </div>
      <ul className="space-y-1.5">
        {visible.map((s) => (
          <li key={s.kind} className="flex items-baseline gap-2.5">
            <span aria-hidden className={cn('size-3 shrink-0 translate-y-0.5 rounded-full', fill[s.kind])} />
            <span className="flex-1 text-muted-foreground">{s.label}</span>
            <span className={cn('figure text-lg', (s.kind === 'grant' || s.kind === 'subsidy') && 'text-grant-ink')}>
              {formatINR(s.amount)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}
