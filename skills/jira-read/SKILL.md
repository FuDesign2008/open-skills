---
name: jira-read
version: "2.0.1"
user-invocable: true
description: 当用户说"jira-read [JIRA-ID]"，或需要读取、获取、下载 Jira issue 数据时触发。需配置 $JIRA_CACHE_DIR（如 ~/.cache/jira）。
---

# Jira Read - 执行规则

> 从本地缓存快速读取已下载的 Jira 信息，无需访问网络

## 配置

使用前设置缓存目录环境变量（推荐写入 `.zshrc` / `.bashrc`）：

```bash
export JIRA_CACHE_DIR="$HOME/.cache/jira"
```

未设置时默认使用 `~/.cache/jira/`。

## 触发词与参数

**主要触发词**：`jira-read [JIRA-ID]`，支持大小写（自动转换为大写）

| 用法 | 行为 | 附件处理 | 输出模式 |
|------|------|---------|---------|
| `jira-read {ID}` | 读本地缓存，不存在则自动 API 获取 | 首次获取时下载 | 摘要 |
| `jira-read {ID} --live` | 跳过缓存，API 获取并更新缓存 | 不重新下载已有附件 | 摘要 |
| `jira-read {ID} --force` | 强制 API 获取 + 重新下载所有附件 | 覆盖本地文件 | 摘要 |
| `jira-read {ID} --no-download` | 仅读本地，不存在则只提示 | 无 | 摘要 |
| `jira-read {ID} --full` | 同默认，输出完整内容含所有评论 | — | 完整 |
| `jira-read {ID} --meta` | 同默认，只输出 YAML Front Matter | — | 元数据 |
| `jira-read ID1 ID2 ID3` | 批量读取本地缓存 | 无 | 摘要 |
| `jira-read --live ID1 ID2 ID3` | 批量从 API 获取并缓存 | 首次获取时下载 | 摘要 |
| `jira-read --force ID1 ID2 ID3` | 批量强制重新下载（含附件） | 覆盖本地文件 | 摘要 |
| `jira-read --list` / `-l` | 列出所有本地缓存 | — | 列表 |

---

## 存储路径

- **主文件**：`$JIRA_CACHE_DIR/{JIRA-ID}.md`
- **资源目录**：`$JIRA_CACHE_DIR/{JIRA-ID}/`
- **字段映射缓存**：`$JIRA_CACHE_DIR/.field-mapping.json`

首次使用时自动调用 `jira_search_fields` 建立字段 ID 映射，后续直接使用缓存；`--force` 时自动刷新。

---

## 执行流程

### 步骤 1：解析 Jira ID

提取（正则：`([A-Za-z]+-\d+)`）并转换为大写，构建本地文件路径。

### 步骤 2：检查文件是否存在

**文件存在**：继续步骤 3

**文件不存在**：
- **默认**：调用 `jira_get_issue(issue_key="{JIRA-ID}", fields="*all", comment_limit=50)` → 成功则格式化保存并继续；失败则提示检查配置
- **--no-download**：仅提示，不自动下载
- **--live**：跳过本地检查，直接 API 获取并更新缓存
- **--force**：API 获取 + 按下方【附件下载规则】下载附件至 `$JIRA_CACHE_DIR/{JIRA-ID}/`，覆盖已有文件

### 附件下载规则（必须遵守）

调用 `jira_download_attachments` **之前**，必须先检查 `jira_get_issue` 响应中所有附件的 `mimeType` 字段：

1. **扫描 MIME 类型**：遍历 `fields.attachment[]`，收集每个附件的 `mimeType`。
2. **判断是否可下载**：
   - 若所有附件的 `mimeType` 均属于支持类型（图片、PDF、二进制等，即**非** `text/plain`、`text/*`），则正常调用 `jira_download_attachments`。
   - 若存在任意 `mimeType` 为 `text/plain` 或其他 `text/*` 的附件，**禁止调用 `jira_download_attachments`**，改为执行步骤 3（仅记录元信息）。
3. **仅记录元信息（跳过下载时）**：在缓存 Markdown 文件的附件区块中写入每个附件的文件名、大小、MIME 类型，并注明「附件因包含不支持类型（如 text/plain）而跳过下载，如需获取请手动访问 Jira」。
4. **流程继续**：无论是否下载附件，均继续步骤 3，不得因附件问题中断整体流程。

### 步骤 3：读取、解析、输出

读取 Markdown → 解析 YAML Front Matter 与正文 → 按结构化中文 Markdown 输出。

**解析字段**：`jira_id`、`title`、`priority`、`status`、`reporter`、`assignee`、`created_at`、`updated_at`、`downloaded_at`、`source_url`；正文含问题描述、复现步骤、期望/实际结果、附件、评论历史。

> 各场景输出格式示例见 [`reference.md`](reference.md)

---

## 缓存时效提示

| 缓存时长 | 提示 |
|---------|------|
| < 1 小时 | 无提示 |
| 1–24 小时 | 「缓存于 X 小时前」 |
| 1–7 天 | 「缓存于 X 天前，建议更新」 |
| > 7 天 | 「缓存已过期（X 天前），强烈建议更新」 |

---

## 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| Jira ID 格式错误 | 提示正确格式 |
| 文件不存在 | 自动从 API 获取（`--no-download` 时只提示）|
| mcp-atlassian 不可用 | 提示检查配置和网络 |
| PAT 认证失败 | 提示检查 Token 有效性 |
| Issue 不存在 | 提示 Jira ID 可能错误 |
| 附件包含 `text/plain` 等不支持类型 | **禁止调用 `jira_download_attachments`**；仅在缓存文件中记录附件元信息（文件名、大小、MIME 类型）并注明跳过原因；流程继续正常输出 Issue 信息 |
| 附件下载失败（其他原因） | 保留 Issue 信息，标记附件失败 |
| 文件解析失败 | 输出原始文件内容 |
| 资源目录不存在 | 正常输出，标记无资源 |
