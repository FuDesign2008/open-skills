## ADDED Requirements

### Requirement: Lightweight in-change eval batches SHALL compare against a prior-version snapshot

When product owners choose a lightweight skill-creator eval bar (2–3 prompts per skill) inside the same change as a language rewrite, the eval harness MUST still pair `with_skill` (current) against an explicit prior-version baseline snapshot (e.g. Chinese body before rewrite), and MUST cover at least one trigger/mode prompt and one gate or clarifying-discipline prompt per workflow-style skill in scope.

#### Scenario: Batch-2 lightweight eval baseline

- **WHEN** the batch-2 English migration change runs its lightweight evals
- **THEN** each in-scope skill has 2–3 prompts evaluated for both current English and the pre-rewrite snapshot, including trigger/mode and gate/clarify coverage where the skill is workflow-gated
