#!/usr/bin/env bash
# Generate ASCII banner for README.md (PM Skills style: ANSI Shadow + box frame)
# Usage: ./scripts/gen-banner.sh [--inplace]

set -e

WIDTH=82
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
README="$REPO_ROOT/README.md"

pad_line() {
  local line="$1"
  local len="${#line}"
  if (( len < WIDTH )); then
    printf '%s%*s' "$line" $(( WIDTH - len )) ''
  else
    printf '%s' "${line:0:WIDTH}"
  fi
}

gen_banner() {
  local figlet_out
  figlet_out=$(npx -y figlet -f "ANSI Shadow" -w 200 "Open Skills" 2>/dev/null | head -6)
  echo "╔════════════════════════════════════════════════════════════════════════════════════════╗"
  echo "║                                                                                        ║"
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    printf '║   %s   ║\n' "$(pad_line "$line")"
  done <<< "$figlet_out"
  echo "║                                                                                        ║"
  printf '║   %s   ║\n' "$(pad_line "THE OPEN AGENT SKILLS ECOSYSTEM")"
  echo "║                                                                                        ║"
  printf '║   %s   ║\n' "$(pad_line "Claude Code • Cursor • OpenCode")"
  echo "║                                                                                        ║"
  echo "╚════════════════════════════════════════════════════════════════════════════════════════╝"
}

markdown_banner() {
  echo '```text'
  gen_banner
  echo '```'
}

full_banner_block() {
  echo '<!-- banner -->'
  markdown_banner
  echo '<!-- /banner -->'
}

if [[ "${1:-}" == "--inplace" ]]; then
  tmp=$(mktemp)
  full_banner_block > "$tmp"
  awk -v tmp="$tmp" '
    /<!-- banner -->/ { skip=1; while ((getline line < tmp) > 0) print line; close(tmp); next }
    /<!-- \/banner -->/ { skip=0; next }
    !skip { print }
  ' "$README" > "${README}.new" && mv "${README}.new" "$README"
  rm -f "$tmp"
  echo "Banner updated in README.md"
else
  markdown_banner
fi
