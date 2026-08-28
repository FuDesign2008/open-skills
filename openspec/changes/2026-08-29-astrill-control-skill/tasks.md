## 1. OpenSpec artifacts

- [x] 1.1 Scaffold change (proposal / design / tasks / specs delta)

## 2. Skill

- [x] 2.1 Write `skills/astrill-control/SKILL.md` (English body; single-line quoted description with Chinese triggers; probes table; boundaries; Accessibility prerequisite)
- [x] 2.2 Port `skills/astrill-control/scripts/astrill.sh` (logic identical; comments/echo translated; `${APP}` brace normalization)
- [x] 2.3 Write `skills/astrill-control/evals/evals.json` (three scenarios + assertions)

## 3. Indexes

- [x] 3.1 Add AGENTS.md skill-table row (工具 / 无依赖)
- [x] 3.2 Regenerate `docs/generated/skills-index.md` (astrill-control row present)

## 4. Gates & evaluation

- [x] 4.1 `bash -n scripts/astrill.sh` clean; logic-line diff vs oh-my-music source shows comments/echo only (comment-stripped diff verified: only echo/usage lines differ, 32/32 symmetric)
- [x] 4.2 `npm run lint:skill-description` → 0 errors for astrill-control (59 skills, 0 errors)
- [x] 4.3 `node scripts/lint-skill-deidentification.mjs --staged` → 0 new hits (exit 0)
- [x] 4.4 Residual grep (Suno|汽水|qishui|ego-|cmux) under `skills/astrill-control/` → zero hits
- [x] 4.5 Independent reviewer subagent: port fidelity + iron-rule compliance (writer/reviewer separation; unattended run replaces the interactive eval viewer) — verdict PASS-WITH-NITS, no blockers; nit fixed in passing (echo "15s" → "20s", source-inherited inaccuracy); trigger narrowing 「发布前关代理」 accepted as intentional per the matrix-strip decision
- [x] 4.6 `openspec validate` → "Change '2026-08-29-astrill-control-skill' is valid" (CLI 1.10.0)

## 5. Delivery

- [x] 5.1 Feature branch `feat/astrill-control-skill`; commit (`feat:` prefix, ceb65c6, 10 files +309); push
- [x] 5.2 Open PR #291 (merge decision left to human acceptance — unattended run guardrail)
