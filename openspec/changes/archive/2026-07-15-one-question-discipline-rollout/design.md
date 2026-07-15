## Context

`one-question-discipline` change 已在 opsx-solve-workflow / solve-workflow 落地一次一问硬纪律（实测 opsx 7→1）。本 rollout 将手法推广到其余 3 个声明该纪律的 skill。3 skill 现状均为无条件声明（无 opsx 条件句缺陷），本次是边际强化 + 统一标准。

## Goals / Non-Goals

**Goals:**
- jira-fix-workflow、opsx-jira-fix-workflow、think-big 统一落地醒目硬纪律 + Red Flag + 多平台
- 与 opsx/solve-workflow 标准对齐

**Non-Goals:**
- 不改其他 skill（仅这 3 个声明了提问纪律的）
- 不重构 skill 篇幅

## Decisions

**D1. 套用 F2/F3/铁律 6**
3 skill 都加：醒目硬纪律声明（F2）+ Red Flags 违规条（F3，缺失的补）+ 平台无关（铁律 6）。手法与 one-question-discipline 一致。

**D2. think-big 英文版（铁律 3）**
think-big 是英文 skill，强化用英文（"Ask one question at a time" 硬纪律版 + 多平台英文表述）。

**D3. 边际强化性质**
3 skill 已有无条件声明（不像 opsx 条件句缺陷）。本次是统一标准，非决定性修复——诚实标注，不为夸大效果而过度改写。

## Risks / Trade-offs

- **[jira-fix-workflow 1024 行篇幅]** → 精准强化（仅「主动提问」小节 + 多平台），不扩展。
- **[边际强化的价值]** → 3 skill baseline 已有无条件声明，强化对强模型边际、对弱模型/赶进度场景更鲁棒。Trade-off：统一标准的价值 > 改动成本。

## Migration Plan

- 纯文本改动，git 可回滚。
- 归档：delta spec 扩展主 specs/clarifying-question-discipline/，change 迁移 archive。

## Open Questions

- 无。手法已验证，套用即可。
