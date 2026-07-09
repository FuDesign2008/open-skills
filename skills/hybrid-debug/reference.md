# Hybrid Fullstack Debugging — Domain Knowledge

> Companion to [SKILL.md](SKILL.md). This file holds the detailed technical pitfalls, contract templates, and an anchored reference case. All cases are sanitized of internal identifiers.

## Contents

1. [Technical pitfalls](#technical-pitfalls)
   - [Pitfall 1 — Android WebView `prefers-color-scheme` ignores system dark mode](#pitfall-1--android-webview-prefers-color-scheme-ignores-system-dark-mode)
   - [Pitfall 2 — Dual theme-variable system conflict](#pitfall-2--dual-theme-variable-system-conflict)
   - [Pitfall 3 — Incomplete native↔H5 theme-sync contract](#pitfall-3--incomplete-nativeh5-theme-sync-contract)
   - [Pitfall 4 — CSS same-specificity source-order trap](#pitfall-4--css-same-specificity-source-order-trap)
   - [Pitfall 5 — dev vs build CSS processing divergence](#pitfall-5--dev-vs-build-css-processing-divergence)
2. [native↔H5 communication contract template](#nativeh5-communication-contract-template)
3. [Anchored reference case](#anchored-reference-case)

---

## Technical pitfalls

These are cross-cutting traps that recur across hybrid projects. When a four-layer investigation reaches L2/L3/L4, scan this list for a match — a hit shortcut-confirms the root cause.

### Pitfall 1 — Android WebView `prefers-color-scheme` ignores system dark mode

- **Behavior**: Android WebView's `prefers-color-scheme` media query is determined by the host Activity's `isLightTheme`, **not** by the system dark-mode setting. If the Activity uses a Light theme (or sets `forceDarkAllowed=false`), WebView always reports `prefers-color-scheme: light`, even when the OS is in dark mode.
- **Official basis**: [Darken web content in WebView](https://developer.android.com/develop/ui/views/layout/webapps/dark-theme) — *"WebView always sets prefers-color-scheme according to isLightTheme."*
- **Avoidance**: In H5, **do not** rely on `@media (prefers-color-scheme)` to detect theme inside a WebView. Have native notify H5 of theme changes via an explicit JS API that switches a class — do not depend on the media query.
- **Contrast**: iOS WKWebView's `prefers-color-scheme` correctly follows the system appearance. This platform difference is a strong full-chain signal (see SKILL.md "Platform discrepancy").

### Pitfall 2 — Dual theme-variable system conflict

- **Behavior**: When an app simultaneously maintains two theme-variable systems — e.g. a `[data-theme]` attribute system alongside a `.theme-dark`/`.theme-light` + `prefers-color-scheme` class system — the two can disagree on "what theme are we in." At equal CSS specificity, source order decides the winner, so the system loaded later silently overrides the other, even when the other seems "more specific."
- **Avoidance**: Unify H5 theme architecture onto a **single source of truth** for theme detection (either class-based or attribute-based, not both). If two systems must coexist temporarily, document the precedence explicitly and ensure native informs both consistently.

### Pitfall 3 — Incomplete native↔H5 theme-sync contract

- **Behavior**: When native tells H5 to switch theme, setting only the attribute (e.g. `setAttribute('data-theme','dark')`) without switching the class leaves any class/media-query-based system misjudging the current theme. The symptom: native "did its part" but H5 renders the wrong theme silently.
- **Contract** (see full template below): a native theme switch must synchronize **all three** — class (`theme-dark`/`theme-light`) + attribute (`data-theme`) + persistent storage (localStorage). Any one missing breaks a consumer that reads the missing channel. Android `evaluateJavascript("setTheme('2')")` and iOS `callJS setTheme` should invoke the **same** H5-side API so both platforms stay aligned.
- **Generalization**: This is not theme-specific. Any native↔H5 state sync (mode, language, feature flags, user preferences) should go through a single H5-exposed API rather than native manipulating DOM attributes directly.

### Pitfall 4 — CSS same-specificity source-order trap

- **Behavior**: At equal specificity, the rule declared **later** in source order wins. When multiple stylesheets layer on top of each other, a rule from a later-loaded sheet overrides an equal-specificity rule from an earlier sheet — even if the earlier rule looks like it "should" win (e.g. `[data-theme=dark]` feeling more "explicit" than `.theme-system`).
- **Diagnosis**: Use the **disable-rules-one-by-one** technique at runtime — in DevTools, disable a suspect rule and watch whether the computed value changes. If it changes, that rule was the winner. This is conclusive; reading source order statically is error-prone.
- **Avoidance**: Concentrate theme-variable definitions at a single selector tier. Avoid scattering them across multiple equal-specificity rules in different sheets.

### Pitfall 5 — dev vs build CSS processing divergence

- **Behavior**: In dev mode (e.g. Vite with less compiled on the fly, unminified), all CSS rules are preserved as-is. In build mode (e.g. cssnano minification), the processor may merge or deduplicate rules targeting the same selector, which can make a dev-reproducible problem "look correct" in the build artifact — or vice versa.
- **Avoidance**: **Reproduce** the problem in dev mode (rules intact, easier to inspect). **Verify the fix** against the build artifact (production-real). Do not dismiss a dev-mode finding just because the build artifact "looks fine" — and do not declare victory on a dev-only fix without checking the build output.

---

## native↔H5 communication contract template

When native code needs to synchronize **any** state to the embedded H5 (theme, language, mode, feature flags, user preferences), follow this contract to avoid the silent-failure class of bugs:

| Channel | What native must do | Why |
|---------|---------------------|-----|
| **Class** | Toggle the H5 theme/state class (e.g. `theme-dark` / `theme-light`, or the equivalent state class) | Class-based CSS systems read the class directly |
| **Attribute** | Set the data attribute (e.g. `data-theme="dark"`) | Attribute-based CSS systems and H5 initializers read the attribute |
| **Persistent storage** | Persist the choice (localStorage / IndexedDB) so H5 reads the correct state on next cold load | Without persistence, a reload flashes the wrong theme before native can re-inject |

**Preferred mechanism**: Expose a single H5-side API (e.g. `window.setTheme(themeId)`) that updates all three channels atomically, and have **both** Android and iOS call that same API. This guarantees both platforms stay in lockstep and avoids the "Android sets attribute, iOS calls API" divergence that produces platform-specific bugs.

**Anti-pattern**: Native directly manipulating DOM attributes (`setAttribute`) bypasses the H5 theme manager, leaving its internal state stale. Even if it "works" on one platform today, it is a latent bug waiting for a platform-runtime difference (Pitfall 1) to expose it.

---

## Anchored reference case

> A sanitized end-to-end demonstration of the four-layer model. Use this to calibrate how the methodology plays out — including how a single-layer first attempt fails.

### Symptom

On an Android hybrid note-taking app, in Markdown preview's dark mode, indented code blocks (4-space-indented ASCII box-drawing art) rendered with a white background (`#f6f8fa`) instead of following the dark theme. Table headers (`thead`) had the same issue. iOS did **not** reproduce, even though the H5 was the same build.

### First attempt (L1-only, later discarded)

Analysis stayed in L1: the indented `<pre>` background used the CSS variable `--color-canvas-subtle`, which resolved to a light value on Android dark mode. The "fix" removed `--color-canvas-subtle` from `pre` and substituted `--code-bg`.

**Why this was superficial**:
1. It patched 1 of 6 elements sharing the variable (`pre`, `thead`, `kbd`, `csv`, two `.hljs` contexts). The other 5 still broke.
2. It never asked *"why does `--color-canvas-subtle` resolve to light on Android dark mode?"* — the deeper question that leads to L2/L3/L4.
3. It changed iOS's existing visual (the `pre` background shifted), a cross-layer side effect never assessed.

### Second attempt (full-chain, the root fix)

Pushed by "what is the deeper problem?", the analysis traced across all four layers:

```
[L3 native config] Activity theme = Theme.AppCompat.Light + forceDarkAllowed=false
  └─ isLightTheme is always true (never follows system dark mode)
       └─ [L4 platform runtime] Android WebView: prefers-color-scheme follows isLightTheme
            └─ WebView always reports prefers-color-scheme: light

[L2 native↔web bridge] native injects theme via setAttribute('data-theme','dark') only
  └─ [L1 web runtime] H5 ThemeManager.currentTheme stays 'system' → class = 'theme-system' (not theme-dark)
       └─ @media (prefers-color-scheme: light) { .theme-system { ...light values } } activates
            └─ .theme-light injects --color-canvas-subtle: #f6f8fa
                 └─ at equal specificity vs [data-theme="dark"], source order makes the later rule win
                      └─ every element using --color-canvas-subtle turns light (pre/thead/kbd/csv/hljs)
```

**Root cause**: the app ran two parallel theme-variable systems (`[data-theme]` vs `.theme-dark/.theme-system` + `prefers-color-scheme`) that disagreed under Android WebView. Android's bridge notified H5 incompletely (attribute only, no class switch) — see Pitfall 3. The platform-runtime quirk (Pitfall 1) amplified the disagreement.

**Root fix**: Android's bridge switched from `setAttribute` to calling the H5 `setTheme('2')` API, which toggles the `theme-dark` class and unifies both systems' understanding of the theme. One change, H5 untouched, all six elements fixed simultaneously. iOS already used the `setTheme` path, so both platforms aligned.

### Lessons visible in this case

- **L1 is where symptoms appear, not where causes live.** The first attempt fixed a symptom at L1 and missed five siblings.
- **Platform discrepancy forces L2/L3/L4.** iOS worked because its bridge + WKWebView runtime differed from Android's — the difference was never in the shared L1 code.
- **Runtime evidence was decisive.** The winning CSS rule was confirmed by disabling rules one-by-one in DevTools, not by reading source. Pixel sampling on screenshots confirmed the actual rendered color on the device.
- **The root fix was smaller than the surface fix** — one native bridge change vs. editing every element — because it addressed the shared root cause across all layers.
