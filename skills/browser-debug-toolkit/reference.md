# browser-debug-toolkit — Reference

The main [SKILL.md](SKILL.md) is the lean decision document (default channel: **ego-browser**; degradation chain + comparison table). Read this when you've picked a channel and need the concrete API cheat sheets and debugging recipes:

- **ego-browser (default)** → "ego-browser channel — minimal heredoc recipes"
- **chrome-devtools-mcp** (panel fallback / perf specialist) → "chrome-devtools-mcp deepening — perf & network"
- **web-access CDP Proxy** (lightweight / parallel fallback) → sections below (curl API + recipes 1–5)

## web-access CDP Proxy — preflight + API cheat sheet

The CDP Proxy lives in the external **`web-access`** skill. It speaks HTTP on `http://localhost:3456` and connects to the user's daily browser — so it carries login state natively, the main reason to reach for it over chrome-devtools-mcp during debugging.

> `web-access` is an external skill (plugin), not a frontmatter dependency of this skill. Verify it is available before taking this channel; if missing, abort and tell the user how to install it (no silent fallback).

## Preflight + API cheat sheet

Follow the `web-access` skill's preflight (`check-deps.mjs`), then use `ID` = target id from `/new` or `/targets`:

```bash
curl -s -X POST --data-raw 'https://app.example.com/dashboard' http://localhost:3456/new
# inspect DOM / run JS — the workhorse
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'document.title'
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'getComputedStyle(document.querySelector(".btn")).color'
# capture rendered state
curl -s "http://localhost:3456/screenshot?target=ID&file=/tmp/before.png"
# interact to reproduce
curl -s -X POST "http://localhost:3456/click?target=ID" -d 'button.submit'
curl -s -X POST "http://localhost:3456/clickAt?target=ID" -d 'button.upload'   # real mouse gesture
curl -s "http://localhost:3456/scroll?target=ID&direction=bottom"
# after-state + close
curl -s "http://localhost:3456/screenshot?target=ID&file=/tmp/after.png"
curl -s "http://localhost:3456/close?target=ID"
```

For multi-line / quoted JS payloads use `--data-binary @file` (see the `web-access` skill's CDP reference).

## Debugging recipes

### Recipe 1 — Login-gated UI bug
The bug only shows when logged in → chrome-devtools-mcp's fresh session can't reproduce → the CDP Proxy connects to the logged-in browser → `/eval` inspect → `/screenshot before` → `/click` trigger → `/screenshot after` → diff.

### Recipe 2 — Dynamic / anti-scraping page
Static curl returns a JS shell → `/eval` reads the DOM after client-side render → `/scroll` triggers lazy load first. `/eval` recurses through Shadow DOM / iframes — boundaries CSS selectors can't cross, JS can.

### Recipe 3 — Click not responding
`/click` (JS `el.click()`) first; if the handler doesn't fire, `/clickAt` (real CDP mouse gesture — required for file dialogs, shadow-DOM-attached listeners, user-activation-gated APIs).

### Recipe 4 — CSS layout / stacking-context diagnosis
"z-index not working" usually means the element (or an ancestor) lacks `position` ≠ `static`, or an ancestor creates a new stacking context (`transform` / `opacity<1` / `isolation:isolate` / `will-change`). One `/eval` walks the ancestor chain dumping `position` / `zIndex` / `transform` / `opacity` / `isolation` per level — the trapping layer is the root cause. Then `/screenshot` for pixel evidence → fix → re-run the same `/eval` + screenshot diff.

### Recipe 5 — Before/after fix verification
Capture anomalous runtime state (`/eval` + `/screenshot`) → apply fix → re-capture at the same point → diff. Runtime evidence is stronger than reading the fixed code.

## When NOT to use the CDP Proxy

- Pure CSS / computed-style / box-model inspection with no login need → chrome-devtools-mcp is more direct.
- Performance flame chart / network waterfall → chrome-devtools-mcp panels.
- Human-AI handoff, task-space isolation, or a11y-ref targeting → ego-browser (see below).
- The bug is statically obvious from code → Read / Grep first; don't spin up a browser.

## ego-browser channel — minimal heredoc recipes

ego-browser (external skill, **macOS only**) drives a real Chromium through `ego-browser nodejs <<'EOF' ... EOF` heredocs with preloaded helpers. Same weak-reference rule as web-access: runtime-check availability first; if missing, degrade per SKILL.md's chain (playwright-mcp → agent-browser → other channels) and tell the user. The Node.js runtime exits after each heredoc and keeps no state — start each round with `useOrCreateTaskSpace(nameOrId)` to reuse the same space and tabs. Full API surface lives in the ego-browser skill's own docs; below are the three debugging patterns that justify this channel.

### Recipe A — Reproduce + inspect in an isolated space

```bash
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace('debug-login-bug')   // reuse across rounds
await openOrReuseTab('https://app.example.com/dashboard')
const snap = await snapshotText()          // a11y tree with [ref=N] tags
cliLog(snap)
await click('@15')                          // ref-based, survives CSS churn
await captureScreenshot()
cliLog(await drainEvents())                 // async event queue: navigation, network
EOF
```

### Recipe B — Human-AI handoff (login wall / captcha mid-debug)

```bash
# Round 1: hit the wall → hand the whole space to the user
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace('debug-login-bug')
await handOffTaskSpace()                    // check result.done before claiming handoff
EOF
# ... user logs in / solves captcha, then confirms in chat ...

# Round 2: take control back and continue the same debug session
ego-browser nodejs <<'EOF'
await takeOverTaskSpace('debug-login-bug')
const state = await js(`({ errors: [...document.querySelectorAll('.error-msg')].map(e => e.textContent) })`)
cliLog(state)
EOF
```

### Recipe C — Raw CDP behind login (console / network domains)

```bash
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace('debug-login-bug')
await cdp('Network.enable')
await openOrReuseTab('https://app.example.com/dashboard')
// ... interact to reproduce ...
cliLog(await drainEvents())                 // includes network events once enabled
EOF
```

## chrome-devtools-mcp deepening — perf & network

The panels are the strongest CDP-debugging surface (Google's official MCP, 26+ tools). Two under-used recipes:

- **Jank / frame drops**: record a performance trace while reproducing the interaction → inspect Long Tasks and the main-thread flame chart → pair with the `perf-optimize-workflow` skill (stack corpus in its reference.md) for framework-specific root causes (React re-render storms, Angular CD cycles). Runtime trace first, code reading second.
- **Async loading / network anomalies**: use the network tooling to list requests filtered by URL/status → inspect response bodies and timing waterfall → compare against the expected API contract. When the same page is behind login, either attach the MCP to an existing logged-in Chrome, or switch to ego-browser Recipe C (raw CDP with inherited login state).
