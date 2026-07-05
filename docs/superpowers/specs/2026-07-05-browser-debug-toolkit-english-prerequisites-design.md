# browser-debug-toolkit English Rewrite + MCP Prerequisites

> **Date**: 2026-07-05
> **Skill**: `browser-debug-toolkit`
> **Version**: 1.0.0 → 1.1.0
> **Status**: Design approved, implementing

## Problem

1. SKILL.md body is in Chinese — violates AGENTS.md 铁律 3 (new skills must use English body)
2. MCP handling is passive degradation — user wants active prerequisite handling (install/enable if missing)
3. Skill references "chrome-devtools-connect" but the actual npm package is `chrome-devtools-mcp`

## Solution

### 1. English Rewrite

All body sections → English. Description frontmatter retains Chinese triggers per 铁律 3.

### 2. New Prerequisites Section (after Overview)

Adaptive MCP setup flow:
- **Step 1**: Check availability (platform-specific commands)
- **Step 2**: If missing — present 3 options:
  - A: Auto-install (AI runs platform-specific install command)
  - B: Manual install (AI provides commands for user)
  - C: Skip (fallback to manual DevTools)
- **Step 3**: Environment prerequisites (Node.js, Chrome)
- **Step 4**: Verify installation

### 3. Package Name Correction

`chrome-devtools-connect` → `chrome-devtools-mcp` throughout. Note the alias for discoverability.

## Platform Install Commands (from librarian research)

| Platform | Command |
|----------|---------|
| Claude Code | `claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest` |
| OpenCode | Add to `~/.config/opencode/opencode.json` mcp config |
| Cursor | Settings → MCP → add config, or use "Install in Cursor" button from official README |

## Verification

- `claude mcp list` shows chrome-devtools (Claude Code)
- Config file contains chrome-devtools entry (OpenCode)
- Settings → MCP shows green status (Cursor)

## Scope

- Single skill file rewrite (`skills/browser-debug-toolkit/SKILL.md`)
- No other files affected (the solve-workflow探索表 changes from PR #194 are separate)
- Version bump: 1.0.0 → 1.1.0
