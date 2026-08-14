# Performance Optimization Reference — Knowledge Layer

Stack-specific knowledge for `perf-optimize-workflow`. The paradigm in [SKILL.md](SKILL.md) is durable; **this file is the perishable layer** — framework versions, thresholds, and tool tables age. Refresh entries via knowledge-only changes (PATCH version bumps) without touching the paradigm file.

> **Reading guide**: Part 1 is the frontend quick-reference (standards, patterns, version features, tools) mapped to workflow stages; Part 2 is the frontend detailed expansion for the Optimize stage; Part 3 reserves extension slots for other stacks. During analysis rely on SKILL.md + Part 1; during optimization consult Part 2 as needed.

## Part 1 — Frontend quick reference (by workflow stage)

| Workflow stage | Frontend-specific content here |
| -------------- | ------------------------------ |
| Stage 1: Benchmark & evidence | Quantitative baselines: RAIL / Web Vitals / Electron metric thresholds |
| Stage 2: Locate the bottleneck | Frontend bottleneck pattern table; render-pipeline localization rules |
| Stage 3: Hypothesize the root cause | Frontend-specific root causes (reflow / long tasks / IPC / leaks) |
| Stage 4: Build toggleable monitoring | Applicable tools and instrumentation points |
| Stage 5: Optimize | Optimization priority reference (P0 → P1 → P2); Part 2 detailed approaches |
| Stage 6: A/B verify | Pass criteria (LCP/INP/CLS/startup time) |

### Quantitative standards

**RAIL model** (Google Chrome team, W3C recommended):

| Phase | Full name | User-perceived threshold | Core optimization direction |
| ---- | ----------- | ------------------------------ | ------------------------------------ |
| R | Response | Interaction → feedback **< 100ms** | Lightweight event handlers, never block the main thread |
| A | Animation | Steady 60fps, per-frame **< 16ms** | Only use transform/opacity, avoid reflow |
| I | Idle | Split idle work into **< 50ms** chunks | Use requestIdleCallback to schedule non-urgent tasks |
| L | Load | First content **< 2s**, usable **< 5s** | Reduce the number and size of critical resources |

**Web Vitals: the three core metrics** (2024 edition — verify currency before use):

| Metric | Full name | Good | Needs improvement | Optimization focus |
| ---- | -------------- | -------------- | ------- | ------------------------ |
| LCP | Largest Contentful Paint | < 2.5s | > 4s | First-screen loading, critical rendering path |
| INP | Interaction to Next Paint | < 200ms | > 500ms | Main-thread long tasks, interaction responsiveness |
| CLS | Cumulative Layout Shift | < 0.1 | > 0.25 | Layout stability, reserved image dimensions |

**Electron desktop extended metrics**:

| Metric | Pass threshold (industry standard) | Localization tool |
| ------------ | ------------------------ | ------------------------------- |
| Cold start time | Windows < 2s, macOS < 1.5s | Electron DevTools / instrumentation timing |
| Warm start time | < 500ms | Instrumentation timing |
| IPC round-trip time | < 50ms per call (for frequent calls) | IPC log instrumentation |
| Renderer process memory | No sustained growth, stable baseline | Chrome DevTools Memory panel |
| Main-thread CPU | Near 0 when idle, no long tasks | Chrome DevTools Performance panel |

### Frontend bottleneck patterns (concrete manifestations)

Concrete frontend forms of the generic pattern table in SKILL.md Stage 3:

| Pattern | Concrete frontend manifestation | Typical trigger scenario | Localization tool |
| ----------------- | ---------------------------------------------- | ------------------------------------------------- | ------------------------------- |
| **Reflow (Layout)** | Reading/writing geometric properties re-triggers the entire render pipeline | Changing width/height/position; reading offsetWidth/scrollTop then writing to the DOM | Performance panel Layout marker |
| **Repaint (Paint)** | Changing visual properties triggers a repaint, skipping Layout | Changing color/shadow/background | Performance panel Paint marker |
| **Main-thread long task** | A single task > 50ms blocks the event loop, INP exceeds target | Heavy data processing/complex computation/synchronous IPC on the main thread | Performance panel Long Task marker |
| **Unnecessary re-render** | Component props/state unchanged but re-render is still triggered | Unstable props references; coarse global state; context updates | React Profiler / Vue DevTools |
| **IPC blocking** | Electron synchronous IPC or high-frequency IPC saturates the main thread | sendSync calls; high-frequency IPC in scroll/input handlers | Electron logs + Performance panel |
| **Continuous memory growth** | Memory not released, GC cannot reclaim it, eventually jank/crash | Listeners not unbound; timers not cleared; closures holding large objects | Memory panel Heap Snapshot |
| **Layout thrashing** | Alternating read-write-read-write, each write forces synchronous layout | Alternately reading/modifying DOM geometry in a loop | Performance panel, dense Layout markers |
| **Underused concurrent features** | React 18+: long computations still on the synchronous path | Not using `useTransition` / `startTransition` for low-priority updates | React DevTools Profiler timeline |
| **Excessive zone triggering** | Zone.js intercepts every async op and triggers whole-tree change detection | Not isolating high-frequency events from the zone | Angular DevTools Profiler |

### Key optimization features by framework version

Confirm the framework version first, then pick the strategy — strategies differ significantly across versions.

**React**:

| Version | Key performance feature | Optimization impact |
| ------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 16.x | `PureComponent` / `shouldComponentUpdate` / class components | Manual control of re-renders, no Hooks |
| 16.8+ | `useMemo` / `useCallback` / `useRef` / `React.memo` | Function components can do fine-grained memoization |
| 18 | **Concurrent rendering** / automatic batching / `useTransition` / `useDeferredValue` | Priority scheduling; multiple setState auto-merge; long tasks markable low-priority |
| 19 | **React Compiler (automatic memoization)** / `use()` | Compiler handles reference stability; most hand-written memo no longer needed |

**Angular**:

| Version | Key performance feature | Optimization impact |
| ----- | ----------------------------------------------------- | ----------------------------------------- |
| 9+ | Ivy compiler | Smaller bundles, faster compilation, tree-shaking friendly |
| 14+ | Standalone components | Less NgModule overhead, finer lazy loading |
| 16+ | **Signals** (`signal()` / `computed()` / `effect()`) | Fine-grained reactivity, bypasses Zone.js change detection |
| 17+ | **`@defer` blocks** / `@for ... track` | Built-in deferred rendering; trackBy in template syntax |
| 18+ | Zoneless change detection (experimental) | Removes the Zone.js patch entirely |

**Electron**:

| Version | Key performance feature | Optimization impact |
| ----- | ----------------------------------------------------- | ----------------------------------------------- |
| 12+ | `remote` deprecated, `contextIsolation` default on | Must use `contextBridge`; no more remote sync-IPC overhead |
| 20+ | `sandbox: true` default | Lighter renderer init |
| 22+ | **`UtilityProcess` API** | Proper home for CPU-intensive tasks, replacing `child_process.fork` |
| 28+ | Native ESM in renderer | Native `import()`, more thorough tree-shaking |

### Browser rendering pipeline essentials

Render path: `DOM → CSSOM → Style → Layout (reflow) → Paint (repaint) → Composite`

| Operation type | Highest-cost phase triggered | Typical CSS properties | Performance tier |
| -------- | ----------------- | --------------------------------- | -------- |
| Geometric change | Layout (reflow) | width / height / top / margin | Slowest |
| Visual change | Paint (repaint) | color / background / box-shadow | Medium |
| Composite change | Composite only | transform / opacity | Fastest |

Core rule: animations and scrolling use only `transform` / `opacity`; batch everything else.

### Electron multi-process essentials

| Process type | Core responsibility | Blocking impact | Optimization red line |
| ------------ | ------------------------------ | ------------------ | ---------------------------------------- |
| **Main process** | App lifecycle, window management, system APIs | All windows freeze | No synchronous IO / CPU-intensive tasks / tight loops |
| **Renderer process** | Window UI rendering, JS execution, interaction | Current window freezes | Same rules as web frontend; no synchronous IPC |
| **GPU process** | 3D drawing, hardware acceleration, compositing | Animation jank, tearing | Avoid compositor layer explosion |
| **Worker process** | CPU-intensive tasks, file IO, background computation | Does not affect UI thread | All time-consuming tasks live here |

Core IPC rule: never `ipcRenderer.sendSync`; throttle IPC in high-frequency events; `SharedArrayBuffer` for zero-copy transfer of large data.

### Analysis tools quick reference

| Scenario | Recommended tool |
| ---------------- | ------------------------------------------------- |
| Main-thread long tasks | Chrome DevTools → Performance panel → Long Tasks |
| Rendering bottlenecks | Chrome DevTools → Performance → Rendering panel |
| React re-renders | React DevTools Profiler (flame graph + ranked chart) |
| React 18+ scheduling priority | React DevTools Profiler → timeline view, priority markers |
| Angular change detection | Angular DevTools → Profiler (CD count and duration) |
| Angular Signals | Angular DevTools 17+ → Signal dependency graph (experimental) |
| Memory leaks | Chrome DevTools → Memory → compare Heap Snapshots |
| Web Vitals | Lighthouse / Chrome DevTools → Performance Insights |
| Electron process overview | `app.getAppMetrics()`; system resource monitor |
| Electron IPC timing | Custom log instrumentation + Performance panel |
| Bundle size analysis | webpack-bundle-analyzer / vite-plugin-inspect |

---

## Part 2 — Frontend optimization detailed reference (Optimize stage)

Detailed expansion of the optimization priorities, organized by category. During analysis (Stages 2-3) rely on SKILL.md + Part 1; during implementation (Stage 5) consult this part as needed.

### 2.1 Rendering performance

**Batch DOM modifications**:

- Build the DOM tree offline with `DocumentFragment` and insert it in one shot
- When changing multiple styles, use `classList` or modify `cssText` instead of setting properties one by one
- Avoid reading and writing the DOM inside a loop: batch-read all needed values first, then batch-write

**Fixing layout thrashing**:

```javascript
// Wrong: alternating read-write, each write forces a synchronous Layout
for (item of items) {
  item.style.width = item.offsetWidth + 10 + 'px'  // read → write → forced Layout
}

// Correct: read all values first, then batch-write
const widths = items.map(item => item.offsetWidth)  // batch read
items.forEach((item, i) => item.style.width = widths[i] + 10 + 'px')  // batch write
```

**Animation optimization**:

- Only `transform` and `opacity` for animations (Composite only)
- `will-change: transform` promotes to an independent compositor layer ahead of time (avoid overuse — too many layers increases memory instead)
- Never animate `top/left/width/height`

### 2.2 React / Angular re-render optimization

**Diagnosing and fixing unnecessary React re-renders** — locate via React DevTools Profiler (flame graph; gray = not rendered, colored = rendered). Common root causes:

| Root cause | Fix |
| ------------------------- | ----------------------------------------------------- |
| Parent re-render cascades to children | Wrap the child with `React.memo` to stabilize the props reference |
| New object/array created on every render | Cache the reference with `useMemo(() => ({...}), [deps])` |
| New function created on every render | Stabilize the callback reference with `useCallback(() => fn, [deps])` |
| Context change affects all consumers | Split the context; or cache the context value with `useMemo` |
| Global state granularity too coarse | Split into atoms (Jotai/Zustand); subscribe precisely with selectors |

**State granularity**: split a large global store into independent small stores or atoms so components subscribe only to the slice they need.

**React 18+ concurrent features (use these first)**:

```tsx
// useTransition — recommended for search/filter/navigation
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    setQuery(e.target.value)          // High priority: update the input immediately
    startTransition(() => {
      setResults(filterData(e.target.value))  // Low priority: results can lag
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultList items={results} />}
    </>
  )
}

// useDeferredValue — recommended for expensive derived rendering
function App() {
  const [text, setText] = useState('')
  const deferredText = useDeferredValue(text)  // Rendering lags but never blocks input
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <HeavyList query={deferredText} />
    </>
  )
}

// startTransition — non-Hook contexts (class components, utility functions)
import { startTransition } from 'react'
startTransition(() => { setState(newValue) })  // Mark as low priority
```

**Automatic batching (React 18)**: setState calls inside `setTimeout`, `Promise`, and native event handlers merge automatically — `unstable_batchedUpdates` is no longer needed manually.

**`Suspense` data boundary (paired with lazy loading)**:

```tsx
const HeavyPage = React.lazy(() => import('./HeavyPage'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HeavyPage />
    </Suspense>
  )
}
```

**React 19 React Compiler (automatic memoization)** — applies to React 19+, requires babel-plugin-react-compiler. The compiler statically analyzes components and inserts caching directives (`useMemo` / `useCallback` / `React.memo`) automatically.

Pre-migration check:

```bash
npm install eslint-plugin-react-compiler --save-dev
```

```json
// .eslintrc
{
  "plugins": ["react-compiler"],
  "rules": { "react-compiler/react-compiler": "error" }
}
```

Scenarios the compiler cannot optimize (still need manual handling):

| Scenario | Reason | Solution |
| ----------------------- | --------------------------------- | -------------------------------- |
| Dynamic `key` depends on an external mutable value | Compiler cannot track external side effects | Manual `useMemo` |
| External mutable reference (`ref.current`) | Compiler assumes references are stable | Refactor into state or annotate the dependency |
| Third-party library with impure functions | Compiler cannot analyze black-box side effects | Wrap in a pure-function wrapper |

Migration advice: enable on leaf components first, extend to parents once stable.

**Optimizing legacy React 16.x projects** (when upgrading is not an option):

```tsx
// shouldComponentUpdate: precise control over re-renders
class ExpensiveComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.data !== this.props.data  // reference comparison
  }
  render() { /* ... */ }
}

// PureComponent: shallow comparison (arrays/objects must stay immutable)
class ListItem extends React.PureComponent {
  render() { return <div>{this.props.label}</div> }
}
```

Performance pitfalls inside render:

```tsx
// Wrong: creates a new object and function on every render
render() {
  return <Child style={{ color: 'red' }} onClick={() => this.handle()} />
  //              ^^^ new object          ^^^ new function → triggers Child re-render
}

// Correct: hoist the style and function out of render
const STYLE = { color: 'red' }
class Parent extends React.Component {
  handleClick = () => this.handle()
  render() {
    return <Child style={STYLE} onClick={this.handleClick} />
  }
}
```

Manual batching (React 16 has no automatic batching):

```tsx
import { unstable_batchedUpdates } from 'react-dom'

setTimeout(() => {
  unstable_batchedUpdates(() => {
    setA(1)
    setB(2)
  })
}, 0)
```

**Deep optimization of Angular change detection** — Zone.js monkey-patches every async API, so any async completion dirties the whole tree. Core: reduce check frequency, shrink check scope.

`OnPush` (mandatory):

```typescript
@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ item.name }}</div>`,
})
export class ItemComponent {
  @Input() item!: Item  // Checked only when the item reference changes
}
```

`OnPush` triggers: `@Input` reference change / `async` pipe emits / internal component event / manual `markForCheck()`. Data immutability must be guaranteed.

`NgZone.runOutsideAngular()` (mandatory for high-frequency events):

```typescript
@Component({ /* ... */ })
export class CanvasComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      // scroll/mousemove/rAF run outside the Zone, no change detection
      window.addEventListener('scroll', this.onScroll.bind(this), { passive: true })
      requestAnimationFrame(this.renderLoop.bind(this))
    })
  }

  onScroll() {
    if (needsUpdate) {
      this.ngZone.run(() => this.updateVisibleItems())  // re-enter only to update UI
    }
  }
}
```

Pure pipes (replace template function calls):

```typescript
// Wrong: <div>{{ formatDate(item.date) }}</div> — runs on every check
// Correct: a pure pipe caches automatically (same input not recomputed)
@Pipe({ name: 'formatDate', pure: true })
export class FormatDatePipe implements PipeTransform {
  transform(date: Date): string { return /* formatting logic */ }
}
// <div>{{ item.date | formatDate }}</div>
```

List rendering `trackBy` (Angular 16 and earlier; 17+ builds it into `@for ... track`):

```typescript
trackById(index: number, item: Item): number {
  return item.id  // unique id, not index — reordering re-renders only the moved items
}
// <div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
```

**Angular 16+ Signals (recommended for new projects)** — fine-grained reactivity; only components reading a signal update when it changes:

```typescript
import { signal, computed, effect } from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  // pair with OnPush
  template: `<div>{{ count() }} — {{ doubled() }}</div>`,
})
export class CounterComponent {
  count = signal(0)
  doubled = computed(() => this.count() * 2)  // derived, cached automatically

  increment() {
    this.count.update(v => v + 1)  // only readers of count update
  }

  constructor() {
    effect(() => console.log('count changed:', this.count()))
  }
}
```

Migrating from `BehaviorSubject`: `readonly items$ = new BehaviorSubject<Item[]>([])` → `readonly items = signal<Item[]>([])`; template `items$ | async` → `items()`. For incremental migration inside existing RxJS code: `readonly data = toSignal(this.dataService.getData$(), { initialValue: [] })`.

**Angular 17+ `@defer` blocks (built-in lazy loading)**:

```html
<!-- Loads only when the component enters the viewport -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData" />
} @placeholder {
  <div class="chart-placeholder" style="height: 300px"></div>
} @loading (minimum 200ms) {
  <app-spinner />
} @error {
  <p>Chart failed to load</p>
}

<!-- Load on interaction / on idle; prefetch control -->
@defer (on interaction) {
  <app-rich-editor [(content)]="content" />
} @placeholder {
  <div class="editor-placeholder">Click to start editing</div>
}

@defer (on viewport; prefetch on idle) {
  <app-heavy-section />
}
```

**Angular module lazy loading**:

```typescript
// Route-level (all versions)
{
  path: 'dashboard',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
}

// Standalone component (14+, finer granularity)
{
  path: 'profile',
  loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent)
}

// Preloading strategy: PreloadAllModules, or custom (only routes marked preload: true)
```

### 2.3 Long lists and large-data rendering

**Virtual scrolling (mandatory for lists > 100 items)** — render only visible items (typically 10-30), placeholder elements preserve total height:

- React: `react-window` (lightweight) or `react-virtualized` (full-featured)
- Vue: `vue-virtual-scroller`
- Angular: `@angular/cdk/scrolling` (CDK VirtualScrollViewport)

Notes: fixed row height outperforms dynamic; dynamic requires height estimation + post-render update. Virtual scrolling is unsuitable when the full DOM must be present (e.g. full-text search highlighting).

**Chunked rendering for large datasets**:

```javascript
// requestIdleCallback splits a large batch of DOM operations across multiple frames
function renderChunks(items, chunkSize = 50) {
  let index = 0
  function renderNext(deadline) {
    while (index < items.length && deadline.timeRemaining() > 5) {
      renderItem(items[index++])
    }
    if (index < items.length) requestIdleCallback(renderNext)
  }
  requestIdleCallback(renderNext)
}
```

### 2.4 Main-thread long task optimization

**Short task scheduling**:

```javascript
// Split a large loop into chunks < 50ms
async function processLargeArray(items) {
  const CHUNK_SIZE = 1000
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    processChunk(items.slice(i, i + CHUNK_SIZE))
    await new Promise(resolve => setTimeout(resolve, 0))  // yield to user interaction
  }
}
```

**Web Worker (mandatory for CPU-intensive tasks)** — large-data parsing (JSON/CSV/Excel), encryption/hashing, image processing, complex computation:

```javascript
// Main thread
const worker = new Worker('./heavy-task.worker.js')
worker.postMessage({ data: largeData })
worker.onmessage = (e) => handleResult(e.data)

// heavy-task.worker.js
self.onmessage = (e) => {
  const result = doHeavyWork(e.data)
  self.postMessage(result)
}
```

### 2.5 Memory leak prevention

| Leak scenario | Fix |
| --------------------- | ------------------------------------------------------------- |
| Event listener not removed | `removeEventListener` or AbortController |
| Timer/interval not cleared | `clearInterval` / `clearTimeout` on component teardown |
| Network request not cancelled | fetch: AbortController; axios: CancelToken |
| Closure holding a large object | Check whether the callback captured a large array/DOM reference |
| React useEffect side effect | Return a cleanup function to unsubscribe/remove listeners/clear timers |
| Angular subscription not unsubscribed | `takeUntil(destroy$)` or `async pipe` |

Localization tool: Chrome DevTools → Memory → compare two Heap Snapshots → check newly added objects.

### 2.6 Electron-specific optimization

**Startup chain**:

- Main-process entry: dynamic `require`/`import()` for non-essential modules; never synchronous IO/db-init/config reads in the entry; defer plugin loading until after first window `ready-to-show`
- Renderer first paint: create window with `show: false`, display on `ready-to-show` (avoid white flash); load preload on demand exposing only necessary APIs; prefer a lightweight native splash over a web skeleton screen
- V8 compile cache: `v8-compile-cache` or electron-builder bytecode cache

**IPC communication**:

```typescript
// Wrong: synchronous IPC blocks the renderer main thread (can block the main process too)
const result = ipcRenderer.sendSync('get-data', params)

// Correct: async IPC
const result = await ipcRenderer.invoke('get-data', params)
```

Throttle IPC in high-frequency scenarios (scroll/input):

```javascript
const throttledSync = throttle((data) => {
  ipcRenderer.send('sync-state', data)
}, 100)  // at most once every 100ms
```

Large data transfer (avoid serialization overhead):

```javascript
// SharedArrayBuffer zero-copy shared memory
const sharedBuffer = new SharedArrayBuffer(1024 * 1024)
ipcRenderer.postMessage('share-buffer', null, [sharedBuffer])
ipcMain.on('share-buffer', (event, _, [buffer]) => {
  const arr = new Int32Array(buffer)  // read/write directly, no serialization
})
```

**UtilityProcess (Electron 22+, proper home for CPU-intensive tasks)** — replaces `child_process.fork`, built-in IPC channel:

```typescript
// main.ts
import { utilityProcess } from 'electron'

const workerProcess = utilityProcess.fork(
  path.join(__dirname, 'worker.js'),
  [],
  { serviceName: 'heavy-task-worker' }
)

workerProcess.on('message', (message) => {
  mainWindow.webContents.send('worker-result', message)
})

ipcMain.handle('run-heavy-task', async (_, data) => {
  workerProcess?.postMessage({ type: 'process', data })
})
```

```javascript
// worker.js (separate process)
process.parentPort.on('message', (event) => {
  const { type, data } = event.data
  if (type === 'process') {
    const result = doHeavyWork(data)  // doesn't block main/renderer
    process.parentPort.postMessage({ type: 'result', result })
  }
})
```

Direct renderer↔worker channel (skip main-process relay):

```typescript
ipcMain.handle('connect-worker', (event) => {
  const { port1, port2 } = new MessageChannelMain()
  workerProcess?.postMessage({ type: 'port' }, [port1])
  event.senderFrame.postMessage('worker-port', null, [port2])
})
```

**contextBridge performance patterns (Electron 12+)**:

```typescript
// preload.ts — minimal exposure + batch API design (fewer IPC round trips)
contextBridge.exposeInMainWorld('myApp', {
  batchQuery: (queries: BatchQuery[]) => ipcRenderer.invoke('batch-query', queries),
  getNoteContent: (id: string) => ipcRenderer.invoke('get-note', id),
  onSyncStatus: (callback: (status: SyncStatus) => void) => {
    ipcRenderer.on('sync-status', (_, status) => callback(status))
    return () => ipcRenderer.removeAllListeners('sync-status')  // cleanup function
  },
})
```

```typescript
// Wrong: N separate IPC round trips
const title = await myApp.getNoteTitle(id)
const content = await myApp.getNoteContent(id)

// Correct: one batched call
const { title, content } = await myApp.getNoteDetail(id)
```

**Migrating off `remote` (legacy Electron < 12)** — every `remote.xxx` call is synchronous IPC:

```typescript
// Before (wrong: synchronous IPC)
const { dialog } = require('electron').remote
const result = dialog.showOpenDialogSync({ properties: ['openFile'] })

// After (async IPC via preload + main handler)
contextBridge.exposeInMainWorld('dialog', {
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
})
ipcMain.handle('dialog:open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] })
  return filePaths[0] ?? null
})
```

Window-control migration follows the same shape (`minimize`/`maximize`/`close` → `ipcRenderer.send` + `ipcMain.on`).

**Process resource management**:

- Lower frame rate of inactive windows: `win.webContents.setFrameRate(1)`
- Release on window destruction: remove all IPC listeners, drop `win` references
- Sandbox mode (default since 20+) + `contextIsolation` reduce renderer init overhead

### 2.7 Loading performance

**Code splitting**:

```javascript
const LazyPage = React.lazy(() => import('./pages/HeavyPage'))

const loadHeavyFeature = async () => {
  const { HeavyFeature } = await import('./features/HeavyFeature')
  return HeavyFeature
}
```

**Critical rendering path**: inline first-screen CSS in `<head>`, load non-critical CSS async; keep critical JS minimal (`defer` / dynamic import); `<link rel="preload">` first-screen fonts/images; `<link rel="preconnect">` cross-origin connections early.

**Images**: WebP/AVIF; multi-resolution via `srcset`; `<img loading="lazy">` or IntersectionObserver; LCP-critical images `loading="eager" fetchpriority="high"`.

### 2.8 Performance budgets and engineering controls

**Budget reference values** (adjust to project):

| Metric | Suggested red line |
| ----------------- | ----------------- |
| First-screen total JS size | < 300KB (gzipped) |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Electron cold start | < 2s |
| Main-thread long tasks | 0 on critical interaction paths |

**CI/CD integration**:

```bash
# Lighthouse CI example (GitHub Actions)
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
  # assert thresholds in lighthouserc.json; pipeline fails if unmet
```

Integrate bundle-size analysis into the build; alert on abnormal growth.

### Optimization priority quick reference

Prioritize the largest time-share — optimizing a <10% step by 100x yields limited gain (Amdahl's law).

**P0 (high impact, low cost)**: split long tasks >50ms into <50ms chunks via `requestIdleCallback`; virtual scrolling for long lists (>100 items); animations on transform/opacity only, batch-read-then-batch-write the DOM; convert all Electron IPC to async (remove every `sendSync`); move large-data parsing/encryption to Web Worker.

**P1 (moderate cost, clear payoff)**: component memoization (React.memo/useMemo/useCallback); split coarse global state; route/component-level code splitting; keep Electron main-process entry lean.

**P2 (engineering payoff, longer horizon)**: caching strategy (long-term strong cache + hashed filenames, Service Worker); bundle size reduction (tree-shaking, on-demand imports, WebP/AVIF); performance budget + CI/CD gate (LCP/INP/bundle size block releases).

---

## Part 3 — Extension slots (other stacks)

The paradigm in SKILL.md is stack-agnostic; this part reserves chapters for other stacks' knowledge as campaigns validate them:

- **Native / C++** (slot): container/data-structure selection, allocation strategy, cache-friendly layout (AoS→SoA, field compression), branch-prediction-friendly code, micro-architecture profiling pipelines
- **Server / backend** (slot): USE/RED dashboards, N+1 patterns, connection pooling, backpressure
- **Compile-time / toolchain** (slot): build profiling, incremental builds, allocator replacement

When a stack's chapter grows large enough to churn independently, promote it to a separate knowledge skill and keep only a pointer here — the chapter boundary is the extraction seam.
