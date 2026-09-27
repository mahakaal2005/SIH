#!/usr/bin/env bash
# PostToolUse(Edit|Write): oxlint the edited TS file; mark this session so its Stop hook verifies.
root="${CLAUDE_PROJECT_DIR:?}"
input=$(cat)
f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty' <<<"$input")
sid=$(jq -r '.session_id // "default"' <<<"$input")
case "$f" in *.ts|*.tsx|*.mjs|*.json) touch "$root/.claude/.needs-verify-$sid" "$root/.claude/.needs-log-$sid" ;; *) exit 0 ;; esac
case "$f" in *.ts|*.tsx) ;; *) exit 0 ;; esac
[ -f "$f" ] || exit 0
if ! out=$(cd "$root/apps/web" && npx --no-install oxlint --deny-warnings "$f" 2>&1); then
  printf 'oxlint errors in %s:\n%s\n' "$f" "$(tail -n 30 <<<"$out")" >&2
  exit 2
fi
