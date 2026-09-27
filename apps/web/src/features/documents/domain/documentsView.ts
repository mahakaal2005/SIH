import { documentsForScheme, SOP_COMPONENTS, type DocumentRequirement, type FinancePlan, type Localized, type Scheme } from '@ys/shared'
import type { PreflightResult } from '@/core/data/repositories/types'

export interface ChecklistItem {
  id: string
  name: Localized
  hint: Localized
  digiLocker: boolean
  checked: boolean
}

export interface ProjectReportLine {
  key: (typeof SOP_COMPONENTS)[number]
  amount: number
}

export interface DocumentsView {
  items: ChecklistItem[]
  preflight: PreflightResult[]
  report: ProjectReportLine[] | null
  allChecked: boolean
}

export function toDocumentsView(
  scheme: Scheme,
  allDocuments: DocumentRequirement[],
  checklistState: Record<string, boolean>,
  preflight: PreflightResult[],
  plan: FinancePlan,
): DocumentsView {
  const items: ChecklistItem[] = documentsForScheme(scheme, allDocuments).map((d) => ({
    id: d.id,
    name: d.name,
    hint: d.hint,
    digiLocker: d.digiLocker,
    checked: checklistState[d.id] ?? false,
  }))

  const gia = plan.gia
  const report: ProjectReportLine[] | null = gia
    ? SOP_COMPONENTS.map((key) => ({ key, amount: gia[key] }))
    : null

  return { items, preflight, report, allChecked: items.length > 0 && items.every((i) => i.checked) }
}
