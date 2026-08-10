# 7×24 Agent 运行手册：让 Agent 不间断且正确地运行

> **一句话摘要**：让 Agent 7×24 不间断"运行"是基础设施问题；让 Agent 7×24 不间断"正确地运行"（达到用户预期效果）才是真正的难点。本手册给出分层方法论 + 场景化可落地清单 + 快速检查表。
>
> **最后更新**：2026-08-05
> **适用范围**：通用方法论，附 Claude Code / OMC 与自建 Agent 场景的具体落地
> **资料时效**：基于 2025–2026 年最新权威资料（Google SRE、Anthropic、Google ADK、LangChain 等，见文末来源）

---

## 0. 核心结论速览（TL;DR）

1. **先问"是否值得用 Agent"**：确定性任务用 cron/脚本，需要判断的任务才用 Agent。盲目给确定性任务套 Agent = 用信用卡付 while 循环的账。
2. **运行 ≠ 正确，两条线分开治理**：
   - *运行*（活着、到点跑）→ 常驻/调度层 + 容错层
   - *正确*（跑对、达到预期）→ 正确性层 + 治理层
3. **四条铁律**：
   - **Propose, do not perform**：Agent 只产建议（PR/任务/摘要），不可逆动作（merge/deploy/对外消息）留在人侧。
   - **渐进授权**（Autonomy Levels L0→L4）：先人工审批，验证合格再放权；绝不一步到位。
   - **每步 Ground Truth**：进度从环境真实反馈读取，禁止从"对话历史"猜。
   - **Stopping is a feature**：能优雅停止、能升级人工、能一键 Kill，才算可靠。
4. **正确性靠闭环，不靠祈祷**：`定义可验证预期 → 每步 ground truth → 输出质检 → 失败沉淀 → 回归 eval → 人工审核`。
5. **进攻型长跑（Goal-Driven）**：想让 Agent 无监督一次跑完一个明确目标，见 §8——需求/验收前置 → sub-agent 分工防上下文爆 → `/goal` 长跑 → 完成报告 + 人工验收。

---

## 1. 根因地图：为什么 Agent 长跑会失败或跑偏

> 来自 galileo.ai、Google SRE 论文、Google ADK 官方教程、acethecloud 等交叉验证。

| # | 根因 | 现象 | 反制机制（见 §2 对应层） |
|---|------|------|--------------------------|
| 1 | **非确定性** | 相同输入不同输出，确定性测试测不出 | L3 质检闭环、eval |
| 2 | **上下文污染/漂移** | 长跑中历史膨胀，模型混淆当前步骤 | L2 显式状态机 |
| 3 | **跨 idle 时间的"推理幻觉"** | 暂停多日后恢复，模型"记住"从未发生的审批、跳过以为完成的步骤 | L2 checkpoint + 状态机 |
| 4 | **级联失败** | 早期一个错误工具选择污染后续所有步骤 | L3 每步 ground truth、门禁 |
| 5 | **死循环/空转** | 语义重复的 no-progress 循环，烧 token 不前进 | L3 no-progress 检测、L4 预算 |
| 6 | **终止/升级条件不当** | 无法停止、不知道何时该问人 | L4 预算 + 升级路径 |
| 7 | **自治级别不当** | 过度自治违反业务规则 / 过度受限导致无效 | L4 渐进授权 |
| 8 | **权限过界/越权执行** | 用人类凭据执行不可逆操作 | L4 最小权限、dry-run |
| 9 | **共享模型依赖** | 底层 LLM 抖动/故障 → 所有 agent 同时失败 | L1 降级/重试、熔断 |

> ⚠️ **关键警示**（来自"Self-Correcting Agents Are Not What You Think"）：自修正循环可能**把对的改成错的**。质检必须是"确定性 checker 兜底 + LLM 评判辅助"，不能纯靠 LLM 自评。

---

## 2. 分层方法论总览

```
┌─────────────────────────────────────────────┐
│  L4 治理层   权限/审计/渐进授权/紧急停止       │  ← 可控、可问责
├─────────────────────────────────────────────┤
│  L3 正确性层  Guardrails/质检/eval/自修正     │  ← 跑对、达到预期
├─────────────────────────────────────────────┤
│  L2 容错层   状态机/checkpoint/预算/幂等      │  ← 跑挂了能回来
├─────────────────────────────────────────────┤
│  L1 常驻层   调度/守护/重启/告警              │  ← 活着、到点跑
└─────────────────────────────────────────────┘
```

| 层 | 回答的问题 | 核心机制 | 权威来源 |
|----|-----------|---------|---------|
| **L1 常驻/调度** | 怎么让它活着、到点跑？ | cron/systemd/launchd/GitHub Actions、Claude Code Routines（云端）、Managed Agents、进程守护+自动重启 | Anthropic / Claude Code 官方文档 |
| **L2 容错** | 跑挂了/暂停了怎么回来？ | 显式状态机、checkpoint-and-resume、event-driven dormancy、幂等键、预算/超时、熔断 | Google ADK、acethecloud |
| **L3 正确性** | 怎么保证跑对、达到预期？ | 分层 guardrails、每步 ground truth、no-progress 检测、质检闭环、eval 回归 | Google SRE、Anthropic、acethecloud |
| **L4 治理** | 怎么可控、可问责？ | 渐进授权(L0-L4)、最小权限、dry-run、升级人工、Red Button/kill switch、全量 trace 审计 | Google SRE 官方论文 |

---

## 3. 场景化落地清单

### 3.1 场景 A：Claude Code / OMC 本地常驻

> 适用：你有自己的服务器/常开电脑，想让 Claude Code 定时处理任务（triage、日报、代码审查等）。

#### A1. headless 模式基础（官方已验证）

```bash
# 非交互执行，返回结果后退出（print mode）
claude -p "你的 prompt"

# 结构化 JSON 输出，适合脚本解析/监控
claude -p "列出所有 API 端点" --output-format json

# 流式 JSON（适合实时日志）
claude -p "..." --output-format stream-json

# 指定权限模式与允许的工具
claude -p "..." --permission-mode acceptEdits --allowedTools "Bash Read Edit Write"
```

| Flag | 说明 | 注意 |
|------|------|------|
| `-p "<prompt>"` | 非交互/print 模式 | 会创建可恢复会话，适合 CI/定时任务 |
| `--output-format text\|json\|stream-json` | 输出格式 | `json` 便于程序化解析 |
| `--permission-mode auto` | 自动放行权限 | 信任场景使用 |
| `--dangerously-skip-permissions` | 跳过所有权限提示（= bypassPermissions） | **危险**，仅限隔离/沙箱环境，勿在生产开放 |
| `--allowedTools "..."` | 工具白名单 | **强烈建议**：给 Agent 最小工具集 |
| `--max-turns N` | 最大迭代轮数 | L4 预算兜底，防失控 |
| `--model <model>` | 指定模型 | 高频检查用 Haiku，重推理用 Opus（成本梯度） |
| `--append-system-prompt "..."` | 追加系统提示 | 可用于注入约束/AGENTS 规则 |

#### A2. cron 定时执行（Linux/macOS）

```bash
# crontab -e
# 每 6 小时运行一次，输出追加到日志
0 */6 * * * /usr/local/bin/claude -p "triage 昨天的生产异常并生成报告" \
  --output-format json --permission-mode acceptEdits \
  --allowedTools "Bash Read" >> /var/log/claude-agent.log 2>&1
```

**守护/重试注意事项**：
- cron 本身不保证"上次没跑完就不重复触发"，幂等键/互斥锁（如 `flock`）按需添加。
- 输出落盘日志，配合日志采集（见 A4）。

#### A3. systemd 服务（Linux 常驻）

```ini
# /etc/systemd/system/claude-agent.service
[Unit]
Description=Claude Code headless agent (hourly task)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/claude -p "巡检并汇报系统状态" \
  --output-format json --permission-mode acceptEdits
Environment=ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
User=deploy
StandardOutput=append:/var/log/claude-agent.log
StandardError=append:/var/log/claude-agent.log

[Install]
WantedBy=multi-user.target
```

配套 timer（比 cron 更可观测，带失败重试语义）：

```ini
# /etc/systemd/system/claude-agent.timer
[Unit]
Description=Run claude-agent every 6h

[Timer]
OnCalendar=*-*-* */6:00:00
Persistent=true        # 机器关机错过的时间，下次开机补跑
RandomizedDelaySec=120 # 抖动，避免整点扎堆

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now claude-agent.timer
journalctl -u claude-agent -f   # 查看运行日志
```

**若 Agent 是持续循环型（非定时）**：改用 `Type=simple` + `Restart=always` + `RestartSec=30`，实现崩溃自动重启。

#### A4. launchd（macOS 常驻）

```xml
<!-- ~/Library/LaunchAgents/com.example.claude-agent.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.example.claude-agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/claude</string>
    <string>-p</string>
    <string>巡检并汇报系统状态</string>
    <string>--output-format</string>
    <string>json</string>
  </array>
  <key>StartInterval</key>
  <integer>21600</integer>       <!-- 每 6 小时 -->
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/claude-agent.log</string>
  <key>StandardErrorPath</string>
  <string>/tmp/claude-agent.err</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.example.claude-agent.plist
```

#### A5. GitHub Actions（云端常驻，无服务器依赖）

```yaml
# .github/workflows/daily-agent.yml
name: Daily Agent Task
on:
  schedule:
    - cron: '0 6 * * *'          # 每天 06:00 UTC（建议避开 :00/:30 整点）
  workflow_dispatch: {}           # 手动触发
jobs:
  agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          prompt: "审查所有 open PR 是否符合 AGENTS.md 规范，输出 JSON 报告"
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: |
            --output-format json
            --permission-mode acceptEdits
            --allowedTools "Bash Read Edit Write"
            --max-turns 20
```

#### A6. 失败告警（关键！"Fail loud"）

- Agent 返回非零退出码 → 通过 cron/systemd 的失败回调、webhook 或监控（如 Uptime、Healthchecks.io、自建告警）通知人。
- **原则：缺数据/出错就停止并报告，不猜、不带病继续**（Claude Code Routines 官方法则"Fail loud"）。

---

### 3.2 场景 B：Claude Code Routines（云端调度，2026 新特性）

> 适用：任务值得在"你不记得也照跑"，且不希望依赖本地机器/服务器。Routines 在 Anthropic 云上运行，**电脑关机照跑**。需要 Pro/Max/Team/Enterprise 订阅。

#### B1. 创建与管理

```bash
# 对话式创建定时 Routine（CLI 内）
/schedule every day at 9am, 汇总昨日合并的 PR 并审查规范性

# 一次性调度（自然语言解析时间）
/schedule tomorrow at 9am, summarize yesterday's merged PRs
/schedule in 2 weeks, open a cleanup PR that removes the feature flag

# 管理子命令（官方支持）
/schedule list
/schedule update
/schedule run
```

- `/schedule` 别名 `/routines`；也可在 **claude.ai/code/routines**（Web）或 Desktop 创建。
- **三种触发器**：Scheduled（cron，最小间隔 1 小时）/ API 调用 / GitHub 事件（push/PR/issue）。API 与 GitHub 触发器需在 Web 界面配置；每个 routine 分配一个带 token 的 `/fire` endpoint 供外部系统调用。
- 每次运行是**全新 stateless 会话**（零历史）。好处是无 drift；代价是 prompt 必须自足、把规则写全。

#### B2. 安全默认（官方内置，务必保持）

- **只能 push 到 `claude/` 前缀分支**，不能动 main、不能部署 → 所有变更走 PR 人工审查。
- **Propose, do not perform**：让 Routine 产 PR/任务/摘要，不可逆动作留在人侧。
- **最小连接器**：只授予任务需要的最窄权限，只读 token 是特性不是限制。
- **Fail loud**：缺 API token / 鉴权失败时停止并报告，不猜、不续跑。

#### B3. 成本梯度

- 计费走订阅 token 预算（Pro/Max/Team/Enterprise），无独立服务器费用。
- **成本 ≈ 模型 × 频率 × 范围**。高频轻检查用 Haiku；重代码推理用 Opus（如 Opus 4.8 / 1M 上下文）。
- **不要**用 Opus 每小时跑 10 个仓库——除非产出真的值。

#### B4. 决策框架（Routine vs cron vs subagent vs Managed Agent）

| 工具 | 启动方式 | 运行位置 | 适合 | 避免 |
|------|---------|---------|------|------|
| cron/脚本 | 时钟 | 你的服务器 | 确定性任务（备份/同步，零判断） | 需要读现场做判断 |
| Interactive Claude | 你打字 | 本地 | 一次性/探索性 | 重复任务你重复手做 |
| Subagent | 父 agent 委派 | 本地会话内 | 拆分大型交互任务 | 需要独立定时跑、不在你机器上 |
| **Routine** | 定时/API/GitHub | **Anthropic 云** | 定时、规则化、可无人值守 | 一次性、需中途干预、无明确输出契约 |
| Managed Agent (Agent SDK) | 你的部署 | 你的基础设施 | 构建常驻产品、需定制控制与计费 | 只是想定时跑个任务 |

> 决策心法：**如果"任务在我睡觉时跑"让你不放心，说明它还不是 Routine 的料**——把 prompt 和输出契约收紧到放心为止。

---

### 3.3 场景 C：自建 Agent 应用（Google ADK 模式）

> 适用：你自研 Agent 服务，需要跨天/跨周暂停-恢复的业务流程（审批、等待外部事件等）。以下模式来自 Google ADK 官方教程（2026-05）。

#### C1. 三大架构转变（对抗"推理幻觉"）

| 传统（错） | 改为（对） |
|-----------|-----------|
| 把所有对话历史塞回下一次 LLM 调用（context 污染、token 爆炸、跨 idle 幻觉） | **显式状态机**：进度存在 session state（`current_step` 字段），不从 chat history 猜 |
| 轮询等待外部事件（浪费算力/线程） | **event-driven dormancy**：idle 期休眠（scale-to-zero），webhook 唤醒 |
| 单 Agent 大 prompt 塞所有工具 | **多 Agent 委派**：协调者把领域任务委派给专注子 agent |

#### C2. 最小实现骨架（Python）

```python
# 1. 显式状态机 —— 进度存在 state，不靠历史
class OnboardingStep:
    START = "START"
    WELCOME_SENT = "WELCOME_SENT"
    DOCUMENTS_SIGNED = "DOCUMENTS_SIGNED"
    IT_PROVISIONED = "IT_PROVISIONED"
    COMPLETED = "COMPLETED"

# 2. 持久化会话（checkpoint-and-resume）
#    sqlite+aiosqlite:///sessions.db  —— 每次 tool call 自动落 checkpoint
#    生产：Cloud SQL / 等价托管存储

# 3. 每次 tool call 原子更新状态（工具函数里写 state）
state["current_step"] = OnboardingStep.WELCOME_SENT
state["new_hire_details"] = {"name": name, "email": email}

# 4. Webhook 唤醒 + state_delta 原子推进（idle 期 scale-to-zero，事件到才拉起）
#    在 resume handler 中：runner.run_async(..., state_delta={"current_step": ...})
```

#### C3. 配套工程

- **Golden eval 集**：预置状态模拟 idle 延迟（如"暂停 48h 后仍记得细节、拒绝跳步"），进 CI 拦截状态机回归。
- **部署**：Agent Runtime 之类托管运行时自带会话持久化、scale-to-zero、链路追踪。
- **可观测**：Cloud Trace 等记录每次 pause/resume 的延迟与状态迁移。

---

## 4. 通用安全清单（Guardrails / 预算 / 熔断 / 权限）

> 来源：acethecloud《Agents Need Seatbelts》、Google SRE 论文。金句："没有 guardrail 的 agent 就是一个带信用卡的 while loop。"

### 4.1 分层 Guardrails（七层）

| 层 | 示例控制 |
|----|---------|
| Input | prompt injection 筛查、敏感数据检测 |
| Planning | 任务范围、允许的工具、需要审批的操作 |
| Tool call | 授权、schema 校验、rate limit |
| Observation | 清洗工具输出、检测恶意指令 |
| Memory | 不存密钥、租户隔离 |
| Output | 策略、引用、PII 检查 |
| **Loop** | 预算、no-progress 检查、递归限制 |

### 4.2 预算（每次运行都应有）

- max steps / max tool calls / max input+output tokens / max wall-clock time
- 单工具 max retries / max 重复动作指纹 / max 花费
- **预算应是任务感知的**：后台调研 agent 给 50 步；客服回答给 4 步；支付类改动强制人工审批。

### 4.3 No-progress 循环检测（防"语义重复空转"）

无限循环通常是**语义重复**而非精确重复。用**状态指纹**检测：

```
fingerprint = hash(目标 + 规范化计划 + 上次工具名 + 规范化工具参数
                   + 检索文档ID + 已知事实集)
```

指纹重复、或变化但不新增事实 → 减速或停止，升级人工。

### 4.4 工具授权

每个工具声明：所需权限 / 允许入参 schema / 副作用 / rate limit / 成本 / 是否需审批 / 数据分类 / 审计字段。

**危险工具（模型不能独自决定）**：支付、删除、部署、发邮件、外部 API 写、数据库变更、浏览器自动化 → 决策权属于 policy 代码。

### 4.5 生产控制项

- step-by-step tracing + state snapshots
- tool-call audit log（全量留痕）
- per-tool timeout + idempotency keys（重试不产生重复副作用）
- cancellation propagation（取消能传递到子任务）
- human approval gates + **emergency kill switch / Red Button**（一键暂停所有在途 agent 动作、全局吊销自治权限）
- **replay harness**：跑挂的会话能重放 → 不能重放就无法调试

### 4.6 权限与身份（Google SRE 强制项）

- **No Ambient Access & Least Privilege**：agent 用独立身份，按需授权；禁止携带开发者的人类凭据常驻。
- **Mandatory Dry-Run**：任何变更先 `dry_run=true` 预测爆炸半径。
- **Zero-Trust 执行**：基础设施本身带确定性安全机制，单靠 agent 自律是不够的。
- **Independent Harness**：写代码的 agent 与写测试/评审的 agent 隔离，防交叉偏差。

---

## 5. 正确性保持闭环（针对"达到用户预期效果"）

```
┌──────────────────────────────────────────────────────────┐
│  ① 定义可验证预期(output contract/明确成功标准)            │
│      ↓                                                    │
│  ② 每步 Ground Truth（从环境取真实反馈，禁止猜）            │
│      ↓                                                    │
│  ③ 输出质检：确定性 checker 兜底 + LLM-as-judge 辅助        │
│      ↓                                                    │
│  ④ 失败归因：沉淀为 eval 样本（Gold/人工标注）              │
│      ↓                                                    │
│  ⑤ 回归 eval：nightly / CI 中持续验证（防 drift、防回归）   │
│      ↓                                                    │
│  ⑥ 人工审核 + 升级路径（不能确定就问人，把上下文完整带上）    │
│      ↑____________（失败样本回流 ①，持续改进）____________↓│
└──────────────────────────────────────────────────────────┘
```

### 关键要点

- **output contract 是前提**：无法用一段话写清"规则 + 输出契约"的任务，还没到无人值守的成熟度。
- **质检双通道**：LLM-as-judge 管"质量/推理过程"，确定性评分管"最终输出是否精确命中"（Google SRE 用 strict precision/recall 判定 mitigation 正确性，不接受模糊建议）。
- **数据分级校准**：Gold（人工验证）→ 校准 Silver（程序生成）→ 校准 Bronze（启发式）。用分层采样持续产出 Gold，避免"accuracy gap"。
- **自修正要防反向恶化**：generation→evaluation→iteration 循环中，确定性 checker 判定失败才迭代；不达标就停止/升级，而不是反复"修正"。

---

## 6. 快速检查表（Checklist，部署前逐项勾选）

### L1 常驻/调度
- [ ] 选对载体：确定性任务→cron/脚本；需判断→Routine/Managed Agent；自研→Agent 应用
- [ ] 调度配置正确（cron/timer/launchd/Actions），避开整点扎堆（加抖动）
- [ ] 进程守护 + 自动重启（systemd `Restart=always` 或定时器 `Persistent=true`）
- [ ] 日志落盘 + 失败告警（非零退出 → 通知人）
- [ ] "Fail loud"：缺数据/出错即停，不带病继续

### L2 容错
- [ ] 显式状态机（进度存 state，不靠对话历史）
- [ ] checkpoint-and-resume（每次关键操作落盘，重启可从断点续跑）
- [ ] 幂等键（重试不产生重复副作用）
- [ ] 预算：max steps / tokens / 时间 / 花费
- [ ] 超时 + 熔断 + rate limit

### L3 正确性
- [ ] 输出契约（成功标准）明确、可验证
- [ ] 每步 ground truth（环境反馈驱动，不猜进度）
- [ ] no-progress 指纹检测
- [ ] 质检：确定性 checker + LLM judge 双通道
- [ ] eval 集存在并进 CI/夜间回归（防 drift）

### L4 治理
- [ ] 最小权限 / 独立 agent 身份（不用人类凭据）
- [ ] 渐进授权（先 L2 人工审批，合格再放权）
- [ ] dry-run 前置（执行前预测影响）
- [ ] 危险操作由 policy 代码把关（模型不能独自决定）
- [ ] kill switch / Red Button 可用
- [ ] 全量 trace 审计（每次执行可回放、可追责）
- [ ] 升级人工路径明确（带完整上下文交接）

---

## 7. 权威来源与延伸阅读

| 来源 | 链接 | 时效 |
|------|------|------|
| Google SRE《AI in SRE: Engineering the Future of Reliable Operations》 | https://sre.google/resources/practices-and-processes/ai-engineering-reliable-operations/ | 2026 |
| Google Developers Blog《Build Long-running AI agents that pause, resume, and never lose context with ADK》 | https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/ | 2026-05 |
| Anthropic《Building Effective Agents》 | https://www.anthropic.com/engineering/building-effective-agents | 官方 |
| Claude Code 官方文档（headless / routines / GitHub Actions） | https://code.claude.com/docs/en/best-practices · /docs/en/routines · /docs/en/github-actions | 官方 |
| Claude Managed Agents 概述 | https://platform.claude.com/docs/en/managed-agents/overview | 官方 |
| LangChain《State of Agent Engineering》（2025-12 调查） | https://www.langchain.com/state-of-agent-engineering | 2025-12 |
| MakerKit《Claude Code Routines: The Complete Guide》 | https://makerkit.dev/blog/tutorials/claude-code-routines-guide | 2026-06 |
| galileo.ai《A Guide to AI Agent Reliability for Mission Critical Systems》 | https://galileo.ai/blog/ai-agent-reliability-strategies | 2025-07 |
| acethecloud《Agents Need Seatbelts: Guardrails and Infinite-Loop Detection》 | https://acethecloud.com/blog/agent-guardrails-infinite-loop-detection/ | 2026-05 |
| Medium《Self-Correcting Agents Are Not What You Think They Are》（反证） | https://medium.com/@Micheal-Lanham/self-correcting-agents-are-not-what-you-think-they-are-d19398186373 | — |

---

## 8. Goal-Driven 长跑模式（社区实践深化）

> 本章源自社区分享的"让 Agent 7×24 长跑"实践（DeepSeek v4 flash 场景），结合 Anthropic 官方《Effective Context Engineering》与 Claude `/goal` 特性深化而成。

### 8.0 章节导引

**定位**：前文各章是"防御性可靠性"——保证 Agent 不挂、不跑偏。本章是"**进攻性目标驱动执行**"——让 Agent 一次性、无监督地完成一个明确目标（社区实践中"一个 goal 下去跑几个小时"）。两者互补：防御层是进攻长跑的安全底座。

**前置条件**（不满足别硬上）：
- 模型"强 + 便宜"（如 DeepSeek v4 flash 这类），长跑成本可接受
- 任务有**明确可验证的完成条件**（输出型，见 §8.3）
- 愿意先花时间做**前置设计**——这是长跑成功的关键投入，省不了

**与 Claude `/goal` 的关系**：Claude 原生支持 `/goal`——设置完成条件后跨 turn 持续工作，每轮由轻量模型检查条件是否达成，未达成自动进入下一轮，达成才交回控制权。分享中的"手工版 goal 循环"已被收编进该特性；本章流程同样适用于 `/goal` 或任何 goal-driven 编排。

### 8.1 五环节总览

```
① 需求/设计前置 (~40min) → ② 验收标准+自评自调 → ③ sub-agent 分工
  → ④ 一个 goal 跑几小时 → ⑤ 完成报告 + 人工验收
```

每环节对应的既有章节锚点：
- ① → §5 闭环第①步（定义可验证预期）
- ② → §5 第③步（质检+自修正）、§4.2 预算
- ③ → §3.3 C1（多 Agent 委派）
- ④ → §4（安全/预算/kill switch）、§3.1/3.2（常驻调度）
- ⑤ → §5 第⑥步（人工审核/升级路径）

### 8.2 环节①：需求与设计前置

**目标**：长跑开始前，把"做什么、做到什么程度算好、边界在哪"聊透。长跑本身无监督，**所有判断依据必须前置固化**。

**核心动作**：
1. 产出**需求摘要**（一段话讲清目标）
2. 产出**分层验收标准**（见环节②）
3. 界定**范围/边界/非目标**（防 Agent 跑偏）
4. 确认**成本/时间预算**（长跑前说清"最多花多少"）

**【模板1】需求对齐清单**（长跑前逐项填写）

| 项 | 填写内容 | 示例 |
|----|---------|------|
| 目标（一段话） | 本次长跑要交付什么 | 把 legacy API 迁移到新接口，所有调用点编译通过 |
| 产出物 | 具体 artifact | 改动的代码 + 迁移报告 |
| 成功标准（机器可验） | Agent 自己能判定的条件 | 构建通过；测试全绿；无 TODO 残留 |
| 成功标准（人工判断） | 需要人验收的条件 | 迁移方案符合团队架构约定 |
| 范围（做什么） | 明确允许的动作 | 只改调用方代码，不动 API 定义 |
| 非目标（不做什么） | 明确禁止的动作 | 不做重构、不改依赖、不碰其他模块 |
| 约束 | 必须遵守的规则 | 保持向后兼容；禁止删除公开 API |
| 预算 | 步数/时间/token 上限 | max 50 步 / 2 小时 / 200 万 token |
| 边界情况处理 | 遇到不确定怎么办 | 无法判断时停下并输出说明，不猜 |

### 8.3 环节②：验收标准与自评自调

**关键洞察（Output vs Outcome）**：Agent 只能自主验证**输出型**标准（编译/测试/格式/覆盖率），**无法自验结果型**标准（用户是否采用、业务指标是否变化）。因此验收标准必须**分层、各归其位**：

| 层级 | 标准 | 判定者 | 何时用 |
|------|------|--------|--------|
| 硬性（机器可验） | 编译/测试/格式/lint/无残留 TODO | Agent 自动（自评自调依据） | 必须 |
| 软性（LLM judge） | 代码质量、文档完整、规范符合 | 质检模型 + 确定性 checker 兜底 | 推荐 |
| 人工（结果型） | 业务价值、架构符合、产品体验 | 人工（环节⑤） | 必须 |

**自评机制**：
- 每步 **ground truth**：从环境取真实反馈（工具结果/测试输出），禁止凭空判断
- 对照验收标准清单**逐项自查**，记录每项状态（通过/未通过/不确定）

**自调机制（防"把对的改错"）**：
- 只有**确定性 checker 判定失败**才进入修正循环（generation→evaluation→iteration）
- 修不动就**停下升级人工**，禁止无限自旋
- 自修正后必须**重跑验证**，确认没把原先通过的标准改坏

**【模板2】验收标准模板**（长跑前填写，作为 Agent 自评依据）

```
## 验收标准
### 硬性（Agent 必须全部自验通过）
- [ ] 构建命令通过：<命令>
- [ ] 测试通过：<命令>（覆盖 >= <阈值>）
- [ ] 无 TODO/FIXME 残留
- [ ] <其他机器可验项>

### 软性（质检模型 + 确定性检查）
- [ ] <质量要求>（如：遵循仓库命名规范）
- [ ] <一致性要求>（如：错误处理模式统一）

### 人工（交给人验收）
- [ ] <业务/架构判断项>（如：方案是否符合团队架构约定）
- [ ] <体验判断项>（如：变更说明清晰可读）
```

### 8.4 环节③：sub-agent 协作与上下文管理

**为什么必须拆分**：**Context Rot**——上下文 token 越多，模型回忆准确率越低（transformer 的 n² 注意力成本）。长跑数小时 token 远超窗口，主 agent 会"记不住开头"。拆分是刚需，不是优化。

**分工原则**：
- **主 agent**：保持**高层面计划** + 委派 + 合成结果（只保留计划/进度/关键决策，不携带细节）
- **sub-agent**：用**干净上下文**深度工作（可耗几万 token），**只回传浓缩摘要（1000–2000 token）**
- 每个 sub-agent 有**明确任务 + 输出契约**，边界清晰可判定

**三大上下文技术选型**：

| 技术 | 机制 | 适合 | 注意 |
|------|------|------|------|
| **Sub-agent 架构** | 子代理深度工作只回传摘要 | 并行探索、研究、多模块开发 | 主 agent 别接细节，避免上下文回流 |
| **Compaction（压缩）** | 接近窗口上限时总结重开，保留架构决策/未决问题/实现细节 | 需要来回对话流的长任务 | 压缩 prompt 要调（先保 recall 再提 precision） |
| **Structured note-taking** | 定期写 NOTES.md 到上下文外，后续拉回 | 多里程碑迭代开发 | 笔记结构要稳定，Agent 能自读续跑 |

**Just-in-time 检索**：给 Agent 轻量标识符（文件路径/查询/链接），运行时按需加载（Claude Code 用 CLAUDE.md 前置 + glob/grep 即时检索 + `head/tail` 分析大数据，不整块加载）。

**【模板3】sub-agent 分工清单**

```
## 协作设计
### 划分维度（选一或组合）
- [ ] 按模块：<模块A> / <模块B> ...
- [ ] 按领域：<研究> / <实现> / <验证>
- [ ] 按验证：<实现 agent> 与 <审查 agent> 分离（独立 harness，防交叉偏差）

### 每个 sub-agent 需定义
- 任务描述（一段话 + 明确输出物）
- 允许的工具（最小集 + 白名单）
- 输出契约（回传格式：摘要 + 证据 + 遗留问题）
- 完成条件（机器可验）
- 失败处理（无法完成时如何上报）

### 主 agent 职责
- [ ] 保持高层面计划与进度跟踪
- [ ] 只接收 sub-agent 摘要，不接收细节
- [ ] 合成结果 + 汇总到完成报告
```

### 8.5 环节④：goal 长跑执行

**`/goal` 机制**（Claude 原生）：设置完成条件 → 跨 turn 持续工作 → 每轮轻量模型检查条件 → 未达成自动下一轮，达成才交回。等价于"委托后不达目标不回来"。

**长跑期间控制**（引用既有机制）：
- **预算**：max steps / tokens / wall-clock / 花费（§4.2）——长跑尤其重要
- **checkpoint**：关键节点落盘，中断可续跑（§3.3 C2）
- **watchdog / kill switch**：异常停滞检测 + 一键终止（§4.5）
- **失败告警**：Fail loud，缺数据即停并报告（§3.1 A6）

**【模板4】goal prompt 模板**

```
/goal
目标：<一段话>
完成条件（全部满足才算完成）：
- <机器可验条件1>
- <机器可验条件2>
- ...
范围：<允许做什么>
非目标：<禁止做什么>
约束：<必须遵守的规则>
预算：<步数/时间/token 上限>
未知情况处理：<无法判断时，停下并输出说明，不要猜测>
输出：完成后按模板5格式输出完成报告
```

**低成本长跑注意**：成本 ≈ 模型 × 频率 × 范围。长跑在"强+便宜"模型（如 DeepSeek v4 flash）上成本可控；但**越便宜的模型越需要更清晰的完成条件与更小的作用域**——否则省的钱会花在无人验证的产出上。

### 8.6 环节⑤：完成报告 + 人工验收

**完成报告**：长跑结束主 agent 必须输出结构化报告（不是只丢产出物），让人能快速验收。

**【模板5】完成报告模板**

```
## 完成报告
### 目标回顾
- 原始目标：<一段话>

### 完成情况（对照验收标准逐项）
- 硬性标准：全部通过 ✅ / 未通过项：<列出>
- 软性标准：<自查结论>
- 人工标准：<留给人工判断的问题/说明>

### 实际完成内容
- 改动/产出的清单（文件/artifact + 一句话说明）
- 验证证据（构建/测试输出摘要、覆盖率等）

### 遗留问题与风险
- 未完成项 / 已知风险 / 需要人决策的点
- 下一步建议

### 备注
- 实际耗时 / token 消耗 / 偏离计划之处
```

**人工验收流程**：
1. 机器可验项（硬性）由 Agent 报告 + 人抽查复核
2. 人工项（业务价值/架构）由人判断——**Agent 无法自验"结果"**
3. 验收发现问题 → 回填到下一轮长跑的需求对齐清单（反馈闭环）

### 8.7 与既有章节的交叉引用

| 本节 | 依赖/引用 |
|------|----------|
| §8.2 环节① | §5 闭环第①步、§1 根因（范围蔓延） |
| §8.3 环节② | §5 第③步质检、§2 L3 正确性层、§4.1 guardrails |
| §8.4 环节③ | §3.3 C1 多 Agent 委派、Anthropic context engineering |
| §8.5 环节④ | §4.2 预算、§3.3 C2 checkpoint、§4.5 kill switch |
| §8.6 环节⑤ | §5 第⑥步人工审核、§4.6 审计 |

**本章专属补充来源**：
- Anthropic《Effective Context Engineering for AI Agents》— anthropic.com/engineering，2025-09
- Yuval Yeret《AI Agents Can Now Run Toward Goals—Are Yours Worth Running Toward?》— yuvalyeret.com，2026-05（Output vs Outcome 目标）
- Claude Code 官方文档（`/goal`、subagents、routines）— code.claude.com
- Claude Platform Cookbook《Context engineering: memory, compaction, and tool clearing》— platform.claude.com

---

*本手册为通用方法论沉淀。具体命令以各产品当前官方文档为准，落地前建议核对对应版本。*
