## Why

The perf optimization paradigm proven across two real campaigns (native C++ toolchain: 29.4s→6.7s, -77%; large web rich-text editor: -27%/-31%/-34% plus a multi-year user-jank attribution) had no home in this repo: `perf-workflow` carried only a generic analysis flow (no benchmark harness contract, no evidence-validity gate, no A/B statistical judge, no iteration discipline), and `frontend-perf` was a knowledge layer with no host after the flow replacement. Sedimenting the paradigm into skills makes it reusable across projects and stacks.

## What Changes

- Create `skills/perf-optimize-workflow/` (`user-invocable: true`) via `/skill-creator`: paradigm SKILL.md (benchmark → evidence-gated attribution → one-target-per-iteration optimization → A/B cross-run judge → benchmark-log sediment, optional unattended loop) + `reference.md` knowledge layer integrating the former `frontend-perf` content (frontend chapter, stage keys remounted, extension slots for other stacks)
- Create `skills/perf-evidence-discipline/` (`user-invocable: false`): nine evidence-validity disciplines (environment-throttling artifacts / monitor self-pollution / framework counter ambiguity / device-profile throttle matrix / input authenticity / toggle lifecycle / single-sample extrapolation ban / ultimate control experiment / negative-result logging), mounted as pre-gate by the host at four stages; `dependencies` direction: host → discipline (host declares; discipline declares nothing)
- Delete `skills/perf-workflow/` and `skills/frontend-perf/` (hard cut, no alias); all trigger words migrate to `perf-optimize-workflow`
- Re-point active references: `commands/perf.md`, `AGENTS.md` (skill inventory ×3 lines), `solve-workflow`/`write-workflow`/`known-issue-research`/`browser-debug-toolkit` ×2 boundary mentions, `docs/SKILL_DISTRIBUTION.md`; `RELEASE-NOTES.md` gains a 2.0.0 BREAKING entry with migration guidance
- **Non-goals**: knowledge refresh (React 20 / newer Electron tables — separate follow-up); filling non-frontend knowledge chapters (slots stay empty); touching historical eval workspaces or archived openspec changes

## Capabilities

### New Capabilities

- `perf-optimize-workflow`: paradigm host — six stages with benchmark harness contract, A/B cross-run statistical judge (`avg_B − avg_A > max(stdev_B, stdev_A)` on interleaved B₁A₁B₂A₂B₃A₃ runs), benchmark-log contract (append-only rows + invalidation warnings), unattended-loop integration point
- `perf-evidence-discipline`: evidence-validity hard gate — nine disciplines with detection methods and anonymized case archive; gate rule: unresolved trap class ⇒ metric is trend-only, never decision-grade

### Modified Capabilities

- (replacement, not modification) `perf-workflow` and `frontend-perf` capabilities are superseded by the two above; trigger surface preserved

## Impact

- New: `skills/perf-optimize-workflow/{SKILL.md,reference.md}`, `skills/perf-evidence-discipline/{SKILL.md,reference.md}`
- Deleted: `skills/perf-workflow/`, `skills/frontend-perf/`
- Modified: `commands/perf.md`, `AGENTS.md`, `skills/solve-workflow/SKILL.md`, `skills/write-workflow/SKILL.md`, `skills/known-issue-research/SKILL.md`, `skills/browser-debug-toolkit/{SKILL.md,reference.md}`, `docs/SKILL_DISTRIBUTION.md`, `RELEASE-NOTES.md`
- Regenerated: `docs/generated/skills-index.md`
- Version: BREAKING CHANGE (published skill removals) → MAJOR (2.0.0); downstream consumers referencing old names must migrate (guidance in RELEASE-NOTES)
- Residual risk: external consumers referencing removed names by string (accepted, mitigated by release notes); trigger-routing regression (mitigated by trigger eval + full trigger inheritance)
