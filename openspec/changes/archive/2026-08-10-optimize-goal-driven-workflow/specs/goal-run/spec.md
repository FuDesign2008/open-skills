## ADDED Requirements

### Requirement: Goal-run instructional body SHALL be English

Instructional body text in `goal-driven-workflow` (`SKILL.md` and `reference.md` templates/cheatsheets) MUST be written in English. Chinese trigger phrases MUST remain in frontmatter `description` (and may appear in the invocation trigger list that mirrors description). MUST NOT leave Chinese instructional prose in stage bodies, gate blocks, or output templates.

#### Scenario: Stage body has no Chinese instructional prose

- **WHEN** an agent reads `goal-driven-workflow` stage sections and `reference.md` templates
- **THEN** instructional sentences and template labels are English; Chinese appears only as description/invocation triggers where required

### Requirement: Goal-run command entry SHALL follow command-file conventions when present

When `commands/goal-run.md` is added, it MUST set `disable-model-invocation: true` and MUST instruct the agent to invoke `goal-driven-workflow` and follow it exactly. The repository SHOULD add this command as part of this change.

#### Scenario: Command file invokes the skill

- **WHEN** `commands/goal-run.md` exists
- **THEN** it sets `disable-model-invocation: true` and instructs the agent to invoke `goal-driven-workflow` and follow it exactly

### Requirement: Goal-run SHALL strong-depend on design-approval-gate for launch approval

`goal-driven-workflow` MUST declare `design-approval-gate` in frontmatter `dependencies`, verify it at startup, and thin-reference it at the long-run launch gate. Long-run-specific rule: high-impact launches (unattended / over-budget / irreversible) MUST still pause for explicit user approval even when the host is in auto mode — this is an intentional divergence from `design-approval-gate`'s generic auto-mode escape and MUST be stated at the host launch gate.

#### Scenario: Launch gate thin-refs design-approval-gate

- **WHEN** stage 4 is about to start a high-impact long run
- **THEN** the host loads `design-approval-gate` and still requires explicit user approval for unattended / over-budget / irreversible launches even under auto mode

## MODIFIED Requirements

### Requirement: 长跑执行多模式支持

The system SHALL support launching the long run via: (1) an interactive goal harness when available, (2) a non-interactive agent CLI invocation of that harness when available, or (3) a manual bounded goal loop fallback. Instructional text MUST describe these as intents first; concrete `/goal` and `claude -p` forms MAY appear as primary-harness examples, not as the only supported platforms.

#### Scenario: Non-interactive execution

- **WHEN** the user needs an unattended run-to-completion invocation
- **THEN** the system launches via the environment's non-interactive agent CLI wrapping the goal harness when available (example: `claude -p "/goal <condition>" --output-format stream-json --verbose`), and can stream progress

#### Scenario: No goal-harness fallback

- **WHEN** the current environment has no `/goal`-equivalent harness
- **THEN** the system falls back to a manual goal loop: iterate do-work → verify against acceptance checklist → continue if unmet (budget-bounded) → stop when met, with an explicit stop clause

### Requirement: 无人值守配套设施

The system SHALL guide companion setup for unattended long runs using intent-first wording: a project convention/instructions file re-read each turn, post-edit automatic validation hooks, and an approval mode that does not stall on routine tool writes. Primary-harness examples (e.g. project-root `CLAUDE.md`, PostToolUse hooks, Claude Code auto mode) MAY be named; MUST NOT imply other agents cannot substitute equivalents.

#### Scenario: Unattended companions in place

- **WHEN** the long run must be unattended (auto/scheduled)
- **THEN** the system confirms a per-turn convention file and post-edit validation hooks are in place, and enables an auto-approval mode so routine writes do not stall the run

### Requirement: 完成报告与人工验收

The system SHALL produce a structured completion report after the long run, separate machine-verifiable acceptance (spot-checked by human) from human outcome-level acceptance, and MUST follow `completion-evidence-discipline` for any pass/done claims (fresh current-turn evidence; Executed vs Pending labels). The host MUST thin-reference that skill rather than restating its full iron law.

#### Scenario: Report and layered acceptance

- **WHEN** the long run ends
- **THEN** the main agent outputs the completion report (template 5: goal recap, per-criterion status, deliverables + evidence, leftovers, spend), the human judges outcome-type items and spot-checks machine items; findings feed the next run's requirements template

#### Scenario: Pass claims cite completion-evidence-discipline

- **WHEN** the agent marks hard acceptance items as passed
- **THEN** each pass claim is backed per `completion-evidence-discipline` with Executed evidence or labeled Pending

### Requirement: 长跑启动批准门控

The system SHALL require explicit user approval before launching a long run when it involves unattended operation, a budget above threshold, or irreversible actions. The host MUST thin-reference `design-approval-gate` for the approval gate pattern. Auto mode does **not** bypass this long-run high-impact gate (intentional host divergence from generic auto escape).

#### Scenario: High-impact long run approved

- **WHEN** the long run meets any high-impact condition (unattended / large budget / irreversible)
- **THEN** the system pauses before launch and requests explicit user approval of the final goal condition + budget + companion checklist, and MUST NOT skip even in auto mode

#### Scenario: Ordinary long run needs no gate

- **WHEN** the long run is low-impact (small budget / reversible / single-file high-certainty)
- **THEN** the system does not require the high-impact approval gate and may start stage 4 normally after prior stage confirms
