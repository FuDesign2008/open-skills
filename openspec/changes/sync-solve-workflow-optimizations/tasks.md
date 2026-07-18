# Tasks: sync-solve-workflow-optimizations

## 1. solve-workflow 补漏（PR #218 分支先行）

- [x] 1.1 在 `feat/solve-workflow-split-analysis-stage` 上：solve-workflow frontmatter/清单/前置检查/reference.md 缺失提示加 `node-version-discipline`（第 12 个强依赖），AGENTS.md solve-workflow 行依赖列追加
- [x] 1.2 `node-version-discipline/SKILL.md:240` Soft-referencers 行移除 solve-workflow（保留 ensure-tests）；提交并推送（#218 更新）

## 2. 新分支与 artifact 落盘

- [x] 2.1 `git checkout -b feat/sync-workflow-contracts main`，提交 openspec/changes/sync-solve-workflow-optimizations/ 全部 artifact（proposal/specs/design/tasks）

## 3. C：browser 口径扩大（6 处）

- [x] 3.1 opsx-solve-workflow `:315`（打点小节）与 `:466`（验证闭环）替换为「浏览器可复现问题」口径（复现+验证方案生效）
- [x] 3.2 jira-fix-workflow `:367` 与 `:724` 同上
- [x] 3.3 opsx-jira-fix-workflow `:265` 与 `:478` 同上
- [x] 3.4 runtime-evidence-debug `:43`、`:74` 委托门槛句由「for UI/CSS/DOM issues」扩大为「browser-reproducible（UI/CSS/DOM 为典型场景）」

## 4. B：打点权限门控（3 处）

- [x] 4.1 opsx-solve-workflow `:320`、jira-fix-workflow `:372`、opsx-jira-fix-workflow `:270` 的「打点代码由用户手动添加或经确认后 AI 添加」统一为「AI 可直接添加并纳入登记 + 进入下一阶段前按登记回滚验证」口径

## 5. E：env-capability-discovery 转强依赖（3 个工作流）

- [x] 5.1 opsx-solve-workflow：frontmatter+清单+前置检查计数；`:171` 禁令句改写为「默认弱引用；本工作流声明为强依赖，前置检查保证可用」；reference.md 缺失提示加 bullet
- [x] 5.2 jira-fix-workflow：frontmatter+清单+前置检查计数（先读 frontmatter 实况再改）；`:133` 弱引用句改写并**保留**「结果记入 state.json `enhanced_capabilities` 字段」；reference.md 缺失提示加 bullet
- [x] 5.3 opsx-jira-fix-workflow：frontmatter+清单+前置检查计数；`:77` 弱引用句改写；reference.md 缺失提示加 bullet

## 6. F：ensure-tests 转强依赖 + 测试基建二分支（3 个工作流）

- [x] 6.1 opsx-solve-workflow：frontmatter+清单；测试套件确保 section「若框架缺失，按技术栈选型安装并配置」改为「先按一次一问纪律询问用户是否增加测试基建，同意后再委托 ensure-tests 搭建」；reference.md 缺失提示加 bullet
- [x] 6.2 jira-fix-workflow：frontmatter+清单；`:692`「若项目配置了 ensure-tests」错误表述替换为测试基建二分支；reference.md 缺失提示加 bullet
- [x] 6.3 opsx-jira-fix-workflow：frontmatter+清单；`:445` 区域同款自动搭建语义加「先问用户」门控；reference.md 缺失提示加 bullet

## 7. G + D 局部 + AGENTS.md

- [x] 7.1 opsx-solve-workflow 阶段 7「回顾总结与经验沉淀」小节更名「复盘改进（委托 learn-and-improve）」（含 `:54` 清单行、`:516` 小节标题、`:518` 正文首句）
- [x] 7.2 opsx-solve-workflow 常见错误表「步骤 5.5 逃生出口」改为「`runtime-evidence-debug` 的逃生出口（Phase 6）」名称引用
- [x] 7.3 jira-fix-workflow reference.md「阶段3.5：难度分级」统一为「阶段2.5」（与 SKILL.md 一致）
- [x] 7.4 AGENTS.md：opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow 三行依赖列追加 env-capability-discovery、ensure-tests（`:79` env-cap 行不动，留 #218 合并后处理）

## 8. 验证与交付

- [x] 8.1 `openspec validate sync-solve-workflow-optimizations` 通过；`node scripts/gen-skill-docs.mjs` + `git diff --exit-code docs/generated/skills-index.md`（预期无 diff，若有 description 变更则纳入并复核）
- [x] 8.2 grep 双侧核对：`UI/CSS/DOM 问题`、`弱引用`、`项目配置了`、`步骤 5.5`、`回顾总结`（opsx 侧）残留仅余刻意保留项；3 个工作流 frontmatter deps 计数与清单一致
- [x] 8.3 提交、推送、创建 PR（描述含批次划分说明与批 2 遗留清单）
