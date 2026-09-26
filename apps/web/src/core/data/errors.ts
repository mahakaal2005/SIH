/** Errors the backend returns. `code` doubles as the i18n key for the user-facing message. */
export class AppError extends Error {
  readonly code: string
  constructor(code: string) {
    super(code)
    this.code = code
    this.name = 'AppError'
  }
}

/** Maps anything thrown by a repository to an i18n key under `errors.*`. */
export function errorKey(err: unknown): string {
  if (err instanceof AppError) return `errors.${err.code}`
  if (err instanceof Error && err.name === 'MockNetworkError') return 'errors.network'
  if (err instanceof TypeError && /fetch|network/i.test(err.message)) return 'errors.network'
  return 'errors.generic'
}
