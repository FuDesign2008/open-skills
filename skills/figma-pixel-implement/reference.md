# figma-pixel-implement — reference

## Screen × state inventory

Write before the spec table. One line per visual state (and out-of-scope behaviors).

| screen / section | state | source | notes |
|------------------|-------|--------|--------|
| Welcome / title | default | metadata `760:32908` | |
| Chip | hover | component variant Hover | |
| Chip | default | variant Default | |
| Auto-follow scroll | `out-of-scope: behavior` | prototype | not a computed-style row |
| Toolbar icon hover | `no-variant-in-design` | no Hover variant | do not invent |

## Design-spec table template

Write as Markdown (session note or artifact). One row per measurable property.

| node / role | state | mode | property | expected | unit | basis | token / class | source |
|-------------|-------|------|----------|----------|------|-------|---------------|--------|
| Header / title | default | light | font-size | 24 | px | self | `text-2xl` / `--font-size-24` | Figma text style / variable |
| Header / title | default | light | font-weight | 600 | — | self | `font-semibold` | typography |
| Welcome / title | default | light | gap-from-header | 82 | px | bottom of 顶部模块 → top of title | (layout) | metadata y minus header height |
| Card | default | light | width | 360 | px | self | (one-off — flagged) | layout |
| Chip | hover | light | background | #F4F6F7 | hex | self | `--yn-fill-2` | variant Hover |
| Icon / logo | default | light | asset | `assets/logo.svg` | path | self | `<img>` | MCP export |

**Rules for the table**

- Prefer **design variables / tokens** in `source` when MCP or Code Connect exposes them.
- Record **raw numbers** from the design (px, rem only if the project converts consistently — note the conversion).
- Colors: hex/rgba **or** token name + resolved value if known.
- `basis` names the parent or sibling the number is relative to (self padding vs gap from a named module).
- `state` matches the inventory (default, hover, …).
- Omit properties you cannot observe later (verify will fail overall if they stay critical and unmeasured).
- When theme is in scope, add a `mode` column (or one row per mode) for theme-varying properties; resolve per-mode values from the design itself (variable `valuesByMode` when exposed, otherwise re-fetch with the file/frame mode switched or via the per-theme frame); shared values stay single-row.
- Conflicting QA/walkthrough numbers stay in notes; `expected` stays on the Figma node.

## Asset whitelist / blacklist

### Prefer (whitelist)

- Exported PNG/SVG/WebP from Figma MCP or export APIs
- `<img>` / Next `Image` / equivalent framework image components
- Inline SVG **only** when fills/strokes match the design without a CSS recolor hack
- Icon font / design-system icon components when they already map via Code Connect
- Per-theme exports when theme is in scope: export each theme's assets from its mode or per-theme frame (design-provided), not one export plus a recolor

### Avoid for Figma-colored glyphs (blacklist)

- Hand-authored SVG/`path` placeholders that only “look similar”
- CSS `mask` / `mask-image` / `-webkit-mask` paired with `background-color` to tint a silhouette
- `currentColor` recolor pipelines that replace the exported flat color
- Inventing mask theming when the frame only has a light (or single) export — use a design-provided dark export or record pending
- Recreating multi-color illustrations as a single-alpha mask

**Why:** MCP often exports flat colored assets. Mask + fill reintroduces theme/`currentColor` drift and fails visual parity with the frame.

## Large frames and quota

- Start with **metadata / structure** for large pages; implement **every visible child section** with separate design-context calls.
- Unfetched visible sections mean implement is incomplete.
- Respect Figma MCP **rate limits** for the user’s plan; batch thoughtfully; on limit errors, pause and report rather than spinning.
- Prefer variables and Code Connect mappings over repeated full-frame fetches.

## Hand-off checklist

- [ ] Inventory covers visible sections, documented visual states, and `out-of-scope: behavior` / `no-variant-in-design` lines
- [ ] Spec table present: geometry, type, color, `state`, `basis`; `mode` when theme is in scope
- [ ] Every visible child section of a large frame was fetched (or unfinished sections are listed)
- [ ] Assets use whitelist patterns; no mask-recolor for design-colored glyphs
- [ ] Theme: in scope when file modes or project theme switch exist; per-mode values and per-theme assets from the design (or pending items noted)
- [ ] QA/walkthrough conflicts recorded; Figma node remains `expected`
- [ ] `figma-pixel-verify` is the next step in this run (or the host verification stage)
