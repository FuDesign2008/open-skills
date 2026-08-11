## Context

open-skills has no installable Figma pixel-fidelity skills. Official/plugin `figma-design-to-code` and curated implement-design skills improve context retrieval but leave a completion gap: agents can call MCP, export assets, then still ship CSS `mask` / theme-convenience pipelines that fail visual QA (see `docs/figma-pixel-fidelity-mask-incident.md` and `docs/figma-pixel-fidelity-research.md`). Adjacent gates: `design-approval-gate` (pre-impl approval) does not cover post-impl measured parity.

This change adds two Markdown skills under `skills/`, with OpenSpec capability `figma-pixel-fidelity`. Authoring must follow project iron rules (English body, Chinese triggers, description ≤1024, platform-agnostic tool intent, deidentification).

## Goals / Non-Goals

**Goals:**

- Ship `figma-pixel-implement` and `figma-pixel-verify` as user-invocable skills.
- Enforce export-faithful assets (including CSS mask ban), design-spec tables, and measured verification with honest degradation.
- Keep hosts (`solve-workflow` / `opsx-solve-workflow`) opt-in—no new mandatory frontmatter dependencies.

**Non-Goals:**

- Replacing or forking Cursor/Figma `figma-design-to-code`.
- Bundling verity CLI or a specific Playwright MCP as a hard dependency in v1.
- Hardcoding stdio `FIGMA_API_KEY` install blocks as the only MCP setup path.
- Auto-wiring these skills into every PDCA run.

## Decisions

1. **Two skills, one capability**  
   - **Why**: Implement must not claim “aligned”; verify owns pass/fail—matches industry extract/verify split and closes Hub-style single-skill false positives.  
   - **Alternatives**: Single combined skill (rejected—repeats Hub failure mode); thin wrapper over community extract/verify only (rejected—less control over mask ban / deid / triggers).

2. **Capability id `figma-pixel-fidelity`**  
   - **Why**: One behavioral contract covering both skills and boundaries; avoids duplicating near-identical requirements across two specs.  
   - **Alternative**: Two capabilities (rejected for v1—extra archive noise; can split later if needed).

3. **Platform-agnostic tool intent**  
   - **Why**: Iron law 6; Figma MCP / browser eval differ by client. Skills describe outcomes; agents pick tools.  
   - **Alternative**: Mandate one MCP server name (rejected).

4. **Spec table as the implement↔verify contract**  
   - **Why**: Research consensus—screenshots are visual reference; variables/metadata drive numbers.  
   - **Alternative**: Screenshot-only QA (rejected—incident + community evidence).

5. **Optional `reference.md` (+ light scripts later)**  
   - **Why**: Keep SKILL.md lean; put checklists, verdict taxonomy, measurement examples in reference. v1 may ship without runnable scripts if prose is enough.  
   - **Alternative**: Mandatory Node scripts in skill package (defer unless needed for eval).

6. **Authoring path**  
   - **Why**: Use `/skill-creator` discipline for drafts/evals where practical; content must satisfy AGENTS.md skill checklist and `lint:skill-description` / deid gates.  
   - **Alternative**: Hand-write only (allowed for lean maintenance, but this is a new pair—prefer creator workflow).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Agents skip verify and claim done | Spec/requirement: implement MUST NOT claim pixel complete; verify owns pass language |
| No JS-eval channel | Verify MUST record residuals; no full numeric PASS |
| Figma MCP rate limits (esp. View/Collab 6/mo) | Prefer local measurement; batch context; document quota in reference |
| Description/trigger bloat | Soft target ≤950 chars; triggers Chinese+English; details in body/reference |
| Drift from official design-to-code | Explicit prerequisite load; do not duplicate full official workflow prose |
| Internal Hub copy-paste leaking identifiers | Write from research §2.8 abstractions only; run deid lint on staged files |

## Migration Plan

1. Land skills + regenerate `docs/generated/skills-index.md`.  
2. Cross-link research/incident “next steps” to the new skill ids.  
3. No runtime migration; consumers install via existing `npx skills` / plugin paths.  
4. Rollback: remove skill directories and revert index (two-way door).

## Open Questions

- Whether v1 includes a tiny `scripts/` measurement snippet or prose-only (default: prose-only unless eval needs a fixture).  
- Exact Chinese trigger set final wording (draft in tasks; refine via skill-creator description pass).
