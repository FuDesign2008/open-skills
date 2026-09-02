# Jira Skill 凭据存储约定缺失 —— 事件复盘与 Skill 优化建议

> **用途**：本文档记录一次真实会话中暴露的问题：`jira-read` / `jira-fix-workflow` 两个 skill 均未约定 Jira PAT 的本地持久化位置，导致 token 只存在于单次会话中，后续会话被迫从 Claude 会话记录（JSONL transcript）里反查找回。本文盘点环境事实、分析根因，并给出 skill 优化建议。
>
> **事件日期**：2026-09-01 ~ 2026-09-02
> **涉及环境**：Windows 11（PowerShell 5.1 + Git Bash），内网 Jira（TLS 1.3 only + mTLS 客户端证书），本机未配置 mcp-atlassian
> **涉及 Skill**：`jira-read`、`jira-fix-workflow`、`jira-fix-batch`、`jira-status-writeback`（同族，认证假设相同）
> **数据脱敏**：内网域名已替换为 `jira.example.com`；PAT 值全文不出现，仅描述格式特征。

---

## 一、事件经过

### 1.1 第一次使用（2026-09-01，正常但未沉淀）

用户为排查一个桌面端崩溃 Jira 单，向 Agent **在会话中直接提供** PAT（命令行内联形式，如 `PAT='<token>' node fetch-jira.js ...`）。Agent 用 node 脚本（mTLS 客户端证书 + Bearer）成功拉取了 issue 与附件，并把「访问配方」（mTLS 证书路径、node 脚本用法、附件归档约定）写入了持久记忆——但**记忆里明确只写了「PAT 由用户提供」，没有存值，也没有约定存值位置**。

### 1.2 第二次使用（2026-09-02，token 丢失）

用户问「用到的 JIRA_PAT 存储在哪里？是多少？」。排查结果：

| 排查位置 | 结果 |
|---|---|
| 当前会话环境变量（`JIRA_PAT` / `JIRA_PERSONAL_TOKEN`） | ❌ 未设置 |
| 拉取脚本（`fetch-jira.js` 等） | 仅运行时读 `process.env.JIRA_PAT`，本身不含 token |
| Claude 配置（`~/.claude.json`、settings） | 只有 skill 注册项，无 token |
| mcp-atlassian 配置 | 本机未配置（skill 文档假定的注入方式在此环境不成立） |
| 任何本地文件 | ❌ 从未落盘 |

结论：**token 已随上次会话结束而丢失**。

### 1.3 反查找回（本事件的核心问题）

用户提示「之前给过你」。Agent 在 Claude 会话记录目录（`~/.claude/projects/<project>/*.jsonl`）中 grep `PAT=`，从**上一次会话的 transcript** 中找回了完整 token（所有出现位置值一致，且可区分出脱敏占位符 `...` 与真实值）。

这次能找回有两个侥幸前提：① 会话记录未被清理；② token 是以可 grep 的明文形式进入了 transcript（本身是一个安全隐患，见根因 3）。

### 1.4 本次处置

- PAT 落盘至 `~/.config/jira-certs/jira-pat.txt`（单行纯文本），与同目录的 mTLS 证书（`client.crt` / `client.key`）放在一起；
- 持久记忆同步更新为「PAT 已落盘于 `<路径>`，用时读出后传给 `JIRA_PAT` 环境变量」；
- 排查确认 `jira-read` / `jira-fix-workflow` 的 SKILL.md 中**均无任何本地凭据文件的约定**，于是自建约定。

---

## 二、现状事实盘点

### 2.1 Skill 的认证假设 vs 本机现实

`jira-read/SKILL.md` 认证表写明：

| Skill 假设 | 本机现实 |
|---|---|
| PAT 来源：env var `JIRA_PERSONAL_TOKEN`，「injected by mcp-atlassian config」 | 本机**未配置** mcp-atlassian，该注入链不存在 |
| 附件下载脚本 `download_jira_attachments.sh`：bash + curl，`--cert/--key` 引用 PEM 证书对 | 本机 curl 为 Schannel 构建：**不支持按文件对引用 PEM 证书对**，且 PowerShell/.NET 通道最高 TLS 1.2，被网关 TLS 1.3-only 拒绝 → **curl/PowerShell 全部不可用，必须用 node**（node 支持 TLS 1.3 + PEM） |
| 证书路径默认 `$HOME/.config/jira-certs/client.crt + client.key` | ✅ 恰好与现状一致（从 mac 拷贝而来） |
| `JIRA_SSL_VERIFY=false` 处理自签名证书 | mTLS 网关场景下该开关不解决问题（问题在客户端证书与 TLS 版本，非服务端证书校验） |

### 2.2 PAT 的格式事实

- 值为 base64 样式字符串（解码后为 `<数字id>:<密钥>` 结构），含 `+` `/` 等字符——grep 提取时字符类需覆盖 `+ / =`；
- 同一 token 在 transcript 中既出现过真实值、也出现过脱敏占位（`'...'`），提取时需取「最长一致值」并人工比对。

### 2.3 凭据落盘的现状（2026-09-02 起）

```
~/.config/jira-certs/
├── client.crt      # mTLS 客户端证书（Mailteam CA）
├── client.key      # 私钥
└── jira-pat.txt    # Jira PAT（单行纯文本）← 本次新增
```

该目录在用户主目录下、不在任何 git 仓库内，不会随代码提交泄露；但为明文存储，后续可考虑迁往系统凭据管理器。

---

## 三、根因分析

### 根因 1：skill 把「凭据注入」外包给一个本机不存在的组件，且无降级路径

SKILL.md 假定 mcp-atlassian 注入 `JIRA_PERSONAL_TOKEN`，这在其原生环境成立；但 skill 被复制到其他机器（Windows + 无 mcp-atlassian）后，既没有说明「注入链不成立时凭据从哪来」，也没有一个**可选的本地凭据文件约定**作为 fallback。结果每次会话都要重新向用户要 token——而用户合理地认为「之前给过你」。

### 根因 2：访问配方沉淀了「怎么用」却没沉淀「凭据本身放哪」

第一次会话的持久记忆记录了证书路径、脚本用法、归档约定——唯独对 PAT 写了「用户提供」这种把问题原样抛给未来会话的写法。**配方类记忆如果不回答「凭据持久化在哪」，就等于约定了每次重新索取**，与用户预期（给过一次即可）必然冲突。

### 根因 3：token 以命令行明文形式进入会话记录，既是找回的运气也是泄露面

`PAT='<token>' node ...` 这种内联形式使 token 落入 transcript JSONL。本次靠它找回，但换个场景（会话已清理、或机器多人使用）就是要么丢、要么泄露。skill 应当引导**凭据不进命令行参数**的用法（从文件读、或脚本内读环境变量由调用方 export 而非内联）。

---

## 四、Skill 优化建议

按优先级排列，前两条是本次事故的直接解：

### 建议 1：在 jira-read（及同族 skill）中定义凭据解析链

在 SKILL.md 的 Authentication 一节显式写入三级 fallback：

1. env var `JIRA_PERSONAL_TOKEN`（mcp-atlassian 注入，原生路径，保持兼容）；
2. 本地凭据文件 `~/.config/jira-certs/jira-pat.txt`（单行纯文本；Windows 上为 `%USERPROFILE%\.config\jira-certs\jira-pat.txt`，与证书同目录，约定「证书在哪凭据就在哪」）；
3. 两者皆无 → 向用户索取一次，并**主动询问是否落盘到约定路径**（本次事故中缺的正是这一步）。

脚本读取顺序与之对齐：先查 env，再读文件，失败时给出「三条路径全部为空」的明确报错而非笼统的 401。

### 建议 2：访问配方类记忆/skill 文档必须包含凭据持久化字段

凡沉淀「某内网服务访问配方」的记忆或 skill reference，模板中固定一节「凭据」：存哪、什么格式、如何轮换。只写「用户提供」视为不完整。

### 建议 3：禁止 token 内联进命令行

skill 的用法示例从 `PAT='xxx' node ...` 改为：

```bash
export JIRA_PAT="$(cat ~/.config/jira-certs/jira-pat.txt)"   # 或由脚本自行读取
node fetch-jira.js "/rest/api/2/issue/..." out.json
```

并把「不要把 token 写进会话消息」写进 SKILL.md 的注意事项——同时这天然满足了「token 不落 transcript」。

### 建议 4：为 Windows / 非 curl 环境提供 node 版下载脚本

`download_jira_attachments.sh` 依赖「curl 支持按 PEM 文件对做 mTLS」，在 Schannel 构建的 curl（Windows 默认）上不可用。建议：脚本开头做能力探测（`curl -V` 是否 Schannel），不可用则自动降级到等价 node 脚本（node 的 `https.request` + `key`/`cert` 选项 + TLS1.3），并在 SKILL.md 标注「Windows 内网 mTLS 网关场景必须用 node」。

### 建议 5：认证失败时的错误分流

现文档只有一行「PAT auth failed → 检查 token validity」。建议细化为：凭据缺失（解析链三级全空）→ 走建议 1 的索取流程；401/403 → token 过期/吊销，提示轮换并更新 `jira-pat.txt`；TLS 握手失败 → 客户端证书或 TLS 版本问题（Windows 上查是否误用 curl）。

---

## 五、验证记录

- `jira-pat.txt` 写入成功（2026-09-02），与 `client.crt`/`client.key` 同目录；
- 持久记忆 `jira-access-mtls` 已同步更新存储路径；
- 全文未包含 PAT 真实值。
