import type { LanguageService } from './languageService'

function recognitionCtor(): SpeechRecognitionStatic | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

export function createWebSpeechLanguageService(): LanguageService {
  return {
    isSttSupported: () => !!recognitionCtor(),
    isTtsSupported: () => 'speechSynthesis' in window,

    listen(lang, onResult, onError) {
      const Ctor = recognitionCtor()
      if (!Ctor) {
        onError('voice.mic.unsupported')
        return () => {}
      }
      const recognition = new Ctor()
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? ''
        onResult({ transcript })
      }
      recognition.onerror = () => onError('voice.mic.error')
      recognition.start()
      return () => recognition.abort()
    },

    speak(text, lang, onEnd) {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.onend = () => onEnd?.()
      utterance.onerror = () => onEnd?.()
      window.speechSynthesis.speak(utterance)
    },

    cancelSpeech() {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    },
  }
}
