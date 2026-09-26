import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorBlock } from './states'

interface Props {
  children: ReactNode
  /** Changing this key clears a caught error, e.g. on navigation. */
  resetKey?: string
}

interface State {
  failed: boolean
  resetKey?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-xl p-4">
        <ErrorBlock messageKey="errors.generic" onRetry={() => this.setState({ failed: false })} />
      </div>
    )
  }
}
