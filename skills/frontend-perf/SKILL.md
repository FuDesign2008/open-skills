---
name: frontend-perf
version: '2.0.0'
user-invocable: false
description: "Frontend (including Electron desktop) performance optimization knowledge base, covering version-specific optimization knowledge for React 16-19, Angular 9-18+, and Electron 12-28+. Works together with the perf-workflow skill: perf-workflow drives the analysis process while this skill supplies frontend-specific quantitative standards, version-aware optimization strategies, bottleneck patterns, and tool references. Use when analyzing performance issues in Web frontend (React/Angular/Vue) or Electron desktop apps. Triggers — 「前端性能」「前端性能优化」「Electron 性能」 / frontend performance, frontend perf optimization, Electron performance."
---

# Frontend Performance Optimization Knowledge Base

## Relationship with perf-workflow

This skill is the **knowledge layer** for `perf-workflow`, which is the **process layer**; the two are used together.

| perf-workflow stage | Frontend-specific content provided by this skill |
| ------------------ | --------------------------------------- |
| Stage 1: Performance evidence | Quantitative baselines: RAIL / Web Vitals / Electron metric thresholds |
| Stage 2: Performance localization | Frontend bottleneck pattern table; render-pipeline localization rules |
| Stage 3: Performance hypothesis | Frontend-specific root causes (reflow / long tasks / IPC / leaks) |
| Stage 4: Performance monitoring | Applicable tools and instrumentation points |
| Stage 5: Performance optimization | Optimization priority reference (P0 → P1 → P2) |
| Stage 6: Performance verification | Pass criteria (LCP/INP/CLS/startup time) |

---

## Quantitative Standards Quick Reference

### RAIL Model (Google Chrome team, W3C recommended)

| Phase | Full name | User-perceived threshold | Core optimization direction |
| ---- | ----------- | ------------------------------ | ------------------------------------ |
| R | Response | Interaction → feedback **< 100ms** | Lightweight event handlers, never block the main thread |
| A | Animation | Steady 60fps, per-frame **< 16ms** | Only use transform/opacity, avoid reflow |
| I | Idle | Split idle work into **< 50ms** chunks | Use requestIdleCallback to schedule non-urgent tasks |
| L | Load | First content **< 2s**, usable **< 5s** | Reduce the number and size of critical resources |

### Web Vitals: The Three Core Metrics (2024 edition)

| Metric | Full name | Good | Needs improvement | Optimization focus |
| ---- | -------------- | ------------ | ------- | ------------------------ |
| LCP | Largest Contentful Paint | < 2.5s | > 4s | First-screen loading, critical rendering path |
| INP | Interaction to Next Paint | < 200ms | > 500ms | Main-thread long tasks, interaction responsiveness |
| CLS | Cumulative Layout Shift | < 0.1 | > 0.25 | Layout stability, reserved image dimensions |

### Electron Desktop Extended Metrics

| Metric | Pass threshold (industry standard) | Localization tool |
| ------------ | ------------------------ | ------------------------------- |
| Cold start time | Windows < 2s, macOS < 1.5s | Electron DevTools / instrumentation timing |
| Warm start time | < 500ms | Instrumentation timing |
| IPC round-trip time | < 50ms per call (for frequent calls) | IPC log instrumentation |
| Renderer process memory | No sustained growth, stable baseline | Chrome DevTools Memory panel |
| Main-thread CPU | Near 0 when idle, no long tasks | Chrome DevTools Performance panel |

---

## Frontend-Specific Bottleneck Patterns

Supplements the generic pattern table in perf-workflow Stage 3; below are common concrete forms seen in frontend code:

| Pattern | Concrete frontend manifestation | Typical trigger scenario (frontend) | Localization tool |
| ----------------- | ---------------------------------------------- | ------------------------------------------------- | ------------------------------- |
| **Reflow (Layout)** | Reading/writing geometric properties re-triggers the entire render pipeline | Changing width/height/position; reading offsetWidth/scrollTop then writing to the DOM | Performance panel Layout marker |
| **Repaint (Paint)** | Changing visual properties triggers a repaint, skipping Layout | Changing color/shadow/background | Performance panel Paint marker |
| **Main-thread long task** | A single task > 50ms blocks the event loop, INP exceeds target | Heavy data processing/complex computation/synchronous IPC running on the main thread | Performance panel Long Task marker |
| **Unnecessary re-render** | Component props/state unchanged but re-render is still triggered | Unstable props references; overly coarse global state granularity; excessive context updates | React Profiler / Vue DevTools |
| **IPC blocking** | Electron synchronous IPC or high-frequency IPC saturates the main thread | sendSync calls; sending IPC at high frequency inside scroll/input handlers | Electron logs + Performance panel |
| **Continuous memory growth** | Memory not released, GC cannot reclaim it, eventually causing jank/crash | Event listeners not unbound; timers not cleared; large objects held by closures | Memory panel Heap Snapshot |
| **Layout thrashing** | Alternating "read-write-read-write" of DOM properties, each write forces a synchronous layout | Alternately reading/modifying DOM geometry inside a loop | Performance panel with dense Layout markers |
| **Underused React Concurrent features** | In React 18+ projects, long computations still run on the synchronous path, blocking user input response | Not using `useTransition` / `startTransition` to mark low-priority updates | React DevTools Profiler timeline |
| **Excessive Angular Zone triggering** | Zone.js intercepts every async operation and triggers change detection across the whole tree | Not using `NgZone.runOutsideAngular()` to isolate high-frequency events | Angular DevTools Profiler |

---

## Key Optimization Features by Framework Version

During analysis/optimization, confirm the framework version first, then pick the matching strategy — strategies differ significantly between versions.

### React Versions

| Version | Key performance feature | Optimization impact |
| ------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 16.x | `PureComponent` / `shouldComponentUpdate` / class components | Manual control of re-renders, no Hooks |
| 16.8+ | `useMemo` / `useCallback` / `useRef` / `React.memo` | Function components can do fine-grained memoization |
| 18 | **Concurrent Rendering** / automatic batching / `useTransition` / `useDeferredValue` | Priority scheduling; multiple setState calls auto-merge; long tasks can be marked low priority |
| 19 | **React Compiler (automatic memoization)** / `use()` | The compiler automatically handles reference stability; most cases no longer need hand-written memo |

### Angular Versions

| Version | Key performance feature | Optimization impact |
| ----- | ----------------------------------------------------- | ----------------------------------------- |
| 9+ | Ivy compiler | Smaller bundles, faster compilation, tree-shaking friendly |
| 14+ | Standalone Components | Reduces NgModule overhead, finer-grained lazy loading |
| 16+ | **Signals** (`signal()` / `computed()` / `effect()`) | Fine-grained reactivity, can bypass Zone.js change detection |
| 17+ | **`@defer` blocks** / `@for ... track` | Built-in deferred rendering; trackBy built into the template syntax |
| 18+ | Zoneless change detection (experimental) | Removes the Zone.js patch, fully eliminating Zone-triggered overhead |

### Electron Versions

| Version | Key performance feature | Optimization impact |
| ----- | ---------------------------------------------- | --------------------------------------------------- |
| 12+ | `remote` module deprecated, `contextIsolation` on by default | Must use `contextBridge`, eliminating remote's synchronous IPC overhead |
| 20+ | `sandbox: true` on by default | Lighter renderer process initialization, requires adjusting the preload script |
| 22+ | **`UtilityProcess` API** | The proper home for CPU-intensive tasks, replacing `child_process.fork` |
| 28+ | Native ESM support in the renderer process | Native `import()` is usable, more thorough tree-shaking |

---

## Browser Rendering Pipeline Essentials

Render path: `DOM → CSSOM → Style → Layout (reflow) → Paint (repaint) → Composite`

| Operation type | Highest-cost phase triggered | Typical CSS properties | Performance tier |
| -------- | ----------------- | --------------------------------- | -------- |
| Geometric change | Layout (reflow) | width / height / top / margin | Slowest |
| Visual change | Paint (repaint) | color / background / box-shadow | Medium |
| Composite change | Composite only | transform / opacity | Fastest |

**Core rule**: animations and scrolling should only use `transform` / `opacity`; batch and minimize any other property changes.

---

## Electron Multi-Process Essentials

| Process type | Core responsibility | Blocking impact | Optimization red line |
| ------------ | ------------------------------ | ------------------ | ---------------------------------------- |
| **Main process** | App lifecycle, window management, system APIs | All windows freeze / become unresponsive | No synchronous IO / CPU-intensive tasks / tight loops |
| **Renderer process** | Window UI rendering, JS execution, user interaction | The current window freezes | Same rules as web frontend; no synchronous IPC |
| **GPU process** | 3D drawing, hardware acceleration, compositor layer rendering | Animation jank, screen tearing | Avoid excessive hardware acceleration; prevent compositor layer explosion |
| **Worker process** | CPU-intensive tasks, file IO, background computation | Does not affect the UI thread | All time-consuming tasks must run on this type of process/Worker |

**Core IPC rule**: never use `ipcRenderer.sendSync`; throttle IPC in high-frequency events; use SharedArrayBuffer for zero-copy transfer of large data.

---

## Optimization Priority Quick Reference

Prioritize the steps that consume the largest share of time — optimizing a step that accounts for < 10% by 100x still yields limited overall gain (Amdahl's law).

### P0: Do first (high impact, low cost)

- **Split long tasks**: break synchronous tasks > 50ms into chunks < 50ms, scheduled via `requestIdleCallback`
- **Virtual scrolling**: mandatory for long lists (> 100 items), use react-window / vue-virtual-scroller
- **Avoid reflow**: use only transform/opacity for animation; batch-read then batch-write the DOM
- **Async IPC**: convert all Electron IPC to async; remove every `sendSync`
- **Web Worker**: move large-data parsing/encryption/complex computation off the main thread

### P1: Next (moderate cost, clear payoff)

- **Component memoization**: React.memo / useMemo / useCallback to stabilize props and function references
- **State granularity**: split overly coarse global state to reduce unnecessary re-render scope
- **Code splitting**: route-level / component-level dynamic import to reduce first-screen JS size
- **Electron startup**: keep the main-process entry as lean as possible; load non-first-screen modules asynchronously

### P2: Optional (engineering payoff, longer horizon)

- **Caching strategy**: long-term strong caching + hashed filenames for static assets; Service Worker offline caching
- **Bundle size reduction**: tree-shaking; import large libraries on demand; use WebP/AVIF for images
- **Performance budget + CI/CD gate**: bring LCP/INP/bundle size into the pipeline, block releases that exceed the budget

See [reference.md](reference.md) for detailed implementation approaches.

---

## Analysis Tools Quick Reference

| Scenario | Recommended tool |
| ---------------- | ------------------------------------------------- |
| Main-thread long tasks | Chrome DevTools → Performance panel → Long Tasks |
| Rendering bottlenecks | Chrome DevTools → Performance → Rendering panel |
| React re-renders | React DevTools Profiler (flame graph + ranked chart) |
| React 18+ scheduling priority | React DevTools Profiler → timeline view, check Concurrent priority markers |
| Angular change detection | Angular DevTools → Profiler (check change detection count and duration) |
| Angular Signals | Angular DevTools 17+ → Signal dependency graph visualization (experimental) |
| Memory leaks | Chrome DevTools → Memory → compare Heap Snapshots |
| Web Vitals | Lighthouse / Chrome DevTools → Performance Insights |
| Electron process overview | `app.getAppMetrics()` to check CPU/memory per process; system resource monitor |
| Electron IPC timing | Custom log instrumentation + Chrome DevTools Performance panel |
| Bundle size analysis | webpack-bundle-analyzer / vite-plugin-inspect |
