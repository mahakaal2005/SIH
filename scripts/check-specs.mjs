// Enforces the spec workflow for everyone, not just Claude: the tracker must stay well-formed and every
// started phase must have a spec file. Runs in `npm run lint`, so CI and the Stop hook catch drift.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rowRe = /^\|\s*(P\d+)\s*\|.*\|\s*(✅|🟡|⬜)\s*\|\s*(.+?)\s*\|$/gm

export function checkSpecs(root) {
  const problems = []
  const office = join(root, 'specs/office')
  const progress = join(office, 'progress.md')
  if (!existsSync(join(root, 'specs/architecture.md'))) problems.push('specs/architecture.md is missing')
  if (!existsSync(progress)) return [...problems, 'specs/office/progress.md is missing']

  const text = readFileSync(progress, 'utf8')
  if (!/^\*\*Current phase:\*\*\s*\S/m.test(text)) problems.push('progress.md needs a "**Current phase:**" line')
  if (!/^\*\*Pick up here:\*\*\s*\S/m.test(text)) problems.push('progress.md needs a "**Pick up here:**" line')

  const rows = [...text.matchAll(rowRe)]
  if (!rows.length) problems.push('progress.md has no phase table rows')
  for (const [, id, status, spec] of rows) {
    if (status === '⬜') continue
    const file = spec.match(/`([^`]+\.md)`/)?.[1]
    if (!file) problems.push(`${id} is started/done but has no spec file in the table`)
    else if (!existsSync(join(office, file))) problems.push(`${id} points to specs/office/${file}, which does not exist`)
  }

  for (const name of readdirSync(office).filter((n) => /^phase-\d+-.+\.md$/.test(n))) {
    if (!/^Status:\s*\S/m.test(readFileSync(join(office, name), 'utf8'))) problems.push(`specs/office/${name} needs a "Status:" line`)
  }
  return problems
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const problems = checkSpecs(root)
  if (problems.length) {
    console.error('Spec workflow violations:\n  ' + problems.join('\n  '))
    process.exit(1)
  }
  console.log('Specs OK')
}
