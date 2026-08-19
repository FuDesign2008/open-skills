## MODIFIED Requirements

### Requirement: Evidence validity disciplines SHALL be owned in-file

The ten disciplines (environment-throttling artifacts, monitor self-pollution, framework counter ambiguity, device-profile calibration, input-event authenticity, instrumentation toggle lifecycle, single-sample extrapolation ban, ultimate control experiment, negative-results-leave-traces, comparison-experiment environment-state validity) MUST live as a section in this skill's `SKILL.md`, each stated at trap-class intent level — platform-specific implementations (browser APIs, DOM techniques) MUST NOT be embedded in the rule body; they live in `reference.md` Part 4's case archive. The anonymized case archive MUST cover all ten disciplines. The gate rule applies: a metric whose applicable discipline is unresolved is trend-only and MUST NOT drive decisions.

#### Scenario: Counter conflicts with native metric

- **WHEN** a framework-internal counter and a browser-native metric disagree in magnitude
- **THEN** the browser-native metric is trusted and the counter is demoted to trend-only signal

#### Scenario: Non-web stack applies a discipline

- **WHEN** a native/C++ campaign applies discipline 1 (throttling artifacts) to a scheduler-class metric
- **THEN** the rule body is directly usable without translating web-specific implementation details

### Requirement: The workflow SHALL run six evidence-gated stages

The skill MUST define the stages benchmark & evidence → locate the bottleneck → hypothesize the root cause → build toggleable monitoring → optimize → A/B verify, with documented forward flows and common jumps. Each stage that consumes performance numbers MUST declare which of the in-file Evidence Validity Disciplines gate it — the A/B-verify stage MUST carry a formal Evidence-gate section covering disciplines 2, 4, 9, and 10, so single-pass exception runs stay under the same gates as loop runs.

#### Scenario: Single-pass run honors environment-state discipline

- **WHEN** a user explicitly requests a single optimization pass and the change touched module structure
- **THEN** the A/B verdict still requires the discipline-10 environment reset between arms

## ADDED Requirements

### Requirement: Corpus SHALL be single-voice and consistent with the layered architecture

`reference.md` MUST present one coherent self-description (stack corpus: seed templates + knowledge attachments + case archive), stage-table keys MUST match `SKILL.md` stage names verbatim (including capitalization), the A/B acceptance formula MUST be stated only in the paradigm's verify stage (referenced elsewhere), and stack-extension slots MUST direct validated knowledge into the project skills as pipeline-step attachments — the corpus itself MUST NOT propose promoting chapters into separate knowledge skills.

#### Scenario: Stage-table keys match stage names

- **WHEN** a reader greps a stage name from SKILL.md against reference.md's stage table
- **THEN** the keys match verbatim, including capitalization

#### Scenario: Stack knowledge validated by a campaign

- **WHEN** a native campaign validates its attribution/optimization knowledge
- **THEN** that knowledge lands in the project's code-insight/code-optimizer as pipeline-step attachments, and the corpus keeps only candidate material and seed slots
