import type { District } from '../types/domain'

const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/[\s\-_.,()'’]+/g, '')

export function resolveDistrict(query: string, districts: District[]): District | undefined {
  const q = norm(query)
  if (!q) return undefined
  return districts.find((d) => [d.name.en, d.name.hi, ...d.aliases].some((n) => norm(n) === q))
}

export interface DistrictMatch {
  district: District
  matchedAlias?: string
}

export function searchDistricts(query: string, districts: District[]): DistrictMatch[] {
  const q = norm(query)
  if (!q) return []
  const out: DistrictMatch[] = []
  for (const district of districts) {
    if ([district.name.en, district.name.hi].some((n) => norm(n).startsWith(q))) out.push({ district })
    else {
      const alias = district.aliases.find((a) => norm(a).startsWith(q))
      if (alias) out.push({ district, matchedAlias: alias })
    }
  }
  return out
}

export interface LatLng {
  lat: number
  lng: number
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(s))
}
