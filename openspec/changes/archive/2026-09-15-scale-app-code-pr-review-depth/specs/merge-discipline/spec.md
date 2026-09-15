## MODIFIED Requirements

### Requirement: Part R SHALL resolve pr-review-gate preference before review depth

Before loading `pr-code-review`, Part R MUST resolve `pr-review-gate:` from `AGENTS.md` then `CLAUDE.md` (first match wins). Allowed values: `always`, `never`, `ask`, `non-code-light`, `auto`. If unset, Part R MUST treat the preference as `auto` (content-matched depth: surface classification plus the size/risk ladder). Preference `always` MUST still mean blanket `depth=full`. Preference `never` and `ask` keep their skip / user-choice behavior.

#### Scenario: Unset preference means auto ladder

- **WHEN** neither `AGENTS.md` nor `CLAUDE.md` declares `pr-review-gate:`
- **THEN** Part R treats the preference as `auto` and selects `depth=full` or `depth=light` from the size/risk ladder (not blanket full solely from unset)

#### Scenario: never skips with 留痕

- **WHEN** preference is `never`
- **THEN** Part R writes project-preference skip 留痕 and proceeds to Part D without invoking `pr-code-review`

#### Scenario: ask requires user choice

- **WHEN** preference is `ask`
- **THEN** Part R asks whether to run full, light, or skip for this merge; MUST NOT auto-pick; skip requires user-explicit skip 留痕

#### Scenario: always remains blanket full

- **WHEN** preference is `always` and the PR is a small application-code diff with no escalation hits
- **THEN** Part R still invokes `pr-code-review` at `depth=full`

### Requirement: non-code-light preference SHALL use light review on non-application-code surfaces

When preference is `non-code-light` and the surface is non-application-code, Part R MUST invoke `pr-code-review` with `depth=light`, still applying dual-axis ≥80 Critical/Important clearance. When preference is `non-code-light` and the surface is application-code, Part R MUST select depth from the same size/risk ladder used by `auto` (MUST NOT force `full` solely because the surface is application-code). When preference is `always`, Part R MUST use `depth=full` regardless of surface.

#### Scenario: non-code-light on docs/skills PR

- **WHEN** preference is `non-code-light` and surface is non-application-code
- **THEN** Part R runs `pr-code-review` at light depth, then proceeds to Part D on pass

#### Scenario: non-code-light on small low-risk application-code PR

- **WHEN** preference is `non-code-light`, surface is application-code, and the size/risk ladder has no escalation hit
- **THEN** Part R runs `pr-code-review` at light depth (dual-axis clearance unchanged)

#### Scenario: non-code-light on escalated application-code PR

- **WHEN** preference is `non-code-light`, surface is application-code, and any size/risk escalation hits
- **THEN** Part R runs `pr-code-review` at full depth

## ADDED Requirements

### Requirement: Part R SHALL select application-code review depth from a size/risk ladder

When preference is `auto`, unset (treated as `auto`), or `non-code-light` on an application-code surface, Part R MUST choose `pr-code-review` depth as follows. Any single escalation hit MUST force `depth=full`. With no hit, Part R MUST use `depth=light`. Part R MUST NOT skip `pr-code-review` solely because the application-code diff is small. Light depth MUST NOT weaken dual-axis ≥80 Critical/Important clearance. Escalation signals and the sensitive-path / keyword table MUST live in `merge-discipline/reference.md` as repo-tunable constants (same home as the 400-line / 20-file thresholds). Signals MUST include at least: three-dot changed lines above the line threshold or changed files above the file threshold; breaking-change keywords in PR title / description / commit messages; a prior Part R fail on this tip re-presented after fixes; and a match against the sensitive-path or sensitive-keyword table (so a one-line change on an auth/crypto/session/permission/payment path still gets `full`).

#### Scenario: Small low-risk application-code uses light

- **WHEN** preference is `auto`, the three-dot diff is application-code, changed lines and files are at or below the reference thresholds, and no breaking, re-entry, or sensitive-path/keyword signal hits
- **THEN** Part R invokes `pr-code-review` with `depth=light`

#### Scenario: Large application-code uses full

- **WHEN** preference is `auto`, surface is application-code, and changed lines exceed the reference line threshold (or changed files exceed the file threshold)
- **THEN** Part R invokes `pr-code-review` with `depth=full`

#### Scenario: One-line sensitive path uses full

- **WHEN** preference is `auto` or `non-code-light`, the diff is a small application-code change, and a changed path or keyword matches the sensitive table in `merge-discipline/reference.md`
- **THEN** Part R invokes `pr-code-review` with `depth=full`

#### Scenario: Small application-code is still reviewed

- **WHEN** the size/risk ladder selects `light` for application-code
- **THEN** Part R still loads `pr-code-review` and still applies the ≥80 Critical/Important pass gate
