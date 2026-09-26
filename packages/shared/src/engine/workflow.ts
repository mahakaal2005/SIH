import type { ApplicationStage, Scheme } from '../types/domain'

export type OfficerActionType = 'approve_pre_scrutiny' | 'forward_to_bank' | 'sanction' | 'disburse' | 'reject' | 'return_for_fix'
export type WorkflowAction = OfficerActionType | 'resubmit'

export class WorkflowError extends Error {
  readonly from: ApplicationStage
  readonly action: WorkflowAction
  constructor(from: ApplicationStage, action: WorkflowAction) {
    super(`Cannot ${action} from ${from}`)
    this.from = from
    this.action = action
  }
}

/** Mirrors the UPSCFDC process (docs/04 B4–B6): pre-scrutiny → DLPAC → bank (5-day SLA) → sanction → disbursal / SRF. */
const TRANSITIONS: Partial<Record<ApplicationStage, Partial<Record<WorkflowAction, ApplicationStage>>>> = {
  submitted: { approve_pre_scrutiny: 'dlpac', reject: 'rejected', return_for_fix: 'returned' },
  pre_scrutiny: { approve_pre_scrutiny: 'dlpac', reject: 'rejected', return_for_fix: 'returned' },
  dlpac: { forward_to_bank: 'bank', reject: 'rejected', return_for_fix: 'returned' },
  bank: { sanction: 'sanctioned', reject: 'rejected' },
  sanctioned: { disburse: 'disbursed' },
  returned: { resubmit: 'pre_scrutiny' },
}

export function nextStage(from: ApplicationStage, action: WorkflowAction, kind: Scheme['kind']): ApplicationStage {
  const to = TRANSITIONS[from]?.[action]
  if (!to) throw new WorkflowError(from, action)
  return to === 'disbursed' && kind === 'grant_plus_loan' ? 'srf_lock' : to
}

export function allowedActions(stage: ApplicationStage): OfficerActionType[] {
  return Object.keys(TRANSITIONS[stage] ?? {}).filter((a): a is OfficerActionType => a !== 'resubmit')
}
