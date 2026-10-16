# fix-verify-evidence-ui-screenshot — Delta Spec: runtime-verification-discipline

## ADDED Requirements

### Requirement: 验证面含 UI 行为时须包含打开 UI 的检查

验证规划时 SHALL 判定验证面是否包含 UI 行为。判定输入 SHALL 只有下面两条命令输出。变更目标、任务卡、修复描述的措辞不是判定输入。

- **路径后缀信号**：变更集合中有路径以 `.html`、`.css`、`.scss`、`.less`、`.vue`、`.svelte`、`.tsx` 或 `.jsx` 结尾。
- **视图标记信号**：跟踪 diff 的新增或删除行匹配下面的 diff 正则，或未跟踪文件的任一行匹配标签正则。两条都大小写敏感。

diff 正则（对 `git diff -U0` 做 `grep -E`）：

```
^[+-].*</?(div|span|button|input|img|svg|path|ul|li|form|label|textarea|canvas|section|header|footer|nav|table|video|iframe|h[1-6])([[:space:]]|>|/)
```

标签正则（对每个未跟踪文件做 `grep -E`）：

```
</?(div|span|button|input|img|svg|path|ul|li|form|label|textarea|canvas|section|header|footer|nav|table|video|iframe|h[1-6])([[:space:]]|>|/)
```

变更集合 = 跟踪 diff 的路径 ∪ 未跟踪且未被 ignore 的路径。在 `git rev-parse --show-toplevel` 下执行。未跟踪路径为 `git ls-files --others --exclude-standard`。跟踪 diff 为空时，不得因此丢掉未跟踪路径。路径名来自该跟踪 diff 的 `--name-only` 加上未跟踪列表。

跟踪 diff 的 base 按下面顺序取第一个成立的：

1. `git rev-parse --verify --quiet origin/HEAD` 成功时，base 为 `origin/HEAD`。
2. 否则，当前分支名非空时，读 `git reflog show --format=%gs HEAD`（新的在前）。base 为最旧一行 `checkout: moving from <src> to <current>` 里的 `<src>`。`<src>` 不得是当前分支，且 `git rev-parse --verify --quiet <src>` 必须成功。最旧一行是该输出里最后一条匹配。
3. 否则，列 `git for-each-ref --format='%(refname:short) %(committerdate:unix)' refs/heads refs/remotes`。保留的 ref 须同时满足：名字不是当前分支，`git rev-parse <ref>` 不等于 `git rev-parse HEAD`，且 `git merge-base --is-ancestor <ref> HEAD` 成功。取 committer 时间戳最大的；时间戳相同则取字典序最小的 ref 名。
4. 否则没有 base，跟踪 diff 为 `git diff HEAD`。

有 base 时，跟踪 diff 为 `git diff --merge-base <base>`。

任一信号命中即判定含 UI 行为。验证阶段 SHALL 在 AI 可驱动的环境中至少运行一次打开 UI 的检查（真实环境优先，按既有分层规则；模拟 UI 同样计为打开 UI）。该检查触发既有「打开 UI 须留存非空截图」义务。

当本次验证由 `figma-pixel-verify` 执行，且其报告 channel 为 `layout-probe`、`Screenshot` 为 `not-openable` 时，该记录就是像素检查的界面证据并结束本前置。该 skill 的可打开通道打开界面并留截图，即满足本前置。

信号命中但本轮仍打不开 UI 时，SHALL 先按既有 A/B/C 规则分类。A 类 SHALL 在本轮接上并跑一次打开 UI 的检查。limitation 条目用于 C 类，以及 B 类在一次性环境尚未就绪时。条目 SHALL 写明受限原因、受阻层、后续明确验证动作，并写明非 UI 检查没有覆盖该 UI 行为。

两条信号都未命中时，本前置不触发。

#### Scenario: 路径后缀命中

- **WHEN** 本次改动 diff 含以 `.css` 结尾的路径
- **THEN** 验证阶段包含至少一次打开 UI 的检查并留存截图
- **AND** 不以类型检查/单测/规格校验全绿替代该检查

#### Scenario: 未跟踪的视图文件命中

- **WHEN** 工作区有未被 ignore 的未跟踪路径以 `.html` 结尾，且该路径不在 `git diff --name-only` 的输出里
- **THEN** 路径后缀信号命中，验证阶段包含至少一次打开 UI 的检查并留存截图
- **AND** 不以「跟踪 diff 未列出该文件」当作未命中

#### Scenario: 无 origin/HEAD 时用本地 main

- **WHEN** `origin/HEAD` 不能被 `git rev-parse --verify --quiet` 解析，本地 `main` 能解析，相对 `main` 的 merge-base diff 含以 `.css` 结尾的路径，且 `git diff HEAD` 为空
- **THEN** 路径后缀信号命中
- **AND** 不以空的 `git diff HEAD` 当作未命中

#### Scenario: 基线分支不叫 main 或 master

- **WHEN** 没有 `origin/HEAD`、`main`、`master`，本地基线分支是 `develop`，功能分支从 `develop` 分出并已提交以 `.css` 结尾的路径，工作区干净，`git diff HEAD` 为空
- **THEN** 路径后缀信号命中
- **AND** 不以空的 `git diff HEAD` 当作未命中

#### Scenario: 视图标记命中而后缀未命中

- **WHEN** 改动路径没有上述后缀，但 diff 的新增或删除行匹配视图标记正则
- **THEN** 判定步骤认定验证面含 UI 行为，验证阶段包含打开 UI 的检查
- **AND** 不以全绿的非 UI 检查替代

#### Scenario: 只在描述里提到渲染

- **WHEN** 任务卡写明验证对象是弹层定位，但变更集合无上述后缀，跟踪 diff 与未跟踪文件也都不匹配视图标记
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
