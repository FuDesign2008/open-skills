# Proposal: close-figma-pixel-loop

## Why

像素还原会在「源码常量与稿面数字一致」或「请人看一眼真机」处停住。系统控件的固有尺寸和父布局覆盖子约束之后，常量对照发现不了偏差，下一轮又把测量交给人。用户侧需要同一次请求里自己测、自己改，直到布局后的尺寸对齐。

## What Changes

- **BREAKING**（验收门）：`figma-pixel-verify` 的通过只认布局之后读到的尺寸。源码字面量对照不是测量通道。没有可执行的测量命令时，总体为 FAIL 并写明缺的命令，不把像素判断交给人。
- 节点有明确宽高、而现成平台控件布局后尺寸不同时，`figma-pixel-implement` 改用自定义控件，并在布局过程里写上稿面尺寸。
- 偏差在同一轮内修复并重测（安全上限约 8 次）。测到的盒子等于平台控件固有尺寸、且不等于稿面时，下一轮换成自定义布局。
- 四个 PDCA 宿主的通过门增加报告检查脚本退出码 0。布局探针必须装进界面使用的父容器。引擎差异可以记一笔，但不扣几何通过，也不产生人工步骤。像素几何不是主观体验硬边界。`goal-driven-workflow` 把几何行放进机器可验层。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `figma-pixel-fidelity`：测量必须来自布局后的尺寸；控件选择必须能被布局探针读到；质量浏览器的图形引导不阻塞本轮；宿主验收通过门收紧为总体 PASS。
- `opsx-solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow`：宿主规格里的 Figma 通过门与上面一致。`solve-workflow` 无独立 spec，行为写在 skill 正文。

## Impact

- `skills/figma-pixel-implement`（1.5.0 → 1.6.0）与 `skills/figma-pixel-verify`（1.6.0 → 1.7.0），含 reference。
- 宿主各加一句并通过 PATCH：`solve-workflow`、`opsx-solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow`。
- 主 spec 在归档时合并；本变更先以 delta 为契约。
