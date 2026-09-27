// Enforces:
//  1. a feature may not import another feature's internals
//  2. packages/shared may not import React/web code
//  3. PII never reaches an LLM: code under any `llm/` directory may not touch applicant PII.
//     Only `llm/privacy/` (the privacy gate that masks PII) is exempt.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const importRe = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
const piiRe = /\b(fullName|casteCategory|annualFamilyIncome|ApplicantProfile|applicantProfileSchema|aadhaar\w*|phone\w*|mobileNumber)\b/gi
const skipDirs = new Set(['node_modules', 'dist', 'dev-dist', 'coverage'])

function walk(dir) {
  let out = []
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (skipDirs.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out = out.concat(walk(p))
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

export function checkBoundaries(root) {
  const featuresDir = join(root, 'apps/web/src/features')
  const sharedDir = join(root, 'packages/shared/src')
  const violations = []

  for (const file of walk(featuresDir)) {
    const own = relative(featuresDir, file).split(sep)[0]
    for (const m of readFileSync(file, 'utf8').matchAll(importRe)) {
      const spec = m[1] ?? m[2]
      let target = null
      if (spec.startsWith('@/features/')) target = spec.split('/')[2]
      else if (spec.startsWith('.')) {
        const abs = resolve(dirname(file), spec)
        if (abs.startsWith(featuresDir + sep)) target = relative(featuresDir, abs).split(sep)[0]
      }
      if (target && target !== own) violations.push(`${relative(root, file)} imports feature "${target}" (${spec})`)
    }
  }

  const webSrc = join(root, 'apps/web/src')
  for (const layer of ['core', 'shared', 'features']) {
    for (const file of walk(join(webSrc, layer))) {
      for (const m of readFileSync(file, 'utf8').matchAll(importRe)) {
        const spec = m[1] ?? m[2]
        const abs = spec.startsWith('@/') ? join(webSrc, spec.slice(2)) : spec.startsWith('.') ? resolve(dirname(file), spec) : null
        if (!abs) continue
        const intoApp = abs.startsWith(join(webSrc, 'app') + sep)
        const intoFeature = layer !== 'features' && abs.startsWith(join(webSrc, 'features') + sep)
        if (intoApp || intoFeature) violations.push(`${relative(root, file)} imports ${intoApp ? 'the app layer' : 'a feature'} (${spec}); only app/ composes features`)
      }
    }
  }

  for (const file of walk(sharedDir)) {
    for (const m of readFileSync(file, 'utf8').matchAll(importRe)) {
      const spec = m[1] ?? m[2]
      if (/^(react|react-dom|@\/)/.test(spec)) violations.push(`${relative(root, file)} imports web-only module ${spec}`)
    }
  }

  const sourceRoots = ['apps', 'packages'].flatMap((top) => {
    try { return readdirSync(join(root, top)).map((pkg) => join(root, top, pkg, 'src')) } catch { return [] }
  })
  for (const file of sourceRoots.flatMap(walk)) {
    const parts = relative(root, file).split(sep)
    const llmAt = parts.indexOf('llm')
    if (llmAt === -1 || parts[llmAt + 1] === 'privacy') continue
    const hits = new Set([...stripComments(readFileSync(file, 'utf8')).matchAll(piiRe)].map((m) => m[1]))
    if (hits.size) violations.push(`${relative(root, file)} touches PII (${[...hits].join(', ')}); route it through llm/privacy/`)
  }

  return violations
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const violations = checkBoundaries(root)
  if (violations.length) {
    console.error('Architecture boundary violations:\n  ' + violations.join('\n  '))
    process.exit(1)
  }
  console.log('Boundaries OK')
}
