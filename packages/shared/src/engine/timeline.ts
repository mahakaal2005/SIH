import type { ApplicationStage, StageEvent } from '../types/domain'

export const PIPELINE_STAGES = ['submitted', 'pre_scrutiny', 'dlpac', 'bank', 'sanctioned'] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]
export type StageDurations = Record<PipelineStage, number>

const TERMINAL: ApplicationStage[] = ['disbursed', 'srf_lock', 'completed', 'rejected']
const DAY = 86_400_000

const addDays = (iso: string, days: number) => new Date(Date.parse(iso.slice(0, 10)) + days * DAY).toISOString().slice(0, 10)

export interface StageEstimate {
  stage: PipelineStage
  expectedDays: number
  expectedStart: string
  expectedEnd: string
}

export function estimateTimeline(submittedAt: string, durations: StageDurations): StageEstimate[] {
  let cursor = submittedAt.slice(0, 10)
  return PIPELINE_STAGES.map((stage) => {
    const expectedStart = cursor
    cursor = addDays(cursor, durations[stage])
    return { stage, expectedDays: durations[stage], expectedStart, expectedEnd: cursor }
  })
}

export const STALL_FACTOR = 2

export function stalledInfo(
  stage: ApplicationStage,
  history: StageEvent[],
  durations: StageDurations,
  now: Date,
): { daysInStage: number; expectedDays: number; stalled: boolean } {
  const enteredAt = [...history].reverse().find((e) => e.stage === stage)?.at ?? history.at(-1)?.at
  const daysInStage = enteredAt ? Math.floor((now.getTime() - Date.parse(enteredAt)) / DAY) : 0
  const expectedDays = (durations as Record<string, number>)[stage] ?? 0
  const stalled = !TERMINAL.includes(stage) && expectedDays > 0 && daysInStage > expectedDays * STALL_FACTOR
  return { daysInStage, expectedDays, stalled }
}
