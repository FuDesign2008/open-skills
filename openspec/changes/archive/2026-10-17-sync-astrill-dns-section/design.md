## Context

The DNS-residue procedure was sedimented in the source workspace on 2026-08-30 after a field incident: Astrill tunnel-mode `off` left 10.x DNS servers and utun routes registered on the system, and the network stayed degraded until a DHCP lease renew. The public `astrill-control` skill (v1.0.0, ported 2026-08-29) ends its `off` story at the dual probes — it has no guidance for "off confirmed but the network is still bad". Syncing the section closes that gap. The content is generic macOS networking (`scutil` / `route` / `networksetup` / `dscacheutil` / `ipconfig`), so it generalizes cleanly once the project-specific release instance and the sibling-skill preflight-discipline line are stripped (iron law 2).

## Goals / Non-Goals

**Goals:**

- The skill covers the "Astrill off but network stays degraded" case end-to-end: detect (two residue probes), recover (DNS clear + cache flush, escalate to full DHCP renew), hand off when sudo is unavailable non-interactively.
- Probe and recovery commands verbatim from the field-tested source; English body; zero project identifiers.
- All repo gates green (`lint:skill-description`, `lint:deid --base origin/main` no new findings, index regen no-drift, `openspec validate`); delta archived into the main spec.

**Non-Goals:**

- No `scripts/astrill.sh` changes — the source section is manual commands only; the script's behavioral contract is untouched.
- No evals changes — the section is diagnostic guidance for an already-triggered skill, not a new trigger surface; the description footprint stays untouched.
- No porting of the source workspace's cross-platform network-policy matrix or release-preflight discipline — project knowledge, intentionally excluded (same boundary as the original port).

## Decisions

1. **Section position: after "State Machine and Probes"** (card-recommended) — the residue check is the post-`off` continuation of the state story, keeping the flow Usage → State Machine → DNS Residue → Prerequisite → Boundaries.
2. **Commands verbatim, echo annotations translated** — the probe pipelines and recovery commands stay byte-identical to the source; the Chinese echo annotations and comments become English (same display-only translation policy as the original port's script).
3. **Instance and discipline line stripped** — the release-instance sentence (project identifiers) and the sibling-skill preflight-discipline sentence are dropped entirely per the frozen card; provenance becomes the generic "field-observed root cause" phrasing.
4. **Version bump `1.0.0` → `1.1.0`** — content addition to an existing skill per repo convention; description untouched.
5. **Delta spec is ADDED-only** — grep of `openspec/specs/` shows no existing requirement mentions DNS/route residue, so there are no MODIFIED requirements and no iron-law-9 sync list; the new requirement appends to `openspec/specs/astrill-control/spec.md` on archive.
