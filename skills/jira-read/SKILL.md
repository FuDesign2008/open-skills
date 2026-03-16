---
name: jira-read
version: "2.0.0"
user-invocable: true
description: Jira 数据统一入口。当用户说"jira-read [JIRA-ID]"或"jira-download [JIRA-ID]"时触发。支持本地缓存读取、API 实时获取（--live）、强制重新下载含附件（--force）、批量获取。从 $JIRA_CACHE_DIR/ 管理 Jira 数据。
---

# Jira Read - 执行规则

> 从本地缓存快速读取已下载的 Jira 信息，无需访问网络

## 配置

使用前设置缓存目录环境变量（推荐写入 `.zshrc` / `.bashrc`）：

```bash
export JIRA_CACHE_DIR="$HOME/database/jira"
```

未设置时默认使用 `~/database/jira/`。

## 触发词定义

**主要触发词**：`jira-read [JIRA-ID]`

**输入格式**：
- Jira ID：`jira-read YNOTR-12167`
- 支持大小写：`jira-read ynotr-12167`（自动转换为大写）

**可选参数**：
- `--no-download` - 禁用自动获取，本地不存在时只提示
- `--live` - 跳过本地缓存，直接从 mcp-atlassian API 获取最新数据并更新缓存
- `--force` - 强制从 API 获取数据 + 重新下载所有附件（覆盖本地文件）
- `--full` - 输出完整内容，包括所有评论
- `--meta` - 只输出 YAML Front Matter 元数据

**参数行为对照表**：

| 用法 | 行为 | 附件处理 |
|------|------|---------|
| `jira-read {ID}` | 读本地缓存，不存在则自动从 API 获取 | 首次获取时下载 |
| `jira-read {ID} --live` | 跳过缓存，API 获取并更新缓存 | 不重新下载已有附件 |
| `jira-read {ID} --force` | 强制 API 获取 + 重新下载所有附件 | 覆盖本地文件 |
| `jira-read {ID} --no-download` | 仅读本地，不存在则只提示 | 无 |
| `jira-read ID1 ID2 ID3` | 批量读取本地缓存 | 无 |
| `jira-read --live ID1 ID2 ID3` | 批量从 API 获取并缓存 | 首次获取时下载 |
| `jira-read --force ID1 ID2 ID3` | 批量强制重新下载（含附件） | 覆盖本地文件 |

**向后兼容别名**：
- `jira-download {ID}` → 等同于 `jira-read {ID} --live --force`
- `jira-download-force {ID}` → 等同于 `jira-read {ID} --live --force`

---

## 存储路径

**主文件**：`$JIRA_CACHE_DIR/{JIRA-ID}.md`

**资源目录**：`$JIRA_CACHE_DIR/{JIRA-ID}/`

**字段映射缓存**：`$JIRA_CACHE_DIR/.field-mapping.json`

首次使用时自动调用 `jira_search_fields` 建立字段 ID 映射，后续直接使用缓存。使用 `--force` 时自动刷新映射缓存。

---

## 执行流程

### 步骤1：解析 Jira ID

1. 提取 Jira ID（正则：`([A-Za-z]+-\d+)`）
2. 转换为大写格式
3. 构建本地文件路径

### 步骤2：检查文件是否存在

**文件存在**：继续读取（步骤3）

**文件不存在**：

- **默认行为**（两层降级）：
  1. 尝试直接调用 mcp-atlassian 的 jira_get_issue(issue_key="{JIRA-ID}", fields="*all", comment_limit=50) 获取数据
  2. 成功：格式化为 Markdown → 保存到本地缓存 → 继续读取（步骤3）
  3. 失败：输出错误信息，提示检查 mcp-atlassian 配置

- **--no-download 模式**：只输出提示（不自动下载）

- **--live 模式**：跳过本地缓存检查，直接执行上述步骤 1-2，更新本地缓存后输出

- **--force 模式**：跳过本地缓存，从 API 获取数据 + 调用 jira_download_attachments 重新下载所有附件到 `$JIRA_CACHE_DIR/{JIRA-ID}/`，覆盖已有文件

```
## Jira 本地缓存不存在

**Jira ID**: YNOTR-12167
**查找路径**: $JIRA_CACHE_DIR/YNOTR-12167.md

该 Jira 尚未下载到本地，请先执行：

```
jira-read YNOTR-12167 --live
```
```

### 步骤3：读取并解析文件

1. 读取 Markdown 文件内容
2. 解析 YAML Front Matter 获取元数据
3. 解析 Markdown 正文获取详细内容

**解析字段**：

| 类别 | 字段 |
|------|------|
| 元数据 | jira_id, title, priority, status, reporter, assignee, created_at, updated_at, downloaded_at, source_url, screenshot, image_count |
| 正文 | 问题描述, 复现步骤, 期望结果, 实际结果, 附件, 评论历史 |

### 步骤4：格式化输出

按结构化格式输出 Jira 信息。

---

## 输出格式

### 正常读取输出

```
## YNOTR-12167 信息（本地缓存）

**标题**: [标题]
**优先级**: P1
**状态**: 待处理

### 基本信息

| 字段 | 值 |
|------|-----|
| 报告人 | xxx |
| 经办人 | xxx |
| 创建时间 | 2026-01-10 10:00 |
| 更新时间 | 2026-01-15 14:30 |

### 问题描述

[描述内容]

### 复现步骤

1. 步骤1
2. 步骤2

### 期望结果

[期望]

### 实际结果

[实际]

### 附件

- [附件1](url)
- [附件2](url)

### 评论摘要

共 5 条评论，最新评论：

> **张三** (2026-01-15 14:30): 这个问题在 Chrome 浏览器上可以复现...

---

**缓存时间**: 2026-01-16 10:30
**本地文件**: $JIRA_CACHE_DIR/YNOTR-12167.md
**资源目录**: $JIRA_CACHE_DIR/YNOTR-12167/

使用 `jira-read YNOTR-12167 --live` 更新缓存，`--force` 重新下载附件
```

### 自动下载后读取输出

当本地缓存不存在时，自动下载后的输出格式：

```
## jira-read（自动下载）

**Jira ID**: YNOTR-12167
**状态**: 本地缓存不存在，已自动下载
**数据来源**: mcp-atlassian API

---

## YNOTR-12167 信息（本地缓存）

**标题**: [标题]
**优先级**: P1
**状态**: 待处理

[... 正常的读取输出内容 ...]

---

**缓存时间**: 刚刚下载
**本地文件**: $JIRA_CACHE_DIR/YNOTR-12167.md
```

---

## 输出模式

### 默认模式：摘要输出

输出关键信息摘要，评论只显示最新一条和总数。

### 完整模式：`jira-read YNOTR-12167 --full`

输出完整内容，包括所有评论。

### 元数据模式：`jira-read YNOTR-12167 --meta`

只输出 YAML Front Matter 元数据。

---

## 缓存时效提示

根据 `downloaded_at` 计算缓存时长：

| 缓存时长 | 提示 |
|---------|------|
| < 1 小时 | 无提示 |
| 1-24 小时 | 提示"缓存于 X 小时前" |
| 1-7 天 | 提示"缓存于 X 天前，建议更新" |
| > 7 天 | 警告"缓存已过期（X 天前），强烈建议更新" |

---

## 批量读取

支持一次读取多个 Jira：

```
jira-read YNOTR-12167 YNOTR-12168 YNOTR-12169
```

输出格式：

```
## 批量读取结果（3 个）

### 1. YNOTR-12167
**标题**: [标题1]
**优先级**: P1
**状态**: 待处理

---

### 2. YNOTR-12168
**标题**: [标题2]
**优先级**: P2
**状态**: 处理中

---

### 3. YNOTR-12169
**标题**: [标题3]
**优先级**: P3
**状态**: 已解决

---

**缓存状态**:
- YNOTR-12167: 2 小时前
- YNOTR-12168: 1 天前 (建议更新)
- YNOTR-12169: 未找到 ❌
```

### 批量获取模式：`jira-read --live ID1 ID2 ID3`

从 API 批量获取多个 Jira 并缓存到本地：

```
jira-read --live YNOTR-12167 YNOTR-12168 YNOTR-12169
```

执行规则：
- 逐个调用 mcp-atlassian API 获取
- 单个失败不阻断后续
- 实时输出进度
- 完成后输出汇总表

输出格式：

```
## 批量获取结果（3 个）

| # | Jira ID | 标题 | 优先级 | 状态 |
|---|---------|------|--------|------|
| 1 | YNOTR-12167 | [标题1] | P1 | ✅ 已获取 |
| 2 | YNOTR-12168 | [标题2] | P2 | ✅ 已获取 |
| 3 | YNOTR-12169 | [标题3] | - | ❌ 获取失败 |

**成功**: 2/3，**失败**: 1/3
**数据来源**: mcp-atlassian API
```

---

## 列出所有缓存

`jira-read --list` 或 `jira-read -l`

输出本地已缓存的所有 Jira：

```
## 本地 Jira 缓存列表

| # | Jira ID | 标题 | 优先级 | 缓存时间 |
|---|---------|------|--------|---------|
| 1 | YNOTR-12167 | [标题1] | P1 | 2 小时前 |
| 2 | YNOTR-12168 | [标题2] | P2 | 1 天前 |
| 3 | YNOTR-12169 | [标题3] | P3 | 3 天前 |

共 3 个缓存，存储路径: $JIRA_CACHE_DIR/
```

---

## 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| Jira ID 格式错误 | 提示正确格式 |
| 文件不存在 | 自动从 mcp-atlassian API 获取（或 --no-download 时只提示） |
| mcp-atlassian 不可用 | 输出错误信息，提示检查配置和网络 |
| PAT 认证失败 | 提示检查 Token 有效性 |
| Issue 不存在 | 提示 Jira ID 可能错误 |
| 附件下载失败 | 保留 Issue 信息，标记附件失败 |
| 文件解析失败 | 输出原始文件内容 |
| 资源目录不存在 | 正常输出，标记无资源 |

---

## 输出要求

**语言**：中文

**格式**：Markdown 结构化输出

**原则**：
- 快速响应（本地读取，无网络请求）
- 清晰展示缓存时效
- 提供更新建议
