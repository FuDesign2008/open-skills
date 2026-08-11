# Brainstorm Workflow — Reference

## Prerequisite Skill Check — Missing Notice

```text
【前置 Skill 缺失】brainstorm-workflow 无法继续。
缺失: <skill-name>
安装:
  brainstorming → install Superpowers (https://github.com/obra/superpowers) so skill name/dir is brainstorming
                 or: npx skills add https://github.com/obra/superpowers.git --skill brainstorming
  solve-workflow → npx skills add FuDesign2008/open-skills -g --skill solve-workflow --yes
本仓全量（不含外部 brainstorming）: npx skills add FuDesign2008/open-skills -g --skill '*' --yes
```

## Handoff payload (into solve-workflow Stage 5)

```text
【brainstorm-workflow 交接】
【Design path】<absolute or repo-relative path to approved design md>
【Goal】...
【Chosen approach】...
【Constraints】...
【Non-goals】...
【Ask】Enter solve-workflow「制定计划」; skip stages 1–4 for this item.
```

## Path prompt (before writing design)

```text
【设计文档落点】Where should I write the approved design?
Recommended: docs/design/YYYY-MM-DD-<topic>-design.md
Reply with a path, or accept the recommendation.
```

## Intent redirect (bug)

```text
【改道】This looks like root-cause / defect analysis.
Use solve-workflow or opsx-solve-workflow instead of brainstorm-workflow.
```
