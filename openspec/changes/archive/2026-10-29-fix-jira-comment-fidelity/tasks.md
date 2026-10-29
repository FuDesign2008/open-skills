# Tasks: fix-jira-comment-fidelity

## 1. 实现

- [x] 1.1 新增 `skills/jira-status-writeback/scripts/update-comment-wiki.mjs`：凭证链（env → jira-pat.txt 首行，逻辑同 jira-read）、`--file`/stdin 读 wiki 正文、`JIRA_URL` base、mTLS 可选、create（无 id）/update（有 id）双模式、内建回读保真校验（PASS/FAIL + 失真明细）、token 零日志；导出纯函数 `checkFidelity`。
- [x] 1.2 新增 `scripts/update-comment-wiki.test.mjs`（node:test）：checkFidelity 保真 / 转义失真（`\*`）/ 标题改写（`###`）三态 + 凭证链缺失时正确退出。
- [x] 1.3 `jira-status-writeback/SKILL.md`：SOP 步骤 2 重写为「写入 → 回读保真校验 → 失真回退脚本」；SOP 步骤 3 不变；version PATCH；正文英文（铁律 3）。
- [x] 1.4 `jira-wiki-markup/SKILL.md`：Composition 节后加三行通道保真交叉指引（指向 jira-status-writeback 的脚本），version PATCH。

## 2. 验证

- [x] 2.1 `node --check` 两脚本语法；`node --test skills/jira-status-writeback/scripts/` 全绿。
- [x] 2.2 `npm run lint:deid -- --staged` 通过（脱敏门禁，铁律 2）。
- [x] 2.3 `node scripts/gen-skill-docs.mjs` 后 skills-index 无意外 diff；`openspec validate fix-jira-comment-fidelity` 通过。
- [x] 2.4 行为实证：真实站点用脚本重放一次评论写入（脱敏票据），确认保真 PASS 路径可走通；失败不阻断（SOP「warn 不阻断」）。

## 3. 交付

- [x] 3.1 commit（fix: 前缀，含 openspec 产物原子提交）；推送分支 `fix/comment-writeback-fidelity`。
- [x] 3.2 MR → `main`，描述含根因/方案/验证证据；PR 合并偏好：merge commit（本仓铁律默认）。
