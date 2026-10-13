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
- [x] 3.3 报告检查脚本单测 6/6 通过，CLI 对合格报告退出 0、对孤立挂载退出 1；主规格已去掉截图收尾、等人看真机、孤立视图探针。

## 4. 截图留痕

- [x] 4.1 设计记录截图文件规则、1 字节缺口，以及审查通过。
- [x] 4.2 先写失败测试：能打开界面的通道缺少截图、文件不存在或空文件时检查失败；`not-openable` 不能用于这些通道；`layout-probe` 的 `not-openable` 不要求文件。
- [x] 4.3 检查脚本对 `Screenshot` 做存在性与非空检查，相对路径相对报告所在目录解析。
- [x] 4.4 `figma-pixel-verify` 升到 1.9.0，正文和 reference 报告模板写上截图字段。
- [x] 4.5 `runtime-verification-discipline` 升到 1.2.0，`completion-evidence-discipline` 升到 1.1.0，各写留痕一句。
- [x] 4.6 主 spec 的视觉截图要求与 delta 对齐。
- [x] 4.7 跑 `openspec validate`、检查脚本单测、description lint、deid 扫描和 `gen-skill-docs`。
