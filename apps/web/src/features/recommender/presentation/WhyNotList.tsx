import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import type { IneligibleView } from '../domain/resultView'

export function WhyNotList({ items }: { items: IneligibleView[] }) {
  const { t, i18n } = useTranslation()
  if (items.length === 0) return null
  return (
    <section aria-labelledby="why-not-title">
      <Accordion type="single" collapsible>
        <AccordionItem value="why-not">
          <AccordionTrigger id="why-not-title">{t('recommender.schemes.whyNotTitle')}</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.schemeId}>
                  <p className="font-medium">{pick(item.name, i18n.language)}</p>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {item.failedReasonKeys.map((k) => (
                      <li key={k}>{t(`${k}.fail`)}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
