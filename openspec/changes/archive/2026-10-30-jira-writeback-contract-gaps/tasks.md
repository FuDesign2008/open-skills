## 1. jira-status-writeback 依赖契约

- [x] 1.1 在 `skills/jira-status-writeback/SKILL.md` 的 frontmatter `dependencies` 增加 `jira-read`，版本 1.2.1 → 1.3.0
- [x] 1.2 更新前置检查说明：同时检查 `jira-wiki-markup` 与 `jira-read`，缺失时给出同一条全量安装命令，并说明加载中止按写回失败告警处理（不回滚已完成合并）
- [x] 1.3 把「本 skill 不解析 PAT 文件」限定为 SOP 层（session/MCP 认证），并在回退步骤说明脚本通过 `jira-read` 的凭证链取值、要求两个 skill 装在同一 skills 根下
- [x] 1.4 在 `skills/jira-fix-workflow/SKILL.md` 的 frontmatter `dependencies` 补 `jira-read`（与其 spec 和 `AGENTS.md` 既有声明对齐），版本 3.38.0 → 3.39.0

## 2. jira-wiki-markup 保真契约

- [x] 2.1 在 `skills/jira-wiki-markup/SKILL.md` 的保真小节写明：四个标记（`h3.`/`h4.` 行首、`*bold*`、`{{mono}}`、`[label|url]`）、无法回读即视为未验证、回退通道可用性判定（脚本与凭证解析器文件都存在才算可用）、bundled 脚本只写 comment body（其他字段需等价端点，否则按无通道报告），版本 1.1.1 → 1.2.0
- [x] 2.2 该小节指明保真校验同样适用于任意 Wiki 字段写入（不止合并后评论），并以条件化能力措辞指认提供直写脚本的 writeback skill（不作为 MUST 级依赖）

## 3. 文档与清单同步

- [x] 3.1 更新 `AGENTS.md` Skill 清单中 `jira-status-writeback` 的依赖列为 `jira-wiki-markup、jira-read`；核对 `jira-fix-workflow` 行已含 `jira-read`（无需改动）
- [x] 3.2 运行 `node scripts/gen-skill-docs.mjs` 重新生成 `docs/generated/skills-index.md`：版本列必然变化（四个 skill），提交前核对 diff 仅含这些版本行
- [x] 3.3 修正 `skills/report-output-discipline/reference.md` 中指向 `jira-fix-workflow/SKILL.md` 的两个行号锚点（119→120、54→55），并把 `report-output-discipline` patch bump 到 1.0.1

## 4. 验证

- [x] 4.1 新增 `scripts/jira-writeback-dependency.test.mjs`：断言 writeback frontmatter 同时含 `jira-wiki-markup` 与 `jira-read`；断言 `jira-read/scripts/resolve-jira-token.mjs` 存在；断言回退脚本的静态 import 指向该文件且路径可解析；断言 `jira-fix-workflow` frontmatter 含 `jira-read`
- [x] 4.2 运行 `node --test scripts/jira-writeback-dependency.test.mjs`，以退出码与断言输出作为证据（替代不可执行的「模拟前置检查」）；另做一次变异验证：移除 `jira-read` 声明后该测试必须转红
- [x] 4.3 `openspec validate --all` 通过（0 失败）
- [x] 4.4 `npm run lint:skill-description` 通过
- [x] 4.5 `node --test` 全绿（确认本变更未影响既有契约测试）

## 5. 归档与交付

- [x] 5.1 阶段 7 验证报告写入 `verification.md`（含 4.2–4.5 的原始输出摘要与变异验证结果）
- [x] 5.2 `openspec archive jira-writeback-contract-gaps` 后核对主 spec 与归档副本一致
- [ ] 5.3 提交、推送、开 PR；不自动合并，等待用户指定合并方式
