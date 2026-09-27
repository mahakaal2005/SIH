import { useState } from 'react'
import { useCatalog, useRuleHistory } from '@/core/data/queries'

export function useOfficerRulesViewModel() {
  const catalog = useCatalog()
  const [selected, setSchemeId] = useState<string>()
  const schemeId = selected ?? catalog.data?.schemes[0]?.id

  const history = useRuleHistory(schemeId ?? '')
  const scheme = catalog.data?.schemes.find((s) => s.id === schemeId)

  return { catalog, scheme, schemeId, setSchemeId, history }
}
