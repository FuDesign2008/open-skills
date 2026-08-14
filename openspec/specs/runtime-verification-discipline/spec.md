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

禁止用「无 Bash / 环境限制」等含糊措辞不经分类就交还人。

#### Scenario: 未接线的可自动化验证

- **WHEN** 一项验证技术上可自动化但工程里还没有对应脚本
- **THEN** AI 当场编写该脚本或提议编写
- **AND** 不把它列为人工验证项

#### Scenario: 真硬边界交还

- **WHEN** 一项验证需要真实指纹或主观 UX 判定
- **THEN** AI 交还用户并明确说明这是真硬边界及其原因

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

