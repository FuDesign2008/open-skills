# 多仓 Worktree 本地验证案例 —— 兄弟目录约定与联调/打包陷阱

> **用途**：记录一次在 **独立 git 多仓工作区** 中，按 `git-worktree-discipline` / git worktree 隔离实现后，**如何本地验证、为何「感觉不好打包」** 的真实案例，供完善 worktree / 隔离工作区相关 Skill（如 `git-worktree-discipline`、`feature-branch-closeout`）时参考。
>
> **事件日期**：2026-08-12  
> **流程宿主**：`opsx-solve-workflow`（Stage 6 前建 worktree）  
> **涉及工程**：某桌面产品 Agent 升级相关双仓（非 open-skills 本体；已脱敏）  
> - `app-agent`（Agent SPA + tools）  
> - `app-desktop`（桌面薄壳 + IPC）  
> **变更主题**：明文读取工具 allowlist + 宿主内容接口返回 `domain`  
> **产物**：双仓 MR（示例）`app-agent!18`、`app-desktop!2344` → `release/x.y.z`

---

## 一、案例背景

### 1.1 为何用 worktree

- 同一台机器上 **另一 Agent 正在改主工作区**，用户要求隔离。
- `opsx-solve-workflow` Stage 6 前按 `git-worktree-discipline` 创建：
  - `app-agent/.worktrees/agent-plaintext-read` → 分支 `feat/agent-plaintext-read`
  - `app-desktop/.worktrees/agent-plaintext-read` → 同名分支
- OpenSpec change 落在 **agent 仓**；desktop 改动写在 tasks 的跨仓步骤里。

### 1.2 仓库拓扑（关键）

```text
special-dev/                    ← 多根工作区，不是 monorepo git
├── app-agent/                  ← 独立 git
│   └── .worktrees/agent-plaintext-read/
└── app-desktop/                ← 独立 git
    └── .worktrees/agent-plaintext-read/
```

联调依赖约定：**主仓彼此是兄弟目录**（`../app-desktop`、`../app-agent`）。  
Worktree 落在 `.worktrees/<slug>/` 后，**相对路径 `../对方仓` 不再指向真实兄弟仓**。

---

## 二、路径失效的具体机制

### 2.1 Agent → Desktop 拷贝脚本

`app-agent/scripts/copyToDesktop.mjs`（摘要）：

```js
const projectRoot = path.resolve(__dirname, '..');
const desktopRoot =
  process.env.DESKTOP_ROOT || path.resolve(projectRoot, '../app-desktop');
// Dist → `${desktopRoot}/build/app-agent`（dev）
```

| 运行目录 | 默认解析出的 `desktopRoot` | 结果 |
|----------|---------------------------|------|
| `…/app-agent`（主仓） | `…/app-desktop` | ✅ |
| `…/app-agent/.worktrees/agent-plaintext-read` | `…/app-agent/.worktrees/app-desktop` | ❌ 不存在 |

缓解：脚本已支持 **`DESKTOP_ROOT` 环境变量**；worktree 联调必须显式设置。

### 2.2 Desktop 打包资源准备

桌面文档约定 `_prepare-resource` 从 **`../app-agent/dist/desktop`** 拷入 `resources/app-agent`。  
从 desktop **worktree** 出发，同样会指到错误的 sibling，除非改脚本、设环境变量，或临时 symlink。

### 2.3 结论（对用户问题的直接回答）

> 「打包似乎都不好打包，是这样吗？」

**不完全是 worktree「不能」打包**，而是：

1. 现有工程脚本 **默认假设主仓兄弟布局**；
2. Worktree 打破该假设后，**默认路径失效**；
3. 完整桌面 **安装包**链路长（widgets / renderer / `_prepare-resource` / pack），在双 worktree 上硬拧路径 **成本高、易错**；
4. 对本类变更，**单测 + 显式路径联调通常足够**；安装包级验证更适合合回标准目录布局之后再做。

---

## 三、分层本地验证（本案例实操）

### 3.1 层 A — 不启桌面宿主（推荐优先）

| 仓 | 命令 | 验证内容 |
|----|------|----------|
| agent worktree | `npm test` / `npm run typecheck` | allowlist、tool、`UNSUPPORTED_TYPE`、截断、identity |
| desktop worktree | 受影响单元测试（如 controller） | 宿主返回 `domain` |

**本案例**：agent 单测 + typecheck 通过；desktop controller 测通过。  
**适合**：行为在纯函数 / 控制器层已可证明时。

### 3.2 层 B — 桌面联调（验证 IPC + 静态资源）

要求：

1. **Agent 与 Desktop 都使用本功能分支的 worktree**（否则一边新代码一边旧宿主）。
2. 设置 `DESKTOP_ROOT` 指向 **desktop worktree 绝对路径**。
3. Agent 用既有 watch/copy 脚本，确保产物进入该 desktop 的静态根。
4. 在 **同一** desktop worktree 启动桌面宿主。
5. 另开网关服务（可主仓或 worktree）。

示意：

```bash
export DESKTOP_ROOT="/abs/path/app-desktop/.worktrees/agent-plaintext-read"

# Agent worktree
cd /abs/path/app-agent/.worktrees/agent-plaintext-read
# 可选：ln -s ../../node_modules node_modules
npm run dev:desktop:watch

# Desktop worktree（另终端）
cd "$DESKTOP_ROOT"
# 既有桌面开发命令
```

点验清单（本变更）：

- [ ] 允许的扩展名 → 明文工具成功  
- [ ] 不允许的扩展名 → `UNSUPPORTED_TYPE`  
- [ ] 内容接口响应含 `domain`

### 3.3 层 C — 安装包 / 正式资源链

| 做法 | 说明 |
|------|------|
| **A. 检出到主仓兄弟布局再 pack**（推荐） | 与脚本默认一致 |
| **B. `DESKTOP_ROOT` + 显式 agent dist 路径 / symlink** | 可行，文档化成本高 |
| **C. 在 worktree 内改死脚本路径** | 勿提交；仅临时 |

**本案例建议**：MR 合入前以层 A（+ 可选层 B）为准；层 C 合入 `release/*` 后在主布局做。

---

## 四、对 Skill / 工具链的启示

供 `git-worktree-discipline`、宿主 PDCA（opsx-solve）作者吸收时参考：

### 4.1 创建隔离时就要问清「跨仓路径约定」

多仓 + 文件拷贝 / `file:` / 相对 `../sibling` 时，仅 `git worktree add` **不够**。应在隔离创建报告中显式写出：

- 默认 sibling 是否会断；
- 应用哪个环境变量（本案例：`DESKTOP_ROOT`）；
- 联调时应启动 **哪一个** worktree 上的宿主进程。

### 4.2 区分「隔离写代码」与「隔离做完整产品构建」

| 目标 | Worktree 适合度 |
|------|----------------|
| 实现 + 单测 + OpenSpec + 开 MR | ✅ 高 |
| 多仓桌面安装包 | ⚠️ 低（除非项目提供官方 env/文档） |

Skill 文案避免暗示「进了 worktree 就能原命令一键 pack」。

### 4.3 `node_modules` 与 baseline

Worktree **不共享** `node_modules`。本案例用 `ln -s ../../node_modules` 加速；Skill 应提示：symlink 或在 worktree 内 `npm install`，并避免把 symlink 提交进 git。

### 4.4 OpenSpec / 未跟踪文件

从主仓 `HEAD` 建 worktree **不会**带上未提交的 `openspec/changes/...`。本案例用 `rsync`/`cp` 拷入 worktree。隔离纪律应提及：**分析阶段产物若在主树，执行前需同步进隔离树**。

### 4.5 Closeout

双仓各有 worktree + MR 时，`feature-branch-closeout` 的清理应：

- 分仓确认；
- 不默认 `git worktree remove`（需强确认）；
- 提醒主工作区可能仍留有同名 change 的脏文件副本。

### 4.6 建议落入 Skill 的检查清单（草案）

创建跨仓相关 worktree 后、声称「可本地验证」前：

- [ ] 是否存在 `../sibling` 或硬编码兄弟路径的脚本？  
- [ ] 是否有官方 env（如 `DESKTOP_ROOT`）可覆盖？  
- [ ] 层 A 单测是否已在 **worktree cwd** 跑通？  
- [ ] 层 B 是否写明「拷贝目标仓 = 运行宿主的同一 worktree」？  
- [ ] 是否避免默认承诺层 C 安装包在 worktree 内一键完成？

---

## 五、与「单仓 worktree」的对比

| 维度 | 单仓应用 | 本案例（双独立 git + 拷贝联动） |
|------|----------|--------------------------------|
| `git worktree add` | 通常足够隔离 | 每仓各建一个 |
| `npm test` | 在 worktree 内即可 | 同上 |
| Dev server / 静态拷贝 | 较少跨仓路径 | **高概率踩 sibling** |
| 安装包 | 视项目而定 | 强烈倾向回主布局 |

因此：open-skills 里 worktree 文档若只覆盖「单仓隔离写代码」，会漏掉本类 **多仓产物联动** 的高频痛点。

---

## 六、一句话摘要

**Worktree 擅长隔离实现与单测；在「兄弟目录相对路径」驱动的多仓桌面联调/打包里，必须显式重绑路径（环境变量或主布局），否则会表现为「不好打包」——根因是路径约定，不是 git worktree 本身不可用。**
