# merge-status-stalled-recovery Specification

## Purpose
MR mergeability 轮询遇到 `checking` 卡住时的机械处置：重算 + 重查 + 继续等待，不把未决状态判为不可合并。

## Requirements

### Requirement: mergeability 轮询 SHALL 将持续 `checking` 视为未决状态而非不可合并

MR mergeability 轮询中，若 `merge_status` 连续 N 次轮询（建议 N=6，间隔 4s）恒为 `checking`，且 `has_conflicts=false`、`state=opened`，系统 MUST 判定为「平台异步计算未完成」，MUST NOT 将该状态归类为不可合并（不得触发 rebase/冲突路径或终止流程）。

#### Scenario: 轮询 6 次仍为 checking 且无冲突

- **WHEN** `merge_status` 连续 6 次轮询（约 24s）恒为 `checking`，且同刻 git 层面证实无冲突（`merge-base --is-ancestor` 成立或 merge-tree=0）
- **THEN** 系统调用平台「mergeability 重算」接口（GitLab：`GET /projects/:id/merge_requests/:iid/merge_ref`）强制重算，而非判定为不可合并

#### Scenario: 重算后转为可合并

- **WHEN** `merge_ref` 重算调用完成，等待约 3s 后重查 `merge_status`
- **THEN** 若变为 `can_be_merged`，系统按原判定表继续正常流程

#### Scenario: 重算后仍为 checking 则继续等待

- **WHEN** `merge_ref` 重算后 `merge_status` 仍为 `checking`
- **THEN** 系统继续有限次轮询等待，连续多轮重算与等待均无变化才视为平台异常上报用户；任一环节均不得把 `checking` 直接当作不可合并 abort
