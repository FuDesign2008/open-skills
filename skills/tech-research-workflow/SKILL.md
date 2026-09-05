---
name: tech-research-workflow
version: "1.0.0"
user-invocable: true
description: "End-to-end technology and competitor research workflow that turns a design-shaping question into a decision-ready, evidence-bound report family: self business audit (asset/hazard inventory with file:line), competitor first-hand runtime testing (five-step evidence method, evolution curves, same-track incident search), three-tier design mapping (copy / copy-the-idea / explicitly-not-copy), reflux loop (first version as constraint probe), layered reports, plus a lean path for single-question research. Triggers — 「技术调研」「竞品调研」「竞品分析」「技术调研报告」「调研报告」「竞品实测」 / tech research workflow, competitor research, competitive analysis, technology research report. Do NOT use for single-question web lookup without design output (use research / effective-web-research), known-bug upstream research routing (known-issue-research), or rewriting an existing design doc into a review doc (tech-review-doc)."
dependencies:
  - effective-web-research
---

# Tech Research Workflow

> Evidence-driven technology and competitor research that ends in a decision-ready report family, not a pile of links. Use when the question is design-shaping — "should we support X, and how" — and the answer must survive a technical review.

> **Prerequisite check**: this skill declares `effective-web-research` in frontmatter `dependencies`. On load, verify it is available; if missing, abort and print the install command (`npx skills add FuDesign2008/open-skills -g`). No silent fallback — every external search in this workflow runs under that skill's discipline.

## Core principle

A design is a function of two inputs: **your own business × competitor first-hand evidence**.

- Trends and articles answer "should we care about this" — they are the backdrop, never the design input.
- Competitors who shipped the feature already paid the tuition in production: their pits, costs, and incident reports are free intelligence. Only they answer "how, and what does it cost".
- First-hand evidence beats second-hand narrative at every layer: run the shipped feature yourself, read your own code with `file:line` in hand, and treat every article as a lead to verify.

The order is load-bearing: audit yourself first, research competitors second, design third. Skipping ahead to design is the classic failure mode of this genre — a trend piece arrives, the agent slides straight into solutioning, and the review surfaces wrong assumptions about scope, stance, and constraints that a one-day audit would have caught.

## Scope and path selection

| Research kind | Example | Path |
|---|---|---|
| Design-shaping research | "Should our multi-platform note product support embedding third-party HTML content? Import, render, share, all ends" | Full staged flow (below) |
| Single bounded question | "Does Competitor A's preview isolate third-party content from the host page?" | Lean path |

When the ask is a single question with no design deliverable, route to the lean path — running the full flow on it is process overkill, the same way a spike is wasted on garden-variety uncertainty. When in doubt, ask which decision the research must feed.

## Stage 0: Intake

Establish before any research:

- The question and the **decision it feeds** (a research report with no decision attached has no acceptance bar).
- The audience and reviewer (who pushes back, on what).
- Research kind → path selection (table above).
- Access inventory: which competitor features are reachable for first-hand testing; which need the user's cooperation (accounts, login state, paid seats) — request that cooperation early, it gates step 2.

## Step 1: Understand your own business

The step only the requester's side can do, and the cheapest place to be wrong.

1. **Business positioning** — who produces the content/capability, who consumes it, on which surfaces. This shapes every later trade-off.
2. **Constraints** — decision-maker principles (e.g. security posture: align with the platform's watermark, or defend beyond it), scope boundaries written as **goals and non-goals** (non-goals are plausible things deliberately excluded, e.g. "multi-file packages are out of scope for v1"), resources and timeline.
3. **Engineering inventory — assets and hazards**, both pinned with `file:line`:
   - **Assets**: existing precedent the design can reuse (a privileged protocol already registered, an established preview pipeline, a type-mapping table to extend).
   - **Hazards**: existing risky patterns that become hard constraints (a long-lived security switch that weakens sandbox semantics; a WebView family running with elevated access flags — any new preview surface must assume that environment, not the ideal one).

Record the inventory as a table (template in [reference.md](reference.md)). Assets answer "what can we copy from ourselves"; hazards answer "what constraints the design must survive". A design is only "ready to implement" when its hard constraints trace to this table — anything else is an assumption to verify, labeled as such.

## Step 2: Learn from competitors

Research shipped, running features — not press releases. Announcements and articles are lead-generation; runtime evidence is the source.

### 2.1 Runtime forensics on shipped features

The five-step evidence method (worked example in [reference.md](reference.md)):

1. **Structure extraction** — inspect the live DOM/container: sandbox attributes, referrer policy, framing structure (outer guard frame vs inner content frame).
2. **Resource supply analysis** — where does the content URL come from: presigned URLs and their parameters, response-content disposition/type hints, expiry windows, which endpoint shape serves preview vs download.
3. **Response probing** — issue the actual requests and record status, headers, content shape per endpoint. Parameterized dual shapes (same storage object, different disposition by endpoint) are frequent high-value finds.
4. **Runtime isolation probes** — from the host page, attempt the cross-frame accesses an attacker would attempt (`contentDocument`, cookie reads, origin inspection); record opaque-origin behavior as positive evidence of isolation.
5. **Code/network view** — find the source-view surface and watch the network panel: does content ever land on a URL, or flow through messaging without a fetchable address? Both patterns are legitimate designs with different bypass surfaces.

When a runtime probe contradicts a vendor article, the probe wins; record the discrepancy.

First-hand runtime testing is an **intent**, platform-neutral by construction: operate a real browser session carrying the user's login state, via whatever browser capability the running agent natively provides (interactive browser tooling, scripted automation, or cooperative testing with the user driving and the agent reading state). What matters is that a real shipped system was observed, not simulated from documentation.

### 2.2 Evolution-curve positioning

For each mechanism the competitors use, find its history: the migration sequence from the old risk-bearing mechanism through intermediates to the current standard (official migration guides, deprecation notes, major-version changelogs). Then classify:

- **End-state**: where the ecosystem converged. Sets the floor for a new design — designing below it borrows deprecated risk.
- **Transitional**: a step the competitor shipped to escape a legacy hazard. Copying it wholesale imports a design that exists only to leave.

The curve also tells you which of your own legacy patterns the industry already abandoned — that is the strongest argument available in a design review.

### 2.3 Same-track incident search

Products in your category have public incident records: CVEs, security advisories, postmortems. They are the most honest risk list in existence — real attacks on real designs like the one you are about to copy. Extract per incident: the affected component, the root cause, and **the user path that was exploited**. The exploited path is frequently not the container everyone hardens (rendering) but an adjacent path nobody watches (link clicks, navigation, import). Every incident found this way becomes a must-test item in the review agenda; several become hard constraints.

### 2.4 Implementer interviews

When someone who built the competitor feature is reachable (colleague, community, former teammate), a short interview is the highest-bandwidth evidence available: confirm the observed mechanism, then ask what they would do differently. Treat the interview as evidence tier "first-hand testimony", and still verify load-bearing claims against the runtime.

All external searching in this step (and throughout the workflow) follows `effective-web-research`: its Step 0 triage, then the four maxims — authority-first, currency check, cross-validate non-trivial claims, skip content farms; strict mode with a source-evaluation report when the user demands rigor. Read that skill's current doc before searching, never from memory.

## Step 3: Design mapping

Map every examined competitor design element onto your constraints. Three tiers, every element classified, none left floating:

| Tier | Meaning | When it fits |
|---|---|---|
| **Copy** | Adopt as-is | The mechanism is cheap, proven, and matches your constraints (e.g. a dual-shape endpoint whose default is the safe disposition — near-zero marginal cost) |
| **Copy-the-idea** | Adopt the concept, adapt the implementation, keep an upgrade path | The architecture is right but sized for a different posture (e.g. a guard pipeline worth blueprinting for the day your security floor rises) |
| **Explicitly-not-copy** | Reject, with the reason on record | It conflicts with your business stance or constraints (e.g. a clipboard-control mechanism that contradicts your product's openness position) |

Each mapping entry states **recommendation + rationale + alternative** — the alternative matters because a review that can only say yes is not a review. Every choice is the function `competitor form × own constraint`; an entry that cites no constraint from step 1 is a guess wearing a decision's clothes.

## Reflux: the first version is a constraint probe

Write the first report version fast and treat it as a probe whose job is to surface real constraints. **Expect at least one pushback** from review — a scope you mis-assumed, a stance the decision-maker corrects, a competitor blind spot. The probe succeeded when the pushback names a constraint you can trace.

When pushback arrives, route it to the step whose assumption failed:

- Business misread (scope, stance, priorities) → re-open step 1, re-run the minimal audit, record what changed.
- Competitor blind spot (mechanism you missed, incident you didn't find) → re-open step 2 with the new lead.

Patching only the report text while the underlying assumption stays wrong guarantees the same pushback at implementation time, when it costs more. Early reflux is cheap — a same-week rewrite after pushback costs a day; the same discovery after implementation costs the iteration. This is double-loop learning: correct the assumption, not just the action (e.g. "security = comprehensive defense" → "security = aligned with the platform's watermark, lighter elsewhere").

## Evidence standards

Binding for the full flow and the lean path alike:

| Tier | What it is | Citation form |
|---|---|---|
| E1 first-hand runtime | You observed the shipped system behave this way | Observation steps + captured values, re-runnable |
| E2 first-hand code | You read the code | `file:line` in the repo concerned |
| E3 second-hand | Articles, docs, advisories | Link + publication/update date |

- **First-hand > second-hand** wherever they conflict; state the conflict rather than silently picking one.
- **Every non-trivial claim carries a tier tag.** A report whose claims are all E3 is a literature survey, not research.
- **Reproducible-evidence section**: the report family includes, for each key claim, the evidence tier, location, and how to reproduce the observation (steps, command, or click-path). Reviewers re-run probes; reviews get shorter and angrier when they can.

## End-to-end staged flow

1. **Intake** — question, decision, audience, access inventory, path selection.
2. **Self audit** — positioning, goals/non-goals, asset/hazard inventory with `file:line`.
3. **Competitor research** — runtime forensics (five-step), evolution curves, same-track incidents, interviews as available; second-hand as leads.
4. **Design mapping** — three tiers, every element classified, recommendation + rationale + alternative.
5. **Report family** — assemble the layers (below); evidence standards applied throughout.
6. **Review reflux** — first version as probe; route pushback to the failed step; iterate until the review's corrections are cosmetic.

## Lean path: single-question research

1. **Scope the question** — one bounded question, the decision it feeds, and the acceptance bar for "answered".
2. **One targeted first-hand check** — the smallest probe that answers it (usually steps 1–4 of the five-step method on a single surface, or one `file:line` reading of your own code).
3. **One-page answer** — the answer, its evidence citation (tier-tagged), what was not checked, and the follow-up question if the answer raises one.

The lean path keeps the evidence standards and drops the report family, design mapping, and reflux loop.

## Report family

Layered by reader, one depth per layer (templates and a worked example in [reference.md](reference.md)):

| Layer | Carries | Reader |
|---|---|---|
| Architecture/decision main doc | The design, trade-offs, alternatives considered | Reviewers, future maintainers |
| Per-area detail docs | Implementation-level specifics per end/subsystem | Implementers |
| Evidence compendium | Full forensic records, reproducible-evidence sections | Anyone who challenges a claim |
| Summary layer | Findings digest | Stakeholders who won't read the main doc |
| One-page decision memo | Decisions requested, each with rationale | The decision-maker |
| Review agenda | Items classified: **A decisions needing approval / B confirmations / C must-test items** | The review meeting |

The review-agenda classification keeps approvals, assumptions-to-confirm, and verification obligations from blurring into one list nobody actions. Document-pipeline mechanics (source format, conversion to the team's doc platform, test-sample design for verification items) are guidance in [reference.md](reference.md), not part of the distributed flow.

## Pitfalls (non-obvious only)

- **The trend-slide**: a trend article arrives, feels like enough, and the design starts before steps 1–2. The tell: you cannot name the file:line or runtime observation your constraint came from. Return to stage 0's path check.
- **Transitional-state copying**: a competitor mechanism that exists to migrate away from a legacy hazard reads as "mature" unless you pull the evolution curve. Curve first, verdict second.
- **Hardened-container blind spot**: same-track incidents cluster on the paths nobody hardens (navigation, links, import), not the container everyone watches. Let the incident record, not intuition, pick your must-test items.
- **Probe-less probe**: an "observation" that cannot be re-run by a reader is a belief. The reproducible-evidence section is what separates research from advocacy.
