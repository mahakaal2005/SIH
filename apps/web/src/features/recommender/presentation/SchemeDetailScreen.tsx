import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { routes } from '@/core/router/routes'
import { MoneyBar } from '@/shared/components/MoneyBar'
import { ReadAloudButton } from '@/shared/components/ReadAloudButton'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { pick } from '@/shared/i18n'
import { formatDate, formatINR, formatPct } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { BetterOddsList } from './BetterOddsList'
import { FunnelDisclosure } from './FunnelDisclosure'
import { moneySegments } from './moneySegments'
import { OddsBadge } from './OddsBadge'
import { useSchemeDetailViewModel } from './useSchemeDetailViewModel'

export function SchemeDetailScreen() {
  const { t, i18n } = useTranslation()
  const { state, retry, continueWithScheme } = useSchemeDetailViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('recommender.detail.title')} backTo={routes.schemes}>
        <LoadingBlock rows={4} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('recommender.detail.title')} backTo={routes.schemes}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'notFound') {
    return (
      <Screen title={t('recommender.detail.title')} backTo={routes.schemes}>
        <p role="alert">{t('recommender.detail.notFound')}</p>
      </Screen>
    )
  }

  const view = state.view!
  const segments = moneySegments(view.financePlan, t)
  const summary = t('recommender.money.summary', { total: formatINR(view.financePlan.projectCost) })
  const spokenSummary = [
    pick(view.name, i18n.language),
    pick(view.summary, i18n.language),
    view.lines.find((l) => l.passed) && t(`${view.lines.find((l) => l.passed)!.reasonKey}.pass`),
    view.approvalRatePct !== undefined && t('recommender.odds.rate', { pct: formatPct(view.approvalRatePct) }),
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <Screen
      title={pick(view.name, i18n.language)}
      lead={pick(view.summary, i18n.language)}
      backTo={routes.schemes}
      wide
      actions={<ReadAloudButton text={spokenSummary} />}
    >
      <div className="space-y-8">
        <OddsBadge approvalRatePct={view.approvalRatePct} lowOdds={view.lowOdds} />
        {view.lowOdds && <BetterOddsList items={view.betterOdds} />}

        <section>
          <h2 className="mb-2 text-lg font-bold">{t('recommender.detail.rulesTitle')}</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            {t('recommender.detail.ruleVersion', { date: formatDate(view.ruleEffectiveFrom), version: view.ruleVersion })}
          </p>
          <ul className="space-y-2">
            {view.lines.map((line, i) => (
              <li key={`${line.reasonKey}-${i}`} className="flex items-start gap-2">
                {line.passed ? (
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-pass" />
                ) : (
                  <X aria-hidden className="mt-0.5 size-4 shrink-0 text-blocked" />
                )}
                <span>{t(`${line.reasonKey}.${line.passed ? 'pass' : 'fail'}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">{t('recommender.detail.financeTitle')}</h2>
          <MoneyBar segments={segments} summary={summary} />
        </section>

        {view.project && (
          <section>
            <h2 className="mb-2 text-lg font-bold">{t('recommender.detail.sopTitle')}</h2>
            {view.project.skillCourses.length > 0 && (
              <p className="mb-2 text-sm">
                {t('recommender.detail.skillCourses')}: {view.project.skillCourses.map((c) => c.name).join(', ')}
              </p>
            )}
            {view.project.conditions.length > 0 && (
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {view.project.conditions.map((c) => (
                  <li key={pick(c, i18n.language)}>{pick(c, i18n.language)}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        <FunnelDisclosure funnel={state.funnel!} />

        <Button className="h-11 w-full" onClick={continueWithScheme}>
          {t('recommender.detail.continue')}
        </Button>
      </div>
    </Screen>
  )
}
