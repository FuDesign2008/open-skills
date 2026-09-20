# workflow-contract-sync Specification (DELTA)

## ADDED Requirements

### Requirement: solve 家族工作流 SHALL 经 context-budget-discipline 执行上下文预算

The four solve-family hosts (solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow) SHALL thin-reference `context-budget-discipline` at their execution stages: at entry to the implement / verify / report stages, the host evaluates the phase-boundary reset (fresh session seeded from the disk ledger, or in-place summarize-and-reopen) and the proactive compaction threshold per the discipline, and writes a complete ledger entry before any reset. Hooks MUST be sub-steps inside existing integer stages (no decimal stage numbers). Each host declares `context-budget-discipline` in its frontmatter `dependencies` and covers it in the stage-0 prerequisite skill check (missing → abort with install guidance); missing-notice dependency lists are updated in the same change. Hosts and host reference files MUST NOT paste the ledger format, threshold table, or methodology verbatim — one-line pointers only. goal-run hosts (goal-driven-workflow) are covered by their own spec delta, not this requirement.

#### Scenario: Jira 宿主执行阶段接线

- **WHEN** `jira-fix-workflow` 进入 stages 7/8/9（或 `opsx-jira-fix-workflow` 进入 stages 6/7/8）
- **THEN** 宿主以一行薄引用应用阶段边界 / 阈值 / 台账规则，方法论细节来自 `context-budget-discipline`，不存在内联复制

#### Scenario: 缺失 skill 在 stage 0 中止

- **WHEN** 运行环境缺少 `context-budget-discipline` 而某 solve 家族宿主声明了强依赖
- **THEN** 该宿主前置检查以安装指引中止，不静默降级

#### Scenario: 宿主正文无方法论复制

- **WHEN** 扫描任一 solve 家族宿主的 SKILL.md / reference.md 查找台账格式或阈值表
- **THEN** 仅存在一行指针，无逐字复制

#### Scenario: 续跑路径消费台账

- **WHEN** Jira 宿主经 `--resume` / 「从上次继续」恢复一次被重置的运行
- **THEN** checkpoint 依据最近一条台账条目重建状态，不回放历史对话
