import type { Repositories } from '../repositories/types'

export type RepoName = keyof Repositories

export class MockNetworkError extends Error {
  readonly repo: RepoName
  constructor(repo: RepoName) {
    super(`Simulated network failure in ${repo}`)
    this.repo = repo
    this.name = 'MockNetworkError'
  }
}

export interface TransportOptions {
  minLatencyMs: number
  maxLatencyMs: number
  random?: () => number
  sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Simulates the network between the app and the backend: latency plus per-repository failure injection. */
export class MockTransport {
  private readonly failingRepos = new Set<RepoName>()
  private readonly listeners = new Set<() => void>()

  private readonly opts: TransportOptions
  constructor(opts: TransportOptions) {
    this.opts = opts
  }

  async call<T>(repo: RepoName, fn: () => Promise<T>): Promise<T> {
    const { minLatencyMs: min, maxLatencyMs: max } = this.opts
    const ms = Math.round(min + (this.opts.random ?? Math.random)() * (max - min))
    if (ms > 0) await (this.opts.sleep ?? defaultSleep)(ms)
    if (this.failingRepos.has(repo)) throw new MockNetworkError(repo)
    return fn()
  }

  setFailing(repo: RepoName, failing: boolean) {
    if (failing) this.failingRepos.add(repo)
    else this.failingRepos.delete(repo)
    this.listeners.forEach((l) => l())
  }

  failing(): RepoName[] {
    return [...this.failingRepos]
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
