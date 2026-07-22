# browser-debug-toolkit — Reference

The main [SKILL.md](SKILL.md) is the lean decision document. **Read this file** when you've chosen the **browser-access CDP Proxy** channel and need the concrete curl API + debugging recipes. (For chrome-devtools-mcp / playwright / visual-qa, see their own docs; this reference covers the CDP Proxy channel specifically.)

The CDP Proxy lives in the strongly-depended **`browser-access`** skill. It speaks HTTP on `http://localhost:3456` and connects to the user's daily browser — so it carries login state natively, which is the main reason to reach for it over chrome-devtools-mcp during debugging.

## Preflight

```bash
node "${CLAUDE_SKILL_DIR}/scripts/check-deps.mjs"
```

`CLAUDE_SKILL_DIR` here resolves to the `browser-access` skill directory (the dependency). Requires Node.js 22+ and the browser's remote-debugging toggle enabled. Exit codes: `0` proceed · `2` ask user for browser preference (writes `config.env`) · `1` follow stdout instructions.

## curl HTTP API cheat sheet

`ID` = target id from `/new` or `/targets`.

```bash
# list the user's open tabs (find an existing one, or just /new your own)
curl -s http://localhost:3456/targets

# open a background tab (auto-waits for load); URL in POST body
curl -s -X POST --data-raw 'https://app.example.com/dashboard' http://localhost:3456/new

# inspect DOM / run JS — the workhorse for runtime inspection
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'document.title'
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'JSON.stringify({h: document.body.scrollHeight, els: document.querySelectorAll(".card").length})'
# computed style (what chrome-devtools-mcp gives you in the Styles panel)
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'getComputedStyle(document.querySelector(".btn")).color'
# box model
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'JSON.stringify(document.querySelector(".btn").getBoundingClientRect())'

# capture rendered state (DOM is not enough → screenshot the pixels)
curl -s "http://localhost:3456/screenshot?target=ID&file=/tmp/before.png"

# interact to reproduce (click / scroll / navigate)
curl -s -X POST "http://localhost:3456/click?target=ID" -d 'button.submit'
curl -s -X POST "http://localhost:3456/clickAt?target=ID" -d 'button.upload'   # real mouse gesture
curl -s "http://localhost:3456/scroll?target=ID&direction=bottom"
curl -s -X POST --data-raw 'https://app.example.com/next' "http://localhost:3456/navigate?target=ID"

# after-state capture for before/after diff
curl -s "http://localhost:3456/screenshot?target=ID&file=/tmp/after.png"

# always close the tab you created (never the user's tabs)
curl -s "http://localhost:3456/close?target=ID"
```

## Debugging recipes

### Recipe 1 — Login-gated UI bug (the killer use case)

The bug only shows up when logged in. chrome-devtools-mcp opens a fresh session → no cookies → can't reproduce.

```
check-deps → /new the authenticated URL (user's browser is already logged in)
→ /eval inspect the buggy DOM / computed style
→ /screenshot /tmp/before.png
→ /click to trigger the bug
→ /screenshot /tmp/after.png  → diff before/after
→ fix code → redeploy/refresh → re-capture → confirm anomaly gone
→ /close
```

### Recipe 2 — Dynamic / anti-scraping page inspection

Static curl returns a JS-rendered shell. Use `/eval` to read the DOM *after* client-side rendering, and `/scroll` to trigger lazy-loaded content before reading.

```
/new → /scroll direction=bottom (load lazy regions) → /eval read text/attrs → /screenshot if visual
```

`/eval` can recurse through Shadow DOM and iframes — selectors that CSS can't cross, JS can. Use it when `querySelector` returns null but the content is visibly on the page.

### Recipe 3 — Interaction reproduction (click not responding)

```
/new → /click the suspect button → /eval check for JS errors / state change → /screenshot
```

If `/click` (JS `el.click()`) doesn't trigger the handler, try `/clickAt` (CDP `Input.dispatchMouseEvent` — a real user gesture, required for file dialogs, some shadow-DOM-attached listeners, and "user activation" gated APIs).

### Recipe 4 — Before/after fix verification

The debugging-validation loop (paired with `runtime-evidence-debug`):

1. Capture the **anomalous** runtime state (`/eval` + `/screenshot` → evidence of the bug)
2. Apply the fix
3. Re-capture at the **same** point
4. Diff — anomaly must be gone, and no new regression introduced

This is runtime evidence, stronger than reading the fixed code.

### Recipe 5 — CSS layout / stacking-context diagnosis

A frequent complaint ("z-index not working", "element covered by another", "flex off by N px") usually has its root cause only visible in computed styles + ancestor chain — not in source CSS. Probe it in one `/eval` (for a multi-line payload use `--data-binary @file`, see `browser-access/references/cdp-api.md`):

- **z-index "not working"**: most often the element (or an ancestor) lacks `position` ≠ `static`, OR an ancestor creates a new stacking context (`transform`, `opacity<1`, `isolation:isolate`, `will-change`) that traps it. Walk the ancestor chain and dump `position` / `zIndex` / `transform` / `opacity` / `isolation` at each level — the trapping layer is the root cause.
- **"element covered by another"**: scan all elements, keep those whose `z-index` > target's and whose `getBoundingClientRect()` intersects the target — those are the covering candidates.
- **flex/grid misalign**: dump `getComputedStyle` (`display` / `align-items` / `gap`) on the container plus children's `offsetTop` / `offsetLeft`.

Then `/screenshot` for pixel evidence → apply fix → re-run the *same* `/eval` to confirm the chain is clean, plus a screenshot diff.

## When NOT to use the CDP Proxy

- Pure CSS / computed-style / box-model inspection with no login need → chrome-devtools-mcp is more direct (panel-aligned).
- Performance flame chart / network waterfall → chrome-devtools-mcp Performance/Network panels.
- The bug is statically obvious from code → don't spin up a browser at all; Read/Grep first.

## References

- Full CDP API detail + JS extraction patterns: `browser-access/references/cdp-api.md`
- Site-specific operating experience: `browser-access/references/site-patterns/{domain}.md`
