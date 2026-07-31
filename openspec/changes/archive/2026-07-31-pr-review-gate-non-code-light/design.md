## Context

Part R always runs full `pr-code-review`. Users want a unified rule for non-application-code PRs (docs / skills / OpenSpec / metadata) without zero-review on this skills repo. Approved solution: **2+4** — surface classifier + light depth, plus `pr-review-gate` preference.

## Goals / Non-Goals

**Goals**
- Resolve `pr-review-gate:` like `coverage-gate:` (`always` | `never` | `ask` | `non-code-light`).
- Classify PR three-dot diff as non-application-code vs application-code with a deterministic path table.
- Light Part R: dual-axis ≥80 clearance without mandatory multi-perspective swarm.
- This repo defaults to `pr-review-gate: non-code-light` in `AGENTS.md`.
- Unset ≡ `always` (preserve external-project behavior).

**Non-Goals**
- Weakening Part A/B/C/D or the ≥80 Critical/Important gate on light depth.
- Host workflow prose duplication.
- Treating `.opencode/**/*.js` or `hooks/**` as non-application-code.

## Decisions

1. **Preference scan**: `AGENTS.md` then `CLAUDE.md`; regex `pr-review-gate:\s*(always|never|ask|non-code-light)\b`.
2. **Surface classifier** (authoritative detail in `merge-discipline/reference.md`):
   - **Allow (non-app if all paths match)**: `*.md`, `docs/**`, `skills/**`, `openspec/**`, `AGENTS.md`, `CLAUDE.md`, `.claude-plugin/**`, `.cursor-plugin/**`, `docs/generated/**`, root `package.json` / lockfile-only bumps when alone with docs (optional—prefer: lockfile alone still non-app; any `scripts/**` JS tool = app).
   - **Deny (forces application-code)**: `hooks/**`, `.opencode/**` (JS/TS plugins), `**/*.{ts,tsx,js,jsx,mjs,cjs,py,go,java,rs,swift,kt}` outside pure doc trees, CI workflow logic beyond metadata if it changes shell/JS behavior—conservative: any path under `.github/workflows/` that is not a one-line comment-only change still **application-code** for simplicity (workflows = app).
   - **Mixed** → application-code → full depth under `non-code-light`.
3. **Depth contract**: `pr-code-review` accepts `depth=full|light`; default `full`.
4. **留痕**: mirror Part C templates for `never` / user skip under `ask`; add light-path note optional in PR comment.
5. **Eval**: add/adjust merge-discipline eval case for non-code-light + skills-only PR.

## Risks / Mitigations

| Risk | Mitigation |
|------|------------|
| Misclassify script as docs | Deny list for hooks/opencode/workflows |
| never abused | Document; unset stays always |
| Light misses skill contract bugs | Keep dual-axis ≥80; Spec from OpenSpec when present |

## Open Questions

None blocking—hooks/opencode/workflows treated as application-code per review note.
