## Why

Clarifying-question copy uses「一问一答」, which reads as “answer immediately after each ask,” while the real goal is one question per turn, multi-round until the problem is clear, without rushing to solutions. Separately, post-release `npx skills add -g` logs PromptScript ✗ lines that AGENTS.md mislabels as “known-harmless PromptScript-class skills”; the skills actually install to `~/.agents/skills`, and the noise comes from the upstream CLI fanout to the PromptScript agent (no `globalSkillsDir`). Both undermine trust and must be fixed in-repo without waiting on an unmerged CLI PR.

## What Changes

- Rewrite `clarifying-question-discipline` contract and skill: keep「一次一问、多轮问清」; remove「一问一答」; add clarify-first (ask until clear; do not rush answers/solutions during clarification).
- Add a repo install helper (`scripts/install-skills.mjs` or equivalent) that runs global `skills add` only against agents that support global install, so the documented path ends with **zero** PromptScript ✗.
- Update `AGENTS.md` / install docs: delete the “PromptScript-class skills / 已知无害” misdiagnosis; point merge/release install at the helper; link upstream issue for context.
- **Not BREAKING** for skill runtime behavior beyond clarifying semantics; install command text changes for maintainers/AI.

## Capabilities

### New Capabilities

- `skill-global-install`: Documented and scripted global install path for this repo that avoids PromptScript (and any agent without global support) failure noise, while still installing universal skills to `~/.agents/skills` / supported agents.

### Modified Capabilities

- `clarifying-question-discipline`: Replace「一问一答」wording; require clarify-first / no rushed answering during clarification rounds; keep one-per-turn + multi-round-until-clear.

## Impact

- Skills: `clarifying-question-discipline` (+ workflow one-line pointers if they still say misleading phrases).
- Specs: new `skill-global-install`; delta on `clarifying-question-discipline`.
- Docs: `AGENTS.md`, `docs/INSTALL.md` (and any duplicate install recipes).
- Tooling: new `scripts/install-skills.*` used after release / merge PR flow.
- Upstream: does not vendor `vercel-labs/skills`; tracks [issue #1352](https://github.com/vercel-labs/skills/issues/1352) until CLI ships a skip filter.
