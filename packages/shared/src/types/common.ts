export type ProvenanceKind = 'real' | 'seeded'

/** Where a value came from. `seeded` means no public source exists and the value is a placeholder. */
export interface Provenance {
  kind: ProvenanceKind
  ref: string
}

export interface Localized {
  en: string
  hi: string
}

export type Language = 'en' | 'hi'

export type Rupees = number
