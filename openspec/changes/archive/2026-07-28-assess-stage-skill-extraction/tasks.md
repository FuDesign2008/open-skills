# Tasks: assess-stage-skill-extraction

## 1. 分析报告文档

- [x] 1.1 写 `openspec/changes/assess-stage-skill-extraction/analysis-report.md`：
  - ① 重复度矩阵（solve↔opsx ~150-160 行明细表、jira 系 ~75-80 逐字+~50 语义明细、4 工作流交叉块、扩围结论）
  - ② 既有共享 skill 边界判定（6 个共享 skill 的吸收上限表 + 「方法论/编排」范式）
  - ③ 方案 A 抽取设计：`analysis-core` 内容清单与边界（下沉项 vs 留存项）、`{next-stage}` 占位符与各工作流映射表草案（solve→阶段 3、opsx→阶段 3、jira→阶段 5、opsx-jira→阶段 3）、覆盖率门控单源化落点（test-coverage-analyzer 本体 + 3 处引用）
  - ④ 成本收益评估（减 150-200 行 vs 1 个新契约 + 一致性维护先例成本）
  - ⑤ 结论与实施路线（未来独立 opsx change + skill-creator 流程；3 个小修复同批独立 commits）
  - ⑥ 形似神异清单（4 处有意分歧，明示禁止合并）
  - ⑦ 意外发现登记（jira-fix 声明未委托、opsx 常见错误违精简原则、upstream-dependency-debug 调用未声明——前两报告均提及的补充发现）

## 2. spec（精简）

- [x] 2.1 本 change 为分析报告型，spec 仅沉淀「分析阶段核心内容共享化」的契约方向：delta spec `workflow-contract-sync` ADDED 一条 Requirement——分析阶段核心（临时改动门控/打点调试委托/调试-验证闭环/分析步骤骨架）SHALL 单源承载、工作流引用而非复制

## 3. 验证与交付

- [x] 3.1 `openspec validate assess-stage-skill-extraction` 通过
- [x] 3.2 报告数据与三路测绘结果交叉核对（行数、位置、清单无出入）
- [x] 3.3 提交、推送、创建 PR；归档时同步主 specs
