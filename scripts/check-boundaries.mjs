// Enforces: a feature may not import another feature's internals, and packages/shared may not import React/web code.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'

const root = resolve(dirname(new URL(import.meta.url).pathname), '..')
const featuresDir = join(root, 'apps/web/src/features')
const sharedDir = join(root, 'packages/shared/src')
const importRe = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

function walk(dir) {
  let out = []
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out = out.concat(walk(p))
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

const violations = []

for (const file of walk(featuresDir)) {
  const own = relative(featuresDir, file).split('/')[0]
  for (const m of readFileSync(file, 'utf8').matchAll(importRe)) {
    const spec = m[1] ?? m[2]
    let target = null
    if (spec.startsWith('@/features/')) target = spec.split('/')[2]
    else if (spec.startsWith('.')) {
      const abs = resolve(dirname(file), spec)
      if (abs.startsWith(featuresDir + '/')) target = relative(featuresDir, abs).split('/')[0]
    }
    if (target && target !== own) violations.push(`${relative(root, file)} imports feature "${target}" (${spec})`)
  }
}

for (const file of walk(sharedDir)) {
  for (const m of readFileSync(file, 'utf8').matchAll(importRe)) {
    const spec = m[1] ?? m[2]
    if (/^(react|react-dom|@\/)/.test(spec)) violations.push(`${relative(root, file)} imports web-only module ${spec}`)
  }
}

if (violations.length) {
  console.error('Architecture boundary violations:\n  ' + violations.join('\n  '))
  process.exit(1)
}
console.log('Boundaries OK')
