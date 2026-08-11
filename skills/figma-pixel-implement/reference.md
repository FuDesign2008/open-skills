# figma-pixel-implement — reference

## Design-spec table template

Write as Markdown (session note or artifact). One row per measurable property.

| node / role | property | expected | unit | token / class | source |
|-------------|----------|----------|------|---------------|--------|
| Header / title | font-size | 24 | px | `text-2xl` / `--font-size-24` | Figma text style / variable |
| Header / title | font-weight | 600 | — | `font-semibold` | typography |
| Header / title | color | #1A1A1A | hex | `--color-text-primary` | fill / variable |
| Card | width | 360 | px | (one-off — flagged) | layout |
| Card | padding | 16 | px | `p-4` | auto-layout |
| Card | border-radius | 12 | px | `rounded-xl` | corner radius |
| Card | gap | 8 | px | `gap-2` | item spacing |
| Icon / logo | asset | `assets/logo.svg` | path | `<img>` | MCP export |

**Rules for the table**

- Prefer **design variables / tokens** in `source` when MCP or Code Connect exposes them.
- Record **raw numbers** from the design (px, rem only if the project converts consistently — note the conversion).
- Colors: hex/rgba **or** token name + resolved value if known.
- Omit properties you cannot observe later (verify will mark residual).

## Asset whitelist / blacklist

### Prefer (whitelist)

- Exported PNG/SVG/WebP from Figma MCP or export APIs
- `<img>` / Next `Image` / equivalent framework image components
- Inline SVG **only** when fills/strokes match the design without a CSS recolor hack
- Icon font / design-system icon components when they already map via Code Connect

### Avoid for Figma-colored glyphs (blacklist)

- Hand-authored SVG/`path` placeholders that only “look similar”
- CSS `mask` / `mask-image` / `-webkit-mask` paired with `background-color` to tint a silhouette
- `currentColor` recolor pipelines that replace the exported flat color
- Inventing mask theming when the frame only has a light (or single) export — use a design-provided dark export or record pending
- Recreating multi-color illustrations as a single-alpha mask

**Why:** MCP often exports flat colored assets. Mask + fill reintroduces theme/`currentColor` drift and fails visual parity with the frame.

## Large frames and quota

- Start with **metadata / structure** for large pages; implement child sections with separate design-context calls.
- Respect Figma MCP **rate limits** for the user’s plan; batch thoughtfully; on limit errors, pause and report rather than spinning.
- Prefer variables and Code Connect mappings over repeated full-frame fetches.

## Hand-off checklist

- [ ] Spec table present and covers critical geometry, type, color
- [ ] Assets use whitelist patterns; no mask-recolor for design-colored glyphs
- [ ] Theme matches requested frame/variant
- [ ] User informed that `figma-pixel-verify` owns alignment verdict
