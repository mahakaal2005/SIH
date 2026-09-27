#!/usr/bin/env bash
# Stop: non-blocking reminder if this session edited code but wrote no log and did not touch progress.md.
input=$(cat)
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0
root="${CLAUDE_PROJECT_DIR:?}"
sid=$(jq -r '.session_id // "default"' <<<"$input")
marker="$root/.claude/.needs-log-$sid"  # set on every code edit, independent of the verify marker
[ -f "$marker" ] || exit 0
newer() { [ -n "$(find "$1" -newer "$marker" -type f 2>/dev/null | head -1)" ]; }
if newer "$root/specs/logs" && newer "$root/specs/office/progress.md"; then rm -f "$marker"; exit 0; fi
jq -n '{systemMessage:"Code changed this session but specs/logs/ or specs/office/progress.md was not updated. Before wrapping up: write the session log, tick progress.md, mark finished phases (CLAUDE.md rule 3)."}'
