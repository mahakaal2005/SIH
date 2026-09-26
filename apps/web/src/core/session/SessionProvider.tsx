import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import i18n, { setDocumentLanguage } from '@/shared/i18n'
import { createSessionStore, type SessionState, type SessionStore } from './sessionStore'

const StoreContext = createContext<SessionStore | null>(null)

export function SessionProvider({ children, store: injected }: { children: ReactNode; store?: SessionStore }) {
  const [store] = useState(() => injected ?? createSessionStore(localStorage))
  const language = useSyncExternalStore(store.subscribe, () => store.get().language)

  useEffect(() => {
    if (!language) return
    void i18n.changeLanguage(language)
    setDocumentLanguage(language)
  }, [language])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useSessionStore(): SessionStore {
  const s = useContext(StoreContext)
  if (!s) throw new Error('SessionProvider is missing') // i18n-ignore: developer error
  return s
}

export function useSession(): SessionState {
  const store = useSessionStore()
  return useSyncExternalStore(store.subscribe, store.get)
}
