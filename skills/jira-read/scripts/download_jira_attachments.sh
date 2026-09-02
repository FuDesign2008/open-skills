#!/usr/bin/env bash
# Download a Jira attachment (auth: PAT Bearer + mTLS client cert; Basic fallback)
# Usage: download_jira_attachments.sh <attachment-id> <filename> <output-path>
# Env:   JIRA_URL (required). Token: JIRA_PERSONAL_TOKEN, else JIRA_PAT, else ~/.config/jira-certs/jira-pat.txt
# Note:  JIRA_SSL_VERIFY=false → curl uses -k. Do not print the PAT. Prefer the node sidecar on Schannel curl.
set -euo pipefail

if [ $# -ne 3 ]; then
  echo "Usage: $0 <attachment-id> <filename> <output-path>" >&2
  exit 2
fi

ATT_ID="$1"
ATT_FILENAME="$2"
OUT="$3"
PAT_FILE="${JIRA_PAT_FILE:-$HOME/.config/jira-certs/jira-pat.txt}"

: "${JIRA_URL:?JIRA_URL must be set (your Jira base URL, e.g. https://jira.example.com)}"

TOKEN="${JIRA_PERSONAL_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  TOKEN="${JIRA_PAT:-}"
fi
if [ -z "$TOKEN" ] && [ -f "$PAT_FILE" ]; then
  TOKEN="$(tr -d '\r' < "$PAT_FILE" | head -n 1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
fi
if [ -z "$TOKEN" ]; then
  echo "Credential chain empty: set JIRA_PERSONAL_TOKEN (alias JIRA_PAT), or write a one-line PAT to $PAT_FILE" >&2
  exit 1
fi

CERT="${JIRA_CLIENT_CERT:-$HOME/.config/jira-certs/client.crt}"
KEY="${JIRA_CLIENT_KEY:-$HOME/.config/jira-certs/client.key}"

mkdir -p "$(dirname "$OUT")"

CURL_K=()
if [ "${JIRA_SSL_VERIFY:-}" = "false" ]; then
  CURL_K=(-k)
fi

# Put the Authorization header in a 0600 curl config so the PAT is not on argv.
CFG="$(mktemp)"
chmod 600 "$CFG"
cleanup() { rm -f "$CFG"; }
trap cleanup EXIT

run_curl() {
  local header="$1"
  printf 'header = "%s"\n' "$header" > "$CFG"
  curl -fsS "${CURL_K[@]}" \
    --cert "$CERT" --key "$KEY" \
    -K "$CFG" \
    -L -o "$OUT" \
    "${JIRA_URL}/secure/attachment/${ATT_ID}/${ATT_FILENAME}"
}

if ! run_curl "Authorization: Bearer ${TOKEN}"; then
  echo "Bearer auth download failed, trying Basic auth..." >&2
  run_curl "Authorization: Basic $(printf '%s' "${TOKEN}:x-oauth-basic" | base64 | tr -d '\n')"
fi

if [ -s "$OUT" ]; then
  echo "Downloaded: $OUT ($(du -h "$OUT" | cut -f1))"
else
  echo "Download failed or empty file: $OUT" >&2
  rm -f "$OUT"
  exit 1
fi
