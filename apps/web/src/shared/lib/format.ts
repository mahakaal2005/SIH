import type { Language } from '@ys/shared'

const whole = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const paise = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const upTo2 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
const oneDp = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 })

const UNITS: Record<Language, { lakh: string; crore: string }> = {
  en: { lakh: 'lakh', crore: 'crore' },
  hi: { lakh: 'लाख', crore: 'करोड़' },
}

export function formatINR(amount: number, opts: { paise?: boolean } = {}): string {
  return `₹${(opts.paise ? paise : whole).format(amount)}`
}

export function formatRupeesShort(amount: number, lang: Language): string {
  if (amount >= 1e7) return `₹${upTo2.format(amount / 1e7)} ${UNITS[lang].crore}`
  if (amount >= 1e5) return `₹${upTo2.format(amount / 1e5)} ${UNITS[lang].lakh}`
  return formatINR(amount)
}

const dateParts = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' })

/** DD-MM-YYYY in Indian Standard Time. */
export function formatDate(iso: string): string {
  return dateParts.format(new Date(iso)).replaceAll('/', '-')
}

export function formatPct(value: number): string {
  return `${oneDp.format(value)}%`
}
