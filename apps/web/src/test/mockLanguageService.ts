import type { LanguageService, SpeechLang, SpeechResult } from '@/core/services/languageService'

export interface MockLanguageService extends LanguageService {
  sttSupported: boolean
  ttsSupported: boolean
  speakCalls: { text: string; lang: SpeechLang }[]
  /** Simulates the browser delivering a transcript for the most recent `listen()` call. */
  fireResult(result: SpeechResult): void
  fireError(errorKey: string): void
}

/** A test double for `LanguageService` — no real browser Speech APIs in jsdom/Vitest. */
export function createMockLanguageService(): MockLanguageService {
  let onResult: ((result: SpeechResult) => void) | undefined
  let onError: ((errorKey: string) => void) | undefined

  return {
    sttSupported: true,
    ttsSupported: true,
    speakCalls: [],
    isSttSupported() {
      return this.sttSupported
    },
    isTtsSupported() {
      return this.ttsSupported
    },
    listen(_lang, resultCb, errorCb) {
      onResult = resultCb
      onError = errorCb
      return () => {
        onResult = undefined
        onError = undefined
      }
    },
    speak(text, lang, onEnd) {
      this.speakCalls.push({ text, lang })
      onEnd?.()
    },
    cancelSpeech() {},
    fireResult(result) {
      onResult?.(result)
    },
    fireError(errorKey) {
      onError?.(errorKey)
    },
  }
}
