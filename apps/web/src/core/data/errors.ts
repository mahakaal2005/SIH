/** Errors the backend returns. `code` doubles as the i18n key for the user-facing message. */
export class AppError extends Error {
  readonly code: string
  constructor(code: string) {
    super(code)
    this.code = code
    this.name = 'AppError'
  }
}
