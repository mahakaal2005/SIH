import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/utils'

export function Screen({
  title,
  lead,
  backTo,
  actions,
  wide,
  children,
}: {
  title: string
  lead?: ReactNode
  backTo?: string
  actions?: ReactNode
  wide?: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section className={cn('mx-auto w-full px-4 pt-4 pb-28', wide ? 'max-w-6xl' : 'max-w-xl')}>
      {backTo && (
        <Link to={backTo} className="-ml-2 mb-2 inline-flex h-11 items-center gap-1 rounded-md px-2 text-primary">
          <ChevronLeft aria-hidden className="size-5" />
          {t('common.back')}
        </Link>
      )}
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-bold text-foreground">{title}</h1>
          {lead && <p className="mt-1 max-w-prose text-muted-foreground">{lead}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
