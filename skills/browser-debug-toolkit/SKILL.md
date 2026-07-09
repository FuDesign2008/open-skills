---
name: browser-debug-toolkit
version: "1.1.0"
user-invocable: true
description: "Browser runtime debugging toolkit — guides AI to prioritize browser DevTools, CDP-based MCP tools (chrome-devtools-mcp), and Playwright for runtime inspection when debugging UI/CSS/DOM layout, frontend interaction, and rendering issues, rather than relying solely on static code analysis. Triggers: 「浏览器调试」「UI 调试」「DOM 检查」「CSS 调试」「页面布局问题」「前端运行时调试」「chrome devtools」「CDP 调试」 / browser debug, devtools, dom inspect, css debug, runtime debugging"
---

# Browser Runtime Debugging Toolkit

## Overview

UI/CSS/DOM layout issues often have root causes that only manifest at runtime — dynamically generated DOM structures, CSS specificity conflicts, layout calculation anomalies. Static code analysis (Read/Grep) and console-based debugging (console.log) have a fundamental limitation: they cannot observe the rendered DOM tree, computed CSS properties, or box model geometry.

This skill provides a scene-to-tool decision table and usage guides for each tool. It serves as an enhancement capability for workflow skills like `solve-workflow` and `debug-workflow` — invoked automatically through their environment capability discovery mechanism when UI debugging scenarios are detected.

## Prerequisites

### Step 1: Check MCP Availability

Before using browser debugging tools, check if `chrome-devtools-mcp` (sometimes called chrome-devtools-connect) is available:

| Platform | Check Method |
|----------|-------------|
| Claude Code | Run `claude mcp list` and look for "chrome-devtools" |
| OpenCode | Check available tools, or `cat ~/.config/opencode/opencode.json` |
| Cursor | Settings → MCP → view server list |

### Step 2: If MCP Is Missing — Adaptive Choice

When chrome-devtools-mcp is not available, present the user with three options:

**Option A: Auto-install (Recommended)**

The AI runs the installation command directly for the detected platform:

| Platform | Install Command |
|----------|----------------|
| Claude Code | `claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest` |
| OpenCode | Add MCP config to `~/.config/opencode/opencode.json` |
| Cursor | Use "Install in Cursor" button from [official README](https://github.com/ChromeDevTools/chrome-devtools-mcp), or manually add to MCP settings |

After installation, restart the AI tool to load the MCP server.

**Option B: Manual Install**

Provide the exact commands (same as Option A) for the user to copy-paste and run themselves. Wait for user confirmation before proceeding.

**Option C: Skip — Use Manual DevTools**

Fallback: guide the user to open browser DevTools manually (F12) and inspect elements by hand. Slower than MCP but requires no setup.

### Step 3: Environment Prerequisites

- **Node.js LTS** + npm (required by chrome-devtools-mcp)
- **Chrome browser** (stable version; Google Chrome or Chrome for Testing)

### Step 4: Verify Installation

After install/enable, verify the MCP is loaded:

| Platform | Verification |
|----------|-------------|
| Claude Code | `claude mcp list` shows chrome-devtools |
| OpenCode | Config file contains chrome-devtools entry |
| Cursor | Settings → MCP shows server with green status |

## Scene → Tool Decision Table

| Problem Scene | Primary Tool | Secondary Tool | Key Capability |
|--------------|-------------|---------------|----------------|
| DOM structure anomaly (missing/wrong elements) | chrome-devtools-mcp / DevTools Elements | playwright screenshot | Live DOM tree, element selection, attribute inspection |
| CSS not applying / specificity conflict | DevTools Elements → Styles | — | Computed styles, override chain, box model |
| Layout shift / box model anomaly | DevTools Elements → Computed/Layout | — | Box model visualization, flex/grid guides |
| Interaction anomaly (click not responding) | DevTools Console + Event Listeners | playwright click + screenshot | Event listener inspection, JS runtime errors |
| Render performance (jank/frame drops) | DevTools Performance panel | `frontend-perf` skill | Flame chart, Long Tasks, render stats |
| Visual regression (style overwritten) | `visual-qa` skill | playwright screenshot | Screenshot diff, design review |
| Async loading / network issues | DevTools Network panel | — | Request/response, waterfall, status codes |
| State management anomaly (React/Vue) | React/Vue DevTools | — | Component tree, props/state, time travel |

## Tool Usage Guides

### chrome-devtools-mcp (MCP Server)

> Type: MCP server (Chrome DevTools Protocol) / Availability: Environment-dependent (see Prerequisites)

**When to use**: Real-time inspection of page DOM, CSS, network, and console — AI operates DevTools directly without manual context switching.

**Core capabilities**: DOM inspection (querySelector, computed styles, element attributes), CSS debugging (matched rules, override chain, box model), Console (execute JS, read output), Network (request/response inspection), Screenshot (page or element capture).

**Usage pattern**: When MCP is available, connect to the browser in workflow stage 1.2 (technical analysis) → inspect target element's DOM structure and computed styles → compare expected vs actual to anchor root cause; in stage 6 (verification) validate the fix result.

> Note: If MCP is not installed, see the Prerequisites section above for adaptive setup options (auto-install / manual / skip).

### playwright / webapp-testing (Skill)

> Type: Skill (browser automation) / Availability: OpenCode built-in playwright; user skill webapp-testing

**When to use**: Automated interaction reproduction (click, type, navigate), screenshot comparison, end-to-end verification.

**Difference from chrome-devtools-mcp**: Playwright focuses on **automated operations** (script-driven, batch verification); chrome-devtools-mcp focuses on **real-time inspection** (interactive debugging, instant feedback).

### visual-qa (Skill)

> Type: Skill (visual quality assurance) / Availability: shared/opencode skill

**When to use**: Screenshot comparison, design review, visual regression verification. Especially suited for before/after fix comparison scenarios.

### Framework DevTools (Browser Extensions)

| Framework | DevTools | Core Capability |
|-----------|---------|----------------|
| React | React DevTools | Component tree, props/state, Profiler timeline |
| Vue | Vue DevTools | Component tree, Vuex/Pinia state, routing |
| Angular | Angular DevTools | Component tree, change detection, Signal dependency graph |

> Framework DevTools are browser extensions that AI cannot operate directly. Guide the user to install and inspect manually.

## Workflow Integration

This skill is discovered by the environment capability exploration mechanism of `solve-workflow`, `debug-workflow`, and similar workflow skills. It is also delegated to by `hybrid-debug` for runtime evidence in hybrid app (WebView/WKWebView/Electron + H5) debugging scenarios:

1. **Stage 1.2 (Technical Analysis)**: UI/CSS/DOM issues → prioritize browser tools for runtime state inspection
2. **Before console.log debugging**: For UI issues, inspect with browser DevTools first (more efficient than console.log), then fall back to logging if still unresolved
3. **Stage 6 (Verification)**: After fix, use browser tools to verify render results

> Progressive enhancement: This skill does not replace the workflow's core process. When browser tools are available, it guides their use; when unavailable, the original process executes unchanged.

## Quick Reference

```
Scene detection: Is this a UI/CSS/DOM issue?
Signal keywords: style, layout, render, display, visibility, position, size, color, animation
→ Yes → Prioritize browser tools (this skill's decision table guides selection)
→ No → Follow original static analysis / console.log debugging process

Tool selection priority:
1. chrome-devtools-mcp (when MCP available) — real-time inspection, AI-operated
2. playwright / webapp-testing — automated operations, screenshot verification
3. visual-qa — visual comparison, design review
4. Guide user to manually open DevTools — fallback when MCP unavailable

MCP prerequisite check:
→ MCP missing? Present adaptive choice: A=auto-install / B=manual / C=skip
→ See Prerequisites section for platform-specific commands
```
