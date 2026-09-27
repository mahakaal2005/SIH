import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { checkBoundaries } from './check-boundaries.mjs'
import { checkLocales, checkHardcoded, LOCALES_DIR } from './check-i18n.mjs'

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'ys-checks-'))
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content))
  }
  return root
}

function withRepo(files, fn) {
  const root = repo(files)
  try { fn(root) } finally { rmSync(root, { recursive: true, force: true }) }
}

test('boundaries: cross-feature import is flagged, own-feature import is not', () => {
  withRepo({
    'apps/web/src/features/calculator/a.ts': "import x from '@/features/locator/internal'\nimport y from './b'",
    'apps/web/src/features/calculator/b.ts': 'export default 1',
  }, (root) => {
    const v = checkBoundaries(root)
    assert.equal(v.length, 1)
    assert.match(v[0], /imports feature "locator"/)
  })
})

test('boundaries: shared package importing react is flagged', () => {
  withRepo({ 'packages/shared/src/x.ts': "import { useState } from 'react'" }, (root) => {
    assert.match(checkBoundaries(root)[0], /web-only module react/)
  })
})

test('PII: llm code touching caste or income is flagged, privacy gate is exempt', () => {
  withRepo({
    'apps/api/src/llm/explain.ts': 'export const f = (p) => `${p.casteCategory} ${p.annualFamilyIncome}`',
    'apps/api/src/llm/privacy/mask.ts': 'export const mask = (p) => ({ ...p, fullName: undefined, aadhaarNumber: undefined })',
    'apps/api/src/engine/rules.ts': 'export const r = (p) => p.casteCategory === "SC"',
  }, (root) => {
    const v = checkBoundaries(root)
    assert.equal(v.length, 1)
    assert.match(v[0], /llm\/explain\.ts touches PII \(casteCategory, annualFamilyIncome\)/)
  })
})

test('PII: mentions inside comments are ignored', () => {
  withRepo({ 'apps/api/src/llm/prompt.ts': '// never pass casteCategory here\n/* no aadhaar */\nexport const p = 1' }, (root) => {
    assert.deepEqual(checkBoundaries(root), [])
  })
})

test('locales: missing, extra and empty keys are reported', () => {
  withRepo({
    [`${LOCALES_DIR}/en.json`]: { home: { title: 'Home', cta: 'Start' } },
    [`${LOCALES_DIR}/hi.json`]: { home: { title: '' }, stray: 'x' },
  }, (root) => {
    const p = checkLocales(root)
    assert.ok(p.includes('hi: missing key "home.cta"'))
    assert.ok(p.includes('hi: extra key "stray" not in en'))
    assert.ok(p.includes('hi: "home.title" is empty'))
  })
})

test('locales: hi.json is required once locales exist', () => {
  withRepo({ [`${LOCALES_DIR}/en.json`]: { a: 'A' } }, (root) => {
    assert.deepEqual(checkLocales(root), [`${LOCALES_DIR}/hi.json is missing`])
  })
})

test('locales: no locales dir yet is not an error', () => {
  withRepo({}, (root) => assert.deepEqual(checkLocales(root), []))
})

test('hardcoded: JSX text and text attributes are flagged; t() calls, symbols, ui primitives and ignores are not', () => {
  withRepo({
    'apps/web/src/features/home/Home.tsx': [
      'export const Home = () => (',
      '  <main>',
      '    <h1>Find your scheme</h1>',
      '    <input placeholder="Enter district" />',
      "    <p>{t('home.subtitle')}</p>",
      '    <span>₹ · 100</span>',
      '    <abbr>NSFDC</abbr> {/* i18n-ignore */}',
      '  </main>',
      ')',
    ].join('\n'),
    'apps/web/src/shared/ui/button.tsx': 'export const B = () => <button>Click</button>',
  }, (root) => {
    const p = checkHardcoded(root)
    assert.equal(p.length, 2, p.join('\n'))
    assert.match(p[0], /Home\.tsx:3 hardcoded text "Find your scheme"/)
    assert.match(p[1], /Home\.tsx:4 hardcoded placeholder="Enter district"/)
  })
})

test('hardcoded: Hindi literals are flagged too', () => {
  withRepo({ 'apps/web/src/App.tsx': 'export const A = () => <h1>योजना सारथी</h1>' }, (root) => {
    assert.equal(checkHardcoded(root).length, 1)
  })
})

test('boundaries: core, shared and features may not import app/ or feature code; app/ may', () => {
  withRepo({
    'apps/web/src/core/x.ts': "import { AppShell } from '@/app/AppShell'",
    'apps/web/src/shared/y.tsx': "import { Login } from '@/features/onboarding/presentation/LoginScreen'",
    'apps/web/src/features/recommender/z.ts': "import { Boot } from '../../app/Boot'",
    'apps/web/src/app/router.tsx': "import { Login } from '@/features/onboarding/presentation/LoginScreen'",
  }, (root) => {
    const v = checkBoundaries(root)
    assert.equal(v.length, 3, v.join('\n'))
    assert.ok(v.every((m) => /(core|shared|features)\//.test(m)))
  })
})
