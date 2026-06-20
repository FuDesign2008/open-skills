## Summary

<!-- 一句话说明本 PR 做了什么，以及为什么 -->

## 变更类型

- [ ] 新增 skill
- [ ] 修改 skill
- [ ] 文档（AGENTS.md / README / INSTALL 等）
- [ ] CI / 脚本
- [ ] 其他

## 检查清单

### Skill 变更（若本 PR 未改动 `skills/`，可跳过本节）

- [ ] 已运行 `node scripts/gen-skill-docs.mjs` 并提交更新后的 `docs/generated/skills-index.md`
- [ ] **未手动编辑** `docs/generated/skills-index.md`（该文件由脚本生成，手改会导致 CI `verify` 失败）
- [ ] `SKILL.md` frontmatter 完整：`name` 与目录名一致、`version` 语义化、`description` 含触发词
- [ ] 遵循 [AGENTS.md「AI 铁律」](../AGENTS.md)：数据脱敏（不含内部平台/域名/项目标识）、内容用英文书写（触发词保留中文）
- [ ] 遵循 [skills/AGENTS.md](../skills/AGENTS.md) 的 Skill 开发规范

### 通用

- [ ] 已在 [AGENTS.md](../AGENTS.md)「Skill 清单」表和 [skills/AGENTS.md](../skills/AGENTS.md)「分类与依赖」表登记（新增 skill 时）

## Validation

<!-- 列出执行过的验证命令及结果，例如：-->
<!-- - `node scripts/gen-skill-docs.mjs` -->
<!-- - `git diff --exit-code docs/generated/skills-index.md` -->
<!-- - `node --check scripts/gen-skill-docs.mjs` -->
