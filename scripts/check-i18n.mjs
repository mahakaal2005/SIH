// Enforces F0.6 "no hardcoded strings, ever":
//  1. every locale in apps/web/src/shared/i18n/locales/<lang>.json has exactly the keys of en.json, none empty
//  2. no user-visible literal text in JSX children or in text-bearing attributes
// Escape hatch for a genuine non-translatable literal: put `i18n-ignore` in a comment on the same line.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, resolve, dirname, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const LOCALES_DIR = 'apps/web/src/shared/i18n/locales'
const REQUIRED = ['en', 'hi']
const WEB_SRC = 'apps/web/src'
// shadcn primitives and tests never carry product copy
const exempt = (rel) => rel.startsWith(`${WEB_SRC}/shared/ui/`) || rel.startsWith(`${WEB_SRC}/test/`) || /\.(test|spec)\.tsx$/.test(rel)

const hasWord = /[A-Za-zऀ-ॿ]{2,}/
const jsxTextRe = />\s*([^<>{}\n=;()&|`]+?)\s*<\/?[A-Za-z]/g
const attrRe = /\b(placeholder|title|alt|aria-label|label|aria-description)="([^"]*)"/g

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out)
    else out[key] = v
  }
  return out
}

function walk(dir) {
  let out = []
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (name === 'node_modules') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out = out.concat(walk(p))
    else if (name.endsWith('.tsx')) out.push(p)
  }
  return out
}

export function checkLocales(root) {
  const dir = join(root, LOCALES_DIR)
  if (!existsSync(dir)) return []
  const problems = []
  const locales = {}
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const lang = name.slice(0, -5)
    try { locales[lang] = flatten(JSON.parse(readFileSync(join(dir, name), 'utf8'))) }
    catch (e) { problems.push(`${LOCALES_DIR}/${name}: invalid JSON (${e.message})`) }
  }
  for (const lang of REQUIRED) if (!locales[lang] && !problems.some((p) => p.includes(`/${lang}.json`))) problems.push(`${LOCALES_DIR}/${lang}.json is missing`)
  const base = locales.en
  if (!base) return problems
  for (const [lang, keys] of Object.entries(locales)) {
    for (const [k, v] of Object.entries(keys)) if (typeof v === 'string' && !v.trim()) problems.push(`${lang}: "${k}" is empty`)
    if (lang === 'en') continue
    for (const k of Object.keys(base)) if (!(k in keys)) problems.push(`${lang}: missing key "${k}"`)
    for (const k of Object.keys(keys)) if (!(k in base)) problems.push(`${lang}: extra key "${k}" not in en`)
  }
  return problems
}

export function checkHardcoded(root) {
  const problems = []
  for (const file of walk(join(root, WEB_SRC))) {
    const rel = relative(root, file).split(sep).join('/')
    if (exempt(rel)) continue
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (line.includes('i18n-ignore') || /^\s*(\/\/|\*|import\b)/.test(line)) return
      for (const m of line.matchAll(jsxTextRe)) if (hasWord.test(m[1])) problems.push(`${rel}:${i + 1} hardcoded text "${m[1].trim()}"`)
      for (const m of line.matchAll(attrRe)) if (hasWord.test(m[2])) problems.push(`${rel}:${i + 1} hardcoded ${m[1]}="${m[2]}"`)
    })
  }
  return problems
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const problems = [...checkLocales(root), ...checkHardcoded(root)]
  if (problems.length) {
    console.error('i18n violations (F0.6: no hardcoded strings):\n  ' + problems.join('\n  '))
    process.exit(1)
  }
  console.log('i18n OK')
}
