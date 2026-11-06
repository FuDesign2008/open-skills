## 1. 三层职责

组织者（宿主工作流）只做三件事：派单、收结果、按契约判定。角色是独立执行主体，自行决定调用哪些 skill。skill 是能力包。组织者对「角色怎么做」不作要求，但对「结果是否可验收」负责——包括读取全部字段、核验被引用的产物、以及在可写角色执行前后快照工作树。

早期版本把「只验收结果」误读为「只读 Verdict」，导致 `PASS + Confidence: low` 可以被放行。本设计改为读取全部字段。

## 2. 任务单 / 结果单

任务单必填：Goal、Artifacts、Constraints、Acceptance criteria、Model tier。

结果单必填：Verdict、Confidence、Model tier、Findings、Evidence、Unresolved。审查角色额外输出 Standards 与 Spec 两个轴判定，两轴分别判定、不合并排名——与 `staged-review-flow` 的双轴契约一致。

## 3. Fail-closed 验收

- 缺字段、空 Evidence、格式不可解析 → 阻断。
- `PASS` 携带非空 `Unresolved` → 不接受。未执行的检查不得随 PASS 过关。
- 任一卡片或任一轴 `FAIL` → 返工。

## 4. 升级语义

触发条件（任一）：命中敏感路径；diff 超过 `merge-discipline/reference.md` 定义的 full 深度阶梯阈值（引用，不复制数字）；standard 卡 `Confidence: low`。

escalated 卡通过（`PASS` + `high`）可以解除 standard 卡的 `low`，但**永不解除 `FAIL`**。未触发升级时，standard 卡必须自身 `PASS` + `high`。这条规则消除了早期版本的死结：`PASS + low` 触发升级后，标准卡的低置信度永远不会被解除。

## 5. 档位可核验

档位名 `standard` / `escalated` 是稳定契约标识，具体模型写在 `models.json`。agent 定义写 `model: inherit`，组织者在派发时传入解析出的 alias，并在阶段报告记录该 alias。结果单回填 `Model tier`；与派发记录不一致视为格式错误。

## 6. 写入边界

可写角色（developer、tester）只能写测试路径。默认集合由 `models.json` 的 `testPaths` 定义，组织者按该集合检查 diff。`code-reviewer` 的 `tools` 不含 Write/Edit；`Bash` 无法物理禁止写文件，因此只读是规范约束，由组织者快照工作树兜底。

## 7. 存在性守卫

`jira-fix-workflow` 是分发 skill，不能假设消费方一定有角色契约。Stage 8 在工程提供契约（默认 `.claude/agents/_contract.md`，可配置）时才启用角色派发，否则按原有检查运行。角色契约本身作为工程级配置维护，不进入安装面。
