import { useTranslation } from 'react-i18next'
import { routes } from '@/core/router/routes'
import { Screen } from '@/shared/components/Screen'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Button } from '@/shared/ui/button'
import { AffordabilityWarning } from './AffordabilityWarning'
import { EmiCard } from './EmiCard'
import { GiaSplitCard } from './GiaSplitCard'
import { TermSlider } from './TermSlider'
import { useCalculatorViewModel } from './useCalculatorViewModel'

export function CalculatorScreen() {
  const { t } = useTranslation()
  const { state, changeTerms, retry, continuePastCalculator } = useCalculatorViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('calculator.title')} backTo={routes.schemes}>
        <LoadingBlock rows={3} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('calculator.title')} backTo={routes.schemes}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'notFound') {
    return (
      <Screen title={t('calculator.title')} backTo={routes.schemes}>
        <p role="alert">{t('calculator.notFound')}</p>
      </Screen>
    )
  }
  if (state.status === 'noCost') {
    return (
      <Screen title={t('calculator.title')} backTo={routes.schemes}>
        <EmptyBlock title={t('calculator.noCost.title')}>{t('calculator.noCost.body')}</EmptyBlock>
      </Screen>
    )
  }

  const view = state.view!
  const terms = state.terms!

  return (
    <Screen title={t('calculator.title')} backTo={routes.scheme()} wide>
      <div className="space-y-8">
        {view.financePlan.gia && <GiaSplitCard gia={view.financePlan.gia} />}
        <EmiCard view={view} />

        <section className="space-y-4">
          <TermSlider
            labelKey="calculator.terms.rate"
            value={terms.ratePct}
            min={view.rateRange.min}
            max={view.rateRange.max}
            step={0.1}
            formatValue={(v) => `${v}%`}
            onChange={(v) => changeTerms({ ratePct: v })}
          />
          <TermSlider
            labelKey="calculator.terms.tenure"
            value={terms.tenureMonths}
            min={view.tenureRange.min}
            max={view.tenureRange.max}
            formatValue={(v) => t('calculator.terms.months', { count: v })}
            onChange={(v) => changeTerms({ tenureMonths: v })}
          />
          <TermSlider
            labelKey="calculator.terms.moratorium"
            value={terms.moratoriumMonths}
            min={view.moratoriumRange.min}
            max={view.moratoriumRange.max}
            formatValue={(v) => t('calculator.terms.months', { count: v })}
            onChange={(v) => changeTerms({ moratoriumMonths: v })}
          />
        </section>

        <AffordabilityWarning level={view.affordability.level} />

        <Button className="h-11 w-full" onClick={continuePastCalculator}>
          {t('calculator.continue')}
        </Button>
      </div>
    </Screen>
  )
}
