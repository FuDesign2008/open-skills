# Tech Research Workflow — reference

Depth material for `tech-research-workflow`: report-family templates, a worked (de-identified) runtime-forensics example, evolution-curve and incident-search how-to, document-pipeline mechanics, and interview guidance. The SKILL.md carries the methodology; this file carries the shapes.

All examples use generic placeholders (`Competitor A`, `my-project`, `my-desktop-app`); no real product identifiers appear here by design.

## 1. Report family templates

### 1.1 Architecture/decision main doc skeleton

```markdown
# <Feature> support — architecture and decision record
## Context and scope          (objective background, one screen max)
## Goals / Non-goals          (bulleted; non-goals = plausible things deliberately excluded)
## Decision summary           (the design in five sentences)
## Design per area            (per end/subsystem, trade-offs on display)
## Alternatives considered    (each viable alternative + why it lost)
## Cross-cutting concerns     (security / privacy / observability, short sections)
## Traceability               (key constraints → audit inventory entry or competitor evidence ID)
```

The traceability section is the difference between a design and a wish: every hard constraint cites its evidence (`audit: A-3 (my-desktop-app/src/main.ts:411)` or `competitor: CA-2 (evidence compendium §2)`).

### 1.2 One-page decision memo skeleton

```markdown
# Decision memo — <Feature>
| # | Decision requested | Recommendation | Rationale (one line) | Alternative kept warm |
1–5 rows, no more. A sixth row means the decision is actually two decisions; split them.
```

### 1.3 Review agenda skeleton

```markdown
# Review agenda — <Feature>
## A. Decisions needing approval   (each: options, recommendation, cost of being wrong)
## B. Confirmations                (assumptions the reviewer is asked to ratify)
## C. Must-test items              (verification obligations, each tracing to an incident or hazard)
```

A-items end the meeting with a verdict; B-items end it with a signature; C-items walk into the test plan. Mixing the three is how verification obligations get approved instead of executed.

### 1.4 Evidence compendium entry format

```markdown
## Evidence <ID>: <one-line claim>
- Tier: E1 (first-hand runtime) | E2 (first-hand code) | E3 (second-hand)
- Location: observation steps / file:line / link + date
- Reproduce: <exact steps, command, or click-path a reviewer can re-run>
- Observed: <captured values, verbatim where possible>
- Feeds: <design-mapping entry / constraint ID>
```

## 2. Runtime forensics — worked example (de-identified)

Illustrative walk-through of the five-step method on a generic scenario: *Competitor A, a team-doc product, just shipped "upload and preview a standalone HTML file".* Values below are placeholders showing the shape of an observation, not quotes from any real product.

**Step 1 — structure extraction.** Open a live preview of an uploaded `index.html`. Inspect the container: an `<iframe sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer" src="...">` — note the absence of `allow-same-origin` and record the sandbox token list verbatim. Two frames deep? Record both.

**Step 2 — resource supply analysis.** The `src` resolves to a presigned storage URL carrying `response-content-disposition=inline`, `response-content-type=text/html`, and an expiry-window parameter (hour-scale). Record: preview is an explicit opt-in to inline serving, distinct from the default.

**Step 3 — response probing.** Issue the storage GET exactly as the frame does, then find the download endpoint for the same object. Observed shape (placeholder): download endpoint returns `Content-Disposition: attachment` + `application/octet-stream`; preview endpoint returns inline + `text/html`. Same object, parameterized dual shape — the safe disposition is the default, the risky one is opt-in. This single observation often resolves an open question in your own product ("what should our download endpoint do with HTML?") for free.

**Step 4 — runtime isolation probes.** From the host page console: `frame.contentDocument` → `null`; `document.cookie` inside the frame → throws `SecurityError`; frame `origin` → opaque. Cookie/DOM isolation confirmed by observation, not by documentation.

**Step 5 — code/network view.** Locate the source-view surface (a sibling pane, same content, different disposition — or a separate template). Watch the network panel while the preview loads: content fetched from a URL, or delivered via messaging with no fetchable address? A no-URL data flow removes an entire class of bypass (link-sharing the content URL) — worth recording either way.

Each observation becomes an evidence entry (§1.4). The five values above — sandbox tokens, dual-shape endpoints, opaque-origin probes, source-pane mechanics — are the standard yield of one afternoon.

## 3. Evolution-curve positioning — how-to

1. Identify the mechanism class (e.g. "serve local/untrusted content inside an app shell").
2. Collect the sequence: origin mechanism → intermediates → current standard. Sources, in authority order: official migration guides and deprecation notes → major-version changelogs → maintainer statements in issue trackers → secondary retrospectives (leads only).
3. Draw the arc with dates: which hazards forced each hop (e.g. `file://` semantics and mixed-content blocking forcing an https-scheme handler generation).
4. Verdict per arc: **end-state** (ecosystem converged; sets your floor) or **transitional** (exists to escape a legacy hazard; copying imports the escape, not the destination).
5. Check your own inventory against the arc: a legacy pattern of yours the ecosystem already left is a hazard entry (step 1 audit) with the arc as its citation — the strongest kind of review argument.

## 4. Same-track incident search — how-to

1. Query shapes: `<product category> CVE`, `<mechanism class> security advisory`, `<category> XSS RCE postmortem`, filtered to the mechanism you plan to adopt.
2. Extract per incident: affected component, root cause, **the exploited user path** (rendering container? link click? navigation? import flow?).
3. Aggregate: the paths that cluster are your must-test items — independently of how confident you are in the container. A review agenda C-item per cluster, each citing the incident IDs.
4. Re-check after design changes: a new user path introduced by your design (a share link, an export) gets a fresh search before the review.

## 5. Document pipeline mechanics

- **Source of truth in plain markdown**; convert per target platform (team doc space, wiki, rich-text editors) at publishing time. Keep the converter as a small reusable script in the project (`docs/tools/`-style location), full-overwrite publish plus a read-back verification pass — converters drift, read-backs catch it.
- **Test-sample triples** for verification items: a control sample (known-benign content), a probe sample exercising the specific risk (external fetch / remote image / inline script per the concern), and an attribution-isolation sample that differs from the probe by exactly one factor — so a failed test points at the factor, not at the family. Build the self-check list into the samples themselves; environment differences then convert into test results rather than test noise.
- Publish order: main doc → evidence compendium → detail docs → summary → decision memo + review agenda last (they reference everything else).

## 6. Interviewing competitor implementers

When a builder of the shipped feature is reachable:

1. Open with the observed mechanism ("we observed sandboxed non-same-origin framing with presigned inline URLs — is that the whole story?") and let them correct it.
2. Ask for the regret list: what they would do differently, what almost shipped broken.
3. Ask for the incident history: anything that bit them post-launch.
4. Record as E1-testimony with name/date withheld as appropriate; verify load-bearing claims against the runtime before they become constraints.
