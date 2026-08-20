# Tasks: runtime-evidence-debug as the default debug entry

## 1. SoT — analysis-core

- [x] 1.1 Rewrite `skills/analysis-core/SKILL.md` §3 "Instrumentation debug": `runtime-evidence-debug` as the default entry with state-based trigger (static stalled / retry / silent failure / before-after verification); scenario composition (browser → `browser-debug-toolkit`; hybrid → `hybrid-debug` layer localization first; real-device → channel enablers e.g. `android-webview-debug`); keep tool limits
- [x] 1.2 Tighten `skills/analysis-core/SKILL.md` §2 step 5 (red-capable loop gate): user-reported symptom ≠ agent-observed red; non-agent-runnable loop MUST land as explicit user handoff (per `runtime-evidence-debug` human-AI division) or a stop with gap stated
- [x] 1.3 Append new §5 "Analysis gate output block" to `skills/analysis-core/SKILL.md` (before Integration guide; no renumbering of §§1–4): mandatory closing block — red-loop status / debug-entry status (loaded + trigger reason, or not-needed + one-line Tier 1–2 evidence) / scenario supplements / temporary-change rollback; missing block blocks `{next-stage}`; §1 exit gate and §2 step 5 gain one pointer line to §5
- [x] 1.4 Update `skills/analysis-core/SKILL.md` frontmatter description enumeration to include the analysis gate output block (single line, ≤1024 chars, 铁律 7); bump version minor

## 2. Default-entry skill — runtime-evidence-debug

- [x] 2.1 Rewrite `skills/runtime-evidence-debug/SKILL.md` frontmatter description: add state-based Chinese triggers 「修了还是不行」「日志正常但行为不对」「偶现」(+「调试默认入口」positioning phrase); trim framework enumerations to stay single-line ≤1024; bump version minor

## 3. Referencing workflows — thin pointers

- [x] 3.1 `skills/solve-workflow/SKILL.md` stage-2 body + `skills/solve-workflow/reference.md` §Stage 2: one pointer line to `analysis-core` §5 gate block (mandatory before stage 3); sync the SoT enumeration in the dependencies bullet + missing-notice
- [x] 3.2 `skills/opsx-solve-workflow/SKILL.md` stage-2 delegation + `skills/opsx-solve-workflow/reference.md`: add minimal Stage 2 section with the §5 gate-block pointer; sync SoT enumeration bullet
- [x] 3.3 `skills/jira-fix-workflow/SKILL.md` stage-3 delegation + `skills/jira-fix-workflow/reference.md` §Stage 3 host-only output template: add the §5 gate-block line into the template; sync SoT enumeration bullet + missing-notice
- [x] 3.4 `skills/opsx-jira-fix-workflow/SKILL.md` stage-2 delegation + `skills/opsx-jira-fix-workflow/reference.md`: add minimal Stage 2 pointer section; sync SoT enumeration bullet + missing-notice
- [x] 3.5 Sweep: `grep -rn "temporary-change gate / analysis steps" skills/` and every enumeration of analysis-core's ownership across the 4 workflows (SKILL.md + reference.md) gains "analysis gate output block" verbatim; bump the 4 workflow versions minor (note: `solve-workflow-workspace/skill-snapshot/` is a frozen skill-creator eval fixture — deliberately NOT synced)

## 4. Gates & verification

- [x] 4.1 Run `npm run lint:skill-description` — all changed skills pass (≤1024, single line)
- [x] 4.2 Run `node scripts/lint-skill-deidentification.mjs --staged` — no new internal identifiers (铁律 2)
- [x] 4.3 Regenerate skills index (`node scripts/gen-skill-docs.mjs`) and confirm `git diff --exit-code docs/generated/skills-index.md` parity after staging
- [x] 4.4 Behavior spot-check: grep-verify the gate block appears exactly once as SoT (analysis-core) and only as pointers elsewhere (`grep -rn "gate output block\|分析门控" skills/` — duplication = fail); verify new description triggers present verbatim; verify no `阶段 1.[12]|stage 1.[12]` style stale refs introduced
- [x] 4.5 `openspec validate runtime-evidence-debug-default-entry` passes; delta-spec requirements vs implementation cross-check (each ADDED/MODIFIED requirement has its landing in the edited files)
