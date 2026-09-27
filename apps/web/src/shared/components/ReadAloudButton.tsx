import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageService } from '@/core/di/RepositoryProvider'
import { Button } from '@/shared/ui/button'

const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN' } as const

export function ReadAloudButton({ text, className }: { text: string; className?: string }) {
  const { t, i18n } = useTranslation()
  const languageService = useLanguageService()
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => languageService.cancelSpeech(), [languageService])

  if (!languageService.isTtsSupported()) return null

  function toggle() {
    if (speaking) {
      languageService.cancelSpeech()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    languageService.speak(text, SPEECH_LANG[i18n.language as 'en' | 'hi'] ?? 'en-IN', () => setSpeaking(false))
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label={speaking ? t('voice.readAloud.stop') : t('voice.readAloud.play')}
      aria-pressed={speaking}
      onClick={toggle}
    >
      {speaking ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
    </Button>
  )
}
