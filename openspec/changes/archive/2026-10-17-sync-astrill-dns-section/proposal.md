## Why

The public `astrill-control` skill (ported 2026-08-29) covers connect / disconnect / status but has no answer for the field-observed failure mode where the network stays degraded after `off`: in tunnel mode, Astrill's DNS servers (10.x virtual range) and routes can remain registered on the system, so DNS resolution stays slow or broken even though both disconnect probes are green. The source workspace sedimented a detection-and-recovery procedure for exactly this case (residue probes plus a DHCP-lease-renew-equivalent recovery). That procedure is generic macOS networking — it belongs in the public skill so any workflow that turns the VPN off before direct-connection work can verify the network is actually clean, not just disconnected.

## What Changes

- Add a new top-level English section "DNS Residue Detection and Recovery" to `skills/astrill-control/SKILL.md`, placed after "State Machine and Probes": the phenomenon, two residue probes (`scutil --dns` nameserver in the 10.x range; default route on a `utun` interface), the recovery commands with an escalation step, a non-interactive-sudo handoff note, and a note that the service name (`Wi-Fi`) and interface (`en0`) vary by local setup.
- Generalize per iron law 2: the source's project-specific release instance and the sibling-skill preflight-discipline sentence are stripped entirely; provenance is expressed generically (field-observed root cause); zero project identifiers.
- Bump frontmatter version `1.0.0` → `1.1.0`; `description` untouched (single-line quoted string, ≤1024 chars).
- Regenerate `docs/generated/skills-index.md` (version column for astrill-control).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `astrill-control`: adds one requirement — DNS residue SHALL be detected and recovered after `off` (post-`off` residue probes, DHCP-equivalent recovery with escalation, sudo handoff or GUI fallback, vary-by-setup note). No existing requirement is modified; grep of `openspec/specs/` confirms no current requirement mentions DNS/route residue.

## Impact

- Skills: `skills/astrill-control/SKILL.md` (one new section + version bump; description, script, and evals untouched)
- Docs: `docs/generated/skills-index.md` (regenerated)
- OpenSpec: `openspec/specs/astrill-control/spec.md` gains one requirement via this change's delta
- No runtime code; no other skill touched
- Out of scope: `scripts/astrill.sh` (the source section is manual commands only); the skill's `evals/` (the section is diagnostic guidance, not a new trigger surface — description footprint untouched); the source workspace's cross-platform network-policy matrix and release-preflight discipline (project knowledge, same boundary as the original port)
