## Context

See `proposal.md` for motivation. The current queue skill writes human-facing records as Markdown and only two HTML surfaces exist: the per-card review page (via `explain-clearly`) and the per-card evidence page. The `goal-queue` spec requires an acceptance package that names the progress document, triage record, engine reports, `verification.md`, and a branch list; it does not require HTML views or MR URLs. The repo already ships skill-local `scripts/` directories, uses `node --test` with contract tests that lock exact sentences, and pins Node 22 via `.nvmrc`. `.goal-driven/` is not gitignored; queue artifacts must stay out of the MR.

## Goals / Non-Goals

**Goals:**

- Generate one self-contained HTML view per covered human-facing record, with the Markdown file remaining canonical.
- Make `verification.html` the acceptance entry page, generated at the approval handoff and package assembly, and regenerated before any open.
- Open the entry page only in interactive handbacks and on explicit view requests; never auto-open in scheduled/unattended runs.
- Make every done card with a reviewable diff auto-submit an MR and carry its URL into every human-facing record, without editing child engine templates.
- Lock the contract with sentence tests, renderer unit tests, security tests, and the existing review/evidence contract tests unchanged.

**Non-Goals:**

- No general-purpose Markdown engine; only the subset used by the queue templates.
- No new runtime dependency, service, port, or external asset.
- No HTML views for `config` or `approaches/*.md`; no replacement of the review/evidence pages.
- No engine-side template edits; no backfill of old batches.
- No merge, release, protected-branch push, or auto-merge.

## Decisions

### Markdown remains canonical; HTML is a sibling view

Every covered record keeps its `.md` file unchanged and gains a sibling `.html` file: task cards, the triage record, `progress.md`, `verification.md`, and each engine report copied into `runs/<batch-id>/`. `config` and `approaches/*.md` stay Markdown-only. Rationale: agents edit structured Markdown cheaply and git diffs stay readable; the HTML is derived and disposable. Alternative considered: HTML-only records (rejected because agent editing and diffing degrade and existing templates would be rewritten); an HTML-primary source with a Markdown mirror (rejected for the same reason plus a second sync surface).

### A line-based renderer with an explicit Markdown subset

`skills/goal-driven-queue/scripts/render-html.mjs` uses only Node built-ins. The block parser handles fenced code, headings, tables, ordered/unordered lists (including task checkboxes rendered read-only), blockquotes, horizontal rules, and paragraphs; the inline parser handles code spans, emphasis, links, and images. Rendering escapes `&`, `<`, `>`, `"`, and `'` first; raw HTML from card or report content never passes through. Link targets are normalized (trim, strip control characters, lowercase the scheme) and limited to relative paths (not starting with `//`), fragments, `http`, `https`, and `mailto`; `javascript:`, `data:`, `vbscript:`, `file:`, protocol-relative URLs, and backslash-prefixed paths are rejected, and attribute values are escaped. Table cells split on unescaped `|`, `\|` is honored inside a cell, and code spans are protected from link rewriting. Relative `.md` links rewrite to an existing `.html` view, except inside code fences. Images render only when their `src` resolves to an existing local file under the queue root; otherwise the alt text is shown. The output has inline CSS, no external script/link/font/`@import`, no interactivity, and a footer with the source path and generation time. Output is deterministic for the same source and generation time; the `.md` source is never written.

The module exports pure helpers (`renderMarkdown`, `resolveLinks`, `renderFile`) and a thin CLI (`node render-html.mjs <source.md>... --root <queue-dir> [--open <file>] [--at <iso>]`). The open action accepts an injected `spawn` function; it resolves the target under `--root` and passes an argument vector, not a shell string. Tests inject the opener and never launch a browser. Alternative considered: a mature Markdown library (rejected: new runtime dependency and cross-platform install assumptions); agent-written HTML per document (rejected: duplicated content, drift, no deterministic tests).

### Generation timing, stale views, and the entry page

The dispatcher renders the task card and triage record at the Stage 1 approval handoff, and all covered records at Stage 3 package assembly. It re-renders immediately before any open, so a stale view is never opened. `verification.html` links to `progress.html`, the triage HTML view, each card's HTML view, each executed card's packaged engine report's HTML view, and, for each done card, that card's review page and evidence page. A target that does not exist is annotated as unavailable for any batch: a failed card (executed, report exists) links its view and report and annotates review/evidence unavailable; a `skipped (covered)` card (not executed) links its view and annotates report/review/evidence unavailable; a zero-done batch still gets the entry page. The generator never invents a file. Alternative considered: generate only at package assembly (rejected because the human may ask to view a card or triage record during intake); generate on every status update (rejected as wasted work; on-demand re-render covers mid-run viewing).

### Auto-open is gated by a recorded trigger fact

The first progress-document entry records a batch header line `Trigger: interactive | scheduled` (not a per-task column) from the actual run trigger. That value gates the **automatic** Stage 3 handback only: when it is `interactive`, the dispatcher auto-opens `verification.html`; when it is `scheduled`, the dispatcher prints the paths and does not auto-open. An explicit view request opens the requested page regardless of the recorded trigger — the request itself is the presence input — after a freshness check. The open action resolves the file under the queue directory, uses an argument vector, and selects the OS default handler (`darwin` → `/usr/bin/open`, `linux` → `xdg-open`, `win32` → `cmd /c start ""`); if the opener fails, it prints the path and records the failure. Generated HTML is not committed: delivery stages only the allowed paths and verification shows the diff excludes `.goal-driven/`; the spec states the generic rule, while the plan names this change's concrete path list. Alternative considered: infer presence from the model's judgment (rejected: not a verifiable fact per iron rule 10); open every page as it is generated (rejected: unattended runs accumulate tabs and fail without a GUI session); open only on request (rejected: loses the convenience at the handback moment).

### Auto-MR is queue-side supply plus a record-step gate

The queue carries this line in every child card supply: on completion, commit, push the feature branch, and open a PR/MR; record `MR: opened <url>` in the completion report; merge stays human. The queue does not edit any child engine template. The child commits its work first, then a reviewable diff is established only when the scoped work tree is clean (`git status --porcelain -- . ':(exclude).goal-driven' ':(exclude).explain-clearly'` prints nothing) and `git diff --stat "$(git merge-base origin/main HEAD)" HEAD` prints at least one changed file; the report records both commands and a short output summary. A scoped status that still prints a change cannot be reported as no diff: the child commits or reports failure. If `origin/main` or the merge base is unavailable, the report records `MR: failed — <reason>`. The report uses exactly one state: `MR: opened <url>`, `MR: failed — <reason>`, or `MR: skipped — no reviewable diff (<status output>; <diff output>)`. The MR URL is recorded in the completion report, the progress document (new `MR` field), the verification document (new `MR` line and card HTML view path), and the acceptance package. A done card with a diff and neither a URL nor a failure reason bounces and is set to `failed`; an MR failure is a delivery failure and the card is set to `failed`; only a scope or constraint change beyond the frozen card uses `conflict pending confirmation`. The queue never fakes a URL. Alternative considered: rely on each engine's existing closeout menu (rejected: `opsx-solve-workflow` may skip delivery and `feature-branch-closeout` can present a menu; the queue needs a uniform rule); edit engine templates (rejected: out of contract and a scope change).

### Engine reports are copied before rendering

Each executed card's engine completion report is copied byte-identically into `runs/<batch-id>/reports/<card-slug>.md` before its HTML view is rendered beside the copy. The footer names the original path. This replaces the current "referenced by path" wording in `SKILL.md`; the plan updates that sentence and surfaces the change. The queue never writes into a child worktree or the project repo, and the original `.md` stays byte-unchanged. This makes the package self-contained and gives the link-resolution check a stable target. Alternative considered: render at the child's path (rejected: the worktree may be removed and the package would depend on it).

### Conflict prediction stays local

The pre-run conflict prediction runs in a temporary scratch worktree. It never pushes, force-pushes, or rewrites a branch that already carries an open MR. Only genuine conflicts and the MR URL reach the human. This reconciles the existing acceptance-package requirement's auto-rebase wording with the auto-MR rule.

### Tests lock the contract in layers

- `scripts/human-facing-html-contract.test.mjs` (new) locks the new sentences in `SKILL.md` and `reference.md` only; it never reads `openspec/changes/<this-change>/`, because the change directory moves at archive. The spec is validated by `openspec validate <change> --strict` before archive and `openspec validate goal-queue --strict` after archive; no `--all`. Negative cases: `config`/`approaches` get no HTML view; the review/evidence contract is unchanged; enqueue shells do not write views. It also locks the progress header `Trigger` line, the per-done-card review/evidence wording, the failed/skipped distinction, the `MR: skipped` output format, and the verification section's card HTML view path.
- `skills/goal-driven-queue/scripts/render-html.test.mjs` (new) covers escaping (`<script>`, `&`, quotes, `<batch-id>` placeholders), tables with escaped pipes, nested/ordered lists, code fences, blockquotes, read-only checkboxes, link rewriting (relative, fragment, existing `.html`, not inside fences), footer, self-containment (no external stylesheet, script, font, image, or `@import`), determinism, `.md` byte-unchanged, scheme allowlist (`javascript:`, `data:`, `vbscript:`, `file:`, `//host`, leading `/`, backslash, `JaVaScRiPt:`, `java\tscript:`), path containment, and an injected opener.
- Packaging fixture: render a task card, triage record, progress, verification, and a copied engine report in a temp queue directory; assert the expected `.html` set, zero missing link targets, failed/skipped/zero-done annotations, and byte-unchanged `.md` sources. The plan carries this as the G3 check.
- G4 evidence: an explicit real-open invocation with a non-empty screenshot; a scheduled-trigger path that prints paths and does not invoke the opener. The plan carries both.
- `scripts/review-html-flow-contract.test.mjs` stays unchanged and must keep passing. No test snapshots rendered HTML.

## Risks / Trade-offs

- [HTML injection through card/report content] → Escape all content, block raw HTML and unsafe link schemes, escape attributes, and lock the cases in tests.
- [Path traversal through slugs or link targets] → Reject path separators in generated slugs, resolve every open target under the queue root, and test containment.
- [Stale view opened] → Re-render immediately before open and include the generation time in the footer.
- [Old batch links to a page that never existed] → Link only to existing targets or annotate the target as unavailable; do not invent files.
- [No-Node fallback writes unsafe HTML] → Apply the same escaping/self-containment/footer rules; if they cannot be guaranteed, print the `.md` paths instead.
- [MR failure silently accepted] → Explicit `MR: failed — <reason>` state; a done card with a diff and no state bounces; no URL is invented.
- [Engine report path disappears with the child worktree] → Copy the report into the package before rendering; render the sibling of the copy.
- [Queue artifacts enter the MR] → Delivery stages only the allowed paths; verification shows the diff excludes `.goal-driven/`.
- [Generated index conflict / description overflow] → Regenerate the index and keep the description single-line ≤950 chars; do not pad it with behavior detail.
- [Node version drift] → Run tests and `node --check` under `.nvmrc` Node 22 and disclose the version.
- [A dirty tree is reported as no diff] → Require a clean `git status --porcelain`; a dirty tree commits or reports failure.
- [Protocol-relative or obfuscated link schemes] → Normalize targets and reject `//host`, `file:`, backslashes, `JaVaScRiPt:`, and `java\tscript:`; lock them in tests.
- [The opener is unavailable or fails] → Print the path and record the failure; do not claim a successful open.
- [Table pipes or code spans are misparsed] → Split on unescaped `|`, honor `\|`, and protect code spans from link rewriting.
- [Engine report filename collision] → Copy to a deterministic `reports/<card-slug>.md`; the card slug is unique per batch.
- [The contract test reads a moved change directory] → Read skill text only; validate the spec with `openspec validate` before and after archive.
- [The auto-open gate is inferred from judgment] → The recorded `Trigger` field is the only input.

## Review Record

### Round 1 (rejected) — proxy findings and resolutions

The first review record was rejected by the fresh-context proxy for six blocking design defects. Each is resolved here; the amended design and delta spec are re-presented at the same checkpoint.

- **B1 — the contract test targeted the delta spec, which moves at archive.** Resolution: the new contract test reads `SKILL.md` and `reference.md` only and never reads `openspec/changes/<this-change>/`; the spec is covered by `openspec validate --strict` before and after archive. The test decision above states this.
- **B2 — the auto-open gate consumed judgment.** Resolution: the first progress entry records `Trigger: interactive | scheduled` from the actual trigger; the dispatcher auto-opens only when it is `interactive`, while an explicit view request is separate. The delta spec requires the field; the plan updates the progress template and the contract test.
- **B3 — the entry-page link rule was unsatisfiable for failed or zero-done cards.** Resolution: the entry page links each done card's review/evidence pages and annotates any missing target as unavailable for any batch; failed-card and zero-done scenarios are added.
- **B4 — the no-diff state could hide uncommitted work.** Resolution: a clean tree (`git status --porcelain` empty) is a precondition; a dirty tree commits or fails; merge-base failure is `MR: failed`; the skipped state records both outputs.
- **B5 — the link-scheme allowlist had no normalization.** Resolution: normalize before checking; reject `//host`, `file:`, backslashes, and obfuscated schemes; tests cover `//host`, `JaVaScRiPt:`, `java\tscript:`, and `file:`.
- **B6 — "ignored status" was factually false.** Resolution: the contract now says generated HTML is not committed and delivery stages only the allowed paths; verification shows the diff excludes `.goal-driven/`.
- Folded non-blocking items: table pipe splitting is specified; report filenames are deterministic (`reports/<card-slug>.md`); delivery failure and bounce map to `failed`, scope changes to `conflict pending confirmation`; the opener resolves by platform with a print-path failure; determinism replaces "idempotent"; the engine-report copy change is surfaced; the description stays untouched.

### Round 2 (rejected) — proxy findings and resolutions

Round 2 rejected the amendments for semantic contradictions; each is resolved here.

- **B2 open gate still contradictory.** Resolution: `Trigger` gates only the automatic handback; an explicit view request opens regardless of the trigger and is itself the presence input. The progress template gains a batch header line `- Trigger: interactive | scheduled`, not a per-task column. Scenarios updated.
- **B2 on-demand vs trigger-only.** Resolution: automatic handback is conditional on `Trigger: interactive`; explicit requests are always allowed; the unattended scenario says "does not auto-open", not "never opens".
- **B2 progress-template claim false.** Resolution: the template gains the header line; the plan and contract test update it; it is not a per-task column.
- **B3 entry-page scenario singular.** Resolution: the scenario now says "for each done card, that card's review page and evidence page"; the proposal is aligned.
- **B3 skipped-card report unsatisfiable.** Resolution: failed cards (executed, report exists) link the report; `skipped (covered)` cards (not executed) annotate report/review/evidence unavailable.
- **B4 clean-tree precondition vs local artifacts.** Resolution: the scoped status command excludes `.goal-driven` and `.explain-clearly`; the child commits first; the order is stated.
- **B4 skipped-state output format.** Resolution: all occurrences use `<status output>; <diff output>`.
- **G3 verification template field missing.** Resolution: each executed card's verification section records the card's HTML view path; a scenario and contract-test assertion are added.
- Folded residuals: leading `/` rejected; "no external link" clarified as external stylesheet/script/font/image/`@import` (content anchors allowed); the spec staging rule is generic and the concrete list stays in the plan; the proposal uses per-done-card wording; validate scope is change-before-archive and `goal-queue`-after.

### Round 3 (rejected) — proxy findings and resolutions

Round 3 verified all eight round-2 blocking findings as resolved and raised two bounded defects (N1/N2). Both are fixed here; the automatic three-round cap has been reached, so the run pauses for the human's decision before a further re-review.

- **N1 — iron-rule-9 sync gap.** The delta added the card HTML view path and MR URL to the verification document, but the main-spec requirement `执行后人工逐卡核对与独立核对文档` still enumerated the older field set. Resolution: a second MODIFIED requirement is added to the delta with both fields in the requirement bullet and the `批次收尾生成独立核对文档` scenario.
- **N2 — test layer omissions.** The design did not name the self-containment assertion or the packaging-fixture/link-resolution check from G2/G3, and the plan did not carry the G4 real-open evidence. Resolution: the test layer now names the self-containment assertion and the packaging fixture; the plan carries the G3 fixture and G4 real-open/scheduled-path evidence.

### Round 4 (approved)

The human authorized one additional bounded re-review. The fresh-context proxy approved: N1 and N2 verified resolved, no new blocking contradiction, and both strict validations exit 0. Non-blocking nits deferred to implementation: the design's leading-`/` parenthetical, the MR value for an executed-but-failed card that never attempted delivery, the duplicated `Trigger` rule, and one "may" vs "SHALL" wording. No implementation had started at this checkpoint.

### Prior review axes (to be re-confirmed in a further review)

- Solution review: reversibility two-way door; core and strategic dimensions pass with the mitigations above.
- Code design review: full + security; testability, modularity, reliability, dependency direction, coupling, cohesion, change amplification, tech debt, complexity, and Demeter pass; OWASP pass with the normalized scheme allowlist and path containment.
- Spec axis: proposal/delta coverage passes; the B1–B6 amendments are reflected in the spec. A second all-✅ record without these findings would not be acceptable evidence.

## Migration Plan

No backfill. Batches that predate this capability keep their files; an on-demand view links only to existing targets. Rollback is reverting the skill text, the renderer, and the tests. Generated views and queue artifacts stay local under `.goal-driven/` and are not committed.

## Open Questions

None.
