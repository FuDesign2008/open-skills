## Context

`render-html.mjs` 在第一批拆分后已经调用 core，但文件本身仍是单一职责的混合体。宿主与测试对它的依赖有两类：一类是**路径**（`<queue-skill-dir>/scripts/render-html.mjs`，出现在 SKILL.md、reference.md、OpenSpec 与契约测试里），一类是**导出名**（`renderReviewPage`、`renderEvidencePage` 等）。这两类都是外部契约，重构必须原样保留。

## Goals / Non-Goals

**Goals**

- 每个模块只有一个职责，读者能在 60 秒内判断一段代码属于「通用渲染」「队列文档」「队列页面」还是「打开浏览器」。
- 去掉 re-export 与重复知识，让「适配器 = 队列特有逻辑」这一边界在导入关系上可见。
- 用字节级等价证明「输出没变」，而不是靠阅读保证。

**Non-Goals**

- 不改 `render-core.mjs`、不改任何 SKILL.md / reference.md 正文、不改 OpenSpec 行为需求。
- 不改 HTML 结构、CSS、文案、CLI 参数或降级行为。
- 不引入 TypeScript、打包器或新依赖。

## Decisions

### D1：模块边界与导入方向

| 模块 | 职责 | 导入 |
|------|------|------|
| `core-bridge.mjs` | 动态导入 core；core 缺失时提供降级桩与 `renderer unavailable` 错误 | 无（仅 fs/url） |
| `queue-labels.mjs` | 中英文 chrome 文案、`kindLabel`、`shellOptionsFor` | `core-bridge` |
| `queue-document.mjs` | Markdown → 队列文档（meta/KPI/章节）、`renderDocument`、`renderFile` | `core-bridge`、`queue-labels` |
| `queue-pages.mjs` | 入口页、评审页、证据页 | `core-bridge`、`queue-labels`、`queue-document`（仅 `renderKpiRow`） |
| `queue-open.mjs` | `readTrigger`、`openInBrowser`、`maybeAutoOpen` | `core-bridge` |
| `render-html.mjs` | facade：导入并再导出公共 API；CLI 参数解析、入口判断与降级打印 | 以上全部 |

导入方向单向：`labels → document → pages`，无环。`render-html.mjs` 是唯一的公共入口，也是唯一含 CLI 的文件。

### D2：facade 保留公共导出，移除其余 core re-export

宿主（`goal-driven-queue`、`goal-driven-workflow`）按路径加载适配器并调用 `renderReviewPage` / `renderEvidencePage`；OpenSpec 需求写明这两个函数留在队列 adapter 内。因此 facade 必须继续导出全部队列 API。

`renderNav` 例外保留：两个宿主 SKILL.md 都写明用 `renderNav` 生成评审页/证据页的共享导航块，且宿主只被要求解析适配器路径，因此它是适配器的公共导出而非内部符号。

其余 core 符号（`renderMarkdown`、`normalizeTarget`、`renderShell` 等）不再从适配器再导出：它们属于 `report-output-discipline`，测试直接从 core 导入。这样「谁拥有什么」在 import 语句上就是事实，而不是注释里的约定。

### D3：等价性用字节基线证明

等价测试 `render-html.equivalence.test.mjs` 覆盖：

- `renderDocument` 的 6 种 kind（card / triage / progress / verification / report / document）× 中英文（12 个 fixture）
- `renderEntryPage`：中英文（含缺失目标标注、extras、KPI）
- `renderReviewPage`：中文、英文、带 `navHtml` 的导航透传
- `renderEvidencePage`：中文有图、英文有图、空证据

输入固定为相对路径与固定 `generatedAt`，并注入 `linkExists`；页面 fixture 在临时目录构造真实文件并把临时根归一化为 `<ROOT>`，不随路径抖动。每份输出的完整 HTML 取 SHA-256，以常量断言。

**基线必须在重构前采集**：先在当前实现上写出测试并跑绿，再动代码；重构后必须仍绿。这样哈希不是「重构后输出长什么样」的自证，而是重构前后的对照。若某份输出变化，测试输出打印该 fixture 的首个差异位置，便于判断是意外还是有意。

### D4：连带更新

- 适配器测试的 core 符号导入改为 `../../report-output-discipline/scripts/render-core.mjs`；队列 API 仍从 `./render-html.mjs` 导入。
- 仓库级契约测试 `human-facing-html-contract.test.mjs` 读取的文案（`source: "来源"` 等）与 `normalizeTarget(item.image)` 改读 `queue-pages.mjs` / `queue-labels.mjs` 的实际归属文件。
- 注册表的 7 个证据锚点（`render-html.mjs:285/426/458/529` 等）改为新模块中的对应行号；锚点测试会拦截空行，但语义指向需人工核对（铁律 9）。
- `goal-driven-queue` 版本 0.18.0 → 0.18.1；`report-output-discipline` 不改。

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|------|------|------|
| 拆分后行为漂移 | 验收页/评审页出现细微差异 | D3 字节基线；重构前后各跑一次 |
| 宿主按路径加载失败 | 队列运行无法生成 HTML | facade 路径与导出名不变；适配器测试与 CLI 冒烟覆盖 |
| 注册表锚点指向错误行 | 消费证据失真 | 重构后逐条比对锚点指向的函数名，而非只看行号非空 |
| 模块增多带来认知成本 | 读者需跨文件 | 每个模块文件头一行说明职责；facade 保留原有公共 API，入口不增加 |

## Migration

无。宿主与安装形态不变；已安装的旧副本在下一次全量安装时替换为多文件版本（skills CLI 复制整个目录）。
