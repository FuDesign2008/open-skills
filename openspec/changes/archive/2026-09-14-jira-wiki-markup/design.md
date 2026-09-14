## Context

Jira Server/DC comments render Wiki markup. This repo's post-merge writeback SOP (`jira-status-writeback`) owns the two-step API but not notation. Host comment templates in `jira-fix-workflow/reference.md` use GitHub Markdown (`**bold**`, `### heading`), which the Wiki renderer mis-parses. Solution A (selected): a shared callee `jira-wiki-markup` plus thin host/writeback loads.

This is a Markdown skills-library change (no runtime app). Architecture-boundary precheck does not apply (same layer: skill documents). Isolation worktree skipped (`【工作区隔离跳过】escape=user-decline；reason=Markdown skills 库；in-place branch feat/jira-wiki-markup`).

## Goals / Non-Goals

**Goals:**
- New skill `jira-wiki-markup` (Wiki SoT: SKILL.md composition + `reference.md` full tables from Wiki Renderer Help, de-identified)
- `jira-status-writeback`, `jira-fix-workflow`, `opsx-jira-fix-workflow` declare and load it; comment bodies and templates are Wiki, not Markdown
- Callee does not enumerate host ids (`skill-dependency-direction`)
- AGENTS.md category/deps row; `docs/generated/skills-index.md` via gen script

**Non-Goals:**
- Jira Cloud ADF / Markdown dialect auto-detect
- Changing two-step writeback API or「已修复」status boundary
- Comments at PR-create time
- Full skill-creator eval harness (spawn with/without skill subagents) — this skill is a notation SoT; verification is lint + template grep + OpenSpec validate

## Decisions

1. **`user-invocable: false`** — same as `jira-status-writeback`. Hosts and writeback load it. Description still carries Chinese triggers for routing. Alternative rejected: standalone true (user can still get it via host comments; avoids a dead-skill-looking true skill that duplicates writeback).
2. **Progressive disclosure** — SKILL.md: when to load, composition rules (wiki-not-markdown, heading/emphasis/list/link/code/table/escape), pointer to `reference.md`. Full Help-derived tables live only in `reference.md`. Hosts keep field maps only.
3. **Writeback composes Wiki from the host field map** — `jira-status-writeback` SOP step 2 loads `jira-wiki-markup` and formats the field map as Wiki (canonical repair-comment skeleton in writeback or a short example in wiki-markup reference — **one** skeleton, not copied into both hosts). Host `reference.md` templates MUST match that skeleton's Wiki shape; they MUST NOT remain Markdown examples.
4. **Dependency edges** — writeback + both Jira hosts list `jira-wiki-markup`. Dual listing on hosts is intentional: they also write comments that never pass through writeback (existence / industry-wide / handoff).
5. **Versioning** — new skill `1.0.0`; `jira-status-writeback` MINOR; both hosts MINOR (new strong dependency).
6. **Examples** — `example.com`, `PROJ-1234`, `user@example.com` only. No instance Wiki-help URLs in skill files.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Cloud Jira tenants render Markdown/ADF | Non-goal; skill description Do-NOT-use and SKILL.md one-liner: this skill is Wiki renderer (Server/DC). Cloud ADF is a later change if needed. |
| Host templates drift from writeback skeleton | One canonical Wiki skeleton in `jira-wiki-markup/reference.md`; hosts point at it; grep for leftover `**Fix Branch**` / `### Verification` in Jira comment templates |
| Notation tables copied into hosts | Thin-load requirement in specs; review grep |
| Reverse integrator lists on callee | Role phrase only |

## Migration Plan

1. Add `jira-wiki-markup` (SKILL + reference)
2. Wire writeback SOP + both hosts' frontmatter, strong-dep mentions, comment templates
3. AGENTS.md + gen-skill-docs
4. Rollback = revert the feature branch / PR

## Open Questions

None blocking.

## Review record (stage 4)

【Solution review report】
- Subject: Shared callee `jira-wiki-markup` + host/writeback thin load (solution A)
- Reversibility: two-way door (Markdown skills; revert PR) → review depth: standard (cost/cognitive at standard per staged-review-flow because long-term skill-graph cost)
- Core dimensions:
  1. Effectiveness: ✅ Covers root cause (missing Wiki SoT + Markdown templates)
  2. Side effects & risks: ✅ Cloud dialect excluded with explicit non-goal; no API/status change
  3. Feasibility: ✅ Concrete files; same pattern as writeback extraction
  4. Spec compliance: ✅ Delta specs match proposal Why/What
- Strategic dimensions:
  5. Reversibility calibration: two-way; skill graph is the lasting part — callee+thin-load is the maintainable shape
  6. Failure-mode analysis: ✅ Wrong dialect on Cloud (low likelihood here; documented non-goal); missing load → abort (desired)
  7. Operability: N/A (no runtime service)
  8. Cost vs value: ✅ Small skill + three dependency edges vs perpetual Markdown comments
  9. Team cognitive fit: ✅ Matches existing callee/host split
- Issue list: none blocking. Non-blocking: skip Cloud ADF.
- Verdict: ✅ pass

【Code design review report】
- Subject: skills graph for Jira comment markup
- Path: quick (new skill module; dependency direction host→callee; no process/layer boundary) + security pass: no
- Layer A (quick skim):
  1. Testability: ✅ Notation checked by lint/grep, not a runtime unit
  2. Modularity: ✅ SoT in one skill
  3. Reliability: ✅ Missing dep aborts
  4. Scalability: N/A
  5. Dependency direction: ✅ Hosts/writeback depend on stable notation callee; callee has no reverse host roster
- Layer B:
  6. Accidental complexity: ✅ No dialect auto-detect
  7. Coupling: ✅ Data (field map in, Wiki string out) / name connascence on skill id
  8. Cohesion: ✅ Functional (Wiki notation only)
  9. Change amplification: ✅ Syntax changes stay in one reference
  10. Tech-debt: Prudent-Deliberate skip of Cloud ADF
  11. Complexity: low
  12. Law of Demeter: N/A (docs)
- Layer C: N/A (no new trust boundary; comments still use existing Jira auth)
- Issue list: none blocking
- Verdict: ✅ pass

【Spec extra-dimension】
- proposal Why ↔ specs ADDED requirements: aligned
- Hosts must declare dependency: specified
- Tasks not yet written — coverage checked at stage 5

## Verification Notes

- `openspec validate jira-wiki-markup` — pass after proposal+specs (re-run after design/tasks)
- 【覆盖率门控】本仓库 `coverage-gate: never`
- 【设计批准门禁逃生】escape=auto；reason=用户本轮明确「自动模式推进」；time=2026-09-14T14:53:00+08:00。
