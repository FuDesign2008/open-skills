# browser-debug-toolkit — Reference

The main [SKILL.md](SKILL.md) is the lean decision document. Read this when you've chosen the **web-access CDP Proxy** channel and need the concrete curl API + debugging recipes.

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
- The bug is statically obvious from code → Read / Grep first; don't spin up a browser.
