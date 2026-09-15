## 1. Part R skill contract

- [x] 1.1 In `skills/merge-discipline/SKILL.md` Part R: remove “Application-code always → full (escalation is irrelevant)”. Make the size/risk ladder apply to application-code under `auto` / unset and under `non-code-light`.
- [x] 1.2 Keep `always` = blanket `full`, `never` / `ask` unchanged, and light’s ≥80 Critical/Important gate unchanged. Bump `merge-discipline` version (1.7.0 → 1.8.0).
- [x] 1.3 Grep hosts (`jira-fix-workflow`, `opsx-jira-fix-workflow`, `solve-workflow`, `opsx-solve-workflow`, `feature-branch-closeout`) for copied “application-code → full” prose; leave only thin pointers if any copy exists.

## 2. Reference ladder and sensitive table

- [x] 2.1 In `skills/merge-discipline/reference.md` Content-matched depth ladder: application-code continues to escalation steps instead of stopping at full in step 1.
- [x] 2.2 Add the sensitive-path glob + keyword table from `design.md` (repo-tunable constants, same file as 400 lines / 20 files). State that globs apply to application-code changed paths; keywords scan PR title / description / commit subjects.

## 3. Evals

- [x] 3.1 Change eval `non-code-light-mixed-full` (id 6): small `scripts/foo.mjs` with no sensitive/scale hit → expect `depth=light`, still run Part R.
- [x] 3.2 Add eval: `auto` or `non-code-light` + large application-code diff (over line or file threshold) → `depth=full`.
- [x] 3.3 Add eval: small application-code path matching the sensitive table (e.g. `src/auth/login.ts`) → `depth=full`.
- [x] 3.4 Add eval: `pr-review-gate: always` + tiny application-code diff → still `depth=full`.

## 4. Verify

- [x] 4.1 Run `openspec validate scale-app-code-pr-review-depth` and `npm test`.
- [x] 4.2 Run `npm run lint:skill-description` on the edited skill; regenerate `docs/generated/skills-index.md` if description changed.
- [x] 4.3 Confirm no host SKILL restates the new ladder methodology (thin pointer only).
