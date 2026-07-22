---
name: browser-debug-toolkit
version: "1.2.0"
user-invocable: true
dependencies:
  - browser-access
description: "Browser runtime debugging toolkit — guides AI to prioritize browser DevTools and CDP-based tools for runtime inspection and control when debugging UI/CSS/DOM layout, frontend interaction, and rendering issues. Two CDP channels: chrome-devtools-mcp (inspection, DevTools panels) and browser-access CDP Proxy (control + verify, carries login state, curl-scriptable). Also covers Playwright. Triggers: 「浏览器调试」「UI 调试」「DOM 检查」「CSS 调试」「页面布局问题」「前端运行时调试」「chrome devtools」「CDP 调试」「登录态调试」 / browser debug, devtools, dom inspect, css debug, runtime debugging, login-state debug. For *operating* the browser to reach/scrape content (not debugging rendering), use browser-access instead."
---

# Browser Runtime Debugging Toolkit

## Overview

UI/CSS/DOM layout issues often have root causes that only manifest at runtime — dynamically generated DOM structures, CSS specificity conflicts, layout calculation anomalies. Static code analysis (Read/Grep) and console-based debugging (console.log) have a fundamental limitation: they cannot observe the rendered DOM tree, computed CSS properties, or box model geometry.

This skill provides a scene-to-tool decision table and usage guides for each tool. It is strongly depended on by `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` via frontmatter `dependencies` (invoked after a prerequisite check when browser-reproducible scenarios are detected).

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

**Usage pattern**: When MCP is available, connect to the browser in the workflow's analysis stage → reproduce the problem and inspect runtime state (DOM structure, computed styles, console, network) → compare expected vs actual to anchor root cause; in the verification stage, validate that the fix works.

> Note: If MCP is not installed, see the Prerequisites section above for adaptive setup options (auto-install / manual / skip).

### browser-access / CDP Proxy (Skill, strongly depended-on)

> Type: Skill (CDP over HTTP) / Availability: guaranteed by frontmatter `dependencies` (open-skills internal skill, ships with the repo)

**When to use**: debugging that needs **control + verify** rather than passive inspection — reproducing an issue by *operating* the page (click, type, scroll, navigate), capturing before/after runtime state, especially under **login state** or on **dynamic / anti-scraping** pages where a fresh chrome-devtools-mcp session has no cookies and gets blocked.

**Core capabilities** (HTTP API on `http://localhost:3456`): `/new` `/eval` (read/write DOM, run JS) `/click` `/clickAt` (real mouse gesture) `/setFiles` `/scroll` `/screenshot` `/navigate` `/close`. Connects to the user's daily browser → login state carried natively.

**Usage pattern**: `node ${CLAUDE_SKILL_DIR}/scripts/check-deps.mjs` (preflight) → `/new` open the page → `/eval` inspect DOM / `/screenshot` capture state → reproduce by `/click` `/scroll` → fix → re-capture for before/after diff → `/close`. Full API cheat sheet + debugging recipes in [reference.md](reference.md).

**Difference from chrome-devtools-mcp**: see the comparison section below.

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

## CDP Proxy (browser-access) vs chrome-devtools-mcp

Both speak CDP, but serve different debugging postures:

| Aspect | chrome-devtools-mcp | browser-access CDP Proxy |
|--------|---------------------|--------------------------|
| Posture | **Inspect** (DevTools panels: Elements / Network / Performance) | **Control + verify** (operate the page, capture state) |
| Login state | Fresh session — no user cookies by default | Connects to user's daily browser — **login state native** |
| Operation API | MCP tools (panel-aligned) | curl HTTP API (scriptable, batch-friendly) |
| Real user gesture | Limited | `/clickAt` (CDP Input.dispatchMouseEvent), `/setFiles` |
| Best for | Computed styles / box model / network waterfall / perf flame chart | Login-gated / dynamic / anti-scrape repro, before/after screenshot diff, scripted batch repro |

**Choose CDP Proxy when**:
- The bug only reproduces under login state (auth pages, paywalls, SSO backends)
- You need to *operate* the page to reproduce (multi-step interaction), then screenshot-compare before/after the fix
- chrome-devtools-mcp is unavailable, or you need curl-scriptable batch operations
- The page is dynamic / anti-scraping and a fresh session gets blocked

**Choose chrome-devtools-mcp when**:
- Pure inspection: computed styles, box model, network waterfall, performance timeline
- No login state needed

They are **complementary**, not replacements — pick by posture (inspect vs control) and login requirement.

**Tie-breaker**: when a bug needs *both* inspection (computed style / box model) **and** login state, prefer the CDP Proxy — login state is the harder constraint, and chrome-devtools-mcp's fresh session simply cannot reach the content.

## Workflow Integration

This skill is strongly depended on by `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` via frontmatter `dependencies` (each runs a prerequisite check at startup; if missing, it aborts). It is also discovered by `debug-workflow` and similar workflow skills through their environment capability exploration. It is delegated to by `hybrid-debug` for runtime evidence in hybrid app (WebView/WKWebView/Electron + H5) debugging scenarios, and by `runtime-evidence-debug` for UI/CSS/DOM instrumentation in general debugging scenarios:

1. **Analysis stage**: Browser-reproducible problems (UI/CSS/DOM as typical scenes) → prioritize browser tools to reproduce the problem and inspect runtime state
2. **Before console.log debugging**: For UI issues, inspect with browser DevTools first (more efficient than console.log), then fall back to logging if still unresolved
3. **Verification stage**: After fix, use browser tools to verify that the fix works (before/after runtime-state comparison)

> Progressive enhancement: This skill does not replace the workflow's core process. In `solve-workflow` it is guaranteed available by the prerequisite check; in other workflows (e.g., `debug-workflow`), when browser tools are unavailable, the original process executes unchanged.

## Quick Reference

```
Scene detection: Can this problem be reproduced in a browser? (UI/CSS/DOM issues are the typical scenes)
Signal keywords: style, layout, render, display, visibility, position, size, color, animation
→ Yes → Prioritize browser tools to reproduce and inspect (this skill's decision table guides selection)
→ No → Follow original static analysis / console.log debugging process

Tool selection priority:
1. chrome-devtools-mcp (when MCP available) — real-time inspection, AI-operated
2. browser-access CDP Proxy — control + verify, login state, curl-scriptable (login-gated / dynamic / anti-scrape repro)
3. playwright / webapp-testing — automated operations, screenshot verification
4. visual-qa — visual comparison, design review
5. Guide user to manually open DevTools — fallback when MCP unavailable

MCP prerequisite check:
→ MCP missing? Present adaptive choice: A=auto-install / B=manual / C=skip
→ See Prerequisites section for platform-specific commands
```
