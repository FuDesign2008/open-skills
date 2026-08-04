# Write Workflow — Output Format Reference

Host-stage templates for `write-workflow`. Writer-specific formats live in `tech-review-doc` (and its `template.md`).

---

## Stage 1 — Clarify intent

```
【Intent】Document type: tech-review | humanize-en | humanize-zh | ...
【Writer】tech-review-doc | humanizer | humanizer-zh
【Source】Design path / text path / pasted excerpt: ...
【Language】(humanize) zh | en | ask
【Path】Full | Incremental | Lean — reason: ...
【Mode】Manual | Auto
【Open】...(one question if needed)
Please confirm intent / Path / mode.
```

---

## Stage 2 — Analyze sources

```
【Existence】Design doc: readable | missing
【Related】PRD / OpenSpec: ... | none
【Inventory】Title / modules / multi-option? / existing Mermaid / review type
【Gaps】...
【Ready for approach?】yes | no (blocking: ...)
```

---

## Stage 3 — Explore writing approach

```
【Diagrams】topology | architecture | data-flow | logic-flow | none needed
【§3 comparison】generate | skip — reason
【§6 release/ops】generate | skip — reason
【§4 depth】per Path: ...
```

---

## Stage 4 — Review writing approach (checklist)

```
[ ] Audience: §§1–3 stay business-readable (no code dumps)
[ ] Conditional §3/§6 decision matches inventory
[ ] Path depth matches scope
[ ] §1 approval gate still planned before file write
Verdict: pass | fail — notes: ...
```

---

## Stage 5 — Outline

```
【§1 topics to confirm】motivation / success / Non-Goals / terms
【Planned figures】...
【Sections to skip】§3? §6?
Hand off → writer Step 1 (§1 draft).
```

---

## Stage 7 — Verify

```
【File】path + naming OK?
【§1】user-approved?
【Diagrams】match plan?
【§3/§6】skip rules respected?
【Language】§§1–3 no code except Mermaid?
【Result】green | red — notes: ...
```

---

## Stage 8 — Retrospect

```
【What worked】...
【Improve next time】...
【Follow-ups】(optional writers / Path tuning)
```

---

## Prerequisite Skill Check — Missing Notice

```
⚠️ write-workflow is missing a strong dependency and cannot run

【Missing】<name>

【Install】
npx skills add FuDesign2008/open-skills -g --skill <name> --yes
```
