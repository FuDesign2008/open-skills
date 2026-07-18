# Proposal: sync-solve-workflow-optimizations

## Why

PR #218 的 7 类优化只在 solve-workflow 单点落地，同族 skill 存在相同模式缺陷：browser-debug-toolkit 口径仍限 UI/CSS/DOM（4 处镜像句 + 2 处委托门槛）、3 个工作流的打点权限无登记/回滚门控、3 个工作流弱引用 env-capability-discovery、3 个工作流调用 ensure-tests 未声明强依赖（jira-fix-workflow 还有「项目配置了 ensure-tests」错误表述）、opsx 阶段 7 命名未对齐 learn-and-improve、两处悬空/矛盾编号引用。且既有 spec `env-capability-discovery` 的「MUST NOT 进入 dependencies」Requirement 与 PR #218 已落地的强依赖**直接矛盾（spec 漂移）**，本次一并补齐。

## What Changes

批 1（本 change，低风险契约文本同步）：

- **C browser 口径**：4 处镜像句 + runtime-evidence-debug 2 处委托门槛，由「仅 UI/CSS/DOM」扩大为「浏览器可复现问题」（复现 + 验证闭环）
- **B 打点权限门控**：opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow 的「打点代码由用户手动添加」句，统一为「AI 可直接添加并纳入登记 + 出口前回滚」口径
- **E env-capability-discovery 转强依赖**：上述 3 个工作流声明强依赖；opsx-solve-workflow `:171`「不得加入 dependencies」禁令句改写为「默认弱引用」口径
- **F ensure-tests 转强依赖**：上述 3 个工作流声明强依赖；jira-fix-workflow `:692` 错误表述修正；测试套件建议统一为「测试基建二分支」（有基建补全运行 / 无基建先问用户）
- **G 命名对齐**：opsx-solve-workflow 阶段 7「回顾总结与经验沉淀」小节更名「复盘改进（委托 learn-and-improve）」
- **D 局部修复**：opsx-solve-workflow「步骤 5.5 逃生出口」悬空引用改为名称引用（runtime-evidence-debug Phase 6）；jira-fix-workflow 难度分级编号矛盾（reference.md「3.5」vs SKILL.md「2.5」）统一为「2.5」
- **solve-workflow 补漏**：`node-version-discipline` 由阶段 7 调用未声明，转为第 12 个强依赖
- **spec 漂移补齐**：`env-capability-discovery` spec 的弱引用 Requirement 改为「默认弱引用；显式声明强依赖的工作流由前置检查保证可用」

批 2（后续独立 change，不在本范围）：opsx-solve-workflow 八阶段拆分 + 各工作流小数/0 起始序号统一。

## Capabilities

### New Capabilities

- `workflow-contract-sync`: 工作流家族契约同步——browser 复现/验证口径、分析期打点权限门控、测试基建二分支、调用 skill 必须声明强依赖、命名对齐 learn-and-improve

### Modified Capabilities

- `env-capability-discovery`: 弱引用 Requirement 变更——由「MUST NOT 进入任何工作流的 dependencies」改为「默认弱引用；显式声明强依赖的工作流由前置检查保证可用，缺失即中止」

## Impact

- 文件：`skills/{opsx-solve-workflow,jira-fix-workflow,opsx-jira-fix-workflow,runtime-evidence-debug,solve-workflow}/SKILL.md`、3 个工作流的 reference.md、`AGENTS.md` 清单表、`docs/generated/skills-index.md`（description 若变）
- 依赖关系：4 个工作流 frontmatter `dependencies` 扩容（env-capability-discovery / ensure-tests / node-version-discipline）
- 行为：缺上述 skill 的环境启动对应工作流将中止并提示安装（硬门槛，用户已确认先例）
- 风险：opsx-solve-workflow 的阶段映射表（openspec 原生 skill 对应阶段 1.1/1.2）在批 2 拆分前维持不变，两侧表述以批 1 不动编号为界
