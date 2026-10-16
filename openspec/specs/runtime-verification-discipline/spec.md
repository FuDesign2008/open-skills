# runtime-verification-discipline Specification

## Purpose
TBD - created by archiving change add-ai-env-verification. Update Purpose after archive.
## Requirements
### Requirement: 验证须由 AI 在环境中执行而非交还人

任何工作流的验证环节，对「有可观察行为」的改动，SHALL 默认由 AI 在环境中亲自执行验证。AI SHALL NOT 在未尝试执行的情况下，把验证步骤列成清单交还用户。尝试执行（attempt-first）是默认动作，不是可选项。

#### Scenario: 有可达环境的行为改动

- **WHEN** 验证环节面对一个其行为可在某个 AI 能驱动的环境中检验的改动
- **THEN** AI 在该环境中亲自执行验证
- **AND** 不把「请自行运行某步骤」作为默认结论

### Requirement: 验证环境须相对生产目标分层

验证环境 SHALL 按「与被验证 app 的生产运行目标的相似度」分为真实环境与模拟环境。真实 = 与生产目标一致或等价的运行环境；模拟 = 与生产目标存在保真差距的替代环境。分层是相对概念：

- Web app：真实浏览器为真实环境；无头浏览器/假 DOM 为模拟环境。
- Electron app：该 Electron 应用为真实环境；纯浏览器为模拟环境。
- 移动 app：物理真机为真实环境；模拟器/浏览器为模拟环境。

#### Scenario: 判定 Electron 改动的验证环境

- **WHEN** 为一个生产目标是 Electron 应用的改动选择验证环境
- **THEN** 在该 Electron 应用内验证计为真实环境验证
- **AND** 在纯浏览器中验证计为模拟环境验证

### Requirement: 选层须取满足约束的最高保真层

验证环境的选择 SHALL 取「AI 能零人工干预驱动、且对当前断言足够确定 + 足够安全」的最高保真层。具体：

- 真实环境存在副作用风险（写真实后端/真实数据/真实推送）或易受 flakiness 影响（真网络/真时序）时，SHALL 采用「模拟环境先验以获得稳定信号 → 真实环境确认以获得保真 → 如实标注」的顺序。
- 仅当检查为只读且确定性高时，才可采用真实环境一步到底。

#### Scenario: 涉及写操作的验证

- **WHEN** 一项验证会写入真实后端或真实用户数据
- **THEN** 先在模拟环境验证以获得可复现信号，再在真实环境确认
- **AND** 报告中如实标注两层各自覆盖了什么

#### Scenario: 只读且高确定的检查

- **WHEN** 一项验证为只读（如读取渲染结果、computed style）且确定性高
- **THEN** 可直接在真实环境一次完成验证

### Requirement: 验证方法须由可插拔提供者解析

验证的具体执行方式 SHALL 按以下优先级解析（约定优于配置）：

1. 工程自带的验证脚本或 skill（通过规范、可发现的约定提供，如工程根的约定位置 verify 脚本 / verify skill）——优先；
2. 本工程提供的能力 skill（如 `browser-debug-toolkit` 对应 web、`android-webview-debug` 对应移动 WebView）——兜底；
3. 两者皆无时，进入诚实交还（见「交还须分类且给理由」要求）。

#### Scenario: 工程自带验证脚本

- **WHEN** 被验证工程按约定提供了自己的验证脚本/skill
- **THEN** 优先使用该工程自带的验证方式
- **AND** 仅在其缺失时才回退到本工程能力 skill

### Requirement: 交还人须发生在真硬边界且分类给理由

当 AI 无法执行某项验证时，SHALL 先将阻塞归类，且仅当属于真硬边界（C 类）时才交还人，并 SHALL 说明理由：

- **A（没接线）**：验证可自动化但尚未写脚本——SHALL 当场接线或提议接线，不交还人。
- **B（缺一次性环境）**：验证可自动化但缺一次性安装的工具链/环境——SHALL 给出安装命令由用户决定，之后 AI 接管。
- **C（真硬边界）**：SHALL 交还人并说明理由；C 含三类——AI 无法执行该步（物理设备、captcha、生物识别）、AI 无法判定结果（主观 UX、探索式评估）、动作有真实世界副作用。

禁止用「无 Bash / 环境限制」等含糊措辞不经分类就交还人。对照设计规格的布局后几何尺寸不是 C 类：它不是主观体验，在文档通道或布局探针能跑时也不是物理设备步骤。缺少探针属于 A 类，本轮写好并在上线用的父容器里跑完。低于生产层的标注不得把这些行改成人工步骤，也不得代替测量。

#### Scenario: 未接线的可自动化验证

- **WHEN** 一项验证技术上可自动化但工程里还没有对应脚本
- **THEN** AI 当场编写该脚本或提议编写
- **AND** 不把它列为人工验证项

#### Scenario: 真硬边界交还

- **WHEN** 一项验证需要真实指纹或主观 UX 判定
- **THEN** AI 交还用户并明确说明这是真硬边界及其原因

#### Scenario: 像素几何不交还人

- **WHEN** 验证是把布局后的宽高和设计规格做数值比较，且文档通道或布局探针可以执行
- **THEN** AI 在本轮测量并判定，不把该行列为人工验证项

### Requirement: 验证须充分覆盖改动的确切行为

验证 SHALL 以「软件真实被使用的方式」覆盖本次改动引入或修复的确切行为——不是「应用能启动」，而是「被修复 bug 的具体症状在真实使用路径上消失 / 新功能的真实使用路径成立」。

#### Scenario: bug 修复的充分验证

- **WHEN** 验证一个 bug 修复
- **THEN** 验证断言针对该 bug 的具体症状在其真实使用路径上已消失
- **AND** 不以「应用能正常运行」这类笼统结论替代

### Requirement: 验证报告须如实标注所用环境层

验证报告 SHALL 标注每项验证实际所用的环境层。当所用层低于生产目标层时，SHALL 标注「模拟环境已验证，真实环境建议人补一次冒烟」——该标注为诚实义务而非门禁，不阻止 AI 在可达层完成验证，但不允许把模拟环境验证表述为真实环境已确认。

#### Scenario: 低于生产目标层的标注

- **WHEN** 一个生产目标为移动真机的改动在桌面浏览器（模拟环境）完成了验证
- **THEN** 报告标注这是在模拟环境完成的验证
- **AND** 标注真实环境仍建议人工补一次冒烟，而不宣称真实环境已确认

### Requirement: 与 completion-evidence-discipline 及能力 skill 须保持正交

本 skill SHALL 与 `completion-evidence-discipline` 保持正交：后者管证据新鲜度（是否本轮真实跑过），本 skill 管环境与执行者（在哪层验、谁验）；一条通过结论须两轴同时满足。本 skill SHALL NOT 复述任何能力 skill 的通道选择或驱动 recipe——环境驱动能力委派给对应能力 skill。

#### Scenario: 通过结论需两轴都过

- **WHEN** 要对一项改动宣称「验证通过」
- **THEN** 既要有本轮新鲜证据（completion-evidence-discipline）
- **AND** 验证环境层与执行者满足本纪律

### Requirement: 能打开界面的验证 SHALL 留存非空截图文件

当一次验证打开了可查看的界面，证据记录 SHALL 写明本轮保存的运行界面截图路径。该文件 SHALL 存在且非空，扩展名为 png、jpg、jpeg 或 webp。没有打开界面的检查（单测、规格校验，以及只打印布局数字且打不开界面的探针）SHALL NOT 被要求附截图，也 SHALL NOT 为了留痕伪造图片。截图 SHALL NOT 代替该验证自己的通过条件。本纪律 SHALL NOT 复述 Figma 通道或报告字段；那些留在 `figma-pixel-verify`。

#### Scenario: 打开了界面

- **WHEN** 验证在浏览器或应用里打开了界面并完成检查
- **THEN** 记录包含一个已保存、非空的截图路径

#### Scenario: 非界面检查

- **WHEN** 验证是单测或规格校验，没有打开界面
- **THEN** 通过结论不要求截图文件

#### Scenario: 打不开界面的布局探针

- **WHEN** 测量命令只打印布局后的数字，且本轮打不开界面
- **THEN** 记录标明打不开界面，不要求伪造截图

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
