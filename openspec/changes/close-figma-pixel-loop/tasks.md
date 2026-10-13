# Tasks: close-figma-pixel-loop

## 1. 契约

- [x] 1.1 写入 proposal / design / delta spec（`figma-pixel-fidelity` 的 MODIFIED + ADDED，以及三个宿主 spec 的通过门）。

## 2. Skill

- [x] 2.1 `figma-pixel-implement` 1.6.0：布局可测控件、`primitive` 列、同一轮进入 verify。
- [x] 2.2 `figma-pixel-verify` 1.7.0：`layout-probe` 通道、源码字面量不算测量、同一轮修复重测、质量浏览器的图形引导不阻塞。
- [x] 2.3 四个 PDCA 宿主各加一句通过门并 PATCH 版本。

## 3. 验证

- [x] 3.1 `openspec validate close-figma-pixel-loop` 通过。
- [x] 3.2 `node scripts/lint-skill-description.mjs` 无 error；变更 skill 文本无 denylist 命中；`node scripts/gen-skill-docs.mjs` 已跑。
