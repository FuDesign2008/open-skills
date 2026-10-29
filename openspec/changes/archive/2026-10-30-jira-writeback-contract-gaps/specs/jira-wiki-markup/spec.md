## ADDED Requirements

### Requirement: Written Wiki fields SHALL be verified for markup fidelity

Composing correct markup is necessary but not sufficient, because a relaying layer may escape or rewrite it while still returning a success response. After writing any Wiki-rendered field (comment body, description, or other wiki field), the agent MUST read the stored value back and confirm that the key markers (`h3.`/`h4.` line starts, `*bold*`, `{{mono}}`, `[label|url]`) survive verbatim. When the stored value cannot be read back at all, the write counts as unverified and the agent MUST report it rather than claim success.

When a marker is escaped or rewritten (for example `\*bold\*`, or `h3.` turned into `###`), the agent MUST treat the write as failed and retry through an available direct-REST channel that writes the same field. A channel counts as available only when its writing script and its credential resolver both exist in the installation; a skill directory alone is not enough, because the script cannot run without the resolver.

A bundled comment script covers comment bodies only. Other wiki fields (for example a description) need an equivalent REST endpoint; when no such endpoint exists, the field has no available channel. When no channel is available, the agent MUST report the fidelity failure and the missing fallback, and MUST NOT report the write as successful.

This requirement covers every wiki-field write. The post-merge repair-comment flow has its own equivalent requirement in `jira-status-writeback`; both describe the same verification discipline for their respective scopes.

#### Scenario: Markers survive the write channel

- **WHEN** the stored value read back after a write contains the composed markers verbatim
- **THEN** the write is complete and the agent proceeds with its own flow

#### Scenario: Escaped markup triggers a direct-REST retry

- **WHEN** the stored value contains escaped or rewritten markers (for example `\*bold\*` where `*bold*` was sent)
- **THEN** the agent rewrites the field through an available direct-REST channel for that field and re-verifies fidelity before reporting completion

#### Scenario: Channel presence is checked before relying on it

- **WHEN** a Jira writeback skill is installed but its fallback script or its credential resolver is missing
- **THEN** the agent treats the channel as unavailable and does not attempt the fallback

#### Scenario: No fallback channel available

- **WHEN** the write channel corrupts markup and no direct-REST channel is available for that field
- **THEN** the agent reports the fidelity failure and the missing fallback rather than reporting success

#### Scenario: Stored value cannot be read back

- **WHEN** neither the write response nor a follow-up read returns the stored field value
- **THEN** the agent reports the write as unverified and does not claim fidelity success
