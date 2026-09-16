# figma-pixel-verify — reference

## Tolerances (defaults)

| Property class | Default tolerance | Notes |
|----------------|-------------------|-------|
| Width / height / x / y / padding / gap | ≈ **±1 CSS px** | Document DPR if box APIs differ |
| Border radius | **Exact** (or ±0.5 px if subpixel) | |
| Font size | **Exact** (computed px) | |
| Font weight | **Exact** numeric or mapped keyword | |
| Color | **Exact** after normalizing to hex/rgba | Ignore only documented gamma/rounding with note |
| Opacity | **Exact** to 2 decimal places | |

Hosts or users may tighten; record overrides in the report.

## Measurement channel ladder

Resolve the runnable surface in this order; declare the chosen channel in the report.

| Rung | Channel | When to use | Notes |
|------|---------|-------------|-------|
| 1 | Component-workbench story | Living artifact has a Stories subsection, or a Storybook-style workbench is detected | Preferred: systematic, observable, agent-drivable states |
| 2 | Lightweight isolated harness | No workbench, or workbench broken; component reachable by stubbing host/engine dependencies | Stub intent: cut non-UI dependency chains, keep real tokens/styles |
| 3 | In-product preview route | Component needs its real shell context | Use the project's preview/dev route when cheaper than a full launch |
| 4 | Full app / browser launch | Nothing lighter can render the component | Heaviest; last resort |

- Isolated is not simulated: a story or harness is a real render with real tokens; the ladder orders integration completeness × cost, not real-vs-fake.
- A broken or absent workbench falls the ladder down — record the fallback.
- When the project declares or shows a host/platform floor (an engine older than the workbench browser), the real host remains the final authority: add a platform-floor note; workbench PASS is not platform-floor proof.
- No workbench at all → make **one** adoption suggestion (a component workbench is systematic, observable, and agent-testable, and enables component tests) and continue measuring through the next rung; the suggestion is advisory, never blocking.

## Quality channel install gate

Use this gate during verify preflight. Do not paste a third-party browser API here; load that skill’s own install reference.

1. If the host is macOS **and** the `ego-browser` skill (or its install script) is available: if `command -v ego-browser` fails, follow that skill’s install reference, wait for user GUI onboarding when required, then confirm the CLI before measuring.
2. After the CLI is ready, load the skill and use it for open / pointer state / screenshot / evaluate.
3. If the host is not macOS, the skill/install path is absent, or install is blocked: continue with another JS-eval channel and record the channel used. Verify still runs.

## Measurement guidance

1. Resolve a stable selector per `node / role` (test id > role+name > CSS path).
2. Switch the running UI to the row’s `state` and `mode` before reading. On macOS with the `ego-browser` skill/install path, finish that install/onboard gate first, then hover/click/theme-switch through that channel and evaluate. When that install is impossible, use another JS-eval channel. Default-state readings do not satisfy a hover row.
3. Prefer `getComputedStyle` (or equivalent) for colors, fonts, radii, padding.
4. Prefer `getBoundingClientRect` (or layout APIs) for width/height; compare in CSS pixels. For `basis` rows, measure the named sibling relationship (e.g. header bottom vs title top), not only the node’s own padding.
5. Normalize colors (`rgb(26, 26, 26)` → `#1A1A1A`) before compare.
6. Re-run the same script/path after each fix iteration — no “looks fine” shortcuts.
7. When the model can inspect images, attach UI vs Figma screenshots as supporting notes for composition. They do not replace steps 2–5 when JS-eval exists.

### Example measurement intent (illustrative)

Agents adapt to available tools; do not treat this as a required library:

```js
const el = document.querySelector('[data-testid="card"]');
const cs = getComputedStyle(el);
const box = el.getBoundingClientRect();
JSON.stringify({
  width: box.width,
  paddingTop: cs.paddingTop,
  borderRadius: cs.borderRadius,
  color: cs.color,
  fontSize: cs.fontSize,
  fontWeight: cs.fontWeight,
});
```

## Report template

Write into the living artifact **Verify** section (same file as Inventory/Spec), or a sibling file if the project already uses a separate report. `expected` in this table is copied for comparison — **do not** edit the Spec section’s `expected`. Spec-gap (critical row missing from Spec) ⇒ Overall FAIL and return to `figma-pixel-implement`. Code DRIFT ⇒ fix UI, then update actual/verdict here.

```markdown
## Verify

- Target: <route or story>
- Channel: <storybook | isolated-harness | preview | full-app>
- Platform floor: <detected (note) | none>
- Spec source: <path to this file or sibling>
- Inventory coverage: <measured>/<critical visual rows> (<unmeasured list>)
- Theme scope: <single default | light+dark | …>
- Iterations: <n>≤3
- Overall: PASS | PASS-with-accepted-residuals | FAIL

| node / role | state | mode | property | expected | actual | verdict | notes |
|-------------|-------|------|----------|----------|--------|---------|-------|
| … | … | … | … | … | … | PASS/DRIFT/MISSING-style/accepted-residual/… | basis: … |

For multi-theme scope: repeat the table per theme (or add a `theme` column); each row under each theme gets its own verdict.

Overall **PASS** (or **PASS-with-accepted-residuals**) requires every critical visual row measured in the correct state/mode and within tolerance, except rows explicitly `accepted-residual` (owner + reason). Unmeasured critical rows, `MISSING-style`, unaccepted `DRIFT`, incomplete Spec, a missing living artifact after this-run implement, invented fill vs Spec `none`, fragment-cut vs a single Assets export, generic-shell size drift, invented text-color alias, or a remote design URL for a visible graphic ⇒ **FAIL**.

`out-of-scope: behavior` inventory lines are listed under Behavior (not pixel PASS).

### Residuals
- …

### Accepted residuals
- <row>: owner / reason (e.g. toolbar icon 18 vs Figma 16, design freeze)

### Root causes (if FAIL)
- e.g. CSS mask recolor; invented fill; fragment-cut icon; generic shell; invented text alias; remote asset URL; wrong variant; missing token; sampled subset; spec-gap (re-enter implement)
```

## Degradation without JS-eval

1. State clearly: numeric verify unavailable.
2. Attach screenshot side-by-side notes.
3. Mark rows MISSING-style or “vision-only residual.”
4. Overall must not be unconditional PASS.
