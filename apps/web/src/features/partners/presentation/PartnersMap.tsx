import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { pick } from '@/shared/i18n'
import type { PartnerListItem } from '../domain/partnersView'

const STATUS_COLOR = { healthy: '#1b7d4a', caution: '#9b6200', blocked: '#b42318' } as const

export function PartnersMap({
  items,
  center,
  selectedBranchId,
  onSelect,
}: {
  items: PartnerListItem[]
  center: { lat: number; lng: number }
  selectedBranchId?: string
  onSelect: (branchId: string) => void
}) {
  const { i18n } = useTranslation()
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={10} scrollWheelZoom={false} className="h-64 w-full rounded-xl">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {items.map(({ match }) => (
        <CircleMarker
          key={match.branch.id}
          center={[match.branch.lat, match.branch.lng]}
          radius={match.branch.id === selectedBranchId ? 10 : 7}
          pathOptions={{
            color: STATUS_COLOR[match.health.status],
            fillColor: STATUS_COLOR[match.health.status],
            fillOpacity: 0.8,
          }}
          eventHandlers={{ click: () => onSelect(match.branch.id) }}
        >
          <Popup>{pick(match.branch.name, i18n.language)}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
