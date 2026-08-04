---
name: write-workflow
version: "1.0.0"
user-invocable: true
description: "Document-writing host workflow: route by document type, clarify with one question per turn, then delegate to a writer skill (default tech-review-doc). Extensible for future writers. Triggers — 「写文档」「写文档工作流」「写技术评审」「生成评审文档」「write workflow」「write-workflow」. Do NOT use for code bugs/features (solve-workflow), performance (perf-workflow), or marketing articles (article-writer)."
dependencies:
  - clarifying-question-discipline
  - tech-review-doc
---

# Write Workflow

> Thin orchestration host for **writing documents**. Document-type skills own the writing methodology; this host routes, checks dependencies, and enforces clarifying-question discipline at the edge.
>
> **Default writer (this release):** `tech-review-doc` — design doc → product/QA technical review markdown.
>
> **Not** a substitute for `solve-workflow` (code PDCA) or `article-writer` (marketing/tech articles).

## Prerequisite skill check

At startup, verify every frontmatter `dependencies` entry is available. If any is missing, abort and print:

```
npx skills add FuDesign2008/open-skills -g --skill <missing-name> --yes
```

Or install all: `npx skills add FuDesign2008/open-skills -g --skill '*' --yes`.

**No silent degradation.**

## Triggers and modes

| Phrasing | Behavior |
|----------|----------|
| 「写文档」「写文档工作流」「write workflow」 | Enter this host; detect document type then delegate |
| 「写技术评审」「生成评审文档」「技术评审文档」 | Enter host and route to `tech-review-doc` |
| Standalone invoke of `tech-review-doc` | Allowed without this host |

Default is interactive (pause at writer hard gates such as §1 approval). There is no separate “auto write full doc without §1 approval” escape — writer gates always win.

## Stage flow

```
0. Prerequisite check
1. Intent & route (document type)
2. Delegate to writer skill (follow it exactly)
3. Host wrap-up (path checklist + extension note if relevant)
```

### Stage 1: Intent & route

1. Confirm what document to produce and the primary source (e.g. design doc path).
2. Follow `clarifying-question-discipline` when intent is unclear (**one question per turn**).
3. Select a route from the table below.

| Document type | Writer skill | Status |
|---------------|--------------|--------|
| Technical review (design → product/QA review) | `tech-review-doc` | **Shipped** |
| AI de-slop / humanize prose | *(future, e.g. humanizer)* | Extension slot only — not implemented |
| Other | Ask user which writer to use, or stop | — |

If the user already named `tech-review-doc` or clearly wants a technical review document, route there without extra ceremony.

### Stage 2: Delegate

Load the chosen writer skill and **follow it exactly** (including its hard gates, template, and output naming).

Do not restate the writer’s full methodology in this host. Do not weaken the writer’s §1 (or equivalent) approval gate.

### Stage 3: Host wrap-up

After the writer finishes, briefly confirm:

- Output file path(s)
- Which writer ran
- Any skipped conditional sections the writer reported

## Extension slot (future writers)

To add a writer later (e.g. humanizer):

1. Add the skill under `skills/<name>/` and publish it.
2. Declare it in this host’s frontmatter `dependencies` **only if** it is a hard requirement for the default path; otherwise keep it optional and document the route.
3. Add a row to the Stage 1 route table and Chinese/English triggers in `description` (keep description ≤1024 chars).
4. Keep this host thin: route + clarify + delegate — do not inline the new writer’s body here.

## Relationship to other skills

| Skill | Relationship |
|-------|--------------|
| `tech-review-doc` | Strong dependency; default route |
| `clarifying-question-discipline` | Strong dependency; host + writers |
| `solve-workflow` | Sibling host for code problems — **not** wired |
| `article-writer` | Different audience (publishable articles) — do not conflate |

## Red flags

- Skipping the writer’s approval gate to “save a round”
- Implementing a future writer inline in this file
- Editing `solve-workflow` to call this host (out of scope unless a later change says so)
