import { Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageService } from '@/core/di/RepositoryProvider'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN' } as const

export function MicButton({
  onResult,
  className,
  testId,
}: {
  onResult: (transcript: string) => void
  className?: string
  testId?: string
}) {
  const { t, i18n } = useTranslation()
  const languageService = useLanguageService()
  const [listening, setListening] = useState(false)
  const stopRef = useRef<() => void>(() => {})

  useEffect(() => () => stopRef.current(), [])

  if (!languageService.isSttSupported()) return null

  function toggle() {
    if (listening) {
      stopRef.current()
      setListening(false)
      return
    }
    setListening(true)
    stopRef.current = languageService.listen(
      SPEECH_LANG[i18n.language as 'en' | 'hi'] ?? 'en-IN',
      (result) => {
        setListening(false)
        onResult(result.transcript)
      },
      () => setListening(false),
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      data-testid={testId}
      className={cn('shrink-0', listening && 'text-primary', className)}
      aria-label={listening ? t('voice.mic.listening') : t('voice.mic.start')}
      aria-pressed={listening}
      onClick={toggle}
    >
      <Mic aria-hidden className={cn('size-4', listening && 'animate-pulse')} />
    </Button>
  )
}
