# opsx-jira-fix-workflow Specification

## Purpose
TBD - created by archiving change integrate-learn-and-improve-jira-hosts. Update Purpose after archive.
## Requirements
### Requirement: OPSX Jira fix workflow SHALL strong-depend on learn-and-improve

`opsx-jira-fix-workflow` MUST list `learn-and-improve` in frontmatter `dependencies`. At startup prerequisite check, a missing `learn-and-improve` MUST abort the workflow (no silent degrade).

#### Scenario: Missing learn-and-improve aborts startup

- **WHEN** `opsx-jira-fix-workflow` loads and `learn-and-improve` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage orchestration continues

### Requirement: OPSX Jira fix workflow SHALL thin-delegate retrospective at stage 8

After archive and branch closeout (and Jira writeback when merge ran), `opsx-jira-fix-workflow` MUST load `learn-and-improve` and follow that skill. Inline stage-8 sediment prose that duplicates `learn-and-improve` MUST be replaced by a thin pointer. OpenSpec artifacts archived through the normal flow MUST remain outside that skill's sediment-value gate (same carve-out as `opsx-solve-workflow`).

#### Scenario: Stage 8.5 delegates instead of inline methodology

- **WHEN** stage 8 archive and closeout steps have completed
- **THEN** the host loads `learn-and-improve` rather than only stating ad-hoc AGENTS/rules writing rules inline

### Requirement: OPSX Jira fix workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Execute/verify stages MUST conditionally load implement and verify per the same Figma-scope rules as `jira-fix-workflow` / `figma-pixel-fidelity` host hooks, including the durable living-artifact path. The host MUST load implement when the goal, card, issue, or plan contains `figma.com` or `node-id=`, or the user asks for pixel restore. Those rows stay hard. A probe of visible text, a visibility flag, or a list length does not pass them. When that same text also contains `参考`, `match the existing`, or `same as`, verify adds the named control's interaction states. Implement MUST continue into `figma-pixel-verify` in the same run until overall PASS or the measurement command cannot run. The host MUST load verify when the goal, card, issue, or plan contains `figma.com` or `node-id=`, when this run implemented from Figma, or alignment checking is required. When that substring is present or this run implemented from Figma, verification MUST treat a missing Verify section (or Spec source sibling) as a failed verification stage. Verification MUST pass only when that report’s overall status is PASS (accepted residuals included), its channel is `storybook`, `isolated-harness`, `preview`, `full-app`, or `layout-probe`, and `scripts/check-figma-verify-report.mjs` from `figma-pixel-verify` exits 0 on that file. A source-literal compare, or a report that leaves pixel rows for a person, MUST NOT pass. Any other result MUST fail the stage and return to the implement stage for another fix/re-measure loop. A spec-gap FAIL MUST NOT pass verification—re-enter implement to complete the table. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing figma-pixel-implement aborts opsx-jira-fix startup

- **WHEN** `opsx-jira-fix-workflow` loads and `figma-pixel-implement` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: OPSX Jira UI fix verifies with figma-pixel-verify

- **WHEN** verification runs after a Figma-scoped implement in this change
- **THEN** the host loads `figma-pixel-verify` and passes only on overall PASS from a laid-out channel

#### Scenario: Missing Figma verify report fails OPSX Jira verification

- **WHEN** this run implemented UI from Figma and verification has no Verify section (or Spec source sibling)
- **THEN** the host MUST NOT mark verification as passed

#### Scenario: Spec-gap FAIL re-enters implement

- **WHEN** verify FAILs because Spec is missing critical rows after this-run implement
- **THEN** the host MUST NOT pass verification and MUST re-enter `figma-pixel-implement`

#### Scenario: Source compare does not pass OPSX Jira verification

- **WHEN** the Verify channel is a source-literal compare, or the report leaves pixel rows for a person
- **THEN** the host MUST NOT pass verification and MUST return to the implement stage for another fix/re-measure loop

### Requirement: 验证环节 SHALL delegate verification execution to runtime-verification-discipline

`opsx-jira-fix-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。验证环节 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证。「manual-verification items」的默认姿态随之改变——验证默认由 AI 在环境执行，仅当属于分类后的真硬边界时才列为人工验证项并给出理由。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

#### Scenario: 默认由 AI 在环境验证

- **WHEN** 验证环节面对一个其行为可在 AI 能驱动的环境中检验的改动
- **THEN** 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把它列为 manual-verification item

#### Scenario: 仅真硬边界才列为人工验证项

- **WHEN** 一项验证属于分类后的真硬边界（如无法行动 / 无法判定结果 / 有真实世界副作用）
- **THEN** 它被列为 manual-verification item 并注明硬边界理由

### Requirement: OPSX Jira fix workflow SHALL strong-depend on jira-wiki-markup for comments

`opsx-jira-fix-workflow` MUST list `jira-wiki-markup` in frontmatter `dependencies`. At startup prerequisite check, a missing `jira-wiki-markup` MUST abort (no silent degrade). Comments this host writes or maps into `jira-status-writeback` (including the stage 8.4 field list rendered as a comment body) MUST be composed after loading `jira-wiki-markup`. Direct comments (existence mismatch after user confirmation, and any other `jira_add_comment` from this host) MUST use the same skill. Host `reference.md` MUST NOT keep Markdown-shaped comment examples for Jira bodies.

#### Scenario: Missing jira-wiki-markup aborts opsx-jira-fix startup

- **WHEN** `opsx-jira-fix-workflow` loads and `jira-wiki-markup` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: Stage 8.4 comment body is Wiki markup

- **WHEN** post-merge writeback composes the comment from this host's field map
- **THEN** the resulting `body` follows `jira-wiki-markup` (Wiki notation), not Markdown

### Requirement: opsx-jira-fix-workflow SHALL strong-depend on competitive-research

`opsx-jira-fix-workflow` MUST list `competitive-research` in frontmatter `dependencies`. At startup prerequisite check, a missing `competitive-research` MUST abort with an install hint. The analysis stage MUST delegate user-visible competitive research to `analysis-core`'s load of `competitive-research` with one line, and MUST NOT restate that skill's method.

#### Scenario: Missing competitive-research aborts startup

- **WHEN** `opsx-jira-fix-workflow` loads and `competitive-research` is not installed
- **THEN** the workflow aborts and names the missing skill and an install command

### Requirement: opsx-jira-fix-workflow queue child SHALL report three facts and not write HTML

When opsx-jira-fix-workflow runs as a queue child, the completion report MUST include the problem, the cause, and the completed fix. The workflow MUST NOT write the review HTML.

#### Scenario: Queue child report carries the three facts

- **WHEN** opsx-jira-fix-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, and the completed fix, and this run does not write the HTML page
