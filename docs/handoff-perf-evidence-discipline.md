# 交接文档：perf-evidence-discipline skill 沉淀

> 本文档由 bulb 性能优化工程（MR !2656，32 commit）的执行 AI 产出，交接给 open-skills 仓库的接手 AI。
> 接手后请按本仓铁律走 `/skill-creator` 草稿化 + `/opsx-solve-workflow` 沉淀（AGENTS.md 铁律 4/5）。
> 源工程完整留痕：bulb 仓库 `BENCHMARK.md`、`benchmark/README.md` 踩坑 #9-12、`.claude/skills/code-insight/SKILL.md`。

## 一、沉淀什么：方法论的核心增量

本工程在 bulb 编辑器上完成了「基准建设 → 4 项优化（-27% commit / -31% 渲染 / -34% 内存）→ 用户卡顿四线归因（打开/输入/IME/滚动）→ 两份专项评估（虚拟滚动/React 升级）」的全闭环。过程中沉淀的**证据纪律方法论**是该工程最有复用价值的部分——现有 `perf-workflow`（流程层）与 `frontend-perf`（知识层）均未覆盖：

### 定位：`perf-evidence-discipline`（硬纪律类，`-discipline` 后缀）

**一句话**：性能结论在进入优化决策前，必须先通过证据有效性审查——测量伪影、口径污染、设备画像错配三类陷阱，任何一类未排除，结论不得作为优化依据。

**铁律性质**（区别于知识/流程 skill）：它是 perf-workflow 各阶段的前置门禁，不是平行的分析流程。

## 二、九条纪律（全部经实战验证，附原始数据）

### 纪律 1：环境节流伪影排查（rAF/帧率类指标）

- **现象**：受控浏览器环境（无头/被遮挡/后台窗口）测得 ~700-850ms「帧延迟」双峰分布
- **根因**：Chromium backgroundThrottling 对遮挡窗口把 rAF 节流到 ~800ms、timer 压向 1Hz；`bringToFront`/焦点模拟均不能解除（遮挡是 OS 窗口状态）
- **判别法**：CPU Profiler 采样——长帧期间 99.9% idle 即环境伪影而非产品长任务
- **替代测法**：刺激与测量放同一 JS 任务（如改容器宽度后立即强制同步布局读取），不给浏览器在中间完成布局的机会
- **实战数据**：bulb resize 负载首版 rafMs 728ms → 同步口径实测 9ms（300 段），伪影放大 80 倍

### 纪律 2：监控器自污染（自举陷阱）

- **现象**：dev 模式（带监控埋点）与生产模式同一负载数字差 3-5 倍
- **根因**：性能监控器自身开销（每 commit 全树遍历）+ 未压缩代码，把真实 157ms 放大到 745ms（~4.7x）
- **判别法**：监控口径 vs 浏览器原生指标（LongTask）对照；**两者矛盾时信浏览器原生指标**
- **实战数据**：bulb 打开负载 dev 745ms vs 生产 157ms；优化决策必须以生产口径为准

### 纪律 3：统计口径歧义（框架内部计数）

- **现象**：「每键渲染 13,420 组件」与同窗口仅 2 个 LongTask 的量级矛盾
- **根因**：React 16 fiber 的 `alternate===null` 在 bailout 复用时大量存在（易误判 mount）；`effectTag` PerformedWork 位在复用时不清除历史残留，全树 DFS 重复计数
- **判别法**：任何自建统计先做一次小规模审计（mounts vs performed vs total 三计数交叉）；与 LongTask 矛盾时信后者
- **实战后果**：曾据此误判「SCU 全失效架构穿透」，撤回避免了错误优化

### 纪律 4：设备画像校准（定罪矩阵）

- **现象**：高端开发机零阻塞，用户持续抱怨卡顿
- **根因**：开发者设备与用户设备 CPU 差 5-20 倍
- **方法**：`Emulation.setCPUThrottlingRate` 节流矩阵（x1/x8/x20）× 路径 × 规模——**不节流的「无罪」结论对低端用户无效**
- **实战数据**：bulb 滚动 x1→0 LongTask / x8→18 个 1089ms / x20→47 个 6282ms——同一负载三种结论

### 纪律 5：输入事件真实性

- **现象**：合成输入「成功执行」但文本未进文档
- **根因**：CDP `dispatchKeyEvent` 走的事件路径不触发编辑器的文本处理链（40 键全部不入文档）；程序滚动 `scrollBy` 不走完整滚动管线
- **判别法**：**任何输入负载前后必须验证文档内容变化量**（textLen 差值 = 输入字符数才有效）
- **正确驱动**：文本用宿主原生输入 API / IME 用 `Input.imeSetComposition` / 滚动用 `mouseWheel` 派发

### 纪律 6：埋点开关生命周期

- **现象**：页面加载后设 localStorage 开关，埋点不生效
- **根因**：开关在模块加载时读一次（构造期求值），后续变更不可见
- **方法**：开关必须经 `Page.addScriptToEvaluateOnNewDocument` 在页面脚本加载前注入
- **连带**：埋点 span 以 rAF 收尾的（首屏/全屏渲染类），其数字含节流帧（见纪律 1）——阶段结论只用同步 span + LongTask

### 纪律 7：单样本画像外推禁令

- **现象**：用本机数据（96.1% 笔记 <10KB）否决大文档优化——被产品侧现场证据推翻（大量用户笔记数万字）
- **方法**：开发者数据 ≠ 用户画像；**负向 ROI 结论必须有用户画像佐证**（埋点聚合/客服反馈/现场数据），单账号样本不可外推

### 纪律 8：终极对照实验（成本分离）

- **场景**：Profiler 显示 `(program)`/`(idle)` 占主体（JS 无热点），需回答「是产品代码成本还是 DOM 规模物理成本」
- **方法**：克隆 DOM 为纯静态副本（脱离框架/编辑器逻辑、同样式环境），同负载同节流对比 LongTask
- **判读**：副本 ≈ 原件 → 主体是 DOM×样式环境的基础渲染成本，优化方向从「找代码热点」转「削减渲染基础成本」（containment/样式域/虚拟化）；差值 = 产品代码边际，即优化收益上限
- **实战数据**：纯静态副本 792ms ≈ 编辑器 1089ms → bulb JS 边际仅 ~30%，一次实验定界「多年卡顿」为物理成本非架构 bug
- **附带消融**：手动激活既有优化机制重跑对照——**「机制存在 ≠ 机制可用」**（bulb content-visibility 激活后 1089→7139ms 负优化）

### 纪律 9：负结果与口径修正同样留痕

- **现象**：伪影数据已写进报告/文档，被他人引用做优化决策
- **方法**：发现伪影立即在基准留痕文档标注「作废警示行」（含作废原因与正确口径）；三例实战：rafMs 728ms / dev 突发 745ms / 每键 13,420 组件
- **原则**：归因工程的产出不只是「找到什么」，还有「排除了什么」——伪影排除记录防止后人重蹈

## 三、skill 结构建议（接手 AI 按 skill-creator 细化）

```yaml
# SKILL.md frontmatter 草案
---
name: perf-evidence-discipline
version: '1.0.0'
user-invocable: false   # 硬纪律类，被 perf-workflow 引用（参照 completion-evidence-discipline 模式）
description: "Hard discipline for performance evidence validity: reject conclusions
  from measurement artifacts, monitor self-pollution, framework counter ambiguity,
  and device-profile mismatch before any optimization decision. Attach to
  perf-workflow as a pre-gate at evidence/localization/verification stages.
  Triggers — 「性能证据纪律」「伪影排查」「口径校准」「设备画像」 / perf evidence
  discipline, measurement artifact check, caliber calibration. Do NOT use as a
  standalone analysis workflow — it gates evidence, it does not find bottlenecks."
dependencies:
  - perf-workflow
---
```

- SKILL.md（<500 行）：九条纪律表格化——每条 现象/根因/判别法/替代测法/实战数据；纪律间引用关系；与 perf-workflow 六阶段的挂载点
- reference.md：每条纪律的完整实战案例（bulb 数据、命令、复现步骤）+ 接手后补其他技术栈案例的占位
- **平台无关**（铁律 6）：正文不写死 CDP/ego-browser/React 16——CDP 手段写「浏览器调试协议的节流/输入/注入能力」，React fiber 细节写「框架内部统计需做口径审计」+ reference 给具体案例
- **触发词含中文**（铁律 3）：description 内「性能证据纪律」等

## 四、挂载关系（与现有 skill 的集成点）

| perf-workflow 阶段 | 挂载的本纪律 |
| --- | --- |
| Stage 1 性能证据 | 纪律 1/2/5/6（证据有效性：节流/污染/输入真实/开关生命周期） |
| Stage 2 性能定位 | 纪律 3/8（口径审计 + 终极对照定界） |
| Stage 3 性能假设 | 纪律 7（画像佐证）+ 纪律 4（节流矩阵验证假设） |
| Stage 6 性能验证 | 纪律 9（负结果留痕）+ 纪律 2（生产口径验收） |

`user-invocable: false` + 被 perf-workflow 引用（铁律：死 skill 检查）——建议同时在 perf-workflow 的 SKILL.md dependencies/正文加反向引用。

## 五、源工程可引用材料

| 材料 | 位置（bulb 仓库，MR !2656 分支 fuyg/8.2.70-perf-benchmark） |
| --- | --- |
| 九条纪律的原始实战数据与命令 | `BENCHMARK.md`（留痕表全部行） |
| 踩坑 #9-12（纪律 1/2/5/6 的展开） | `benchmark/README.md` |
| 归因流水线（code-insight，含同源方法论） | `.claude/skills/code-insight/SKILL.md`（Step 3.7 终极对照实验） |
| 8 个归因探针（纪律的工程化实现） | `benchmark/probe-*.js`（js-profile/open-phase/input-perf/scu-reason/setstate-trace/spike-attr/ime-bigdoc/scroll-bigdoc） |
| 定罪矩阵原始 JSON | `benchmark/results/`（gitignore，索引在 BENCHMARK.md） |

## 六、接手后建议的验证

1. skill-creator 草稿 → 触发词 eval（与 perf-workflow/frontend-perf 的边界不混淆）
2. 至少补一个非 bulb 案例验证平台无关性（如 React 18 项目的监控口径审计）
3. opsx 沉淀：openspec/changes/add-perf-evidence-discipline/
