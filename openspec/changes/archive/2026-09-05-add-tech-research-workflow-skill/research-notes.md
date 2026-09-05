# External research notes — pre-authoring survey (frozen decision T2 addendum)

- Date: 2026-09-05
- Discipline: `effective-web-research` default mode (4 maxims: authority-first, currency check, cross-validate, skip content farms). Not strict mode — no explicit rigor demand on this survey; findings below carry source + date so they can be re-verified.
- Purpose: before authoring the skill body, survey (a) industry tech-research methodology and (b) comparable agent "research" skills, then reflect every finding in the design as adopted / adapted / explicitly-not-adopted (itemized table at the end).

## RQ1: How does the industry structure technical research before design/implementation?

### 1. Agile spike — time-boxed research to reduce excess uncertainty
Source: Mountain Goat Software (Mike Cohn), "Agile Spikes Deliver Knowledge So Teams Can Deliver Products", page updated 2024-08-06. https://www.mountaingoatsoftware.com/agile/what-are-agile-spikes (corroborated by Agile Alliance collateral).

Key points: a spike is a time-boxed research activity whose deliverable is **knowledge for a decision**, not a capability; the investment is fixed and after the box a decision is made (which may be "invest more"); spikes are for *excess* uncertainty only and overuse is a named failure mode.

### 2. Design docs at Google — trade-off-centric pre-implementation documents
Source: Malte Ubl (then-Google Distinguished Engineer), "Design Docs at Google", 2020-07-06. https://www.industrialempathy.com/posts/design-docs-at-google/

Key points: structure = context & scope → **goals and non-goals** → actual design (the place to write down trade-offs) → **alternatives considered** → cross-cutting concerns; lifecycle = creation & rapid iteration → **review (may be multiple rounds)** → implementation & iteration (update the doc when reality collides) → maintenance & learning; a **1–3 page "mini design doc"** is explicitly endorsed for smaller problems; "I tried it out and it works" is one of the best arguments for choosing a design.

### 3. RFC (Request for Comments) process — proposal before lock-in, feedback rounds, then implement
Sources: Storybook RFC process docs (storybook.js.org/docs/contribute/RFC); Attentive Engineering, "A Pragmatic RFC Process" (tech.attentive.com); Increment, "Planning for Change with RFCs"; LSST developer guide decision process. Cross-validated: all four describe propose → gather feedback from a wider audience → reach consensus → implement right after the RFC closes; named failure modes: starting too early (no concrete shape), too late (details locked), or never closing the feedback window.

### 4. Thoughtworks Technology Radar — staged adoption decisions with explicit rationale
Source: Thoughtworks Radar FAQ (official) + Technology Radar Vol. 33 PDF (2025-11). https://www.thoughtworks.com/en-us/radar/faq

Key points: four rings Hold / Assess / Trial / Adopt; every ring assignment is a decision that must carry explicit rationale; the radar exists because raw technology listing without disposition is not actionable.

### 5. Competitive teardown analysis — systematic disassembly as intelligence
Sources: TechInsights "Competitive Benchmarking Through Teardown Analysis"; Umbrex product-teardown framework page. Hardware-rooted practice: physically disassemble a competitor product to recover design/cost/strategy decisions the vendor will not tell you.

## RQ2: What comparable agent "research" skills exist, and what do they cover?

### 1. Official Anthropic skills catalog
Source: github.com/anthropics/skills + platform.claude.com Agent Skills docs, checked 2026-09-05. Official catalog centers on document processing (pptx/xlsx/docx/pdf), artifacts, and brand/design tooling. No general "technology research → decision report" methodology skill found in the official catalog (verification date stated per repo AI 铁律 8).

### 2. Community "deep-research" skills
GitHub survey 2026-09-05 (grep.app over SKILL.md files): runx `deep-research` worker (notable disciplines: "material claims bound to source evidence"; harness case "stops-before-drafting-without-sources"), PromptHub skill-registry entry, NVIDIA nemoclaw-community deep-research-worker recipe, paperclip template ("Fan out, verify, synthesize"). Common shape: decompose question → fan out searches → verify → synthesize a cited knowledge report. LangChain deep-research docs (docs.langchain.com) describe the same plan → delegate sub-agents → synthesize pattern.

### 3. Domain-vertical research skills
SEO forensic / audit skills (sickn33/agentic-awesome-skills `seo-forensic-incident-response`, several `seo-audit` clones) run competitor comparison, but as a fixed SEO checklist, not a reusable research methodology.

### 4. Academic-research agent skills
orchestra-research/AI-research-SKILLs — literature survey → idea generation → experiment execution → paper writing. Different domain; stage division (survey → experiment → write) parallels our three-step model.

### 5. In-repo neighbors (authoritative, local)
- `known-issue-research` — external-research routing for **confirmed code problems** inside bug-fix workflows; symptom-triggered.
- Global third-party `research` skill — investigates a question against high-trust sources, saves a findings markdown; single-question, no competitor-runtime-testing or design-mapping stage.
- `tech-review-doc` — turns an **already-written** technical design doc into a product/QA-readable review; downstream of research.
- `write-workflow` / `solve-workflow` — document-writing host / code-change PDCA host respectively.

## Design disposition — every finding reflected (adopted / adapted / explicitly-not-adopted)

| # | Finding (source, date) | Disposition in `tech-research-workflow` |
|---|---|---|
| 1 | Spike = fixed budget, decision output, excess-uncertainty-only (MGS 2024) | **Adapted** — tailoring path: small single-question research runs a lean flow (scope one question → targeted first-hand check → one-page answer); full flow reserved for design-shaping research, guarding against spike overuse |
| 2 | Goals **and non-goals** section (Google design docs 2020) | **Adopted** — self business audit requires explicit non-goals (what was deliberately excluded), not just goals |
| 3 | "Alternatives considered" is the most important section (Google 2020) | **Adopted** — every design-mapping entry gives recommendation + rationale + alternative |
| 4 | Mini design doc 1–3 pages for smaller problems (Google 2020) | **Adopted** — layered report family includes a one-page decision summary; tailoring path drops to a single answer doc |
| 5 | Review may be multiple rounds; update doc when reality collides (Google 2020) + RFC feedback rounds before implementation lock-in (Storybook/Attentive/Increment/LSST) | **Adapted** — reflux mechanism: first version treated as a constraint probe, one pushback expected; findings flow back to re-audit assumptions (business misread or competitor blind spot), the earlier the cheaper |
| 6 | Radar rings = disposition classification with mandatory rationale (Thoughtworks 2025-11) | **Adapted** — three-tier design mapping (copy / copy-the-idea / explicitly-not-copy) is the same "no undistributed item" classification genre, applied per competitor-design-element; every tier entry carries its rationale |
| 7 | Teardown = systematic disassembly for intelligence no one will hand you (TechInsights/Umbrex) | **Adapted** — competitor first-hand runtime testing is the digital teardown; the five-step evidence method operationalizes it (DOM/structure → URL/supply → response probes → runtime isolation probes → code/network view) |
| 8 | Deep-research agent pattern: decompose → fan out → verify → synthesize with claims bound to sources (runx/LangChain/community 2026) | **Adapted** — evidence standard adopts claim→evidence binding and "no drafting without evidence"; but the report target differs: engineering decision docs (recommendation/rationale/alternative) rather than knowledge summaries |
| 9 | Official Anthropic catalog has no tech-research methodology skill (checked 2026-09-05) | **Context** — confirms the capability gap this skill fills; restated with verification date wherever asserted |
| 10 | SEO-forensic competitor skills (community) | **Explicitly not adopted** — fixed SEO checklist is domain-bound; we keep the methodology domain-agnostic |
| 11 | Academic-research pipeline (orchestra-research) | **Explicitly not adopted** — literature→experiment→paper stages solve a different problem; no citation-graph machinery in this skill |
| 12 | Case study's own five-step method + evolution curve + same-track incident search | **Primary material** — external survey corroborates ingredients (isolation probes ≈ sandbox security testing; evolution curve ≈ migration-wave/tech-radar reasoning; incident search ≈ postmortem/CVE intelligence) but no single external source prescribes the full method; case stays authoritative |

## Gaps / honest residuals

- No industry-standard "runtime forensics of a competitor feature" methodology doc was found; teardown literature is hardware-rooted, security reverse-engineering literature is adjacent but goal-different. The five-step method remains case-derived with external ingredient-corroboration only.
- Community deep-research skills evolve fast; the 2026-09-05 snapshot is a point-in-time survey, not a longitudinal one.
