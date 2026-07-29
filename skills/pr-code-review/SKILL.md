---
name: pr-code-review
version: "1.0.0"
user-invocable: true
description: "Multi-perspective pull-request code review with confidence filtering (≥80) and optional GitHub review comment. Open-skills port of the Claude Code official /code-review command methodology (platform-agnostic agent dispatch). Triggers — 「PR 代码审查」「审查这个 PR」「code-review」「/code-review」「审 PR」「pull request review」 / pr code review, review this PR. Do NOT use as a name alias for mattpocock code-review (two-axis since-fixed-point) or Superpowers requesting-code-review."
---

# PR Code Review

> Portable PR review skill for open-skills. Methodology adapted from Anthropic's Claude Code **code-review plugin** command (`/code-review`); rewritten so any agent host can run it without hard-coding that host's model tiers or proprietary tools.
>
> **Origin note:** Claude Code install path is a *plugin command*, not `npx skills`. This skill is the installable Agent Skills form: `npx skills add FuDesign2008/open-skills -g --skill pr-code-review --yes`.

## When this applies

- User asks to review an open PR/MR, or a host (e.g. `merge-discipline`) requires pre-merge PR review.
- Skip (do not post a review comment) when the PR is closed, draft, trivial/automated, or already has a review comment from this skill in this session — report the skip reason and stop.

## Process

1. **Eligibility** — Confirm the PR is open, non-draft, needs review, and has not already been reviewed by this skill this turn/session. If ineligible, stop.
2. **Guidance paths** — List paths only (do not dump full bodies yet) for project guidance: root `AGENTS.md` / `CLAUDE.md` if present, plus any nested `CLAUDE.md` / `AGENTS.md` under directories the PR touches.
3. **Summary** — Read the PR (title, body, diff summary) and state a short change summary.
4. **Multi-perspective review** (run perspectives independently; prefer parallel agent dispatch when the host supports it):
   - **Guidelines** — Diff vs listed guidance files (only flag items those files explicitly require).
   - **Bugs** — Obvious bugs in the PR diff only; ignore likely false positives and nits.
   - **History** — `git blame` / history on touched lines for context regressions.
   - **Prior PR comments** — Earlier PRs on the same files; apply still-relevant review comments.
   - **In-file comments** — Honor guidance in comments inside modified files.
5. **Confidence filter** — For each candidate issue, score **0–100** (rubric below). **Drop scores below 80.** If none remain, either post the “no issues” comment or (when host asks silent-ok) report pass without commenting.
6. **Re-check eligibility** — Confirm the PR is still eligible before posting.
7. **Publish** — Post the review comment via the host’s GitHub/GitLab CLI (`gh pr comment` / equivalent). Keep the comment brief; no emoji spam; cite code with **full commit SHA** permalinks.

Comment templates and permalink rules: [reference.md](reference.md).

### Confidence rubric (verbatim for scorers)

| Score | Meaning |
|------|---------|
| 0 | False positive / pre-existing / does not stand scrutiny |
| 25 | Might be real; unverified; or stylistic and not in guidance files |
| 50 | Real but nit / rare; not important vs the rest of the PR |
| 75 | Likely real and important; current approach insufficient; or explicitly required by guidance |
| 100 | Definitely real and frequent; evidence confirms |

### False positives to discard

Pre-existing issues; lookalike non-bugs; pedantic nits; anything a linter/typechecker/compiler would catch; generic “add more tests/docs/security” unless guidance files require it; issues on lines the PR did not change; intentional behavior changes that match the PR intent.

## Host contract (`merge-discipline`)

When loaded as a strong dependency before merge:

- Run this skill against the **open PR/MR about to be merged**.
- **Pass** → no remaining issues ≥80 (posted “no issues” or silent pass per host).
- **Fail** → ≥1 issue at ≥80 posted (or ready to post) → **block merge** until fixed or the user gives an **explicit** skip 留痕.
- Do not treat “CI green” as a substitute for this review.

## Integration guide

- Declare `pr-code-review` in frontmatter `dependencies` when merge must not proceed without PR review.
- On missing dependency, abort and print per-skill install (see merge-discipline Missing Notice).
- Do not rename this skill to `code-review` (collides with external two-axis review skills).
