import { createContext, useContext, type ReactNode } from 'react'
import type { Repositories } from '../data/repositories/types'
import type { LanguageService } from '../services/languageService'
import type { Container, DevTools } from './container'

const ContainerContext = createContext<Container | null>(null)

export function RepositoryProvider({ container, children }: { container: Container; children: ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>
}

function useContainer(): Container {
  const c = useContext(ContainerContext)
  if (!c) throw new Error('RepositoryProvider is missing') // i18n-ignore: developer error
  return c
}

export const useRepositories = (): Repositories => useContainer().repos
export const useDevTools = (): DevTools | null => useContainer().dev
export const useLanguageService = (): LanguageService => useContainer().language
