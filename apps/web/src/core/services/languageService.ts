export type SpeechLang = 'hi-IN' | 'en-IN'

export interface SpeechResult {
  transcript: string
}

/** Wraps whichever engine actually does STT/TTS (Web Speech API today, Bhashini later) behind one interface. */
export interface LanguageService {
  isSttSupported(): boolean
  isTtsSupported(): boolean
  /** Starts listening; calls `onResult` once with the final transcript, or `onError` with an i18n key. Returns a stop function. */
  listen(lang: SpeechLang, onResult: (result: SpeechResult) => void, onError: (errorKey: string) => void): () => void
  /** `onEnd` fires once speech finishes naturally or is cancelled. */
  speak(text: string, lang: SpeechLang, onEnd?: () => void): void
  cancelSpeech(): void
}
