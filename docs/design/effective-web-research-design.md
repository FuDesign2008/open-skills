# Design: effective-web-research

> Design spec for the `effective-web-research` skill. Authored via `/solve-workflow` + `/superpowers:brainstorming`, grounded in CRAAP (information literacy) + Google E-E-A-T (web content quality) frameworks.

## Problem

AI agents doing **external web research** don't follow best practices: they cite low-authority blogs over official docs, ignore recency on fast-moving topics, trust single sources for non-trivial claims, and surface content-farm/SEO spam. Anthropic publishes no prescriptive source-credibility rubric for agents — this skill fills that gap.

**Scope boundary**: this skill is about **external web research only**. Internal codebase/docs search (grep, read, LSP, `node_modules`) is out of scope — handled by existing tools.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build vs Reuse | **Build** | `find-skills` confirmed no comparable skill in skills.sh registry (only tool wrappers, domain-specific research, generic templates) |
| Framework anchor | **CRAAP + E-E-A-T merged** | Decades of information-literacy science + the web's dominant quality framework; defensible, not opinionated |
| Activation | **Dual mode** (default implicit + strict explicit) | User's pain is "everyday searches are sloppy" → default mode fixes that; strict mode gives auditable reports when needed |
| Architecture | **Two-tier** (curated default + full strict) | Default = 4 high-leverage maxims (low friction); strict = full 7-dim + report. Avoids over-applying 7-dim check on every casual lookup |
| Naming | **`effective-web-research`** | `effective` = 有效高效; `web` = locks external scope + reinforces Step 0 boundary; `research` = methodology framing (web research is an accepted compound, not overclaiming) |

## Architecture (three-stage pipeline)

```
agent faces an external-research task
        │
        ▼
Step 0: Triage — should this go external at all?
        │
        ├── internal-sufficient → exit, use grep/read/LSP/explore
        ├── external-needed → Default mode (4 maxims auto-apply)
        │       └── (user says "strict/deep research") → Strict mode (7-dim + report)
        └── hybrid (external concept + internal application) → external stage uses default/strict, internal stage uses internal tools
```

### Step 0 — Triage

| Task signal | Path | Skill role |
|-------------|------|-----------|
| Answer likely in repo (our code, AGENTS.md, installed deps) | Internal first (grep/read/LSP/explore); no external search | Not triggered (hint: "check internal first") |
| About third-party lib/framework/API/tool/version behavior | External | Default mode |
| Real-world info (news, market, people, papers) | External | Default mode |
| Hybrid (external concept + "our X" / "apply to our code") | External-then-internal | External stage = default/strict; internal stage = internal tools |

### Default mode — 4 maxims (always-on, no artifact)

1. **Authority-first** — official docs/sites > authoritative secondary (MDN, official blogs, RFC) > reputable community (high-vote SO, official repo issues) > general web. Scan domain first.
2. **Currency check** — for fast-moving topics (frameworks/APIs/security), find publish/update date; >~2yr flag "possibly stale", verify against current version.
3. **Cross-validate** — non-trivial claims (behavior, perf numbers, security, compatibility) need ≥2 independent sources; two sites with near-identical wording ≠ independent (likely copied).
4. **Skip content farms** — recognize & deprioritize aggregators, AI-generated SEO farms, scraped copies, ad-saturated low-quality sites.

**Corollary (citation hygiene)**: when relaying external findings, attach source link + (date) so the user can verify.

### Strict mode — 7-dimension evaluation + report (explicit trigger)

Trigger: 「严格调研」「深度调研」「严格查证」「严谨调研」/ strict research, deep research, fact-check — AND target is external.

**7 dimensions** (CRAAP + E-E-A-T merged; Trust = synthesized verdict, not separate):

1. Authority — who published, standing
2. Expertise — author credentials
3. Experience — first-hand practical evidence
4. Currency — timeliness, version alignment
5. Accuracy — verifiability, citations, cross-confirmation
6. Purpose/Bias — why created, commercial/ideological tilt
7. Relevance — direct fit to the question

Each scored High/Med/Low with concrete criteria (full rubric in `reference.md`). Trust verdict: Trustworthy / Cautious / Unreliable.

**Report template** (full in `reference.md`): topic → per-source 7-dim scores → claim-level synthesis (strong/moderate/disputed) → gaps & next steps.

## File structure

```
skills/effective-web-research/
├── SKILL.md          # Step 0 triage + default 4 maxims + strict mode skeleton + report template pointer
└── reference.md      # Full 7-dim High/Med/Low rubric + complete report template + worked example
commands/
└── effective-web-research.md   # optional shortcut (enters strict mode)
```

SKILL.md kept under ~250 lines (decision logic + maxims + strict skeleton); reference.md holds strict-mode detail. Pure markdown → auto-supports Claude Code / Cursor / OpenCode.

## Non-goals

- Internal codebase search (grep/read/LSP/explore territory)
- Creating/editing documents
- General "how to prompt" advice
- Replacing Anthropic's web search tool mechanics

## Open questions (resolved during build)

- Report output as README vs JSON → v1 markdown only (YAGNI; JSON can come later if automation needs it)
- Whether default mode should emit anything → no, pure behavioral constraint (citation hygiene is a corollary, not an artifact)
