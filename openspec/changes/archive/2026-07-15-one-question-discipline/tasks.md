## 1. opsx-solve-workflow 强化（F1/F4/F3）

- [x] 1.1 阶段 1.1 行 254：去掉条件句「若检测到 brainstorming」，改为**无条件硬纪律**（F1，决定性修复）
- [x] 1.2 步骤 3 行 260：「疑问点列出」追加「若向用户提问，一次只问 1 个最关键的」（F4）
- [x] 1.3 阶段 1 Red Flags：加「1.1 一次抛出多个疑问点」违规条（F3）

## 2. solve-workflow 强化（F2/F3/F4/F5）

- [x] 2.1 「主动提问」小节行 125-127：改为醒目硬纪律版（⚠️ 标签 + 禁止项 + 为什么 + 工具化建议）（F2/F3/F5）
- [x] 2.2 步骤 3 行 218：「疑问点列出」措辞统一（F4）
- [x] 2.3 阶段 1 Red Flags 行 328：加违规条（F3）

## 3. 多平台兼容（铁律 6 落地）

- [x] 3.1 两 skill 提问方式：prose「单问题+多选项」平台无关为主，`AskUserQuestion` 降为 Claude Code 可选 + Cursor/OpenCode prose 兜底（修正初版 Claude Code 中心主义）

## 4. 长期沉淀（AGENTS.md）

- [x] 4.1 新增铁律 6（skill 正文不得硬依赖某一 Agent 专属工具，平台无关）+ 对应反模式
- [x] 4.2 修正既有反模式错引（skill-creator 是铁律 4 非 5）

## 5. 验证

- [x] 5.1 subagent 实测对照：opsx 无 brainstorming 环境 7→1（F1 决定性）；solve-workflow 改前改后均 1（边际强化）；opsx 有 brainstorming 均通过
- [x] 5.2 grep + 篇幅（opsx +1、solve-workflow +7，未膨胀）+ frontmatter 校验

## 6. 收尾

- [x] 6.1 提交（feat + fix + docs×2）+ PR #212 创建
- [x] 6.2 反向补全 OpenSpec artifacts（本 change）+ 归档
