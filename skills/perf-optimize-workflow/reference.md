# Performance Optimization Reference — Knowledge Layer

Stack-specific knowledge for `perf-optimize-workflow`. The paradigm in [SKILL.md](SKILL.md) is durable; **this file is the perishable layer** — framework versions, thresholds, and tool tables age. Refresh entries via knowledge-only changes (PATCH version bumps) without touching the paradigm file.

> **Reading guide**: this file is the **stack corpus** — seed material for the project-level `code-insight` / `code-optimizer` skills that `perf-optimize-workflow` creates and evolves in each target project. **Part 5 holds the seed pipeline templates** (step-by-step attribution/optimization pipelines — seeds are pipelines, not reference documents); Part 1 is the frontend quick-reference and Part 2 the frontend optimization detail (knowledge attachments per pipeline step); Part 3 reserves seed slots for other stacks; Part 4 is the evidence-discipline case archive (paradigm-level, stays here). Before project skills mature, Parts 1-2 also serve as working knowledge directly; once seeded, the project skills own the living knowledge and this corpus only refreshes occasionally.

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

---

## Part 4 — Evidence-discipline case archive

Full battle-tested cases behind the ten Evidence Validity Disciplines in [SKILL.md](SKILL.md) (cases for disciplines 1-9 below; discipline 10's case is the hot-reload pollution recorded in the source campaign's harness pitfall log). All cases come from one anonymized source campaign: a large web rich-text editor (React 16 codebase, driven through a browser debugging protocol) taken through a complete optimize-and-attribute loop (benchmark construction → 4 optimizations → four-path user-jank attribution → two special assessments). Numbers are real; project identifiers are stripped.

> Extension placeholder: cases from other stacks (native, server, compile-time) should be appended per discipline as they are validated in practice — the disciplines are platform-agnostic; the cases need not be.

### Discipline 1 — Environment-throttling artifacts

**Case (resize workload, controlled browser)**

- Symptom: first-version resize "frame latency" read ~728ms average, with a bimodal ~700-850ms distribution across resize rounds.
- Root cause: the automation browser's window was occluded; Chromium's background throttling clamps rAF to ~800ms and timers toward 1Hz. `bringToFront` and focus emulation did not lift it — occlusion is an OS window state.
- Detection: JS-profiler sampling during the "long frames" showed 99.9% idle → environmental, not product work.
- Correct method: same-task stimulus + measurement — change container width, then immediately force a synchronous layout read in the same JS task. The browser has no opportunity to complete layout in between.
- Result: 300-paragraph reflow measured ~9ms (and ~18ms at 600 paragraphs) — the throttled number was an ~80x artifact.
- Spillover: any span whose end boundary is a rAF callback contains throttled frames; phase conclusions must use synchronous spans + long tasks (see discipline 6).

### Discipline 2 — Monitor self-pollution

**Case (document-open workload)**

- Symptom: dev build (with render instrumentation + unminified code) showed a full-render burst of 745ms; production build of the same load showed 157ms (~4.7x).
- Root cause: the monitor walked the entire fiber tree on every commit (per-commit overhead), plus unminified code paths.
- Rule adopted: dev caliber is for relative A/B only; every optimization decision and acceptance number uses production caliber (production server mode + probe production flag).
- Cross-check habit: when monitor-caliber and browser-native long-task numbers disagree, the browser-native number wins — zero caliber pollution by construction.

### Discipline 3 — Framework counter ambiguity

**Case ("13,420 component renders per keystroke")**

- Symptom: a self-built render counter reported 13,420 components rendered per keystroke on a 2000-paragraph document — while the same window recorded only 2 long tasks (61ms + 53ms). If ~13k renders were real, ~15 long tasks should appear.
- Root cause (React 16 fiber audit): (a) fibers bailed out of rendering carry `alternate === null`, easily misread as mounts; (b) the `effectTag` "performed work" bit is not cleared when a fiber is reused via bailout, so a full-tree DFS re-counts stale bits on every commit.
- Outcome: an "SCU fully bypassed, architecture-wide penetration" conclusion drafted from the counter was withdrawn before any optimization was built on it; the real suspects (2 spike commits out of 19) were re-investigated instead.
- Generalized rule: any self-built statistic gets one small-scale audit (cross-reconcile mounts vs performed vs total against a native metric) before first use; counters are trend signals, not conviction evidence.

### Discipline 4 — Device-profile calibration

**Case (scroll attribution, conviction matrix)**

- Setup: CPU throttling via the debugging protocol's emulation domain; matrix of throttle (1x/8x/20x) × path × document scale; scrolling driven by real wheel events.
- Results on a 2000-paragraph document: 1x → 0 long tasks; 8x → 18 long tasks / 1089ms total blocking; 20x → 47 long tasks / 6282ms. On 300 paragraphs at 20x → 11 / 939ms.
- Companion path: typing under 8x and 20x → 0 long tasks (acquitted). Same machine, same loads — the verdict flips with the throttle cell.
- Profiler reading under conviction conditions: named JS functions totaled <120ms while `(program)` + GC dominated → blocking lived in the browser render pipeline (layout/style/paint/GC), not product JS (see discipline 8 for the follow-up).

### Discipline 5 — Input-event authenticity

**Case (synthetic keyboard)**

- Symptom: protocol-level key dispatch reported success for 40 keys; zero characters reached the document.
- Root cause: the dispatched events took an event path that never entered the editor's text-processing chain.
- Correct drivers: text via the host's native typing API; IME via a composition-capable protocol API; scrolling via real wheel events (programmatic `scrollBy` does not exercise the full scroll pipeline).
- Rule adopted: after every input load, assert content delta == intended change (document length delta == characters sent). No delta → the load is void, whatever the driver reported.

### Discipline 6 — Instrumentation toggle lifecycle

**Case (toggle read at module load)**

- Symptom: setting the debug toggle in storage after page load produced no instrumentation output.
- Root cause: the toggle was read exactly once at module-load (constructor-time evaluation); later changes are invisible.
- Fix: inject toggles through the debugging protocol's evaluate-on-new-document capability so they exist before any page script runs.
- Related caliber rule: open-phase spans terminated by rAF callbacks contained one/two ~800ms throttled frames (~1000ms/~2000ms signatures in the controlled environment) — phase conclusions switched to synchronous spans (deserialize/load-data phases) + long-task counts, which are immune to rAF throttling.

### Discipline 7 — Single-sample extrapolation ban

**Case (note-size profile)**

- Event: local single-account statistics (2,596 notes, 96.1% <10KB, one >100KB) were used to argue against large-document optimization.
- Rebuttal: field evidence from the product side — years of continuous jank complaints plus users routinely holding tens-of-thousands-of-character notes (~1000-3000 paragraph class).
- Correction: test scale re-aligned to the field class; the large-document attribution work that followed located the real user-facing problem (scroll-path blocking under throttle, disciplines 4 and 8).
- Rule: developer data is not a user profile; negative-ROI conclusions require user-profile evidence (aggregate telemetry, support feedback, field data).

### Discipline 8 — Ultimate control experiment

**Case (scroll blocking: physical cost vs product code)**

- Question: profiler showed no JS hotspot (`(program)` dominant) — is the blocking product code cost or the physical cost of DOM scale?
- Experiment: clone the live editor DOM (~11,363 nodes) into a static overlay — zero framework, zero editor logic, same injected styles — and run the same wheel-scroll load under the same 8x throttle.
- Reading: static copy 792ms vs live editor 1089ms (same order) → the bulk is base rendering cost of DOM scale × style environment; product-code margin ~30%. Optimization direction shifted from "find the code hotspot" to "cut base rendering cost" (style scoping, containment exclusion, virtualization), with the difference (≈300ms) as the ceiling of code-level gains.
- Ablation rider: manually activating the project's dormant big-document optimization (a content-visibility mechanism, gated off by a size threshold in normal operation) made scrolling 1089ms → 7139ms — a negative optimization (collapse/expand double layout + estimated-size jitter). "Mechanism exists" ≠ "mechanism works".

### Discipline 9 — Negative results leave traces

**Case (three invalidation rows in one campaign)**

- Row 1: resize rafMs ~728ms — invalid, environment throttling artifact; correct caliber: same-task synchronous measurement (~9ms).
- Row 2: open-phase dev burst 745ms — invalid for decisions; correct caliber: production 157ms.
- Row 3: "13,420 renders per keystroke" — invalid, counter artifact; correct reading: 2 spike commits out of 19.
- Each row lives in the benchmark log next to the data it invalidates, with reason and correct caliber, so later readers cannot cite the contaminated numbers by accident. The campaign's durable output includes what it excluded, not only what it found.

### Generic detection toolkit (platform-agnostic intents)

| Intent | Typical realization |
|--------|--------------------|
| Distinguish throttling artifact from real long task | JS-profiler sampling during the suspect window (idle-dominant ⇒ artifact) |
| Same-task stimulus + measurement | Mutate, then force a synchronous layout read in the same JS task |
| CPU-throttle matrix | Debugging protocol CPU-throttling emulation (1x/8x/20x) × path × scale |
| Native-metric cross-check | Browser long-task observer vs any self-built counter |
| Early toggle injection | Debugging protocol evaluate-on-new-document, before page scripts |
| Input authenticity assert | Content-length delta == intended change, after every load |
| Static-copy control experiment | `cloneNode(true)` into a style-identical overlay, same load, same throttle |
| Invalidation warning row | Benchmark log row: what/why/correct caliber |

---

## Part 5 — Seed pipeline templates

Step-by-step pipeline skeletons used to seed the project-level `code-insight` / `code-optimizer` skills (see SKILL.md Stage 2 / Stage 5). **Seeds are pipelines, not reference documents** — the source paradigm's core claim is fixing methodology as a reproducible sequence of steps, not prompt luck. The JS-stack pipelines below are generalized from the web-editor campaign's project skill; adapt tool names, harness entry points, and domain dimensions to the project at seed time. Parts 1-2 attach as knowledge per step. C++ slot: pending validation by a native campaign — seed from discovery then.

### code-insight seed pipeline (JS/web stack)

1. **Harness baseline** — run the benchmark harness on the target workload scale; read open/interaction metrics with the evidence disciplines applied (production caliber, real input paths, content-delta asserts). **Reading priority (JS-stack attachment)**: open cost vs document scale (super-linear growth flags a scaling problem); render-penetration threshold applies to the **interaction phase only** (first-screen ~100% is normal — every node must render once); long-task tiering — >50ms investigate, >100ms severe bottleneck.
2. **Trace attribution** — record a performance trace over the load; split time into Scripting / Rendering four-bucket (framework commit / style insertion / layout / paint) / GC; read flame-graph wide bars first; flag forced-reflow write→read patterns.
3. **Framework rendering analysis** — framework-native counters and profilers (render counts, commit frequency, bailout behavior); apply the counter-audit discipline before trusting any self-built statistic; check the three measurable invariants (per-commit rendered ≈ changed nodes; per-keystroke rendered = O(1); commits per operation ≤ small constant).
4. **Domain-specific dimensions** — the product class's invisible-to-framework costs (editor: selection/grapheme, decorations, collaboration transforms, undo history, serialization phases, large paste; app-specific equivalents enumerated at seed time).
5. **Long-session degradation** — session/switch/history-class loads; trend slope and inflection analysis (memory creep, latency-trend rise, history bloat), not single-run numbers.
6. **Ultimate control experiment** — when profilers show no JS hotspot: static-DOM-copy control run under the same throttle to split product-code margin from DOM-scale physical cost; ablation rider for dormant mechanisms.
7. **Memory & GC** — three-snapshot heap comparison (before/after/again), detached-DOM counts and retained-size deltas; allocation sampling for GC pressure (minor GC is invisible in performance-panel markers).
8. **Loading & bundling** — phase-split open timing (deserialize / first paint / full render / TTI), bundle composition, first-screen blockers.

**Output template** (per bottleneck, ranked by impact):

```
【Bottleneck #N】<one-line conclusion>
- Symptom: <quantified metric + source (harness/trace); interaction or first-screen phase>
- Location: <file:line / component / function>
- Evidence: <penetration / time-share / per-op counts / trace refs>
- Impact surface: <open/input/scroll/collab/memory>
- Suggested direction: <entry hypothesis for code-optimizer>
- Confidence: <high/med/low + basis>
```

### code-optimizer seed pipeline (JS/web stack)

- **Step 0 — Understand context**: read the bottleneck report entry hypothesis; confirm the one target of this round.
- **Step 1 — Stack best-practice audit**: language/framework-level checks against the Part 2 knowledge attachments (re-render memoization, batching, OnPush/signals, list virtualization, code splitting).
- **Step 2 — Allocation reduction**: object churn on hot paths, pooled/reused structures, lazy allocation of optional members.
- **Step 3 — Data-structure review**: container choice vs access pattern (lookup/iteration/mutation profile); replace mismatched containers (escalate per the technology-selection rule).
- **Step 4 — Dataflow & caching**: redundant recomputation, memoization seams, batched reads/writes, moved-off-thread candidates (workers/utility processes).
- **Step 5 — Cache-friendly access** (hot loops): contiguous layout, field compaction, per-cache-line density.
- **Step 6 — Deep attribution delegation**: for micro-level or hardware-adjacent questions, **invoke the project's `code-insight`** — the two skills are cooperating pipelines; do not re-implement attribution here.
- **Step 7 — Correctness verification**: full test suite; output-equivalence where applicable; then the workflow's A/B judge decides accept/revert.

### C++ / native seed slot

Pending: pipeline shape validated by a native campaign (profiler-driven hotspot location → micro-architecture analysis → data-layout optimization → correctness gates). Seed from that campaign's discoveries; the article's five-step insight pipeline (optimization remarks → pipeline simulation → static analysis → struct layout → cross-check) is the reference shape.
