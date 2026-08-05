---
name: jira-read
version: "3.1.0"
user-invocable: true
description: Read Jira issue data from local cache or API, and download attachments via script (never into context). Triggers when user says "jira-read [JIRA-ID]", 「读取 Jira」「查看 Jira」「下载 Jira」「下载附件」 (read/view/download Jira / download attachments), or needs to fetch Jira issue data. Requires $JIRA_CACHE_DIR (e.g. ~/.cache/jira).
---

# Jira Read — Execution Rules

> Quickly read downloaded Jira data from local cache — no network access required.

## Configuration

Set the cache directory environment variable before use (recommend adding to `.zshrc` / `.bashrc`):

```bash
export JIRA_CACHE_DIR="$HOME/.cache/jira"
```

Defaults to `~/.cache/jira/` if not set.

## Triggers & Parameters

**Primary trigger**: `jira-read [JIRA-ID]` — case-insensitive (auto-converted to uppercase)

| Usage | Behavior | Output Mode |
|-------|----------|-------------|
| `jira-read {ID}` | Read local cache; auto-fetch from API if missing | Summary |
| `jira-read {ID} --live` | Skip cache, fetch from API and update cache | Summary |
| `jira-read {ID} --force` | Force API fetch, overwrite local cache | Summary |
| `jira-read {ID} --no-download` | Local only; prompt if missing | Summary |
| `jira-read {ID} --full` | Same as default, output full content including all comments | Full |
| `jira-read {ID} --meta` | Same as default, output YAML front matter only | Metadata |
| `jira-read ID1 ID2 ID3` | Batch read from local cache | Summary |
| `jira-read --live ID1 ID2 ID3` | Batch fetch from API and cache | Summary |
| `jira-read --force ID1 ID2 ID3` | Batch force re-fetch (overwrite local cache) | Summary |
| `jira-read --list` / `-l` | List all local cache entries | List |

---

## Storage Paths

- **Main file**: `$JIRA_CACHE_DIR/{JIRA-ID}.md`
- **Field mapping cache**: `$JIRA_CACHE_DIR/.field-mapping.json`

On first use, automatically calls `jira_search_fields` to build field ID mapping; subsequent reads use the cache directly. `--force` refreshes the mapping.

---

## Execution Flow

### Step 1: Parse Jira ID

Extract (regex: `([A-Za-z]+-\d+)`) and convert to uppercase, build the local file path.

### Step 2: Check File Existence

**File exists**: continue to step 3

**File does not exist**:
- **Default**: call `jira_get_issue(issue_key="{JIRA-ID}", fields="*all", comment_limit=50)` → on success, format and save, then continue; on failure, prompt to check configuration
- **--no-download**: prompt only, don't auto-download
- **--live**: skip local check, fetch from API and update cache
- **--force**: fetch from API and overwrite local cache

### Step 3: Read, Parse, Output

Read Markdown → parse YAML front matter and body → output as structured Markdown.

**Parsed fields**: `jira_id`, `title`, `priority`, `status`, `reporter`, `assignee`, `created_at`, `updated_at`, `downloaded_at`, `source_url`; body contains issue description, reproduction steps, expected/actual results, comment history.

**Attachment handling**: Never read attachment content into the Agent context. If the issue has attachments (logs, screenshots), note them at the end of the output. When the user needs the actual attachment (logs), follow the "Attachment Download" section below.

> Output format examples for each scenario: see [`reference.md`](reference.md)

---

## Attachment Download（附件下载）

附件一律用脚本下载到本地磁盘，不进入 Agent 上下文；需要查看日志内容时用 `grep`/`head`/`tail` 定向提取关键行。

### 认证（内网 Jira）

| 要素 | 来源 | 值 |
|---|---|---|
| PAT（Bearer） | 环境变量 `JIRA_PERSONAL_TOKEN` | 由 mcp-atlassian 配置注入 |
| mTLS 客户端证书 | `JIRA_CLIENT_CERT` / `JIRA_CLIENT_KEY` | `~/.config/jira-certs/client.crt` + `client.key` |
| SSL | `JIRA_SSL_VERIFY=false` | 内网自签名证书 → curl 需 `-k` |

### 附件 URL

从 `jira_get_issue` 返回的 `attachment[].url` 直接取：
`https://jira.mail.netease.com/secure/attachment/{attachmentId}/{filename}`

### 下载脚本

脚本位于 skill 目录内：`scripts/download_jira_attachments.sh <attachment-id> <filename> <输出路径>`。例如：

```bash
scripts/download_jira_attachments.sh 133273 ynote-desktop-log-1785203336185.zip /tmp/logs/YNOTR-14729.zip
```

脚本自动使用 `JIRA_PERSONAL_TOKEN`（Bearer，HTTP 失败回退 Basic）；证书路径可用 `JIRA_CLIENT_CERT`/`JIRA_CLIENT_KEY` 覆盖。若脚本不可用，按「认证」表手工构造 curl。

### 下载与归档流程

1. 用 `jira_get_issue(issue_key=..., fields="summary,description,attachment,status,priority")` 拿附件清单（attachment[].id / filename / url）
2. 用脚本下载附件到临时目录，先下载 1 个验证认证，再批量
3. `unzip -l` 预览 zip 内部结构，确认平铺格式后再解压
4. 归档到工程 `issues/{type}/jira-bug/{JIRA-ID}-ynote-desktop-log/`，写 `{JIRA-ID}.md` 记录工单信息 + 附件清单

> 下载结果报告格式见 [`reference.md`](reference.md) § 7

---

## Cache Freshness Prompts

| Cache Age | Prompt |
|-----------|--------|
| < 1 hour | None |
| 1–24 hours | "Cached X hours ago" |
| 1–7 days | "Cached X days ago, recommend updating" |
| > 7 days | "Cache expired (X days ago), strongly recommend updating" |

---

## Error Handling

| Error Scenario | Handling |
|----------------|----------|
| Invalid Jira ID format | Prompt correct format |
| File not found | Auto-fetch from API (prompt only with `--no-download`) |
| mcp-atlassian unavailable | Prompt to check configuration and network |
| PAT auth failed | Prompt to check token validity |
| Issue not found | Prompt that Jira ID may be incorrect |
| File parse failure | Output raw file content |
