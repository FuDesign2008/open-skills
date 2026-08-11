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

## Measurement guidance

1. Resolve a stable selector per `node / role` (test id > role+name > CSS path).
2. Prefer `getComputedStyle` (or equivalent) for colors, fonts, radii, padding.
3. Prefer `getBoundingClientRect` (or layout APIs) for width/height; compare in CSS pixels.
4. Normalize colors (`rgb(26, 26, 26)` → `#1A1A1A`) before compare.
5. Re-run the same script/path after each fix iteration — no “looks fine” shortcuts.

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

```markdown
## Figma pixel verify report

- Target: <route or story>
- Spec source: <path or note>
- Iterations: <n>≤3
- Overall: PASS | PASS-with-accepted-residuals | FAIL

| node / role | property | expected | actual | verdict | notes |
|-------------|----------|----------|--------|---------|-------|
| … | … | … | … | PASS/DRIFT/… | |

### Residuals
- …

### Root causes (if FAIL)
- e.g. CSS mask recolor; wrong variant; missing token
```

## Degradation without JS-eval

1. State clearly: numeric verify unavailable.
2. Attach screenshot side-by-side notes.
3. Mark rows MISSING-style or “vision-only residual.”
4. Overall must not be unconditional PASS.
