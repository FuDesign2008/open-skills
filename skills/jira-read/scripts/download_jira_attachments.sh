#!/usr/bin/env bash
# 下载 jira.mail.netease.com 工单附件（支持认证：PAT + mTLS 客户端证书）
# 用法: download_jira_attachments.sh <attachment-id> <filename> <输出路径>
# 环境变量: JIRA_PERSONAL_TOKEN（必填，Jira Personal Access Token）
# 说明: JIRA_SSL_VERIFY=false 对应内网自签名证书，curl 加 -k
set -euo pipefail

if [ $# -ne 3 ]; then
  echo "用法: $0 <attachment-id> <filename> <输出路径>" >&2
  exit 2
fi

ATT_ID="$1"
ATT_FILENAME="$2"
OUT="$3"

: "${JIRA_PERSONAL_TOKEN:?需要设置 JIRA_PERSONAL_TOKEN 环境变量}"

JIRA_URL="${JIRA_URL:-https://jira.mail.netease.com}"
CERT="${JIRA_CLIENT_CERT:-$HOME/.config/jira-certs/client.crt}"
KEY="${JIRA_CLIENT_KEY:-$HOME/.config/jira-certs/client.key}"

mkdir -p "$(dirname "$OUT")"

# 先尝试 Bearer 认证；若 HTTP 失败（-f）则回退 Basic（PAT 作为用户名 + x-oauth-basic）
if ! curl -fsS -k \
  --cert "$CERT" --key "$KEY" \
  -H "Authorization: Bearer ${JIRA_PERSONAL_TOKEN}" \
  -L -o "$OUT" \
  "${JIRA_URL}/secure/attachment/${ATT_ID}/${ATT_FILENAME}" \
  ; then
  echo "Bearer 认证下载失败，尝试 Basic 认证..." >&2
  curl -fsS -k \
    --cert "$CERT" --key "$KEY" \
    -u "${JIRA_PERSONAL_TOKEN}:x-oauth-basic" \
    -L -o "$OUT" \
    "${JIRA_URL}/secure/attachment/${ATT_ID}/${ATT_FILENAME}"
fi

if [ -s "$OUT" ]; then
  echo "下载成功: $OUT ($(du -h "$OUT" | cut -f1))"
else
  echo "下载失败或文件为空: $OUT" >&2
  rm -f "$OUT"
  exit 1
fi
