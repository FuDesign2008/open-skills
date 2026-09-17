## 1. OpenSpec 契约（delta specs）

- [x] 1.1 MODIFIED（goal-queue）`derived 关系且禁止共用 change/分支`：覆盖证据须 `verified`（全文覆盖 + 新增场景）
- [x] 1.2 MODIFIED（goal-queue）`并发消费与非阻塞失败`：重复任务跳过场景改为 `verified` 方成立（全文覆盖）
- [x] 1.3 MODIFIED（goal-queue-triage）`入队批量 triage`：`already-covered-by-a-verified-card`（全文覆盖）
- [x] 1.4 MODIFIED（goal-queue-triage）`信息杠杆排序`：`Waits-on` 释放须 `verified`；`awaiting` 保持等待、`returned` 搁置（全文覆盖）
- [x] 1.5 `openspec validate goal-queue-verified-evidence` 通过

## 2. 技能文本同步（skills/goal-driven-queue）

- [x] 2.1 SKILL.md Stage 1 triage：覆盖证据须 `verified`（原「a `done` card's report」）
- [x] 2.2 SKILL.md Stage 2 relationship pass：覆盖检查与 `Waits-on` 释放改为 `verified`；`awaiting` 保持等待、`returned`/非 verified 搁置
- [x] 2.3 reference.md Triage defaults：同步覆盖证据措辞

## 3. 收尾

- [x] 3.1 `openspec validate --changes --strict` 通过
- [x] 3.2 `node scripts/gen-skill-docs.mjs` + description lint + 脱敏 lint 通过
- [x] 3.3 archive 变更（合入主 specs）
