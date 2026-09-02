# Goal: goal-driven-batch 增补 opsx-jira-fix-workflow 引擎 + 引擎必问票（无默认）

- Status: done
- Priority: P1
- Engine: opsx-solve-workflow
- Stage-exit policy: ai-proxy
- Traceability: openspec/changes/opsx-jira-engine-and-mandatory-ticket
- Estimate: ~1h
- Budget: or stop after 40 turns / 60 minutes

## Goal Condition
PR 开好且五门禁全绿（索引 diff / lint --staged 0 / openspec validate+归档 / 契约 grep 5 值双侧+必问措辞 / 无 default-when-absent 残留）；合并留人
- Stated check: PR 存在 + 各门禁命令输出绿 + 契约 grep 0 残留
- Constraints: 仅改 skills/goal-driven-batch、opsx-jira-fix-workflow、ai-proxy-discipline、AGENTS.md、openspec/、docs/generated/
- Budget: or stop after 40 turns / 60 minutes

## Frozen Decisions (intake)
- Chosen approach: 方案①先例合成 + 必问票增补（宿主 solve-workflow 阶段 3/4 已裁定 PASS）
- Resolved tickets: Engine=opsx-solve-workflow（用户显式）· policy=ai-proxy（用户显式）· 预算 40t/60m
- Deferred tickets: 无
- Initial assumptions: main@f21e41b 为基线（factual）
- Pre-launch self-review: pass

## Decisions I Made for You
- evals 增 2 条（必问票 / opsx-jira 派发） — kind: preference — impact: low
- 旧「无字段零变化」场景替换为「消费入口搁置待定引擎」 — kind: preference — impact: low（阶段 4 已留痕）

## Approved: chat confirm 2026-09-01（批准与开跑两独立事件，同刻完成）

## Acceptance Summary
- 结果: done — PR open（archive+PR-open 终态）；合并+本仓回写留人
- 证据: 索引 3 版本行 / lint 0 / validate+归档(+2 MODIFIED+1 scenario) / 语义 grep archive+PR-open 双侧 / 残留 0 / proxy 两轮 BOUNCE→修复→APPROVE-with-condition→验证 BOUNCE→修复（ Delegate 默认值残留，选择性引用被抓）→预授权放行
- proxy 台账: 2×REJECT(surgical) + 1×APPROVE-with-condition，全部 proxy-made 可推翻
- 预算: 远低于 40t/60m 封顶（wall-clock 含 proxy 等待 ~15m）
