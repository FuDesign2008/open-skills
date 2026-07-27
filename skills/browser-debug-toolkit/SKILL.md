---
name: browser-debug-toolkit
version: "1.2.0"
user-invocable: true
description: "Browser runtime debugging toolkit — prioritize browser DevTools and CDP tools for runtime inspection and control when debugging UI/CSS/DOM layout, frontend interaction, and rendering issues. Three channels picked by signal: chrome-devtools-mcp (DevTools panels: computed style, network, perf trace), web-access CDP Proxy (lightweight control + login state, curl-scriptable; runtime-checked), ego-browser (macOS, runtime-checked: human-AI handoff, isolated task space, a11y-ref targeting, raw CDP + login state; non-macOS fallback playwright-mcp / agent-browser). Triggers: 「浏览器调试」「UI 调试」「DOM 检查」「CSS 调试」「页面布局问题」「前端运行时调试」「chrome devtools」「CDP 调试」「登录态调试」 / browser debug, devtools, dom inspect, css debug, runtime debugging, login-state debug."
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

| Problem Scene | Primary Tool | Secondary Tool | CDP Proxy (web-access) | Key Capability |
|--------------|-------------|---------------|------------------------|----------------|
| DOM structure anomaly (missing/wrong elements) | chrome-devtools-mcp / DevTools Elements | playwright screenshot | login-state repro: `/eval` read DOM | Live DOM tree, element selection, attribute inspection |
| CSS not applying / specificity conflict | DevTools Elements → Styles | — | login-state repro: `/eval` getComputedStyle | Computed styles, override chain, box model |
| Layout shift / box model anomaly | DevTools Elements → Computed/Layout | — | login-state repro: `/eval` getBoundingClientRect | Box model visualization, flex/grid guides |
| Interaction anomaly (click not responding) | DevTools Console + Event Listeners | playwright click + screenshot | login-state repro + real gesture: `/click` `/clickAt` | Event listener inspection, JS runtime errors |
| Login wall / captcha interrupts the debug flow | ego-browser: `handOffTaskSpace` → user acts → `takeOverTaskSpace` | — | — | Atomic human-AI handoff mid-debug; agent and user share one browser without fighting for control |
| Selector-fragile UI (Canvas / virtualized list / frequently re-skinned page) | ego-browser: `snapshotText()` @N refs | playwright-mcp a11y snapshot | — | a11y-tree refs survive CSS/markup churn; re-snapshot after mutation |
| Login state + full CDP domains needed together (e.g. network waterfall behind login) | ego-browser: `cdp('Network.*')` in logged-in space | — | `/eval` reads only; no full domains | Raw CDP passthrough with inherited login state |
| Render performance (jank/frame drops) | DevTools Performance panel | `frontend-perf` skill | — | Flame chart, Long Tasks, render stats |
| Visual regression (style overwritten) | `visual-qa` skill | playwright screenshot | before/after `/screenshot` diff | Screenshot diff, design review |
| Async loading / network issues | DevTools Network panel | — | — | Request/response, waterfall, status codes |
| State management anomaly (React/Vue) | React/Vue DevTools | — | — | Component tree, props/state, time travel |

> The CDP Proxy column points to the external **`web-access`** skill — a runtime-local dependency (this skill does **not** declare it in frontmatter `dependencies`, so upstream workflows like solve-workflow stay free of any external-plugin requirement): verify `web-access` is available when you take this channel; if missing, abort and tell the user how to install it (no silent fallback). The **ego-browser** rows follow the same pattern: ego-browser is an external, macOS-only skill — runtime-check it; if absent (or non-macOS), degrade to playwright-mcp (MCP, a11y-tree snapshots), then agent-browser (CLI), then the remaining channels. See the comparison below for when to pick each channel.

## Tool Usage Guides

### chrome-devtools-mcp (MCP Server)

> Type: MCP server (Chrome DevTools Protocol) / Availability: Environment-dependent (see Prerequisites)

**When to use**: Real-time inspection of page DOM, CSS, network, and console — AI operates DevTools directly without manual context switching.

**Core capabilities**: DOM inspection (querySelector, computed styles, element attributes), CSS debugging (matched rules, override chain, box model), Console (execute JS, read output), Network (request/response inspection), Screenshot (page or element capture).

**Usage pattern**: When MCP is available, connect to the browser in the workflow's analysis stage → reproduce the problem and inspect runtime state (DOM structure, computed styles, console, network) → compare expected vs actual to anchor root cause; in the verification stage, validate that the fix works.

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

## Three channels, three postures — choose by signal

Pick the channel by what the debug session **needs**, not by habit. The three overlap in basic interaction (click / fill / evaluate / screenshot) but differ sharply in posture:

| Aspect | chrome-devtools-mcp | web-access CDP Proxy | ego-browser (macOS) |
|--------|---------------------|----------------------|---------------------|
| Posture | **Inspect** (DevTools panels: Elements / Network / Performance) | **Lightweight control + verify** (operate the page, capture state) | **Full control + raw CDP + human-AI handoff** |
| Login state | Fresh session by default; can attach to an existing Chrome | Connects to user's daily browser — **login state native** | Inherited from user's browser — **login state native** |
| Element targeting | CSS / text queries | CSS via `/eval` | `snapshotText()` a11y refs (`@N`) + CSS + xpath + coordinates |
| Full CDP domains (Network/Performance/Console) | ✅ via panels | ❌ (proxy subset: eval/click/scroll/screenshot) | ✅ `cdp()` raw passthrough |
| Human-AI handoff mid-debug | ❌ | ❌ | ✅ `handOffTaskSpace` / `takeOverTaskSpace` |
| Browser isolation | Separate fresh instance | Shares user's browser (background tabs, parallel-safe) | Isolated Task Space — never disturbs user's tabs |
| Scripting posture | MCP tools (interactive) | curl HTTP API (batch, parallel agents) | heredoc JS batch (multi-step in one round) |
| Platform | Cross-platform (Chrome-family) | Cross-platform | **macOS only** |

**Decision signals:**

- Need computed styles / box model / network waterfall / perf flame chart → **chrome-devtools-mcp** (its panels are the strongest CDP-debugging surface; also the right tool for performance work — pair with `frontend-perf`).
- Need login state + lightweight operate-to-reproduce (click/fill/eval/screenshot), curl-scriptable or parallel sub-agents → **web-access CDP Proxy**.
- Need human-AI handoff (login wall / captcha / payment mid-debug), isolated task space, selector-fragile pages (a11y refs), or login state **and** full CDP domains at once → **ego-browser**.
- **Tie-breaker** (unchanged): when a bug needs *both* panel inspection *and* login state, login state is the harder constraint — take a login-state channel (web-access for lightweight needs, ego-browser when you also need raw CDP or handoff).

**Degradation chain for the ego-browser row**: ego-browser is macOS-only and external (runtime-checked, same weak-reference pattern as web-access). If unavailable → playwright-mcp (MCP form, a11y-tree snapshots — closest capability match) → agent-browser (CLI form) → fall back to the other two channels. Never silently fall back — tell the user which channel you are on.

For the web-access curl API cheat sheet, the ego-browser heredoc recipes, and debugging recipes per channel, see [reference.md](reference.md).

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

Tool selection priority (decide by signal — full table in "Three channels" section):
1. Full DevTools panels (computed style / box model / network / perf trace) → chrome-devtools-mcp
2. Login state + lightweight control (click/fill/eval/screenshot), curl-batch or parallel agents → web-access CDP Proxy
3. Human-AI handoff / isolated task space / a11y-ref targeting / login state + raw CDP → ego-browser (macOS, runtime-checked)
   → ego-browser absent or non-macOS → playwright-mcp → agent-browser → remaining channels
4. Automated batch verification / E2E → playwright / webapp-testing
5. Visual comparison / design review → visual-qa
6. No browser tooling available → guide user to manual DevTools

MCP prerequisite check:
→ MCP missing? Present adaptive choice: A=auto-install / B=manual / C=skip
→ See Prerequisites section for platform-specific commands
```
