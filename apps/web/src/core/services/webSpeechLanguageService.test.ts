import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createWebSpeechLanguageService } from './webSpeechLanguageService'

class FakeRecognition extends EventTarget implements SpeechRecognition {
  lang = ''
  continuous = false
  interimResults = false
  maxAlternatives = 1
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null
  onend: (() => void) | null = null
  started = false
  aborted = false
  start() {
    this.started = true
  }
  stop() {}
  abort() {
    this.aborted = true
  }
}

class FakeUtterance {
  lang = ''
  text: string
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}

describe('webSpeechLanguageService', () => {
  let recognitionInstances: FakeRecognition[]

  beforeEach(() => {
    recognitionInstances = []
    vi.stubGlobal(
      'SpeechRecognition',
      class {
        constructor() {
          const instance = new FakeRecognition()
          recognitionInstances.push(instance)
          return instance
        }
      },
    )
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports STT/TTS as supported when the globals exist', () => {
    const service = createWebSpeechLanguageService()
    expect(service.isSttSupported()).toBe(true)
    expect(service.isTtsSupported()).toBe(true)
  })

  it('reports unsupported when the globals are missing', () => {
    vi.unstubAllGlobals()
    const service = createWebSpeechLanguageService()
    expect(service.isSttSupported()).toBe(false)
    expect(service.isTtsSupported()).toBe(false)
  })

  it('starts recognition with the given language and delivers the transcript', () => {
    const service = createWebSpeechLanguageService()
    const onResult = vi.fn()
    service.listen('hi-IN', onResult, vi.fn())
    const recognition = recognitionInstances[0]!
    expect(recognition.lang).toBe('hi-IN')
    expect(recognition.started).toBe(true)
    recognition.onresult?.({ results: [[{ transcript: 'नमस्ते' }]] } as unknown as SpeechRecognitionEvent)
    expect(onResult).toHaveBeenCalledWith({ transcript: 'नमस्ते' })
  })

  it('stop function aborts the in-progress recognition', () => {
    const service = createWebSpeechLanguageService()
    const stop = service.listen('en-IN', vi.fn(), vi.fn())
    stop()
    expect(recognitionInstances[0]!.aborted).toBe(true)
  })

  it('calls onError when recognition errors', () => {
    const service = createWebSpeechLanguageService()
    const onError = vi.fn()
    service.listen('en-IN', vi.fn(), onError)
    recognitionInstances[0]!.onerror?.({} as SpeechRecognitionErrorEvent)
    expect(onError).toHaveBeenCalledWith('voice.mic.error')
  })

  it('speak() builds an utterance with the given language and calls onEnd when it finishes', () => {
    const service = createWebSpeechLanguageService()
    const onEnd = vi.fn()
    service.speak('hello', 'en-IN', onEnd)
    const spoken = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]![0] as FakeUtterance
    expect(spoken.text).toBe('hello')
    expect(spoken.lang).toBe('en-IN')
    spoken.onend?.()
    expect(onEnd).toHaveBeenCalled()
  })
})
