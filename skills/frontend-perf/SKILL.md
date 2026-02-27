---
name: frontend-perf
version: '2.0.0'
user-invocable: false
description: 前端（含 Electron 桌面端）性能优化领域知识库，含 React 16-19、Angular 9-18+、Electron 12-28+ 版本专属优化知识。配合 perf-workflow skill 使用：perf-workflow 驱动分析流程，本 skill 提供前端专属量化标准、版本感知优化方案、瓶颈模式与工具速查。当分析 Web 前端（React/Angular/Vue）、Electron 桌面端性能问题时使用。
---

# 前端性能优化领域知识库

## 与 perf-workflow 的协作关系

本 skill 是 `perf-workflow` 的**知识层**，perf-workflow 是**流程层**，两者配合使用。

| perf-workflow 阶段 | 本 skill 提供的前端专属内容              |
| ------------------ | --------------------------------------- |
| 阶段 1：性能证据   | 量化基准：RAIL / Web Vitals / Electron 指标阈值 |
| 阶段 2：性能定位   | 前端瓶颈模式表；渲染流水线定位规则       |
| 阶段 3：性能假设   | 前端专属根因（重排/长任务/IPC/泄漏）     |
| 阶段 4：性能监控   | 适用工具与打点位置                       |
| 阶段 5：性能优化   | 优化方案优先级速查（P0 → P1 → P2）       |
| 阶段 6：性能验证   | 达标标准（LCP/INP/CLS/启动耗时）         |

---

## 量化标准速查

### RAIL 模型（Google Chrome 团队，W3C 推荐）

| 阶段 | 全称        | 用户体验阈值                   | 核心优化方向                         |
| ---- | ----------- | ------------------------------ | ------------------------------------ |
| R    | Response 响应 | 交互 → 反馈 **< 100ms**        | 事件处理轻量化，禁止阻塞主线程       |
| A    | Animation 动画 | 帧率稳定 60fps，单帧 **< 16ms** | 仅用 transform/opacity，避免重排     |
| I    | Idle 空闲   | 空闲任务拆分到 **< 50ms**      | requestIdleCallback 调度非紧急任务   |
| L    | Load 加载   | 首屏内容 **< 2s**，可用 **< 5s** | 减少关键资源数量与体积               |

### Web Vitals 三项核心指标（2024 年生效版）

| 指标 | 全称           | 达标（良好） | 需优化  | 对应优化方向             |
| ---- | -------------- | ------------ | ------- | ------------------------ |
| LCP  | 最大内容绘制   | < 2.5s       | > 4s    | 首屏加载、关键渲染路径   |
| INP  | 下一帧交互绘制 | < 200ms      | > 500ms | 主线程长任务、交互响应   |
| CLS  | 累积布局偏移   | < 0.1        | > 0.25  | 布局稳定性、图片尺寸预留 |

### Electron 桌面端扩展指标

| 指标         | 达标阈值（业界通用）     | 定位工具                        |
| ------------ | ------------------------ | ------------------------------- |
| 冷启动耗时   | Windows < 2s，macOS < 1.5s | Electron DevTools / 打点计时    |
| 热启动耗时   | < 500ms                  | 打点计时                        |
| IPC 往返耗时 | 单次 < 50ms（频繁调用时）  | IPC 日志打点                    |
| 渲染进程内存 | 无持续上涨，基线稳定     | Chrome DevTools Memory 面板     |
| 主线程 CPU   | 空闲时接近 0，无长任务   | Chrome DevTools Performance 面板 |

---

## 前端专属瓶颈模式

补充 perf-workflow 阶段 3 通用模式表，以下为前端常见具体形态：

| 模式              | 前端具体表现                                   | 典型触发场景（前端）                              | 定位工具                        |
| ----------------- | ---------------------------------------------- | ------------------------------------------------- | ------------------------------- |
| **重排（Layout）** | 读写几何属性触发整个渲染流水线重新执行         | 修改宽高/位置；读取 offsetWidth/scrollTop 后写 DOM | Performance 面板 Layout 标记    |
| **重绘（Paint）**  | 修改视觉属性触发重绘，跳过 Layout              | 改变颜色/阴影/背景                                | Performance 面板 Paint 标记     |
| **主线程长任务**  | 单个任务 > 50ms 阻塞事件循环，INP 超标         | 大数据处理/复杂计算/同步 IPC 在主线程执行         | Performance 面板 Long Task 标记 |
| **无效重渲染**    | 组件 props/state 未变但触发 re-render          | props 引用不稳定；全局状态粒度过粗；context 过度更新 | React Profiler / Vue DevTools   |
| **IPC 阻塞**      | Electron 同步 IPC 或高频 IPC 占满主线程        | sendSync 调用；scroll/input 事件中高频发送 IPC    | Electron 日志 + Performance 面板 |
| **内存持续增长**  | 内存不释放，GC 无法回收，最终导致卡顿/崩溃    | 事件未解绑；定时器未清理；大对象被闭包持有        | Memory 面板 Heap Snapshot       |
| **布局抖动（Thrashing）** | 「读-写-读-写」DOM 属性交替，每次写后强制同步布局 | 循环内交替读取/修改 DOM 几何属性                | Performance 面板密集 Layout 标记 |
| **React Concurrent 未利用** | React 18+ 项目长计算仍在同步路径执行，阻塞用户输入响应 | 未使用 `useTransition` / `startTransition` 标记低优先级更新 | React DevTools Profiler 时间轴 |
| **Angular Zone 过度触发** | Zone.js 拦截所有异步操作触发全树变更检测 | 未用 `NgZone.runOutsideAngular()` 隔离高频事件 | Angular DevTools Profiler |

---

## 框架版本关键优化特性

在分析/优化阶段，先确认框架版本，再选对应方案——不同版本策略差异显著。

### React 版本

| 版本    | 关键性能特性                                                                    | 优化影响                                                       |
| ------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 16.x    | `PureComponent` / `shouldComponentUpdate` / Class 组件                          | 手动控制重渲染，无 Hook                                        |
| 16.8+   | `useMemo` / `useCallback` / `useRef` / `React.memo`                             | 函数组件可做细粒度缓存                                         |
| 18      | **Concurrent Rendering** / 自动批处理 / `useTransition` / `useDeferredValue`    | 优先级调度；多次 setState 自动合并；长任务可标记为低优先级     |
| 19      | **React Compiler（自动 memoization）** / `use()`                                | 编译器自动处理引用稳定性，大多数场景无需手写 memo              |

### Angular 版本

| 版本  | 关键性能特性                                          | 优化影响                                  |
| ----- | ----------------------------------------------------- | ----------------------------------------- |
| 9+    | Ivy 编译器                                            | 更小 bundle、更快编译、tree-shaking 友好  |
| 14+   | Standalone Components                                 | 减少 NgModule 开销，懒加载粒度更细        |
| 16+   | **Signals**（`signal()` / `computed()` / `effect()`） | 细粒度响应式，可绕过 Zone.js 变更检测     |
| 17+   | **`@defer` 块** / `@for ... track`                    | 内置延迟渲染；trackBy 内置到模板语法      |
| 18+   | Zoneless 变更检测（实验性）                           | 去掉 Zone.js 补丁，彻底消除 Zone 触发开销 |

### Electron 版本

| 版本  | 关键性能特性                                   | 优化影响                                            |
| ----- | ---------------------------------------------- | --------------------------------------------------- |
| 12+   | `remote` 模块废弃，`contextIsolation` 默认开启 | 必须用 `contextBridge`，消除 remote 的同步 IPC 开销 |
| 20+   | `sandbox: true` 默认开启                       | 渲染进程初始化更轻量，需调整 preload 脚本           |
| 22+   | **`UtilityProcess` API**                       | CPU 密集任务的正确归宿，替代 `child_process.fork`   |
| 28+   | 渲染进程 ESM 原生支持                          | 可用原生 `import()`，tree-shaking 更彻底            |

---

## 浏览器渲染流水线要点

渲染路径：`DOM → CSSOM → Style → Layout（重排）→ Paint（重绘）→ Composite（合成）`

| 操作类型 | 触发的最高开销阶段 | 典型 CSS 属性                    | 性能等级 |
| -------- | ----------------- | --------------------------------- | -------- |
| 几何修改 | Layout（重排）    | width / height / top / margin     | 最慢     |
| 视觉修改 | Paint（重绘）     | color / background / box-shadow   | 中等     |
| 合成修改 | Composite（仅合成）| transform / opacity              | 最快     |

**核心规则**：动画和滚动只用 `transform` / `opacity`，其余属性修改尽量批量、减少次数。

---

## Electron 多进程要点

| 进程类型     | 核心职责                       | 阻塞影响           | 优化红线                                 |
| ------------ | ------------------------------ | ------------------ | ---------------------------------------- |
| **主进程**   | 应用生命周期、窗口管理、系统 API | 所有窗口卡顿无响应 | 禁止同步 IO / CPU 密集任务 / 高频循环    |
| **渲染进程** | 窗口 UI 渲染、JS 执行、用户交互 | 当前窗口卡顿       | 同 Web 前端规则；禁止同步 IPC            |
| **GPU 进程** | 3D 绘制、硬件加速、合成层渲染  | 动画卡顿、画面撕裂 | 避免过度硬件加速；防合成层爆炸           |
| **Worker 进程** | CPU 密集任务、文件 IO、后台计算 | 不影响 UI 线程   | 所有耗时任务必须放到此类进程/Worker 执行 |

**IPC 核心规则**：禁止 `ipcRenderer.sendSync`；高频事件中 IPC 必须节流；大数据用 SharedArrayBuffer 零拷贝传输。

---

## 优化方案优先级速查

优先优化**耗时占比高的环节**，< 10% 占比的点即便优化 100 倍整体收益也有限（阿姆达尔定律）。

### P0：先做（影响大、成本低）

- **长任务拆分**：把 > 50ms 的同步任务拆成 < 50ms 小片，用 `requestIdleCallback` 调度
- **虚拟滚动**：长列表（> 100 项）必须用 react-window / vue-virtual-scroller
- **避免重排**：动画只用 transform/opacity；批量读后批量写 DOM
- **异步 IPC**：Electron 所有 IPC 改为异步；去掉所有 `sendSync`
- **Web Worker**：大数据解析/加密/复杂计算移出主线程

### P1：次之（中等成本，明显收益）

- **组件缓存**：React.memo / useMemo / useCallback 稳定 props 和函数引用
- **状态粒度**：拆分过粗的全局状态，减少不必要的重渲染范围
- **代码分割**：路由级 / 组件级动态 import，减少首屏 JS 体积
- **Electron 启动**：主进程入口极致轻量；非首屏模块异步加载

### P2：可选（工程化收益，周期较长）

- **缓存策略**：静态资源长期强缓存 + hash 文件名；Service Worker 离线缓存
- **包体积瘦身**：Tree-Shaking；按需引入大库；图片用 WebP/AVIF
- **性能预算 + CI/CD 门禁**：把 LCP/INP/包体积纳入流水线，超标拦截发布

详细落地方案见 [reference.md](reference.md)。

---

## 分析工具速查

| 场景             | 推荐工具                                          |
| ---------------- | ------------------------------------------------- |
| 主线程长任务     | Chrome DevTools → Performance 面板 → Long Tasks   |
| 渲染瓶颈         | Chrome DevTools → Performance → Rendering 面板    |
| React 重渲染         | React DevTools Profiler（火焰图 + 排名图）                               |
| React 18+ 调度优先级 | React DevTools Profiler → 时间轴视图查看 Concurrent 优先级标记           |
| Angular 变更检测     | Angular DevTools → Profiler（查看变更检测次数与耗时）                    |
| Angular Signals      | Angular DevTools 17+ → Signal 依赖图可视化（实验性）                     |
| 内存泄漏             | Chrome DevTools → Memory → Heap Snapshot 对比                           |
| Web Vitals           | Lighthouse / Chrome DevTools → Performance Insights                      |
| Electron 进程总览    | `app.getAppMetrics()` 查看各进程 CPU / 内存；系统资源监视器              |
| Electron IPC 耗时    | 自定义日志打点 + Chrome DevTools Performance 面板                        |
| 包体积分析           | webpack-bundle-analyzer / vite-plugin-inspect                            |
