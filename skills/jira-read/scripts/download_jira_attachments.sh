#!/usr/bin/env bash
# Download a Jira attachment (auth: PAT Bearer + mTLS client cert; Basic fallback)
# Usage: download_jira_attachments.sh <attachment-id> <filename> <output-path>
# Env:   JIRA_URL (required, your Jira base URL, e.g. https://jira.example.com)
#        JIRA_PERSONAL_TOKEN (required, Jira Personal Access Token)
# Note:  JIRA_SSL_VERIFY=false means an internal self-signed cert → curl uses -k
set -euo pipefail

if [ $# -ne 3 ]; then
  echo "Usage: $0 <attachment-id> <filename> <output-path>" >&2
  exit 2
fi

ATT_ID="$1"
ATT_FILENAME="$2"
OUT="$3"

: "${JIRA_URL:?JIRA_URL must be set (your Jira base URL, e.g. https://jira.example.com)}"
: "${JIRA_PERSONAL_TOKEN:?JIRA_PERSONAL_TOKEN must be set (Jira Personal Access Token)}"

CERT="${JIRA_CLIENT_CERT:-$HOME/.config/jira-certs/client.crt}"
KEY="${JIRA_CLIENT_KEY:-$HOME/.config/jira-certs/client.key}"

mkdir -p "$(dirname "$OUT")"

# Try Bearer auth first; on HTTP failure (-f) fall back to Basic (PAT as username + x-oauth-basic)
if ! curl -fsS -k \
  --cert "$CERT" --key "$KEY" \
  -H "Authorization: Bearer ${JIRA_PERSONAL_TOKEN}" \
  -L -o "$OUT" \
  "${JIRA_URL}/secure/attachment/${ATT_ID}/${ATT_FILENAME}" \
  ; then
  echo "Bearer auth download failed, trying Basic auth..." >&2
  curl -fsS -k \
    --cert "$CERT" --key "$KEY" \
    -u "${JIRA_PERSONAL_TOKEN}:x-oauth-basic" \
    -L -o "$OUT" \
    "${JIRA_URL}/secure/attachment/${ATT_ID}/${ATT_FILENAME}"
fi

if [ -s "$OUT" ]; then
  echo "Downloaded: $OUT ($(du -h "$OUT" | cut -f1))"
else
  echo "Download failed or empty file: $OUT" >&2
  rm -f "$OUT"
  exit 1
fi
