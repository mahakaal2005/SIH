import type { NotificationRepository } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'

export function createNotificationRepository(db: MockDb, transport: MockTransport): NotificationRepository {
  const notification: NotificationRepository = {
    list: (userId) =>
      transport.call('notification', async () =>
        db.state.notifications.filter((x) => x.userId === userId).sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id, undefined, { numeric: true })),
      ),
    markRead: (noteId) =>
      transport.call('notification', async () => {
        await db.commit((s) => {
          const note = s.notifications.find((x) => x.id === noteId)
          if (note) note.read = true
        })
      }),
  }
  return notification
}
