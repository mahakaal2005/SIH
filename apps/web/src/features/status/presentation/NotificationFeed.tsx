import { useTranslation } from 'react-i18next'
import type { Notification } from '@/core/data/repositories/types'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function NotificationFeed({ notifications, onRead }: { notifications: Notification[]; onRead: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('status.detail.notifications.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('status.detail.notifications.empty')}</p>
        ) : (
          <ul className="space-y-2" data-testid="notification-feed">
            {notifications.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  data-testid={`notification-${note.id}`}
                  className={cn(
                    'w-full rounded-xl border p-2 text-left text-sm',
                    !note.read && 'border-primary/30 bg-primary/5 font-medium',
                  )}
                  disabled={note.read}
                  onClick={() => onRead(note.id)}
                >
                  <p>{t(note.messageKey, note.params)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(note.at)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
