# Frontend Performance Optimization: Detailed Reference

This file is the detailed expansion of the optimization priorities in SKILL.md, organized by category. During the analysis stage (perf-workflow Stage 2/3), rely primarily on SKILL.md; during implementation (Stage 5), consult this file as needed.

---

## 1. Rendering Performance Optimization

### Avoiding Reflow and Repaint

**Core principle**: changing geometric properties is the most expensive (triggers Layout), visual properties are next (triggers Paint), and transform/opacity are cheapest (Composite only).

**Batch DOM modifications**:
- Build the DOM tree offline with `DocumentFragment` and insert it in one shot
- When changing multiple styles, use `classList` or modify `cssText` instead of setting `style` property by property
- Avoid reading and writing the DOM inside a loop: batch-read all needed values first, then batch-write

**Fixing layout thrashing**:
```
// Wrong: alternating read-write, each write forces a synchronous Layout
for (item of items) {
  item.style.width = item.offsetWidth + 10 + 'px'  // read → write → forced Layout
}

// Correct: read all values first, then batch-write
const widths = items.map(item => item.offsetWidth)  // batch read
items.forEach((item, i) => item.style.width = widths[i] + 10 + 'px')  // batch write
```

**Animation optimization**:
- Only use `transform` and `opacity` for animations (Composite only)
- Use `will-change: transform` to promote to an independent compositor layer ahead of time (avoid overuse — too many layers increases memory usage instead)
- Never animate `top/left/width/height`

---

## 2. React / Angular Re-render Optimization

### Diagnosing and Fixing Unnecessary React Re-renders

**How to locate**: React DevTools Profiler → flame graph → check which components re-render unnecessarily (gray = not rendered, colored = rendered)

**Common root causes and fixes**:

| Root cause | Fix |
| ------------------------- | ----------------------------------------------------- |
| Parent re-render cascades to children | Wrap the child with `React.memo` to stabilize the props reference |
| New object/array created on every render | Cache the reference with `useMemo(() => ({...}), [deps])` |
| New function created on every render | Stabilize the callback reference with `useCallback(() => fn, [deps])` |
| Context change affects all consumers | Split the context; or cache the context value with `useMemo` |
| Global state granularity too coarse | Split into atoms (Jotai/Zustand); subscribe precisely with selectors |

**State granularity optimization**: split a large global store into independent small stores or atoms so that components only subscribe to the slice they need, avoiding any state change triggering a global re-render.

### React 18+ Concurrent Features (use these first)

React 18 introduces concurrent rendering, whose core idea is to **mark state updates with a priority**, so user interactions always take priority over low-priority updates.

**`useTransition` (recommended for search/filter/navigation scenarios)**:

```tsx
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
```

**`useDeferredValue` (recommended for expensive derived rendering)**:

```tsx
function App() {
  const [text, setText] = useState('')
  const deferredText = useDeferredValue(text)  // Rendering lags behind input, but never blocks input

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <HeavyList query={deferredText} />  {/* deferredText may lag temporarily */}
    </>
  )
}
```

**Automatic batching (new in React 18)**: React 18 also automatically merges setState calls inside `setTimeout`, `Promise`, and native event handlers, so `unstable_batchedUpdates` is no longer needed manually.

```tsx
// React 18: these two setState calls automatically merge into a single render
setTimeout(() => {
  setA(1)  // does not trigger a render
  setB(2)  // triggers one render after merging
}, 0)
```

**`Suspense` data boundary (paired with lazy loading)**:

```tsx
// Route-level code splitting + Suspense
const HeavyPage = React.lazy(() => import('./HeavyPage'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HeavyPage />
    </Suspense>
  )
}
```

**`startTransition` (for non-Hook contexts)**:

```tsx
import { startTransition } from 'react'

// Used inside class components or utility functions
startTransition(() => {
  setState(newValue)  // Mark as low priority
})
```

---

### React 19 React Compiler (Automatic Memoization)

> Applies to React 19+, requires babel-plugin-react-compiler

**Core principle**: the compiler statically analyzes component code and automatically inserts caching directives such as `useMemo` / `useCallback` / `React.memo`, so developers no longer need to write them by hand.

**Pre-migration check**:

```bash
# Use the official ESLint plugin to scan for compatibility issues
npm install eslint-plugin-react-compiler --save-dev
```

```json
// .eslintrc
{
  "plugins": ["react-compiler"],
  "rules": { "react-compiler/react-compiler": "error" }
}
```

**Scenarios the compiler cannot optimize (still need manual handling)**:

| Scenario | Reason | Solution |
| ----------------------- | --------------------------------- | -------------------------------- |
| Dynamic `key` depends on an external mutable value | The compiler cannot track external side effects | Manual `useMemo` |
| External mutable reference (`ref.current`) | The compiler assumes references are stable | Refactor into state or explicitly annotate the dependency |
| Third-party library with impure functions | The compiler cannot analyze side effects of black-box functions | Wrap it in a pure-function wrapper |

**Migration advice**: migrate existing React 18 projects incrementally — enable it on leaf components first, then extend to parent components once stable.

---

### Optimizing Legacy React 16.x Projects

> Best practices when upgrading the React version is not an option

**Manual memoization with class components**:

```tsx
// shouldComponentUpdate: precise control over re-renders
class ExpensiveComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.data !== this.props.data  // reference comparison
  }
  render() { /* ... */ }
}

// PureComponent: shallow comparison of props and state (note: arrays/objects must remain immutable)
class ListItem extends React.PureComponent {
  render() { return <div>{this.props.label}</div> }
}
```

**Performance pitfalls inside render**:

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

**Manual batching (React 16 has no automatic batching)**:

```tsx
import { unstable_batchedUpdates } from 'react-dom'

// Multiple setState calls inside setTimeout/async callbacks must be merged manually
setTimeout(() => {
  unstable_batchedUpdates(() => {
    setA(1)
    setB(2)
  })
}, 0)
```

---

### Deep Optimization of Angular Change Detection

Angular's change detection is driven by Zone.js — it monkey-patches every async API (`setTimeout`, `addEventListener`, `Promise`, `XMLHttpRequest`), so any async operation completing triggers a dirty-check of the entire component tree. The core of optimization is to **reduce check frequency and shrink the check scope**.

**`OnPush` strategy (mandatory)**:

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

`OnPush` trigger conditions: `@Input` reference changes / `async pipe` emits a new value / an internal component event / manual `markForCheck()`.
When using `OnPush`, data immutability must be guaranteed (create a new object/array on modification instead of mutating in place).

**`NgZone.runOutsideAngular()` (mandatory for high-frequency events)**:

```typescript
@Component({ /* ... */ })
export class CanvasComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      // scroll/mousemove/requestAnimationFrame run outside the Zone, no change detection triggered
      window.addEventListener('scroll', this.onScroll.bind(this), { passive: true })
      requestAnimationFrame(this.renderLoop.bind(this))
    })
  }

  onScroll() {
    // Only re-enter the Zone to trigger detection when the UI actually needs updating
    if (needsUpdate) {
      this.ngZone.run(() => this.updateVisibleItems())
    }
  }
}
```

**Pure pipes (replacing function calls inside templates)**:

```typescript
// Wrong: calling a function inside the template runs it on every check
// <div>{{ formatDate(item.date) }}</div>

// Correct: a pure pipe caches automatically (same input is not recomputed)
@Pipe({ name: 'formatDate', pure: true })
export class FormatDatePipe implements PipeTransform {
  transform(date: Date): string {
    return /* formatting logic */
  }
}
// <div>{{ item.date | formatDate }}</div>
```

**List rendering `trackBy` (Angular 16 and earlier)**:

```typescript
// Component
trackById(index: number, item: Item): number {
  return item.id  // Use a unique id instead of index to avoid re-rendering all items when data is reordered
}

// Template
// <div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
```

---

### Angular 16+ Signals (recommended for new projects)

Signals is a fine-grained reactivity system that coexists with Zone.js change detection — **only components that read a signal update when that signal changes**, fully avoiding whole-tree dirty checking.

**Basic usage**:

```typescript
import { signal, computed, effect } from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  // Pair with OnPush
  template: `<div>{{ count() }} — {{ doubled() }}</div>`,
})
export class CounterComponent {
  count = signal(0)  // Writable signal
  doubled = computed(() => this.count() * 2)  // Derived signal, cached automatically

  increment() {
    this.count.update(v => v + 1)  // Only components reading count will update
  }

  constructor() {
    effect(() => {
      console.log('count changed:', this.count())  // Side-effect tracking
    })
  }
}
```

**Migrating from `BehaviorSubject` to `signal()`**:

```typescript
// Old approach (BehaviorSubject)
readonly items$ = new BehaviorSubject<Item[]>([])

// New approach (signal)
readonly items = signal<Item[]>([])

// In the template: items$ | async  →  items()
```

**`toSignal` / `toObservable` (incremental migration)**:

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop'

// Convert an Observable to a signal (for incremental migration within existing RxJS code)
readonly data = toSignal(this.dataService.getData$(), { initialValue: [] })
```

---

### Angular 17+ `@defer` Blocks (Built-in Lazy Loading)

`@defer` is the template-level lazy loading introduced in Angular 17, replacing manual `IntersectionObserver` + dynamic `import()`.

**Load on viewport** (lazy-load non-first-screen components on long pages):

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
```

**Load on interaction** (load on click/hover):

```html
@defer (on interaction) {
  <app-rich-editor [(content)]="content" />
} @placeholder {
  <div class="editor-placeholder">Click to start editing</div>
}
```

**Load on idle** (load low-priority modules when the browser is idle):

```html
@defer (on idle) {
  <app-analytics-widget />
}
```

**Prefetch control**:

```html
<!-- Prefetch the JS immediately, but render only when it crosses the viewport -->
@defer (on viewport; prefetch on idle) {
  <app-heavy-section />
}
```

---

### Angular Module Lazy Loading

**Route-level lazy loading (all versions)**:

```typescript
// app-routing.module.ts
{
  path: 'dashboard',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
}
```

**Standalone component lazy loading (Angular 14+, finer granularity)**:

```typescript
// No NgModule wrapper needed, lazy-load a single component directly
{
  path: 'profile',
  loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent)
}
```

**Preloading strategy (speeds up navigation)**:

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules  // Preload all lazy modules after the initial route load
    // Or a custom strategy: only preload routes marked preload: true
  })]
})
```

---

## 3. Long Lists and Large-Data Rendering

### Virtual Scrolling (mandatory for lists > 100 items)

**Principle**: only render the list items visible in the viewport (typically 10–30), and use placeholder elements to preserve the total height.

**Common solutions**:
- React: `react-window` (lightweight) or `react-virtualized` (full-featured)
- Vue: `vue-virtual-scroller`
- Angular: `@angular/cdk/scrolling` (CDK VirtualScrollViewport)

**Notes**:
- Fixed row height performs better than dynamic row height; dynamic row height requires estimating the height and updating it after render
- Virtual scrolling is not suitable for scenarios that require the full DOM to be present (e.g., full-text search highlighting)

### Chunked Rendering for Large Datasets

```javascript
// Use requestIdleCallback to split a large batch of DOM operations across multiple frames
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

---

## 4. Main-Thread Long Task Optimization

### Short Task Scheduling

```javascript
// Split a large loop into chunks < 50ms
async function processLargeArray(items) {
  const CHUNK_SIZE = 1000
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE)
    processChunk(chunk)
    // Yield the main thread so the browser can handle user interaction
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
```

### Web Worker (mandatory for CPU-intensive tasks)

Tasks that should be moved off the main thread:
- Large-data parsing (JSON/CSV/Excel)
- Encryption/decryption/hashing
- Image processing (compression/filters)
- Complex math/path-planning computation

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

---

## 5. Memory Leak Prevention

### Common Leak Scenarios and Fixes

| Leak scenario | Fix |
| --------------------- | ------------------------------------------------------------- |
| Event listener not removed | `removeEventListener` or AbortController |
| Timer/interval not cleared | `clearInterval` / `clearTimeout` on component teardown |
| Network request not cancelled | fetch: use AbortController; axios: use CancelToken |
| Closure holding a large object | Check whether the callback accidentally captured a large array/DOM reference |
| React useEffect side effect | Return a cleanup function to unsubscribe/remove listeners/clear timers |
| Angular subscription not unsubscribed | `takeUntil(destroy$)` or `async pipe` to auto-unsubscribe |

**Localization tool**: Chrome DevTools → Memory → compare two Heap Snapshots → check newly added objects

---

## 6. Electron-Specific Optimization

### Startup Chain Optimization

**Trim the main-process entry**:
- Use dynamic `require` (or `import()` to lazy-load non-essential modules)
- Never do synchronous IO, database initialization, or config reading in the entry file
- Defer plugin loading and non-core service registration until after the first window's `ready-to-show`

**Speeding up renderer first paint**:
- Create the window with `show: false`, and only display it after the `ready-to-show` event fires, to avoid a white flash
- Load the preload script on demand, exposing only the native APIs that are strictly necessary
- Splash screen: use a lightweight native splash instead of a web-based skeleton screen

**V8 compile cache**:
- Use `v8-compile-cache` or electron-builder's bytecode cache to reduce JS parsing time on subsequent launches

### IPC Communication Optimization

**Never use synchronous IPC, always use async**:

```typescript
// Wrong: synchronous IPC, completely blocks the renderer's main thread (and can even block the main process)
const result = ipcRenderer.sendSync('get-data', params)

// Correct: async IPC, does not block the main thread
const result = await ipcRenderer.invoke('get-data', params)
```

**IPC must be throttled in high-frequency scenarios (scroll/input, etc.)**:

```javascript
const throttledSync = throttle((data) => {
  ipcRenderer.send('sync-state', data)
}, 100)  // Send at most once every 100ms
```

**Large data transfer (avoid serialization overhead)**:

```javascript
// Use SharedArrayBuffer for zero-copy shared memory
const sharedBuffer = new SharedArrayBuffer(1024 * 1024)
ipcRenderer.postMessage('share-buffer', null, [sharedBuffer])
// In the main process
ipcMain.on('share-buffer', (event, _, [buffer]) => {
  const arr = new Int32Array(buffer)  // Read/write directly, no serialization needed
})
```

---

### UtilityProcess (Electron 22+, the proper home for CPU-intensive tasks)

> Replacing `child_process.fork`, `UtilityProcess` is the native process API introduced in Electron 22, with a built-in IPC channel that requires no manual `process.on('message')` setup.

**Suitable scenarios**: database operations, bulk file processing, encryption/decryption, large-data parsing, complex algorithms.

**Basic usage (created in the main process)**:

```typescript
// main.ts
import { utilityProcess } from 'electron'
import path from 'path'

let workerProcess: Electron.UtilityProcess | null = null

function createWorker() {
  workerProcess = utilityProcess.fork(
    path.join(__dirname, 'worker.js'),
    [],
    { serviceName: 'heavy-task-worker' }
  )

  workerProcess.on('message', (message) => {
    // Received the worker's result, forward it to the renderer process
    mainWindow.webContents.send('worker-result', message)
  })

  workerProcess.on('exit', (code) => {
    console.log('Worker exited with code:', code)
    workerProcess = null
  })
}

// The main process receives a request from the renderer and forwards it to the worker
ipcMain.handle('run-heavy-task', async (_, data) => {
  workerProcess?.postMessage({ type: 'process', data })
})
```

**Worker script (worker.js)**:

```javascript
// worker.js (runs in a separate process)
process.parentPort.on('message', (event) => {
  const { type, data } = event.data
  if (type === 'process') {
    const result = doHeavyWork(data)  // Time-consuming computation, doesn't block the main/renderer process
    process.parentPort.postMessage({ type: 'result', result })
  }
})
```

**Use `MessagePort` to let the renderer and the worker talk directly (skip forwarding through the main process)**:

```typescript
// main.ts: set up a direct channel between the renderer and the worker
ipcMain.handle('connect-worker', (event) => {
  const { port1, port2 } = new MessageChannelMain()
  workerProcess?.postMessage({ type: 'port' }, [port1])
  event.senderFrame.postMessage('worker-port', null, [port2])
})

// renderer: send messages directly to the worker, no main-process relay needed
window.addEventListener('message', (event) => {
  if (event.data === 'worker-port') {
    const port = event.ports[0]
    port.onmessage = (e) => handleWorkerResult(e.data)
    port.postMessage({ type: 'process', data: largeData })
  }
})
```

---

### contextBridge Performance Patterns (Electron 12+)

> `contextBridge` is the only recommended way to expose APIs to the renderer process under `contextIsolation: true`.

**Minimal-exposure principle (avoid exposing large objects)**:

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// Wrong: exposing the entire ipcRenderer, which brings security risk and initialization overhead
// contextBridge.exposeInMainWorld('ipc', ipcRenderer)

// Correct: expose only the minimal API set the renderer actually needs
contextBridge.exposeInMainWorld('myApp', {
  // Batch API design: one invoke handles multiple operations, reducing IPC round trips
  batchQuery: (queries: BatchQuery[]) => ipcRenderer.invoke('batch-query', queries),
  // Single-purpose API
  getNoteContent: (id: string) => ipcRenderer.invoke('get-note', id),
  saveNote: (id: string, content: string) => ipcRenderer.invoke('save-note', { id, content }),
  // Event listener
  onSyncStatus: (callback: (status: SyncStatus) => void) => {
    ipcRenderer.on('sync-status', (_, status) => callback(status))
    return () => ipcRenderer.removeAllListeners('sync-status')  // Return a cleanup function
  },
})
```

**Batch API design pattern (reduce IPC call count)**:

```typescript
// Wrong: multiple separate IPC calls (N round trips)
const title = await myApp.getNoteTitle(id)
const content = await myApp.getNoteContent(id)
const tags = await myApp.getNoteTags(id)

// Correct: one IPC call fetches everything in a batch (1 round trip)
const { title, content, tags } = await myApp.getNoteDetail(id)
```

---

### Migrating Off the `remote` Module (legacy Electron < 12 projects)

> The `remote` module was deprecated in Electron 12 and removed in 14. Every `remote.xxx` call is a **synchronous IPC** call that severely blocks the renderer's main thread.

**Diagnosis**: in the Performance panel, if you see dense synchronous IPC calls (usually marked `IPC_SYNC`), check whether `remote` is being used.

**Migration pattern: `remote.xxx` → `ipcRenderer.invoke` + a main-process handler**:

```typescript
// Before migration (wrong: synchronous IPC)
const { dialog } = require('electron').remote
const result = dialog.showOpenDialogSync({ properties: ['openFile'] })

// After migration (correct: async IPC)
// preload.ts
contextBridge.exposeInMainWorld('dialog', {
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
})

// main.ts
ipcMain.handle('dialog:open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] })
  return filePaths[0] ?? null
})

// renderer
const filePath = await window.dialog.openFile()
```

**Migrating `remote.getCurrentWindow()`**:

```typescript
// Before
const win = require('electron').remote.getCurrentWindow()
win.minimize()

// After (preload.ts)
contextBridge.exposeInMainWorld('windowControl', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
})

// main.ts
ipcMain.on('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})
```

### Process Resource Management

- Lower the frame rate of inactive windows: `win.webContents.setFrameRate(1)` reduces background CPU usage
- Fully release resources on window destruction: remove all IPC listeners, drop references to the `win` object
- Sandbox mode (on by default since Electron 20+): `sandbox: true` + `contextIsolation: true` reduces renderer initialization overhead while improving security

---

## 7. Loading Performance Optimization

### Code Splitting

```javascript
// React route-level splitting
const LazyPage = React.lazy(() => import('./pages/HeavyPage'))

// Conditional loading (loaded only when needed)
const loadHeavyFeature = async () => {
  const { HeavyFeature } = await import('./features/HeavyFeature')
  return HeavyFeature
}
```

### Critical Rendering Path

- Inline the CSS required for the first screen into `<head>`; load non-critical CSS asynchronously
- Keep critical JS to a minimum; use `defer` or dynamic import for non-critical JS
- Use `<link rel="preload">` to preload first-screen fonts/images; use `<link rel="preconnect">` to establish cross-origin connections early

### Image Optimization

- Format: WebP (general purpose) or AVIF (higher compression ratio)
- Size: serve multiple resolutions based on actual display size (`srcset`)
- Lazy loading: `<img loading="lazy">` or IntersectionObserver
- Important images: `<img loading="eager" fetchpriority="high">` to avoid delaying LCP

---

## 8. Performance Budgets and Engineering Controls

### Performance Budget Reference Values (adjust to your project)

| Metric | Suggested red line |
| ----------------- | ----------------- |
| First-screen total JS size | < 300KB (gzipped) |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Electron cold start | < 2s |
| Main-thread long tasks | 0 on critical interaction paths |

### CI/CD Integration

```bash
# Lighthouse CI example (GitHub Actions)
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
  # Configure assert thresholds in lighthouserc.json; the pipeline fails if they aren't met
```

Integrate webpack-bundle-analyzer into the build process to generate a bundle size report after every build, and alert on abnormal size growth.
