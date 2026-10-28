## 1. 忽略规则

- [x] 1.1 在 `.gitignore` 末尾按序追加 `!docs/reports/evolution/` 与 `docs/reports/**/*.html`，验证 `git check-ignore` 对 `docs/reports/evolution/ledger.md` 返回未忽略、对 `docs/reports/evolution/ledger.html` 返回忽略
- [x] 1.2 验证 `docs/reports/diagnosis/x.md`、`docs/reports/research/y/main.md` 不被忽略，各自 `.html` 被忽略

## 2. essence-diagnosis 接入

- [x] 2.1 在 `skills/essence-diagnosis/SKILL.md` 的 Output format 段写入 sink：`docs/reports/diagnosis/<YYYY-MM-DD>-<topic>.md`，同名存在时追加 `-2`，验证正文含路径与 `-2` 规则
- [x] 2.2 写入派生步骤：按 `report-output-discipline` 派生同名 HTML 并回报两条路径，渲染器不可用时降级，验证正文含派生与降级句
- [x] 2.3 frontmatter 声明 `report-output-discipline` 依赖并增加前置检查（缺失即中止并给安装命令），验证正文含检查段

## 3. competitive-research 接入

- [x] 3.1 在 `skills/competitive-research/SKILL.md` 的 Report family 段写入 sink：`docs/reports/research/<YYYY-MM-DD>-<topic>/`，同名再次运行时追加 `-2`，验证正文含路径与规则
- [x] 3.2 写入 `Layers:` 约定（围栏外恰好一行、层名到文件映射、无可选层写 `none`），验证正文含该约定与映射
- [x] 3.3 写入派生步骤（每个写出的文件各派生同名 HTML）与降级句，验证正文含两者
- [x] 3.4 frontmatter 声明依赖并增加前置检查，验证正文含检查段

## 4. evolution-review 接入

- [x] 4.1 在 `skills/evolution-review/SKILL.md` 的 Ledger 段写入 sink：`docs/reports/evolution/ledger.md`，滚动更新同一文件，验证正文含路径与「原地更新」
- [x] 4.2 写入每次更新后重新派生 `ledger.html` 与降级句，验证正文含派生与降级
- [x] 4.3 frontmatter 声明依赖并增加前置检查，验证正文含检查段

## 5. 注册表

- [x] 5.1 三条 `sink 待定` 改为 `接入`，登记 `docs/reports/` 路径、抑制方式与派生格式，验证表内无 `sink 待定` 残留
- [x] 5.2 产品名「演化复盘 ledger」改为「演化复盘台账」，验证注册表与规格名称一致

## 6. 契约测试

- [x] 6.1 `scripts/report-output-format-contract.test.mjs` 增加三个新接入项的断言（依赖声明、sink 路径、派生句、前置检查），验证测试通过
- [x] 6.2 增加 `Layers:` 可核验断言（层名到文件的映射表存在、`none` 语义存在），验证测试通过
- [x] 6.3 增加忽略规则断言：`ledger.md` 未被忽略、`ledger.html` 被忽略，验证测试通过
- [x] 6.4 运行 `node --test`（Node 22），验证全部通过

## 7. 文档与收尾

- [x] 7.1 `AGENTS.md` 为 `report-output-discipline` 引用方补依赖列；`evolution-review` 无表行则新增行，验证表格行存在
- [x] 7.2 运行 `node scripts/gen-skill-docs.mjs`，验证 `docs/generated/skills-index.md` 无未提交漂移
- [x] 7.3 运行 `npm run lint:skill-description`、`node scripts/lint-skill-deidentification.mjs --staged`、`openspec validate report-output-batch-2-sinks --strict`，验证全部通过
