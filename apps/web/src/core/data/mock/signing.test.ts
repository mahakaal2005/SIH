import { describe, expect, it } from 'vitest'
import { exportKeys, generateSigningKeys, importKeys, signText, verifyText } from './signing'

describe('receipt signing (ECDSA P-256)', () => {
  it('verifies a signature over the exact text it signed', async () => {
    const keys = await generateSigningKeys()
    const sig = await signText(keys.privateKey, 'payload')
    expect(await verifyText(keys.publicKey, 'payload', sig)).toBe(true)
  })

  it('rejects tampered text', async () => {
    const keys = await generateSigningKeys()
    const sig = await signText(keys.privateKey, 'loan=64000')
    expect(await verifyText(keys.publicKey, 'loan=640000', sig)).toBe(false)
  })

  it('rejects a garbage signature without throwing', async () => {
    const keys = await generateSigningKeys()
    expect(await verifyText(keys.publicKey, 'x', 'not-base64!!')).toBe(false)
  })

  it('survives a JWK export/import round trip (keys persist in the mock DB)', async () => {
    const keys = await generateSigningKeys()
    const restored = await importKeys(await exportKeys(keys))
    const sig = await signText(restored.privateKey, 'p')
    expect(await verifyText(keys.publicKey, 'p', sig)).toBe(true)
  })
})
