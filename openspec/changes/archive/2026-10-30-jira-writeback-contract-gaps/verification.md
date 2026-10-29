# Verification — jira-writeback-contract-gaps

日期：2026-10-30 · Node：v22.22.2（`.nvmrc` = 22）· 工作区：feature 分支 `fix/jira-writeback-contract-gaps`

## 命令输出（原始摘要）

```text
$ node --version
v22.22.2

$ node --test scripts/jira-writeback-dependency.test.mjs
# tests 4
# pass 4
# fail 0

$ node --test
# tests 162
# pass 162
# fail 0

$ openspec validate --all
Totals: 67 passed, 0 failed (67 items)

$ npm run lint:skill-description
Checked 68 skills: 0 error(s), 0 warning(s) (hard limit 1024, soft target 950)
```

## 变异验证（测试确实能转红）

从 `skills/jira-status-writeback/SKILL.md` 的 `dependencies` 临时移除 `jira-read` 后：

```text
not ok 1 - jira-status-writeback declares its runtime dependencies
# pass 3
# fail 1
```

恢复声明后 4/4 通过。该测试同时断言脚本 import 目标存在，覆盖了「声明了依赖但脚本实际依赖别的路径」这类漂移。

## 覆盖的缺口

| 缺口 | 证据 |
|------|------|
| 单装时回退脚本 `ERR_MODULE_NOT_FOUND` | frontmatter 声明 + 前置检查；`scripts/jira-writeback-dependency.test.mjs` 永久断言 |
| wiki 保真指令无 spec 覆盖 | `openspec/specs/jira-wiki-markup/spec.md` 新增需求（归档后生效）；spec 与 SKILL.md 的标记清单、可用性判定一致 |

## 回归修复（由契约测试捕获）

`jira-fix-workflow/SKILL.md` 增加一行依赖导致后续行号 +1，`report-output-discipline` 注册表中两个锚点（`:119`、`:54`）失效，既有 anchor 测试转红；已更新为 `:120`、`:55`，并重新生成索引。

## 审查

- 第 1 轮独立审查（code-reviewer，只读）：Critical 0 / Important 5 / Minor 7，REQUEST CHANGES。
- 第 2 轮（同一审查者复核修订后制品）：见 PR 说明或审查回执。

## 未验证 / 剩余风险

- 未做真实单装安装（`npx skills add --skill jira-status-writeback`）的端到端演练；前置检查是散文指令，由契约测试覆盖其可核验前提（声明 + import 目标存在）。
- 跨 skills 根混装（全局 + 项目级）时相对 import 不解析，已写入 design Risks 与 SKILL.md 的安装布局前提。
