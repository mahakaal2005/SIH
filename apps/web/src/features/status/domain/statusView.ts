import { estimateTimeline, type Application, type PipelineStage, type StageDurations } from '@ys/shared'

export type StepStatus = 'done' | 'current' | 'upcoming'

export interface TimelineStep {
  stage: PipelineStage
  status: StepStatus
  expectedStart: string
  expectedEnd: string
  actualAt?: string
}

export type Terminal = 'none' | 'disbursed' | 'srf_lock' | 'completed' | 'rejected' | 'returned'

export interface StatusDetailView {
  steps: TimelineStep[]
  terminal: Terminal
  rejectionReasonKey?: string
  canResubmit: boolean
}

const TERMINALS: Terminal[] = ['disbursed', 'srf_lock', 'completed', 'rejected', 'returned']

export function toTimelineView(app: Application, durations: StageDurations): StatusDetailView {
  const estimates = estimateTimeline(app.submittedAt, durations)
  const terminal = (TERMINALS as string[]).includes(app.stage) ? (app.stage as Terminal) : 'none'

  const steps: TimelineStep[] = estimates.map((e) => {
    const reached = app.history.find((h) => h.stage === e.stage)
    const status: StepStatus = e.stage === app.stage ? 'current' : reached ? 'done' : 'upcoming'
    return { stage: e.stage, status, expectedStart: e.expectedStart, expectedEnd: e.expectedEnd, actualAt: reached?.at }
  })

  const isRejectionLike = terminal === 'rejected' || terminal === 'returned'
  return {
    steps,
    terminal,
    rejectionReasonKey: isRejectionLike ? app.history.at(-1)?.reasonKey : undefined,
    canResubmit: terminal === 'returned',
  }
}
