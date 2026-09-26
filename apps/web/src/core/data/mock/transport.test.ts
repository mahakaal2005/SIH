import { describe, expect, it, vi } from 'vitest'
import { MockNetworkError, MockTransport } from './transport'

describe('MockTransport', () => {
  it('waits a latency within the configured range before answering', async () => {
    const sleep = vi.fn(async () => {})
    const t = new MockTransport({ minLatencyMs: 200, maxLatencyMs: 500, random: () => 0.5, sleep })
    expect(await t.call('catalog', async () => 42)).toBe(42)
    expect(sleep).toHaveBeenCalledWith(350)
  })

  it('fails calls to a repository marked failing, and recovers when cleared', async () => {
    const t = new MockTransport({ minLatencyMs: 0, maxLatencyMs: 0 })
    t.setFailing('recommendation', true)
    await expect(t.call('recommendation', async () => 1)).rejects.toBeInstanceOf(MockNetworkError)
    expect(await t.call('catalog', async () => 2)).toBe(2)
    t.setFailing('recommendation', false)
    expect(await t.call('recommendation', async () => 3)).toBe(3)
  })

  it('notifies subscribers when failure injection changes', () => {
    const t = new MockTransport({ minLatencyMs: 0, maxLatencyMs: 0 })
    const listener = vi.fn()
    const off = t.subscribe(listener)
    t.setFailing('partner', true)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(t.failing()).toEqual(['partner'])
    off()
    t.setFailing('partner', false)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
