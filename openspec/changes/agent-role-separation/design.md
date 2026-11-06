## 1. 三层职责

组织者（宿主工作流）只做三件事：派单、收结果、按契约判定。角色是独立执行主体，自行决定调用哪些 skill。skill 是能力包。组织者对「角色怎么做」不作要求，只对「结果是否可验收」负责。

## 2. 任务单 / 结果单

任务单：Goal、Artifacts、Constraints、Acceptance criteria。

结果单：Verdict、Confidence、Model tier、Findings、Evidence、Unresolved。审查角色的每条 finding 带 `[Standards]` 或 `[Spec]` 前缀，两轴分别判定、不合并排名。

## 3. Fail-closed 验收

- 缺字段、空 Evidence、格式不可解析 → 阻断。
- `PASS` 携带非空 `Unresolved` → 不接受。未执行的检查必须返回 `FAIL`，不得随 PASS 过关。
- 任一卡 `FAIL` → 返工。

## 4. Confidence 不作门禁

早期版本把「每张卡必须 PASS + high」作为放行条件，导致 `PASS + low` 触发升级后永远无法放行。本版把 `Confidence` 降为**记录项**：放行只看 `Verdict` 与 `Unresolved`。`Confidence: low` 仍作为升级触发条件，用于决定是否再跑一次 escalated 档，但不影响最终判定。

## 5. 升级

触发（任一）：命中敏感路径；diff 超过 `merge-discipline/reference.md` 的 large-diff 行；standard 卡 `Confidence: low`。

escalated 审查使用同一 agent、同一流程、`escalated` 档，输入完全相同。两张卡独立，都须 `PASS`；任一 `FAIL` 即失败。更强模型不推翻已发现的失败。

## 6. 模型档位

档位名 `standard` / `escalated` 是稳定契约标识，具体模型写在 `models.json`。组织者在阶段报告中同时记录请求的档位与宿主实际解析到的模型，**不做相等断言**——宿主可以把某档位映射到它提供的任意模型（例如某环境用 sonnet-5-5 承载 `escalated` 档）。

## 7. 写入边界

- `code-reviewer` 不写文件。其 `tools` 不含 Write/Edit；因 `Bash` 仍可重定向输出，这是明示的约定而非沙箱。
- `tester` 只能新增或修改测试文件，不得改生产代码。
- `developer` 可改生产代码。

组织者检查可写角色产生的 diff，越界即作废该结果。

## 8. 存在性守卫

`jira-fix-workflow` 是分发 skill，不能假设消费方一定有角色契约。Stage 8 在工程提供契约时才启用角色派发，否则按原有检查运行。角色契约作为工程级配置维护，不进入安装面。
