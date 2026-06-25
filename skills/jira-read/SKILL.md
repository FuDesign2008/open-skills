---
name: jira-read
version: "3.0.0"
user-invocable: true
description: Read Jira issue data from local cache or API. Triggers when user says "jira-read [JIRA-ID]", 「读取 Jira」「查看 Jira」「下载 Jira」 (read/view/download Jira), or needs to fetch Jira issue data. Requires $JIRA_CACHE_DIR (e.g. ~/.cache/jira).
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

**Attachment handling**: Do not download or display attachment content. If the Jira description or comments reference attachments (e.g., screenshots, log files), note at the end of output: "This issue contains attachments. To view them, visit Jira: {issue_url}".

> Output format examples for each scenario: see [`reference.md`](reference.md)

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
