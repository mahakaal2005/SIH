import { CircleCheck, MapPin } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { searchDistricts, type District } from '@ys/shared'
import { pick } from '@/shared/i18n'
import { MicButton } from '@/shared/components/MicButton'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

const MAX = 8

/** Accessible combobox. Also matches legacy names ("Allahabad" → Prayagraj), the alias problem from docs/04 Part E. */
export function DistrictSearch({
  districts,
  value,
  onChange,
  label,
  error,
}: {
  districts: District[]
  value: string | undefined
  onChange: (id: string) => void
  label: string
  error?: string
}) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const selected = districts.find((d) => d.id === value)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const matches = useMemo(() => searchDistricts(query, districts).slice(0, MAX), [query, districts])

  function choose(d: District) {
    onChange(d.id)
    setQuery('')
    setOpen(false)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, matches.length - 1))
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
    else if (e.key === 'Enter' && open && matches[active]) choose(matches[active]!.district)
    else if (e.key === 'Escape') setOpen(false)
    else return
    e.preventDefault()
  }

  const listId = `${id}-list`
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-2 block font-medium">
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <MapPin aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            role="combobox"
            aria-expanded={open && query.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
            aria-invalid={!!error}
            autoComplete="off"
            placeholder={t('onboarding.profile.districtPlaceholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
              setOpen(true)
            }}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="h-14 pl-10 text-lg"
          />
        </div>
        <MicButton
          className="h-14 w-14"
          testId="mic-districtId"
          onResult={(transcript) => {
            setQuery(transcript)
            setActive(0)
            setOpen(true)
          }}
        />
      </div>
      {open && query && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-lg">
          {matches.length === 0 && <li className="px-3 py-3 text-muted-foreground">{t('onboarding.profile.districtNone')}</li>}
          {matches.map((m, i) => (
            <li
              key={m.district.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(m.district)}
              className={cn('cursor-pointer rounded-lg px-3 py-2.5', i === active && 'bg-secondary')}
            >
              <span className="block">{pick(m.district.name, i18n.language)}</span>
              {m.matchedAlias && (
                <span className="block text-sm text-muted-foreground">
                  {t('onboarding.profile.districtAlias', { alias: m.matchedAlias, district: pick(m.district.name, i18n.language) })}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {selected && !open && (
        <p className="mt-2 flex items-center gap-1.5 font-medium text-pass" aria-live="polite">
          <CircleCheck aria-hidden className="size-5" />
          {pick(selected.name, i18n.language)}
        </p>
      )}
      {error && <p className="mt-1.5 text-sm text-blocked">{error}</p>}
    </div>
  )
}
