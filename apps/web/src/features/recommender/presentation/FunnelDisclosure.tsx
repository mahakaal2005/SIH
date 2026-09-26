import { useTranslation } from 'react-i18next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { pick } from '@/shared/i18n'
import { formatNumber, formatPct } from '@/shared/lib/format'
import type { FunnelDisclosure as FunnelDisclosureView } from '../domain/oddsView'

export function FunnelDisclosure({ funnel }: { funnel: FunnelDisclosureView }) {
  const { t, i18n } = useTranslation()
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="about-numbers">
        <AccordionTrigger>{t('recommender.odds.aboutTitle')}</AccordionTrigger>
        <AccordionContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>{t('recommender.odds.noDecision', { pct: formatPct(funnel.noDecisionPct), applied: formatNumber(funnel.applied) })}</p>
          <p>{t('recommender.odds.mostApplications', { district: pick(funnel.mostApplications.name, i18n.language), count: formatNumber(funnel.mostApplications.count) })}</p>
          <p>{t('recommender.odds.mostApprovals', { district: pick(funnel.mostApprovals.name, i18n.language), count: formatNumber(funnel.mostApprovals.count) })}</p>
          <p>{t('recommender.odds.source')}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
