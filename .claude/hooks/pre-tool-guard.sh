#!/usr/bin/env bash
# PreToolUse(Edit|Write|Bash): keep secrets out of edits, stop irreversible commands.
input=$(cat)
tool=$(jq -r '.tool_name' <<<"$input")
decide() { jq -n --arg d "$1" --arg r "$2" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}'; exit 0; }

if [ "$tool" = "Bash" ]; then
  cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
  grep -Eq 'git +push\b.*(--force\b|--force-with-lease|(^| )-f\b)' <<<"$cmd" && decide deny "Force-push is blocked in this repo; push normally or ask the user."
  grep -Eq 'rm +-[a-zA-Z]*r[a-zA-Z]*f?[a-zA-Z]* +(/|~|\$HOME|\.|\*)( |$)' <<<"$cmd" && decide deny "Recursive delete of a root/home/project path is blocked."
  grep -Eq 'supabase +db +(reset|push)\b.*--linked|supabase +db +push\b' <<<"$cmd" && decide ask "This touches the remote Supabase database."
  grep -Eq 'git +(reset +--hard|clean +-[a-zA-Z]*f|checkout +-- +\.)' <<<"$cmd" && decide ask "This discards uncommitted work."
  grep -Eq '(^|[ ;&|])(cat|less|head|tail|more|bat) +[^|;&]*\.env(\.[a-z]+)?( |$)' <<<"$cmd" && ! grep -q '\.env\.example' <<<"$cmd" && decide deny "Reading .env would put secrets in the transcript. Use .env.example."
  exit 0
fi

f=$(jq -r '.tool_input.file_path // empty' <<<"$input")
case "$f" in
  */specs/architecture.md|*/.claude/settings.json|*/.claude/hooks/*|*/.github/CODEOWNERS)
    decide ask "Protected team file (architecture spec or Claude hooks/settings): change it only with the user's explicit approval (CLAUDE.md rule 1)." ;;
esac
case "$(basename "$f")" in
  .env.example) ;;
  .env|.env.*) decide deny "Editing .env files is blocked; update .env.example and tell the user which values to set." ;;
  *.pem|*.key|service-account*.json|gcp-credentials*.json) decide deny "Credential files are off-limits." ;;
esac
exit 0
