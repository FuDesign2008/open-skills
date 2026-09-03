## ADDED Requirements

### Requirement: 共享 skill SHALL 识别 ai-proxy overlay（非第三控制流态）

`workflow-mode-lifecycle` SHALL recognize an **ai-proxy overlay** in addition to manual/auto control-flow modes, without folding the `ai-proxy-discipline` charter into this skill. Recognition: a host that lists ai-proxy triggers in its `description` treats 「ai-proxy 模式」「AI 代理模式」 / "ai-proxy mode" as overlay request; 「切换 ai-proxy」 / "switch to ai-proxy" switches mid-run. Overlay maps to **auto carrier** plus `Stage-exit policy: ai-proxy`; occupancy and thin freeze remain in `ai-proxy-discipline`. On full-flow completion or any interruption, overlay MUST revert to manual and clear the policy (same revert table as auto). Re-entering overlay requires an explicit trigger; implicit continuation (「继续」「再改一下」「深入分析」) MUST NOT re-activate overlay. Batch orchestrators MUST pass `Stage-exit policy` explicitly per child (not ambient inheritance). This skill MUST NOT restate the proxy authority charter, reserved list, or adversarial protocol.

#### Scenario: 独立触发请求 overlay 而非裸 auto

- **WHEN** solve-workflow 的触发含「ai-proxy 模式」且不含仅表示裸 auto 的「自动分析/自动解决」路径
- **THEN** 生命周期将本次 run 标为 overlay 请求（auto 载体 + 待写入的 Stage-exit policy: ai-proxy），不把它当成普通自动模式（named escapes 直通）

#### Scenario: 完成回手动并清除 overlay

- **WHEN** 处于 overlay 的 PDCA 流程正常完成或被中断
- **THEN** 恢复手动模式，且本次 Stage-exit policy 不再视为 ai-proxy

#### Scenario: 隐式延续不重开 overlay

- **WHEN** overlay 已回手动后用户说「继续」「再改一下」
- **THEN** 保持手动，不重新进入 overlay，也不重新开始薄冻结

### Requirement: 未声明 ai-proxy 触发词的宿主 MUST 忽略 overlay

Hosts that declare `workflow-mode-lifecycle` but do **not** list ai-proxy triggers in `description` (including `write-workflow`) MUST keep two-state recognition only: 「自动」 selects auto mode; other phrases including 「ai-proxy 模式」 MUST NOT start overlay, freeze, or occupancy.

#### Scenario: write-workflow 不进入 overlay

- **WHEN** write-workflow 运行中用户说「ai-proxy 模式」或「切换 ai-proxy」
- **THEN** 不改变该宿主的手动/自动状态机（除非同时命中该宿主已有的「自动」触发），不加载代理占位
