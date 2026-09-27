import { useState } from 'react'
import { useCatalog } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import type { ReceiptVerification } from '@/core/data/repositories/types'

export function useVerifyViewModel() {
  const { application } = useRepositories()
  const catalog = useCatalog()
  const [text, setText] = useState('')
  const [result, setResult] = useState<ReceiptVerification>()
  const [checking, setChecking] = useState(false)

  async function check() {
    setChecking(true)
    try {
      setResult(await application.verifyReceipt(text))
    } finally {
      setChecking(false)
    }
  }

  const scheme = result?.valid ? catalog.data?.schemes.find((s) => s.id === result.application.schemeId) : undefined
  const district = result?.valid ? catalog.data?.districts.find((d) => d.id === result.application.districtId) : undefined

  return { text, setText, result, checking, check, scheme, district }
}
