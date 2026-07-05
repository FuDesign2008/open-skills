---
name: browser-debug-toolkit
version: "1.0.0"
user-invocable: true
description: "浏览器运行时调试工具箱——在调试 UI/CSS/DOM 布局、前端交互、渲染性能等问题时，引导优先使用浏览器 DevTools、CDP 协议工具（chrome-devtools-connect）、Playwright 等运行时分析手段，而非仅依赖静态代码分析。触发词：「浏览器调试」「UI 调试」「DOM 检查」「CSS 调试」「页面布局问题」「前端运行时调试」「chrome devtools」「CDP 调试」 / browser debug, devtools, dom inspect, css debug, runtime debugging"
---

# 浏览器运行时调试工具箱（browser-debug-toolkit）

## Overview

UI/CSS/DOM 布局问题的根因往往在运行时才显现——DOM 结构动态生成、CSS 优先级冲突、布局计算异常。静态代码分析（Read/Grep）和打点调试（console.log）有边界：无法观测渲染后的 DOM 树、计算后的 CSS 属性、布局盒模型。

本 skill 提供「场景 → 工具」决策表和各工具的使用引导，作为 `solve-workflow`、`debug-workflow` 等工作流 skill 的增强能力。被这些工作流的环境能力探索机制发现后，在 UI 调试场景自动引导调用。

## 场景 → 工具决策表

| 问题场景 | 首选工具 | 次选工具 | 关键能力 |
|---------|---------|---------|---------|
| DOM 结构异常（元素缺失/层级错误） | chrome-devtools-connect / DevTools Elements | playwright screenshot | 实时 DOM 树浏览、元素选中、属性检查 |
| CSS 样式不生效 / 优先级冲突 | DevTools Elements → Styles | — | 计算后样式、覆盖链、盒模型 |
| 布局偏移 / 盒模型异常 | DevTools Elements → Computed/Layout | — | 盒模型可视化、flex/grid 网格线 |
| 交互行为异常（点击无响应等） | DevTools Console + Event Listeners | playwright click + screenshot | 事件监听器检查、JS 运行时错误 |
| 渲染性能（卡顿/掉帧） | DevTools Performance 面板 | `frontend-perf` skill | 火焰图、Long Tasks、渲染统计 |
| 视觉回归（样式被覆盖） | `visual-qa` skill | playwright screenshot | 截图对比、设计审查 |
| 异步加载 / 网络问题 | DevTools Network 面板 | — | 请求/响应、瀑布图、状态码 |
| 状态管理异常（React/Vue） | React/Vue DevTools | — | 组件树、props/state、时间旅行 |

## 工具使用引导

### chrome-devtools-connect（MCP 工具）

> 类型：MCP server（通过 CDP 协议连接浏览器） / 可用性：环境相关（需配置 MCP server）

**何时使用**：需要实时检查页面 DOM、CSS、网络、控制台——AI 可直接操作 DevTools，无需人工切换。

**核心能力**：DOM 检查（querySelector、计算样式、元素属性）、CSS 调试（匹配规则、覆盖链、盒模型）、Console（执行 JS、读取输出）、Network（请求/响应检查）、Screenshot（页面或元素截图）。

**使用模式**：探索到 MCP 可用时，在工作流的阶段 1.2（技术分析）中连接浏览器 → 检查目标元素的 DOM 结构和计算样式 → 对比预期 vs 实际锚定根因；在阶段 6（检查验证）中验证修复后的效果。

> ⚠️ MCP 工具是环境能力——不一定所有环境都有。探索到时优先使用，未探索到时降级为引导用户手动打开浏览器 DevTools。

### playwright / webapp-testing（skill）

> 类型：skill（浏览器自动化） / 可用性：OpenCode 内置 playwright；user skill webapp-testing

**何时使用**：需要自动化复现交互（点击、输入、导航）、截图对比、端到端验证。

**与 chrome-devtools-connect 的区别**：playwright 偏向**自动化操作**（脚本驱动、批量验证）；chrome-devtools-connect 偏向**实时检查**（交互式调试、即时反馈）。

### visual-qa（skill）

> 类型：skill（视觉质量保证） / 可用性：shared/opencode skill

**何时使用**：需要截图对比、设计审查、视觉回归验证。特别适合「修复前后对比」场景。

### 框架 DevTools（浏览器扩展）

| 框架 | DevTools | 核心能力 |
|------|---------|---------|
| React | React DevTools | 组件树、props/state、Profiler 时间轴 |
| Vue | Vue DevTools | 组件树、Vuex/Pinia 状态、路由 |
| Angular | Angular DevTools | 组件树、变更检测、Signal 依赖图 |

> 框架 DevTools 是浏览器扩展，AI 无法直接操作。引导用户安装并手动检查。

## 与工作流 skill 的协作

本 skill 被 `solve-workflow`、`debug-workflow` 等工作流的「环境能力探索」机制发现后：

1. **阶段 1.2（技术分析）**：UI/CSS/DOM 问题 → 优先引导使用浏览器工具检查运行时状态
2. **打点调试前置**：UI 问题时，先用浏览器 DevTools 检查（比 console.log 打点更高效），仍无法定位再打点
3. **阶段 6（检查验证）**：修复后用浏览器工具验证渲染结果

> 渐进增强原则：本 skill 不替代工作流的核心流程。探索到浏览器工具时引导使用，未探索到时按原有流程执行。

## 快速参考

```
场景判断：这个问题是 UI/CSS/DOM 相关吗？
关键词信号：样式、布局、渲染、显示、可见性、位置、尺寸、颜色、动画
→ 是 → 优先使用浏览器工具（本 skill 决策表引导）
→ 否 → 按原有静态分析/打点调试流程

工具选择优先级：
1. chrome-devtools-connect（MCP 可用时）—— 实时检查，AI 直接操作
2. playwright / webapp-testing —— 自动化操作，截图验证
3. visual-qa —— 视觉对比，设计审查
4. 引导用户手动打开 DevTools —— MCP 不可用时的降级方案
```
