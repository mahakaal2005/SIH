import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import type { ChecklistItem as ChecklistItemModel } from '../domain/documentsView'

export function ChecklistItem({
  item,
  busy,
  onToggle,
  onFetchDigiLocker,
}: {
  item: ChecklistItemModel
  busy: boolean
  onToggle: (checked: boolean) => void
  onFetchDigiLocker: () => void
}) {
  const { t, i18n } = useTranslation()
  return (
    <li className="flex items-start gap-3 rounded-xl border p-3" data-testid={`checklist-item-${item.id}`}>
      <Checkbox
        id={`doc-${item.id}`}
        checked={item.checked}
        onCheckedChange={(checked) => onToggle(checked === true)}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <label htmlFor={`doc-${item.id}`} className="font-medium">
          {pick(item.name, i18n.language)}
        </label>
        <p className="text-sm text-muted-foreground">{pick(item.hint, i18n.language)}</p>
        {item.digiLocker && !item.checked && (
          <Button variant="outline" size="sm" className="mt-2 h-9" disabled={busy} onClick={onFetchDigiLocker}>
            {busy ? t('documents.digiLocker.fetching') : t('documents.digiLocker.fetch')}
          </Button>
        )}
        {item.digiLocker && item.checked && <p className="mt-1 text-xs text-pass">{t('documents.digiLocker.verified')}</p>}
      </div>
    </li>
  )
}
