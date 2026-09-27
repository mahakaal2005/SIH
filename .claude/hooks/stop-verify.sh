#!/usr/bin/env bash
# Stop: if TS/JSON changed this session, run typecheck + lint (incl. boundary, PII, i18n checks) + related tests.
# Blocks once (exit 2) with the failures; stop_hook_active prevents a loop.
input=$(cat)
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0
root="${CLAUDE_PROJECT_DIR:?}"
sid=$(jq -r '.session_id // "default"' <<<"$input")
marker="$root/.claude/.needs-verify-$sid"  # per-session: other sessions' edits don't trigger this one
[ -f "$marker" ] || exit 0
cd "$root" || exit 0

fail() { printf '%s failed — fix before finishing:\n%s\n' "$1" "$(tail -n 40 <<<"$2")" >&2; exit 2; }

out=$(npm run -s typecheck 2>&1) || fail "typecheck" "$out"
out=$(npm run -s lint 2>&1) || fail "lint / boundary / PII / i18n checks" "$out"
out=$(node --test scripts/*.test.mjs 2>&1) || fail "scripts tests" "$out"

changed=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | grep -E '\.(ts|tsx)$' | sort -u)
for ws in apps/web packages/shared; do
  files=$(grep "^$ws/" <<<"$changed" | sed "s|^$ws/||")
  [ -n "$files" ] || continue
  out=$(cd "$ws" && npx --no-install vitest related --run --passWithNoTests $files 2>&1) || fail "vitest related ($ws)" "$out"
done

rm -f "$marker"
