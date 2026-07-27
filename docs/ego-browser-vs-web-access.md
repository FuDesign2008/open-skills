# ego-browser vs web-access：浏览器自动化 Skill 选型对比

> **事实核验注记（2026-07-26）**：本文经双源核验修正——本地 skill 源码实证 + GitHub 官方 API 竞品数据。早期版本两处失实已更正：①第二节原称 web-access「不能执行 JS / 不能交互 / 不能调 CDP」——实证其具备 `/eval`（任意页面 JS）、`/click`、`/clickAt`（真实鼠标手势）、`/setFiles`、`/scroll` 能力；②第十/十二章原称人机切换「市场上没有任何竞品」——Browserbase Live View、OpenAI Operator takeover、browser-use HITL、Playwright `connectOverCDP` 均存在同实例人机交接，ego-browser 的原子化 handoff 协议是其中**集成度最高**的实现，而非独家。

## 背景

在 open-skills-4 项目中，存在两个与浏览器相关的 Skill：
- **ego-browser**：基于 ego lite app 的 Chromium 浏览器，面向 AI Agent 的可编程浏览器运行时
- **web-access**：基于 CDP Proxy 的轻量网页通道，侧重信息抓取、搜索与轻量交互

两者都使用真实浏览器环境、都继承用户登录态，但设计哲学、能力边界和适用场景截然不同。本文档系统对比两者的差异，帮助 Skill 作者在合适场景选择合适工具。

---

## 一、ego-browser 能力总览

ego-browser 是一个为 AI Agent 设计的**可编程 Chromium 浏览器**，通过 CLI heredoc 脚本驱动。核心能力分三层：

### 1.1 观察层

| 能力 | 说明 | 调试价值 |
|------|------|----------|
| `snapshotText()` | 获取页面无障碍语义树，每个元素带 `[ref=N]` 引用标签 | 检查 DOM 结构、元素是否存在、文本内容 |
| `captureScreenshot()` | 截取页面/元素截图（PNG/JPEG/WebP） | 验证渲染结果、布局问题 |
| `pageInfo()` | URL、标题、视口尺寸、滚动位置 | 确认页面加载状态 |
| `drainEvents()` | 收集异步事件队列（导航、网络请求等） | 捕获运行时事件流 |

### 1.2 交互层

| 能力 | 说明 | 调试价值 |
|------|------|----------|
| `click()` / `hover()` / `doubleClick()` | 支持 CSS 选择器、`@N` ref、xpath、坐标四种定位 | 复现用户操作路径 |
| `fillInput()` / `typeText()` / `pressKey()` | 表单填写、真实键盘输入 | 模拟用户输入 |
| `scroll()` / `scrollBy()` | 滚动控制 | 触发懒加载、无限滚动 |
| `dragMouse()` | 拖拽操作 | 复现拖拽交互 bug |
| `uploadFile()` | 文件上传 | 测试上传功能 |

### 1.3 底层能力（调试核心）

| 能力 | 说明 | 调试价值 |
|------|------|----------|
| `js()` | 在页面上下文执行任意 JS（`Runtime.evaluate`） | **检查变量、DOM 状态、打断点、注入追踪代码** |
| `cdp()` | 直接调用 Chrome DevTools Protocol | **控制 Console、Network、Performance、断点等全部 DevTools 能力** |
| `serverFetch()` / `browserFetch()` | 从 Node 端或浏览器端发起 HTTP 请求 | 对比服务端/客户端请求差异 |

### 1.4 架构特性

- **Task Space 隔离**：Agent 拥有独立标签页集合，不影响用户正常浏览器窗口，同时继承用户登录态
- **控制权切换**：`handOffTaskSpace()` / `takeOverTaskSpace()` 允许 Agent 和用户在调试过程中无缝切换
- **零依赖运行**：一条 `ego-browser nodejs <<'EOF' ... EOF` heredoc 即可，所有 helper 预加载

---

## 二、web-access 能力总览

web-access 基于 CDP Proxy（HTTP `localhost:3456`，curl 脚本化），连接用户日常浏览器、登录态原生：

| 能力 | 说明 |
|------|------|
| 网页搜索 | 通过搜索引擎搜索互联网内容 |
| 网页抓取 | 读取指定 URL 的页面内容（Markdown/HTML） |
| 登录态访问 | 继承用户浏览器登录态，访问需要认证的页面 |
| 动态页面渲染 | 处理 JS 渲染的 SPA 页面 |
| 平台专项适配 | 针对小红书、微博、微信公众号等反爬平台做了专项处理 |
| 页面内 JS（`/eval`） | 在页面上下文执行任意 JS：查 DOM、填表提交、递归穿透 Shadow DOM / iframe |
| 交互（`/click` `/clickAt` `/scroll` `/setFiles`） | 点击（JS click 或 CDP 真实鼠标手势）、滚动触发懒加载、文件上传 |
| 截图（`/screenshot`） | 页面渲染态截图，可采集视频帧 |
| 多 Agent 并行 | 多子 Agent 共享同一浏览器实例，各自操作后台 tab，无竞态 |

### 核心局限（核验后修正）

- ❌ **无完整 DevTools 域**：代理仅暴露 eval/click/scroll/screenshot 等子集，无 Console 监听、Network 瀑布、Performance trace、断点
- ❌ **不能人机切换**：无 handoff / takeover 协议，Agent 操作期间用户无法在同一会话无缝接管
- ⚠️ **共享用户浏览器**：在用户的日常浏览器中开后台 tab，无 Task Space 式隔离
- ⚠️ **元素定位依赖 CSS 选择器 / eval**：无语义树 `@N` ref，结构脆弱的页面需手写更健壮的 JS

---

## 三、核心差异对比

| 维度 | ego-browser | web-access |
|------|-------------|------------|
| **设计定位** | 可编程浏览器（执行+调试+协作） | 轻量网页通道（检索 + 轻交互） |
| **运行方式** | ego lite app 内常驻 Chromium | CDP Proxy（按需连接用户浏览器） |
| **调用方式** | heredoc Node.js 脚本 | MCP tool / curl 脚本 |
| **元素定位** | `snapshotText()` 语义树 + `@N` ref | CSS 选择器 / `/eval` |
| **页面内 JS 执行** | ✅ `js()` | ✅ `/eval` |
| **完整 DevTools 域（Console/Network/Perf）** | ✅ `cdp()` 裸协议 | ❌（仅 eval/click/scroll 等代理子集） |
| **表单交互** | ✅ click / fill / type / press | ✅ `/click` `/clickAt` `/eval` 填表 |
| **Canvas/富编辑器** | ✅ 视觉模式（截图+坐标） | ⚠️ 可用 `/clickAt` 坐标点击，无视觉模式编排 |
| **事件监听** | ✅ `drainEvents()` | ❌ |
| **人机控制切换** | ✅ handoff / takeover | ❌ |
| **执行隔离** | ✅ Task Space 隔离 | ⚠️ 共享用户浏览器（后台 tab，并行安全） |
| **轻量搜索** | 较重（需启动 app） | ✅ 轻量快速 |
| **反爬平台适配** | 通用 | ✅ 小红书/微博/微信专项 |
| **平台** | macOS only | 全平台 |

---

## 四、场景选型矩阵

| 场景 | 推荐工具 | 原因 |
|------|:---:|------|
| 搜一篇文章 / 查一个信息 | **web-access** | 轻量，无需启动 app |
| 批量抓取网页内容 | **web-access** | API 化，多 Agent 并行无竞态 |
| 小红书 / 微博 / 公众号抓取 | **web-access** | 专项反爬适配 |
| 浏览器操控/调试（交互、JS、CDP、登录态） | **ego-browser** | 默认第一优选，单通道覆盖调试全链路；不可用/失败时降级 |
| 轻量交互的降级与并行批量 | **web-access** | ego 不可用时降级通道；多 Agent 并行共享浏览器无竞态 |
| 调试中途需人机切换（登录、验证码、支付） | **ego-browser** | handoff 机制，体系内唯一 |
| 需要隔离 Space 不干扰用户浏览 | **ego-browser** | Task Space 隔离 |
| 选择器脆弱页面（Canvas / 虚拟化 / 频繁改版） | **ego-browser** | 语义树 `@N` ref + 视觉模式 |
| 登录态 + 完整 CDP 域（Network/Console/Perf） | **ego-browser** | `cdp()` 裸协议 + 登录态继承 |
| 自动化测试 / 回放用户操作 | **ego-browser** | 完整交互 + heredoc 批量编排 |
| **浏览器代码 Debug（全链路）** | **ego-browser + chrome-devtools-mcp** | 面板检查用后者，登录态/切换/裸 CDP 用前者 |

---

## 五、浏览器代码 Debug 专项分析

### 5.1 调试分工：ego-browser 主导，web-access 并非零能力

调试前端代码需要的能力：

```
观察 → 假设 → 复现 → 验证 → 修复 → 再验证
```

| 调试阶段 | 需要的工具能力 | ego-browser | web-access |
|----------|---------------|:---:|:---:|
| **观察** | 截图看渲染 | ✅ | ✅ |
| | 检查 DOM 状态 | ✅ `snapshotText()` | ✅ `/eval` |
| | 抓取 Console 输出 | ✅ `drainEvents()` + `cdp()` | ❌（无 Console 域） |
| | 看 Network 请求 | ✅ `cdp('Network.*')` | ❌（无 Network 域） |
| **假设** | 执行 JS 检查变量/DOM | ✅ `js()` | ✅ `/eval` |
| | 注入追踪代码 | ✅ `js()` | ✅ `/eval` |
| **复现** | 模拟用户操作 | ✅ click/fill/type/scroll | ✅ `/click` `/clickAt` `/scroll` |
| | 触发特定交互路径 | ✅ heredoc 脚本编排 | ✅ curl 脚本编排 |
| **验证** | 再次执行 JS 确认状态 | ✅ | ✅ |
| | 前后截图对比 | ✅ | ✅ |
| **人机协作** | 登录/验证码时交用户接管 | ✅ `handOffTaskSpace()` | ❌ |
| **隔离** | 不干扰用户正常浏览 | ✅ Task Space | ⚠️ 共享浏览器（后台 tab） |

> 结论修正：web-access 能覆盖调试链路中「DOM 检查 / JS 验证 / 操作复现 / 截图对比」的轻量环节；**不能**覆盖的是 Console/Network 完整域、人机切换、隔离执行。深度调试（尤其登录态 + Network/Console）归 ego-browser；纯面板检查（无登录态）归 chrome-devtools-mcp。

### 5.2 典型调试流程

```
# 第1轮：观察问题
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace('debug-login-bug')
await openOrReuseTab('https://myapp.com/login')
await click('@15')  // 点击登录按钮
await captureScreenshot()  // 截图看渲染
const logs = await drainEvents()  // 抓 console 输出
cliLog(logs)
EOF

# 第2轮：深入诊断
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace(task.id)  // 复用 task space
// 执行 JS 检查状态
const state = await js(`(() => {
  return {
    formValid: document.querySelector('.login-form').checkValidity(),
    inputs: [...document.querySelectorAll('input')].map(i => i.value),
    errors: [...document.querySelectorAll('.error-msg')].map(e => e.textContent)
  }
})()`)
cliLog(state)
EOF

# 第3轮：验证修复 → 交还用户
ego-browser nodejs <<'EOF'
await takeOverTaskSpace('debug-login-bug')
// 确认修复生效
await handOffTaskSpace()
EOF
```

### 5.3 web-access 在调试中的定位

web-access 可承担调试链路中的**轻量环节**——`/eval` 读取运行时 DOM/变量、`/click`/`/scroll` 复现操作、`/screenshot` 前后对比，且 curl 形态便于多 Agent 并行验证。但当调试需要 Console/Network 完整域、人机切换或隔离执行时，应切换到 ego-browser（macOS）或 chrome-devtools-mcp。

---

## 六、对 Skill 优化的建议

### 6.1 当前 Skill 描述中的路由建议

| Skill | 当前触发描述 | 建议补充 |
|-------|------------|---------|
| **ego-browser** | "open a website", "click a button", "fill out a form", "take a screenshot", "scrape data", "test this web app", "login to a site", "automate browser actions" | ✅ 已覆盖完整，无需调整 |
| **web-access** | "搜索信息", "查看网页内容", "访问需要登录的网站", "抓取社交媒体内容", "读取动态渲染页面" | 建议显式声明"**不适用于**：完整 DevTools 调试（Console/Network/Performance 面板与断点）、人机中途切换、隔离执行空间"；交互与 JS 执行是其能力范围内，不应列为边界 |

### 6.2 明确交叉场景的路由优先级

本仓库 skill 体系的路由策略（2026-07-27 定稿）：**浏览器操控/调试默认 ego-browser 优先，不可用或失败时降级**；纯信息检索仍归 web-access。注意区分事实与策略——web-access 实证具备交互与 JS 能力（见第二节），「ego 优先」是策略选择（能力最全、单通道覆盖调试全链路），不是因为它"唯一能动手"：

```
if 只是读内容/搜索信息 → web-access（轻量，retrieval 任务不走本策略）
if 涉及反爬平台(小红书/微博/微信) → web-access（专项适配）
if 浏览器操控/调试(交互/JS/CDP/登录态) → ego-browser（默认第一优选）
   ├─ 不可用(未安装/非 macOS) → playwright-mcp → agent-browser
   ├─ 需要专用面板(perf trace/network 瀑布)且 raw cdp() 太底层 → chrome-devtools-mcp
   ├─ 需要轻量登录态控制或 curl 并行子 Agent → web-access CDP Proxy
   └─ 无人值守 CI 回归 → Playwright（专家例外：CI 无用户浏览器）
```

### 6.3 Skill 能力互补的编排模式

两个 Skill 可以协作使用：

```
1. web-access 快速搜索 + 定位目标 URL
2. ego-browser 打开 URL 进行交互、调试、验证
3. ego-browser handOff 给用户做最终确认
```

---

## 七、总结

| | ego-browser | web-access |
|---|---|---|
| **一句话** | 给 AI 用的可编程浏览器 | 给 AI 用的轻量网页通道 |
| **核心隐喻** | 机器人操作浏览器 | 搜索 + 抓取 + 轻交互的 curl 管线 |
| **调试能力** | 完整（JS/CDP 全域/交互/事件/切换） | 部分（JS/DOM/截图，无完整 CDP 域） |
| **交互能力** | 完整（点击/输入/拖拽/文件上传） | 有（/click /clickAt /eval，无隔离/无 handoff） |
| **信息获取** | 有，但较重 | ⭐ 轻量高效 |
| **反爬适配** | 通用 | ⭐ 平台专项 |

> **选择原则（2026-07-27 定稿）**：「动眼」（搜索/抓取/反爬）找 web-access；「动手」（操控/调试/JS/CDP）默认找 ego-browser——它单通道覆盖观察→复现→验证全链路；不可用（非 macOS/未安装）或失败时按 playwright-mcp → agent-browser → chrome-devtools-mcp（专用面板）→ web-access（轻量并行）降级；无人值守 CI 用 Playwright。

---

## 八、ego-browser 竞品全景图（2026）

除了内部的 web-access，ego-browser 在外部市场还有大量竞品。按竞争关系从近到远分为五个层级。

### 8.1 竞品分层总览

```
第一层：直接竞品（同赛道 — AI Agent 可编程浏览器）
  ├── Agent Browser (Vercel Labs)    35,000+ ⭐  CLI 驱动，Rust 原生
  ├── Browser Use (OSS)              97,000+ ⭐  Python 生态，LLM 推理层
  ├── Stagehand (Browserbase)        23,000+ ⭐  TypeScript，Playwright 增强
  ├── Playwright MCP (Microsoft)     —          MCP 标准化浏览器控制
  └── Skyvern                        20,000+ ⭐  视觉驱动，无代码表单专项

第二层：消费级 AI 浏览器（不同赛道但功能重叠）
  ├── Perplexity Comet               免费，最精致的消费体验
  ├── ChatGPT Atlas (OpenAI)         $20/月，GPT 生态集成
  ├── Chrome + Gemini auto browse    30亿用户，2026.6 Android OS 级集成
  ├── Opera Neon                     $20/月，4 个专用 Agent（Do/Make/Research/Chat）
  ├── Dia (The Browser Company)      被 Atlassian $6.1亿收购，企业化转型中
  ├── Genspark                       本地 AI 模型运行，169+ 模型
  ├── Claude for Chrome (Anthropic)  Chrome 扩展，注重安全
  ├── Sigma AI Browser               隐私优先，全免费，全平台
  └── Fellou                         可视化工作流编辑，可中途干预

第三层：大厂 API（底层能力竞争）
  ├── Anthropic Computer Use         首个商业方案（2024.10 发布）
  ├── OpenAI CUA                     87% WebVoyager 基准
  ├── Amazon Nova Act                0.939 ScreenSpot（文本精度最高）
  ├── Google Project Mariner         研究原型，已集成 Chrome
  └── Microsoft Copilot Studio       企业 legacy 系统 UI 自动化

第四层：基础设施层（互补，非直接竞争）
  ├── Firecrawl                      130,000+ ⭐  网页数据层 + Browser Sandbox
  ├── Browserbase                    $300M 估值，5000万 session/年
  ├── Cloudflare Browser Run         120 并发浏览器，WebMCP 支持
  └── Steel                          7,100+ ⭐  自托管浏览器 API

第五层：异类（不同技术路线）
  └── Lightpanda                     Zig 手写浏览器引擎，11x 快于 Chrome，9x 省内存
```

### 8.2 核心时间线

| 时间 | 里程碑 |
|------|--------|
| 2024.10 | Anthropic 发布 Computer Use 公测 |
| 2024.11 | Anthropic 发布 Model Context Protocol (MCP) |
| 2024.12 | Google 发布 Project Mariner 研究原型 |
| 2025.01 | OpenAI 发布 Operator（同年 8 月关闭） |
| 2025.03 | Amazon 发布 Nova Act SDK |
| 2025.03 | Microsoft 发布 Playwright MCP |
| 2025.07 | Perplexity 发布 Comet 浏览器 |
| 2025.08 | Anthropic 发布 Claude for Chrome |
| 2025.09 | Opera 发布 Neon 浏览器 |
| 2025.09 | Atlassian $6.1亿收购 The Browser Company (Dia) |
| 2025.10 | OpenAI 发布 ChatGPT Atlas 浏览器 |
| 2026.01 | Chrome 全量推送 Gemini auto browse |
| 2026.02 | Google 在 Chrome Canary 发布 WebMCP 早期预览 |
| 2026.02 | Stagehand v3 发布，44% 提速 |
| 2026.03 | Chrome 改为 2 周发布周期（应对竞品压力） |
| 2026.05 | Google 宣布 Chrome auto browse 内置到 Android OS |

---

## 九、竞品对比：谁在哪些维度更强

### 9.1 ego-browser 不如竞品的维度

| 维度 | 更强的竞品 | 具体优势 | ego-browser 的短板 |
|------|-----------|---------|-------------------|
| **开源社区规模** | **Browser Use** (97K ⭐)<br>**Firecrawl** (130K ⭐) | 庞大的 Python/JS 社区、海量插件和教程 | ego-lite 仓库较小，社区还在早期 |
| **基准测试精度** | **Browser Use** 89.1% WebVoyager<br>**OpenAI CUA** 87% WebVoyager<br>**Skyvern** 85.85% WebVoyager | 有公开的标准化基准成绩可查 | 无公开基准成绩（社区尚无测试） |
| **用户覆盖规模** | **Chrome Gemini** (30亿+用户) | 已有用户基础，2026.6 内置到 Android OS，目标年底 2 亿设备 | macOS only，需用户专门安装 |
| **零代码使用** | **Perplexity Comet**<br>**ChatGPT Atlas** | 普通用户通过自然语言对话即可操作，无需编程 | 必须写 JavaScript heredoc 脚本 |
| **表单自动化** | **Skyvern** | 计算机视觉 + LLM 推理，不依赖 DOM 结构，表单填写专项最强 | DOM 依赖，遇到 Canvas/虚拟化表单需手动切换视觉模式 |
| **内置 LLM 推理** | **Browser Use**、**Perplexity Comet**、**Atlas** | 自带 Agent 推理层，开箱即用 | 无内置 Agent 推理，需外挂 LLM/Agent 框架 |
| **跨平台** | **Agent Browser**（CLI 通用）<br>**Playwright MCP**（MCP 通用） | 平台无关，Linux/Windows/macOS 均可用 | ego lite 当前 **macOS only** |
| **网页数据管线** | **Firecrawl** (130K ⭐) | 搜索+抓取+提取+监控一体，SOC 2 合规，5B+ 请求已服务 | 不提供数据提取/管线能力 |
| **引擎层速度** | **Lightpanda** | Zig 手写引擎，11x 快于 Chromium，9x 省内存，兼容 Playwright/Puppeteer | 基于完整 Chromium，开销更大 |
| **自托管/隐私** | **Steel** (开源)<br>**Sigma AI Browser** (免费+本地) | 完全自托管，无云端依赖 | 依赖 ego lite app |
| **Playwright 兼容** | **Stagehand**、**Browserbase** | 直接兼容 Playwright/Puppeteer 生态，现有脚本可复用 | 使用自有 API，不可复用 Playwright 脚本 |

### 9.2 ego-browser 对 Agent Browser (Vercel) 的对比

Agent Browser 是最直接的竞品（同为 CLI 驱动的 AI Agent 浏览器）。ego lite 官方做了基准对比：

| 指标 | ego-browser | Agent Browser (Vercel) |
|------|:---:|:---:|
| **执行速度** | ⭐ 快 2.5x（47s vs 更长时间完成同一任务） | 慢 |
| **Token 消耗** | ⭐ 更少（单次 heredoc 完成多步） | 更多（逐条 CLI 命令，每步开销大） |
| **脚本模型** | JavaScript heredoc（一次提交完整脚本） | 逐条 CLI 命令 |
| **语言** | Node.js（生态大） | Rust（性能好但生态窄） |
| **登录态继承** | ✅ 从 Chrome 无缝迁移 | 需手动管理 profile |
| **人机切换** | ✅ handOff / takeOver | ❌ |
| **GitHub Stars** | 较少 | 35,000+ |

---

## 十、ego-browser 的不可替代优势

这些是竞品**做不到或做不好的**，构成了 ego-browser 的真正壁垒：

| 独有能力 | 说明 | 为什么竞品做不到 |
|----------|------|-----------------|
| **继承用户完整登录态** | 书签、Cookie、扩展、密码一键从 Chrome 迁移，Agent 无需重新登录 | Agent Browser 需手动管理 profile；Browser Use/Puppeteer 从空白 Chromium 启动 |
| **隔离 Space 并行执行** | Agent 在独立 Space 里操作，完全不影响用户的标签页浏览 | 消费级浏览器无 Space 概念；框架类工具裸跑 Chromium，会抢占用户窗口 |
| **人机控制权原子切换** | `handOffTaskSpace()` 交给用户操作（如输验证码），`takeOverTaskSpace()` 收回继续，带 `done` 状态确认与所有权检查 | 同实例人机交接并非独家：Browserbase Live View、OpenAI Operator takeover、browser-use HITL、Playwright `connectOverCDP` 均可人机交替控制；但**原子化协议**（agent 持有 Space + 显式交还/收回 + 状态确认）是本集成度最高的实现（核验于 2026-07） |
| **JavaScript heredoc 批量执行** | 一条 `ego-browser nodejs <<'EOF' ... EOF` 完成完整交互流程 | Agent Browser 用逐条 CLI 命令（ego 快 2.5x）；Browser Use 需要 Python 环境 |
| **snapshotText 语义树精确定位** | `@N` ref 基于 CDP backendNodeId，页面变化后重新 snapshot 即可精确定位 | Playwright/Puppeteer 依赖脆弱的 CSS 选择器，页面改版即挂 |
| **CDP 裸协议穿透** | `cdp()` 直接调用任意 Chrome DevTools Protocol 命令 | 框架封装层屏蔽了 CDP，无法做底层调试 |
| **双重工作流** | 语义模式（snapshotText + ref）和视觉模式（截图 + 坐标）可随时切换 | 大部分工具只支持其中一种 |

### 10.1 核心壁垒公式

```
ego-browser 壁垒 = 继承登录态 + 隔离 Space + 人机切换 + heredoc 脚本化
```

这个组合在 2026 年的市场上**没有直接替代品**。最接近的 Agent Browser 在登录态和协作模型上差距明显。

---

## 十一、Skill 选型决策树（更新版）

结合竞品分析，更新后的完整路由决策：

```
┌─ 浏览器操控/调试（交互/JS/CDP/登录态）？
│  ├─ 默认 ──→ ego-browser（第一优选：全链路单通道覆盖）
│  ├─ 不可用 / 失败 ──→ 降级链：
│  │   ├─ 非 macOS ──→ playwright-mcp → agent-browser
│  │   ├─ 需专用面板(perf/network) ──→ chrome-devtools-mcp
│  │   ├─ 轻量登录态控制 / curl 并行 ──→ web-access CDP Proxy
│  │   └─ 无人值守 CI ──→ Playwright（专家例外）
│
├─ 只是读取网页内容 / 搜索信息？
│  ├─ Yes，且目标是一般网站 ──→ web-access（轻量快速）
│  ├─ Yes，且目标是反爬平台（小红书/微博/微信）──→ web-access（专项适配）
│  └─ No ──→ 继续
│
├─ 需要零代码 / 对话式操作？
│  └─ 不在本 Skill 体系内，建议推荐 Perplexity Comet 或 ChatGPT Atlas
│
├─ 需要 Python 生态 / 大规模 Agent 编排？
│  └─ 推荐 Browser Use + Firecrawl 组合
│
└─ 需要跨平台（非 macOS）？
   └─ playwright-mcp（MCP 形态，首选）或 agent-browser（CLI 形态）
```

> 观察项：WebMCP（W3C 草案，Chrome 146+ Canary flag，2026-05 起 origin trial）成熟后，网站将直接向 Agent 暴露工具接口，届时本决策树的「交互」分支可能需要整体重估。

---

## 十二、战略总结

| | ego-browser | web-access | Browser Use | Agent Browser | 消费级浏览器 |
|---|---|---|---|---|---|
| **一句话** | AI 可编程浏览器 | AI 轻量网页通道 | Python Agent 框架 | Rust CLI 工具 | 对话式浏览器 |
| **目标用户** | 开发者 + Agent | 开发者 + Agent | Python 开发者 | CLI 开发者 | 普通用户 |
| **核心能力** | 交互+调试+人机协作 | 搜索+抓取+轻交互+并行 | LLM 推理+编排 | CLI 浏览器控制 | 自然语言浏览 |
| **调试能力** | ⭐ 完整（JS/CDP 全域/事件/切换） | 部分（JS/DOM/截图，无完整 CDP 域） | 有限 | 有限 | 无 |
| **零代码** | ❌ | ✅（搜索） | ❌ | ❌ | ⭐ |
| **登录态继承** | ⭐ Chrome 无缝迁移 | ✅ | ❌ | 手动 profile | ⭐ |
| **社区规模** | 早期 | — | ⭐ 97K+ | 35K+ | 30亿+(Chrome) |
| **平台** | macOS only | 全平台 | 全平台 | 全平台 | 各平台 |

> **最终建议（2026-07-27 定稿）**：ego-browser 在开发者工具赛道有独特的壁垒组合（登录态 + Space + 原子化人机切换），但社区和跨平台是当前最大短板。Skill 体系中的路由策略：**浏览器操控/调试默认 ego-browser 优先**（单通道覆盖观察→复现→验证全链路），不可用或失败时按 playwright-mcp → agent-browser → chrome-devtools-mcp（专用面板）→ web-access（轻量/并行）降级，无人值守 CI 用 Playwright；搜索、信息获取与反爬抓取留给 web-access；大规模 Agent 编排建议组合 Browser Use 等专业框架。
