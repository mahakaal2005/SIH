import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { checkSpecs } from './check-specs.mjs'

const good = [
  '# Progress',
  '**Current phase:** P1',
  '**Pick up here:** do the thing',
  '| # | Phase | Req | Status | Spec |',
  '|---|---|---|---|---|',
  '| P0 | Scaffold | - | ✅ | `phase-0-x.md` |',
  '| P1 | Core | F0 | 🟡 | `phase-1-y.md` |',
  '| P2 | Later | F1 | ⬜ | not written |',
].join('\n')

function withRepo(files, fn) {
  const root = mkdtempSync(join(tmpdir(), 'ys-specs-'))
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  try { fn(root) } finally { rmSync(root, { recursive: true, force: true }) }
}

const base = {
  'specs/architecture.md': '# a',
  'specs/office/progress.md': good,
  'specs/office/phase-0-x.md': 'Status: done',
  'specs/office/phase-1-y.md': 'Status: in progress',
}

test('a well-formed tracker passes', () => withRepo(base, (r) => assert.deepEqual(checkSpecs(r), [])))

test('missing architecture and progress are reported', () => withRepo({}, (r) => {
  assert.deepEqual(checkSpecs(r), ['specs/architecture.md is missing', 'specs/office/progress.md is missing'])
}))

test('missing resume lines are reported', () => withRepo({ ...base, 'specs/office/progress.md': good.replace(/\*\*Pick up here:\*\*.*\n/, '') }, (r) => {
  assert.deepEqual(checkSpecs(r), ['progress.md needs a "**Pick up here:**" line'])
}))

test('a started phase without an existing spec file is reported; not-started is fine', () => withRepo(base, (r) => {
  rmSync(join(r, 'specs/office/phase-1-y.md'))
  assert.deepEqual(checkSpecs(r), ['P1 points to specs/office/phase-1-y.md, which does not exist'])
}))

test('a phase file without a Status line is reported', () => withRepo({ ...base, 'specs/office/phase-0-x.md': '# no status' }, (r) => {
  assert.deepEqual(checkSpecs(r), ['specs/office/phase-0-x.md needs a "Status:" line'])
}))
