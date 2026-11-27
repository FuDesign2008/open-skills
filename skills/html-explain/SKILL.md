---
name: html-explain
version: "1.0.0"
user-invocable: true
dependencies:
  - system-browser-open-discipline
description: "Lightweight HTML explain for MR/PR/diff/local changes: gather evidence, write a five-section HTML page, open via system browser, return path only in chat. Use when the user wants an HTML explanation of a merge request, pull request, diff, or local change. Triggers — /html-explain, 「用 HTML 解释」「HTML 解释这个 MR」「解释这个合并请求」「看不懂这个改动」 / explain this MR in HTML, HTML explain this diff, explain this merge request. Do NOT use for pure concept/mechanism questions (explain-clearly), hands-on tutorials (teach), or design-doc rewriting (tech-review-doc)."
---

# HTML Explain

> Lightweight HTML explanation of an MR, PR, diff, or local change. Default path stays light: evidence → five-section page → system browser → chat path only. Escalation to `explain-clearly` is optional and shape-gated.

## Prerequisite check

At startup, confirm `system-browser-open-discipline` is available (declared dependency). If it is missing, **abort** immediately and tell the user to install that skill. Do not open an IDE Simple Browser or in-editor preview as a substitute. Do not silently degrade.

## When to use / route elsewhere

Use this when the user wants an HTML page that explains **what a change did** — merge request, pull request, diff, or local uncommitted/committed change.

Route elsewhere and stop when the request is:

- Pure concept / mechanism / protocol questions ("what is X", "how does X work") with no change-explain intent → `explain-clearly`
- Hands-on tutorial or onboarding → `teach`
- Turning a design doc into a review doc → `tech-review-doc`

## Default pipeline

1. **Gather evidence** for the named subject: MR/PR URL or number, `git diff` / status / log as needed, and the key files touched. Prefer facts from this session over invention.
2. **Write lightweight HTML** using the five-section outline in [reference.md](reference.md). Use `assets/page-shell.html` as a layout reference (title, one-liner, five section placeholders). Inline CSS is fine. Keep the page light — no concept step-player rules from `explain-clearly`.
3. **Deliver** under the workspace-root directory `.html-explain/`. Create that directory when needed. Name each file `<topic-slug>-<local-YYYYMMDD-HHmm>.html`. Write a **new** file every time; leave existing files in place. Do **not** edit the workspace gitignore.
4. **Open** the file for human view by loading and following `system-browser-open-discipline` (thin pointer — do not paste that skill's Iron Law here).
5. **Close out in chat** with the file path only. Do not paste the full HTML body into the chat. If the browser cannot be opened, still give the absolute path and state that open was skipped.

## Escalation rule (the only heavier path)

Escalate **only** when the subject is mainly a concept, mechanism, or protocol **shape** — not when the ask is primarily "what this change did".

When escalating:

1. Optionally load `explain-clearly` with the form **fixed to HTML**.
2. Let that skill produce the concept page (it may write under its own output directory).
3. This skill still **owns** the system-browser open and the chat path closeout.

Do **not** list `explain-clearly` in this skill's frontmatter `dependencies`. See the decision table in [reference.md](reference.md).

## Templates

Page section outline, escalation table, and sample placeholder URLs: [reference.md](reference.md). Minimal shell: [assets/page-shell.html](assets/page-shell.html).
