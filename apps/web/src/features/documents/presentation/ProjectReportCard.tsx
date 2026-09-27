import { useTranslation } from 'react-i18next'
import { formatINR } from '@/shared/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import type { ProjectReportLine } from '../domain/documentsView'

export function ProjectReportCard({ report }: { report: ProjectReportLine[] }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('documents.report.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1.5 text-sm">
          {report.map((line) => (
            <div key={line.key} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t(`documents.report.${line.key}`)}</dt>
              <dd className="figure">{formatINR(line.amount)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
