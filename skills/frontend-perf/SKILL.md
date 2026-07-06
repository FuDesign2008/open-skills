---
name: frontend-perf
version: '2.1.0'
user-invocable: false
description: "前端（含 Electron 桌面端）性能优化领域知识库，含 React 16-19、Angular 9-18+、Electron 12-28+ 版本专属优化知识。配合 perf-workflow skill 使用：perf-workflow 驱动分析流程，本 skill 提供前端专属量化标准、版本感知优化方案、瓶颈模式与工具速查。当分析 Web 前端（React/Angular/Vue）、Electron 桌面端性能问题时使用。 / Frontend (incl. Electron desktop) performance optimization knowledge base with version-specific guidance for React 16-19, Angular 9-18+, Electron 12-28+. Pair with perf-workflow skill — perf-workflow drives the analysis flow; this skill provides frontend quantified thresholds, version-aware optimizations, bottleneck patterns, and tool lookup. Use when analyzing Web frontend (React/Angular/Vue) or Electron desktop performance issues."
---

# Frontend Performance Optimization Knowledge Base

## Relationship with perf-workflow

This skill is the **knowledge layer** for `perf-workflow`; perf-workflow is the **flow layer**. Use them together.

| perf-workflow stage | Frontend-specific content provided by this skill |
| ------------------- | ------------------------------------------------- |
| Stage 1: Performance evidence | Quantified baselines: RAIL / Web Vitals / Electron thresholds |
| Stage 2: Performance localization | Frontend bottleneck pattern table; render pipeline localization rules |
| Stage 3: Performance hypotheses | Frontend-specific root causes (reflow / long tasks / IPC / leaks) |
| Stage 4: Performance monitoring | Applicable tools and instrumentation points |
| Stage 5: Performance optimization | Optimization priority lookup (P0 → P1 → P2) |
| Stage 6: Performance verification | Pass criteria (LCP / INP / CLS / startup time) |

---

## Quantified Standards Lookup

### RAIL Model (Google Chrome team, W3C recommended)

| Stage | Full name        | User experience threshold           | Core optimization direction                       |
| ----- | ---------------- | ----------------------------------- | ------------------------------------------------- |
| R     | Response         | Interaction → feedback **< 100ms**  | Keep event handlers lightweight; never block the main thread |
| A     | Animation        | Stable 60fps, single frame **< 16ms** | Use only transform / opacity; avoid reflow        |
| I     | Idle             | Split idle tasks to **< 50ms**      | Schedule non-urgent work via requestIdleCallback  |
| L     | Load             | First paint **< 2s**, usable **< 5s** | Reduce critical resource count and size           |

### Web Vitals — Three Core Metrics (2024 effective version)

| Metric | Full name                  | Good       | Needs work | Optimization direction                       |
| ------- | -------------------------- | ---------- | ---------- | -------------------------------------------- |
| LCP     | Largest Contentful Paint   | < 2.5s     | > 4s       | First paint, critical rendering path         |
| INP     | Interaction to Next Paint  | < 200ms    | > 500ms    | Main-thread long tasks, interaction response |
| CLS     | Cumulative Layout Shift    | < 0.1      | > 0.25     | Layout stability, image size reservation     |

### Electron Desktop Extended Metrics

| Metric               | Pass threshold (industry general)         | Localization tool                          |
| -------------------- | ----------------------------------------- | ------------------------------------------ |
| Cold start time      | Windows < 2s, macOS < 1.5s                | Electron DevTools / timing instrumentation |
| Warm start time      | < 500ms                                   | Timing instrumentation                     |
| IPC round-trip time  | Single call < 50ms (when called frequently) | IPC log instrumentation                    |
| Renderer memory      | No sustained growth, stable baseline      | Chrome DevTools Memory panel               |
| Main thread CPU      | Near 0 when idle, no long tasks           | Chrome DevTools Performance panel          |

---

## Frontend-specific Bottleneck Patterns

This table supplements the generic pattern table in perf-workflow Stage 3 with concrete frontend forms:

| Pattern                          | Concrete frontend symptom                                         | Typical trigger scenario (frontend)                                  | Localization tool                       |
| -------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| **Reflow (Layout)**              | Read/write of geometric properties triggers full render pipeline  | Changing width/height/position; reading offsetWidth/scrollTop then writing DOM | Performance panel Layout markers        |
| **Repaint (Paint)**              | Visual property change triggers repaint, skips Layout             | Changing color / shadow / background                                 | Performance panel Paint markers         |
| **Main-thread long task**        | Single task > 50ms blocks event loop, INP exceeds threshold       | Large data processing / complex computation / sync IPC on main thread | Performance panel Long Task markers     |
| **Wasteful re-render**           | Component props/state unchanged but re-render fires              | Unstable prop references; overly coarse global state; excessive context updates | React Profiler / Vue DevTools           |
| **IPC blocking**                 | Electron sync IPC or high-frequency IPC saturates main thread    | `sendSync` calls; high-frequency IPC inside scroll / input handlers  | Electron logs + Performance panel       |
| **Sustained memory growth**      | Memory not released, GC cannot reclaim, ultimately causing jank / crash | Unbound events; uncleared timers; large objects held by closures | Memory panel Heap Snapshot              |
| **Layout thrashing**             | Read-write-read-write alternating on DOM properties, each write forcing sync layout | Alternating read/modify of DOM geometric properties inside a loop | Performance panel dense Layout markers  |
| **React Concurrent unused**      | React 18+ project still runs long computations on synchronous path, blocking input response | Not using `useTransition` / `startTransition` to mark low-priority updates | React DevTools Profiler timeline        |
| **Angular Zone over-triggering** | Zone.js intercepts every async op, triggering full-tree change detection | Not using `NgZone.runOutsideAngular()` to isolate high-frequency events | Angular DevTools Profiler               |

---

## Framework Version Key Optimization Features

In the analysis / optimization stage, confirm the framework version first, then pick the matching strategy — different versions differ significantly.

### React Versions

| Version | Key performance feature                                                              | Optimization impact                                                       |
| ------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 16.x    | `PureComponent` / `shouldComponentUpdate` / Class components                          | Manual re-render control, no Hooks                                        |
| 16.8+   | `useMemo` / `useCallback` / `useRef` / `React.memo`                                   | Function components gain fine-grained caching                             |
| 18      | **Concurrent Rendering** / automatic batching / `useTransition` / `useDeferredValue`  | Priority scheduling; multiple setStates auto-merged; long tasks markable as low priority |
| 19      | **React Compiler (automatic memoization)** / `use()`                                  | Compiler handles reference stability automatically; manual memo rarely needed |

### Angular Versions

| Version | Key performance feature                                              | Optimization impact                                        |
| ------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| 9+      | Ivy compiler                                                         | Smaller bundle, faster compilation, tree-shaking friendly  |
| 14+     | Standalone Components                                                | Reduces NgModule overhead, finer lazy-load granularity     |
| 16+     | **Signals** (`signal()` / `computed()` / `effect()`)                 | Fine-grained reactivity, can bypass Zone.js change detection |
| 17+     | **`@defer` block** / `@for ... track`                                | Built-in deferred rendering; trackBy baked into template syntax |
| 18+     | Zoneless change detection (experimental)                             | Removes Zone.js patching entirely, eliminates Zone trigger overhead |

### Electron Versions

| Version | Key performance feature                                       | Optimization impact                                                |
| ------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| 12+     | `remote` module deprecated, `contextIsolation` on by default  | Must use `contextBridge`; eliminates remote's sync IPC overhead    |
| 20+     | `sandbox: true` on by default                                 | Lighter renderer init; preload scripts need adjustment             |
| 22+     | **`UtilityProcess` API**                                      | Proper home for CPU-intensive tasks, replaces `child_process.fork` |
| 28+     | Native ESM support in renderer                                | Native `import()` usable, more thorough tree-shaking               |

---

## Browser Render Pipeline Essentials

Render path: `DOM → CSSOM → Style → Layout (reflow) → Paint (repaint) → Composite`

| Operation type   | Most expensive stage triggered  | Typical CSS properties              | Performance tier |
| ---------------- | ------------------------------- | ----------------------------------- | ---------------- |
| Geometry change  | Layout (reflow)                 | width / height / top / margin       | Slowest          |
| Visual change    | Paint (repaint)                 | color / background / box-shadow     | Medium           |
| Composite change | Composite (composite only)      | transform / opacity                 | Fastest          |

**Core rule**: animations and scrolling must use only `transform` / `opacity`; batch other property changes and minimize their count.

---

## Electron Multi-process Essentials

| Process type        | Core responsibilities                              | Blocking impact              | Optimization red line                                  |
| ------------------- | -------------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
| **Main process**    | App lifecycle, window management, system APIs      | All windows freeze, unresponsive | No sync IO / CPU-intensive tasks / high-frequency loops |
| **Renderer process**| Window UI rendering, JS execution, user interaction| Current window freezes       | Same rules as Web frontend; no sync IPC                 |
| **GPU process**     | 3D drawing, hardware acceleration, composite layers| Animation jank, screen tearing | Avoid excessive hardware acceleration; prevent composite-layer explosion |
| **Worker process**  | CPU-intensive tasks, file IO, background computation| Does not affect UI thread   | All time-consuming tasks must run in this kind of process / Worker |

**IPC core rule**: never use `ipcRenderer.sendSync`; throttle IPC inside high-frequency events; use SharedArrayBuffer for zero-copy transfer of large data.

---

## Optimization Priority Lookup

Prioritize **the stages with the highest time share** — points under 10% share yield limited overall gain even when optimized 100x (Amdahl's law).

### P0: Do first (high impact, low cost)

- **Split long tasks**: break > 50ms synchronous tasks into < 50ms slices, schedule via `requestIdleCallback`
- **Virtual scrolling**: long lists (> 100 items) must use react-window / vue-virtual-scroller
- **Avoid reflow**: animations use only transform / opacity; batch read-then-write to DOM
- **Async IPC**: convert every Electron IPC call to async; remove all `sendSync`
- **Web Worker**: move large data parsing / encryption / complex computation off the main thread

### P1: Next (medium cost, clear gain)

- **Component caching**: React.memo / useMemo / useCallback to stabilize props and function references
- **State granularity**: split overly coarse global state to narrow unnecessary re-render scope
- **Code splitting**: route-level / component-level dynamic import to reduce first-paint JS size
- **Electron startup**: keep main process entry extremely lightweight; async-load non-first-screen modules

### P2: Optional (engineering gains, longer cycle)

- **Caching strategy**: long-term strong cache for static assets + hashed filenames; Service Worker offline cache
- **Bundle slimming**: Tree-Shaking; on-demand imports of large libraries; WebP / AVIF for images
- **Performance budget + CI/CD gate**: route LCP / INP / bundle size into the pipeline, block release on threshold breach

See [reference.md](reference.md) for detailed implementation plans.

---

## Analysis Tools Lookup

| Scenario                       | Recommended tool                                                              |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Main-thread long tasks         | Chrome DevTools → Performance panel → Long Tasks                              |
| Rendering bottleneck           | Chrome DevTools → Performance → Rendering panel                               |
| React re-render                | React DevTools Profiler (flame chart + ranked chart)                          |
| React 18+ scheduling priority  | React DevTools Profiler → timeline view to inspect Concurrent priority markers|
| Angular change detection       | Angular DevTools → Profiler (inspect change detection count and duration)     |
| Angular Signals                | Angular DevTools 17+ → Signal dependency graph visualization (experimental)   |
| Memory leak                    | Chrome DevTools → Memory → Heap Snapshot diff                                 |
| Web Vitals                     | Lighthouse / Chrome DevTools → Performance Insights                           |
| Electron process overview      | `app.getAppMetrics()` to inspect CPU / memory per process; system resource monitor |
| Electron IPC duration          | Custom log instrumentation + Chrome DevTools Performance panel                |
| Bundle size analysis           | webpack-bundle-analyzer / vite-plugin-inspect                                 |
