# Jira Read — Output Format Reference

This file provides output format examples for the `jira-read` skill.

---

## 1. Normal Read Output

```
## YNOTR-12167 Info (Local Cache)

**Title**: [title]
**Priority**: P1
**Status**: Open

### Basic Info

| Field | Value |
|-------|-------|
| Reporter | xxx |
| Assignee | xxx |
| Created | 2026-01-10 10:00 |
| Updated | 2026-01-15 14:30 |

### Description

[description content]

### Reproduction Steps

1. Step 1
2. Step 2

### Expected Result

[expected]

### Actual Result

[actual]

### Comment Summary

5 comments total, latest:

> **Zhang San** (2026-01-15 14:30): This issue can be reproduced on Chrome...

---

**Cache time**: 2026-01-16 10:30
**Local file**: $JIRA_CACHE_DIR/YNOTR-12167.md

Use `jira-read YNOTR-12167 --live` to update cache
```

---

## 2. Local Cache Not Found Prompt

```
## Jira Local Cache Not Found

**Jira ID**: YNOTR-12167
**Lookup path**: $JIRA_CACHE_DIR/YNOTR-12167.md

This Jira has not been downloaded locally. Please run:

    jira-read YNOTR-12167 --live
```

---

## 3. Auto-Download Read Output

```
## jira-read (Auto-Download)

**Jira ID**: YNOTR-12167
**Status**: Local cache not found, auto-downloaded
**Data source**: mcp-atlassian API

---

## YNOTR-12167 Info (Local Cache)

**Title**: [title]
**Priority**: P1
**Status**: Open

 [... normal read output ...]

---

**Cache time**: Just downloaded
**Local file**: $JIRA_CACHE_DIR/YNOTR-12167.md
```

---

## 4. Batch Read Output

Command: `jira-read YNOTR-12167 YNOTR-12168 YNOTR-12169`

```
## Batch Read Results (3 items)

### 1. YNOTR-12167
**Title**: [title 1]
**Priority**: P1
**Status**: Open

---

### 2. YNOTR-12168
**Title**: [title 2]
**Priority**: P2
**Status**: In Progress

---

### 3. YNOTR-12169
**Title**: [title 3]
**Priority**: P3
**Status**: Resolved

---

**Cache status**:
- YNOTR-12167: 2 hours ago
- YNOTR-12168: 1 day ago (recommend update)
- YNOTR-12169: not found ❌
```

---

## 5. Batch API Fetch Output

Command: `jira-read --live YNOTR-12167 YNOTR-12168 YNOTR-12169`

Execution rule: fetch from API one by one; single failure doesn't block subsequent items; output progress in real time; summarize at end.

```
## Batch Fetch Results (3 items)

| # | Jira ID | Title | Priority | Status |
|---|---------|-------|----------|--------|
| 1 | YNOTR-12167 | [title 1] | P1 | ✅ Fetched |
| 2 | YNOTR-12168 | [title 2] | P2 | ✅ Fetched |
| 3 | YNOTR-12169 | [title 3] | - | ❌ Failed |

**Success**: 2/3, **Failed**: 1/3
**Data source**: mcp-atlassian API
```

---

## 6. List All Cache Entries Output

Command: `jira-read --list` or `jira-read -l`

```
## Local Jira Cache List

| # | Jira ID | Title | Priority | Cache Time |
|---|---------|-------|----------|------------|
| 1 | YNOTR-12167 | [title 1] | P1 | 2 hours ago |
| 2 | YNOTR-12168 | [title 2] | P2 | 1 day ago |
| 3 | YNOTR-12169 | [title 3] | P3 | 3 days ago |

3 cached items, storage path: $JIRA_CACHE_DIR/

---

## 7. Attachment Download Report（附件下载报告）

当工单存在附件且用户要求下载时，按以下格式报告下载结果：

```
## Attachment Download Report

| # | Attachment | Size | Status | Path |
|---|-----------|------|--------|------|
| 1 | ynote-desktop-log-xxx.zip | 2.0 MB | ✅ 已下载并解压 | issues/{type}/jira-bug/YNOTR-xxxxx-ynote-desktop-log/ |
| 2 | screenshot-1.png | 181 KB | 📌 截图未归档（如需请说明） | — |

**下载方式**: scripts/download_jira_attachments.sh（Bearer + mTLS + -k）
**注意**: setting.json 等含 deviceId/cookies 敏感信息，提交/外发前需脱敏
```

> 附件一律用脚本下载到本地磁盘，不进入 Agent 上下文（见 SKILL.md「Attachment Download」）。
```
