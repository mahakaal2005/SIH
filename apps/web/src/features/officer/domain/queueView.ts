import { stalledInfo, type Application, type StageDurations } from '@ys/shared'

export interface QueueRow {
  application: Application
  daysInStage: number
  stalled: boolean
}

/** One row per application, with the same ageing/stall computation the citizen status screen uses. */
export function toQueueView(applications: Application[], durations: StageDurations, now: Date): QueueRow[] {
  return applications.map((application) => {
    const info = stalledInfo(application.stage, application.history, durations, now)
    return { application, daysInStage: info.daysInStage, stalled: info.stalled }
  })
}

/** Same rows, oldest-in-stage first — "call these first" for the HQ Tele Caller role. */
export function toCallList(rows: QueueRow[]): QueueRow[] {
  return [...rows].sort((a, b) => b.daysInStage - a.daysInStage)
}
