const ALG = { name: 'ECDSA', namedCurve: 'P-256' } as const
const SIGN = { name: 'ECDSA', hash: 'SHA-256' } as const

export interface SigningKeys {
  privateKey: CryptoKey
  publicKey: CryptoKey
}

export interface ExportedKeys {
  privateJwk: JsonWebKey
  publicJwk: JsonWebKey
}

const toB64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const bytes = (text: string) => new TextEncoder().encode(text)

export async function generateSigningKeys(): Promise<SigningKeys> {
  return (await crypto.subtle.generateKey(ALG, true, ['sign', 'verify'])) as CryptoKeyPair
}

export async function exportKeys(k: SigningKeys): Promise<ExportedKeys> {
  return {
    privateJwk: await crypto.subtle.exportKey('jwk', k.privateKey),
    publicJwk: await crypto.subtle.exportKey('jwk', k.publicKey),
  }
}

export async function importKeys(e: ExportedKeys): Promise<SigningKeys> {
  return {
    privateKey: await crypto.subtle.importKey('jwk', e.privateJwk, ALG, true, ['sign']),
    publicKey: await crypto.subtle.importKey('jwk', e.publicJwk, ALG, true, ['verify']),
  }
}

export async function signText(key: CryptoKey, text: string): Promise<string> {
  return toB64(await crypto.subtle.sign(SIGN, key, bytes(text)))
}

export async function verifyText(key: CryptoKey, text: string, signatureB64: string): Promise<boolean> {
  try {
    return await crypto.subtle.verify(SIGN, key, fromB64(signatureB64), bytes(text))
  } catch {
    return false
  }
}
