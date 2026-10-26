# Design

## Context

See `proposal.md` — Why. Current `skills/node-version-discipline/SKILL.md` (v1.1.0) lists CI at priority #6 but §7's paste-ready probe stops after `volta`/`engines`, and CI examples emphasize GitHub Actions only. Agents fill the gap with unsafe zsh globs. Scope is dependee-only (no host thin-reference rewrites).

## Goals / Non-Goals

**Goals:**

- Make CI/Docker probing shell-safe and first-class in both the priority table and §7 script
- Encode degenerate-engines and align-before-install / corrupt-install stop behaviors in the skill body
- Add one eval that locks the GitLab-CI false-negative case

**Non-Goals:**

- Shipping a separate `scripts/probe-node-version.sh` as an installable binary
- Secondary clues from `node_modules/*/package.json` engines (deferred)
- Changing `opsx-solve-workflow` / other host SKILL.md thin references
- Persisting Node pins into customer repos as part of this change

## Decisions

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| Probe shape | Inline §7 bash with per-path `[ -f ]` lists; no globs in shared `ls` argv | Matches incident root cause; stays paste-ready inside SKILL.md | Separate script file (S4) — heavier distribute surface |
| CI candidates | Explicit literals: `.gitlab-ci.yml`, `Jenkinsfile`, `Dockerfile`, `Dockerfile.web` (etc. small fixed set) + safe walk of `.github/workflows/*.yml` via `find`/`for` with nullglob or `find` | Covers GitLab incident + common GH Actions; avoids zsh nomatch | Broad `Dockerfile*` in one `ls` — rejected |
| Degenerate engines | Document a small denylist/heuristic (`>=0.8.0` and similarly ancient lower bounds) as non-authoritative continue | Enough for the incident without a full semver oracle | Full range parser — overkill |
| Corrupt install | Explicit §4/SOP row: `Exit handler never called!` ⇒ failed regardless of exit code | Incident evidence; exit-code-only checks lie | Ignore stderr if exit 0 — rejected |
| Hosts | No host edits | Scope A; hosts already depend on this skill | Sync all host prose — out of scope |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Fixed Dockerfile name list misses exotic names | Document that agents MAY add per-path checks for project-specific names; never revive unsafe multi-glob `ls` |
| Degenerate heuristic misses other placeholder engines | Start with known bad patterns; extend via future change if new incidents appear |
| Longer SKILL.md | Prefer surgical edits + one pitfall row; keep §7 as single source for paste-ready probe |
| Eval is prompt-only (not executed CI) | Still documents expected agent behavior for skill-creator / future harness |

## Migration Plan

1. Edit `SKILL.md` and `evals/evals.json` on feature branch in worktree
2. Bump skill `version` patch/minor in frontmatter
3. Archive OpenSpec capability into `openspec/specs/node-version-discipline/`
4. No runtime migration; consumers pick up via next skills install

## Open Questions

None blocking implementation.
