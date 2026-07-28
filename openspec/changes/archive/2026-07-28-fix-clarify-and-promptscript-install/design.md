## Context

Two trust issues in one change: (1) clarifying-question-discipline / main spec still say「一问一答」, which reads as answer-immediately; the desired contract is one-per-turn + multi-round-until-clear + clarify-first. (2) `npx skills add -g -y` prints PromptScript ✗ for every skill even though installs succeed to `~/.agents/skills`; AGENTS.md mislabels this as “known-harmless PromptScript-class skills.” Upstream fix PRs for `vercel-labs/skills` remain open as of 1.5.20.

## Goals / Non-Goals

**Goals:**
- Spec + skill: remove「一问一答」; add clarify-first (no rushed answers during clarification).
- Ship `scripts/install-skills.mjs` that global-installs with **zero** PromptScript ✗.
- Rewrite AGENTS.md / INSTALL install recipes; delete misdiagnosis.

**Non-Goals:**
- Vendoring or forking `vercel-labs/skills`.
- Changing openspec-* distribution / internal skill policy.
- Making PromptScript itself support global installs.

## Decisions

1. **Clarify wording** — Normative slogan stays「一次一问、多轮问清」; replace「一问一答」with「多轮追问」; ADDED requirement for clarify-first. Touch shared skill + main delta; update workflow one-liners only if they still say「一问一答」(pointers already use the good slogan).

2. **Install helper vs hardcoding `--agent` in docs only** — Ship a script (proposal option 2) so AI/CI have one non-interactive entrypoint. Default `--agent claude-code cursor opencode` (this repo’s three platforms); skills still land in `~/.agents/skills`. Override via `OPEN_SKILLS_AGENTS` (space/comma-separated). Always strip `promptscript` and `eve` (no `globalSkillsDir` in skills@1.5.x).

3. **Not passing all 70+ agents** — Full fanout is brittle and slow; three platforms match AGENTS.md scope. Users who need more set `OPEN_SKILLS_AGENTS`.

4. **Docs** — Point merge/release and INSTALL “全局全量” at `node scripts/install-skills.mjs`; briefly explain CLI fanout root cause + link https://github.com/vercel-labs/skills/issues/1352; remove「已知无害」.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| CLI adds another no-global agent | Denylist `promptscript`/`eve`; script fails if install log still matches PromptScript ✗ |
| Default three agents miss someone’s agent | Document `OPEN_SKILLS_AGENTS` |
| Local vs remote source during verify | Script accepts `--source` (default `FuDesign2008/open-skills`) |

## Migration Plan

1. Land skill/spec/doc/script on feature branch → PR → merge.
2. After release, maintainers run `node scripts/install-skills.mjs` instead of raw `npx skills add … -g -s '*' -y`.
3. Rollback: revert commit; old npx command still installs (with noisy ✗).

## Open Questions

None blocking; denylist may need expansion if skills CLI adds more `globalSkillsDir: undefined` agents.
