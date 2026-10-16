# fix-verify-evidence-ui-screenshot — Delta Spec: runtime-verification-discipline

## ADDED Requirements

### Requirement: 验证面含 UI 行为时须包含打开 UI 的检查

验证规划时 SHALL 判定验证面是否包含 UI 行为。判定输入 SHALL 只有下面两条命令输出。变更目标、任务卡、修复描述的措辞不是判定输入。

- **路径后缀信号**：本次改动 diff 中有路径以 `.html`、`.css`、`.scss`、`.less`、`.vue`、`.svelte`、`.tsx` 或 `.jsx` 结尾。
- **视图标记信号**：同一 diff 的新增或删除行匹配下面这条大小写敏感的扩展正则：

```
^[+-].*</?(div|span|button|input|img|svg|path|ul|li|form|label|textarea|canvas|section|header|footer|nav|table|video|iframe|h[1-6])([[:space:]]|>|/)
```

两条信号使用同一次 diff。`origin/HEAD` 可解析时，该 diff 为 `git diff --merge-base origin/HEAD`；否则为 `git diff HEAD`。路径后缀用 `--name-only` 证实。视图标记用 `-U0` 经 `grep -E` 与上式过滤证实。

任一信号命中即判定含 UI 行为。验证阶段 SHALL 在 AI 可驱动的环境中至少运行一次打开 UI 的检查（真实环境优先，按既有分层规则；模拟 UI 同样计为打开 UI）。该检查触发既有「打开 UI 须留存非空截图」义务。

当本次验证由 `figma-pixel-verify` 执行，且其报告 channel 为 `layout-probe`、`Screenshot` 为 `not-openable` 时，该记录就是像素检查的界面证据并结束本前置。该 skill 的可打开通道打开界面并留截图，即满足本前置。

信号命中但本轮仍打不开 UI 时，SHALL 先按既有 A/B/C 规则分类。A 类 SHALL 在本轮接上并跑一次打开 UI 的检查。limitation 条目用于 C 类，以及 B 类在一次性环境尚未就绪时。条目 SHALL 写明受限原因、受阻层、后续明确验证动作，并写明非 UI 检查没有覆盖该 UI 行为。

两条信号都未命中时，本前置不触发。

#### Scenario: 路径后缀命中

- **WHEN** 本次改动 diff 含以 `.css` 结尾的路径
- **THEN** 验证阶段包含至少一次打开 UI 的检查并留存截图
- **AND** 不以类型检查/单测/规格校验全绿替代该检查

#### Scenario: 视图标记命中而后缀未命中

- **WHEN** 改动路径没有上述后缀，但 diff 的新增或删除行匹配视图标记正则
- **THEN** 判定步骤认定验证面含 UI 行为，验证阶段包含打开 UI 的检查
- **AND** 不以全绿的非 UI 检查替代

#### Scenario: 只在描述里提到渲染

- **WHEN** 任务卡写明验证对象是弹层定位，但 diff 无上述后缀，也无匹配视图标记的增删行
- **THEN** 本前置不触发，验证报告无需 UI 截图或 limitation 留痕
- **AND** 非 UI 检查照常满足验证要求

#### Scenario: 环境受限时先分类再留痕

- **WHEN** 路径后缀已命中，本轮打不开 UI，且阻塞分类为 C，或为 B 且一次性环境尚未就绪
- **THEN** 验证报告包含 limitation 条目：受限原因 + 受阻层 + 后续明确验证动作，并写明非 UI 检查没有覆盖该 UI 行为
- **AND** 阻塞分类为 A 时，本轮接上并跑一次打开 UI 的检查，不写 limitation 代替

#### Scenario: 模拟 UI 也计为打开 UI

- **WHEN** 检查通过本地开发服务器页面、无头浏览器或带截图能力的渲染 harness 打开了界面
- **THEN** 该检查计为打开 UI，触发既有截图留痕义务
- **AND** 若模拟 UI 也不可达，则先做 A/B/C 分类，再按「环境受限时先分类再留痕」处理

#### Scenario: layout-probe 记录结束本前置

- **WHEN** 本次验证由 `figma-pixel-verify` 执行，报告 channel 为 `layout-probe` 且 `Screenshot` 为 `not-openable`
- **THEN** 该记录结束本前置
- **AND** 不另要求一次打开 UI 的检查
