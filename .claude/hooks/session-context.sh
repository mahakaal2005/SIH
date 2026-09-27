#!/usr/bin/env bash
# SessionStart (startup|resume|clear|compact): inject the resume point so no session starts blind.
root="${CLAUDE_PROJECT_DIR:?}"
command -v jq >/dev/null || echo "WARNING: jq is not installed; the project hooks (guards, verify, log nudge) cannot run. Install jq (apt/brew install jq)."
p="$root/specs/office/progress.md"
[ -f "$p" ] || exit 0
echo "PROJECT RESUME CONTEXT (auto-injected; rule 0 in CLAUDE.md: progress.md is the source of truth)"
sed -n '1,/^Status:/p' "$p" | head -12
last=$(ls -1 "$root"/specs/logs/*.md 2>/dev/null | sort | tail -1)
if [ -n "$last" ]; then
  echo; echo "Latest session log: ${last#$root/}"
  awk '/^## Next steps/{f=1;next} /^## /{f=0} f' "$last" | head -12
fi
echo; echo "Uncommitted: $(git -C "$root" status --short 2>/dev/null | wc -l) files. Before coding: read specs/architecture.md and the current phase file; flag any progress.md vs code mismatch."
