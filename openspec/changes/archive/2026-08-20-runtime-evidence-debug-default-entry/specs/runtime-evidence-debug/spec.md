# runtime-evidence-debug Delta Spec

## ADDED Requirements

### Requirement: runtime-evidence-debug SHALL be the default entry of the debug skill family

When a PDCA analysis stage needs any runtime observation (static analysis stalled, retry after a failed fix, silent failure, before/after fix verification), `runtime-evidence-debug` MUST be loaded first as the methodology entry. The trigger is state-based ("runtime observation is needed"), not self-assessed confidence. This default does not skip static analysis: the skill's own escalation-decision phase (static first) remains authoritative.

#### Scenario: Static analysis stalls and runtime observation is needed

- **WHEN** an agent has located candidate modules but cannot confirm the mechanism, and any runtime observation (log instrumentation, debugger, reproduction) is the next useful step
- **THEN** the agent loads `runtime-evidence-debug` and follows its lifecycle, instead of re-reading code or emitting speculative hypothesis lists

#### Scenario: Fix applied but problem persists

- **WHEN** a fix based on static analysis was applied and the symptom remains
- **THEN** the next debugging round enters through `runtime-evidence-debug` (retry scenario is an explicit trigger)

### Requirement: runtime-evidence-debug SHALL compose with scenario skills without demoting them

`runtime-evidence-debug` owns HOW to gather evidence and when evidence is enough (lifecycle, evidence tiers, confidence gating, fix-readiness); this ownership MUST NOT be duplicated by scenario skills. Scenario skills MUST compose on demand and keep their own authority: browser-reproducible issues MUST delegate tool selection to `browser-debug-toolkit`; hybrid apps (native shell + WebView/WKWebView/Electron + H5) MUST consult `hybrid-debug` for layer localization before instrumenting; real-device observation MUST compose channel enablers (e.g. `android-webview-debug` to connect, then this skill decides what to observe). Channel enablers provide the observation channel; their data MUST flow into this skill's evidence analysis.

#### Scenario: Browser-reproducible UI bug

- **WHEN** the problem reproduces in a browser and DOM/computed-style/network observation applies
- **THEN** the agent enters via `runtime-evidence-debug` and its instrumentation step delegates tool selection to `browser-debug-toolkit`

#### Scenario: Real-device WebView debugging

- **WHEN** a hybrid app bug requires observing a real device WebView
- **THEN** a channel enabler (e.g. `android-webview-debug`) establishes the connection, and what to instrument, what evidence tier the observations carry, and when confidence suffices are decided by `runtime-evidence-debug`

### Requirement: runtime-evidence-debug description SHALL carry state-based Chinese triggers

The skill's frontmatter `description` MUST include state-based Chinese trigger words users actually say in mid-debug conversations — at minimum 「修了还是不行」, 「日志正常但行为不对」, 「偶现」 — alongside its existing method-name triggers. It MUST remain a single-line quoted string within the 1024-character limit (铁律 7), and keep the default-entry positioning phrase.

#### Scenario: User reports a persistent bug in natural language

- **WHEN** a user says 「这个问题修了还是不行」 or 「日志都是正常的但行为不对」
- **THEN** the skill is a strong routing candidate via its description triggers, without the user naming any debugging method
