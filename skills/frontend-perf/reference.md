# 前端性能优化方案详细参考

本文件是 SKILL.md 中优化方案优先级的详细展开，按分类组织。分析阶段（perf-workflow 阶段 2/3）以 SKILL.md 为主；实施阶段（阶段 5）按需查阅本文件。

---

## 一、渲染性能优化

### 重排重绘规避

**核心原则**：几何属性修改代价最高（触发 Layout），视觉属性次之（触发 Paint），transform/opacity 最低（仅 Composite）。

**批量 DOM 修改**：
- 用 `DocumentFragment` 离线构建 DOM 树，一次性插入
- 修改多个样式时，用 `classList` 或修改 `cssText` 代替逐条修改 `style`
- 避免在循环中读写 DOM：先批量读取所有需要的值，再批量修改

**布局抖动（Layout Thrashing）修复模式**：
```
// 错误：读-写交替，每次写后强制同步 Layout
for (item of items) {
  item.style.width = item.offsetWidth + 10 + 'px'  // 读 → 写 → 强制 Layout
}

// 正确：先读取所有值，再批量写
const widths = items.map(item => item.offsetWidth)  // 批量读
items.forEach((item, i) => item.style.width = widths[i] + 10 + 'px')  // 批量写
```

**动画优化**：
- 只用 `transform` 和 `opacity` 实现动画（仅触发 Composite）
- 用 `will-change: transform` 提前提升到独立合成层（避免滥用，层数过多反而增加内存）
- 绝对禁止用 `top/left/width/height` 做动画

---

## 二、React / Angular 重渲染优化

### React 无效重渲染排查与修复

**定位方式**：React DevTools Profiler → 火焰图 → 查看哪些组件在不必要时重渲染（灰色 = 未渲染，彩色 = 渲染了）

**常见根因与修复**：

| 根因                      | 修复方案                                              |
| ------------------------- | ----------------------------------------------------- |
| 父组件重渲染带动子组件    | `React.memo` 包裹子组件，稳定 props 引用              |
| 每次渲染创建新对象/数组   | `useMemo(() => ({...}), [deps])` 缓存引用             |
| 每次渲染创建新函数        | `useCallback(() => fn, [deps])` 稳定回调引用          |
| Context 变化影响所有消费者 | 拆分 Context；或用 `useMemo` 缓存 Context value       |
| 全局状态粒度太粗          | 拆分 atom（Jotai/Zustand）；selector 精确订阅         |

**状态粒度优化**：把大的全局 Store 拆分成独立的小 store 或 atom，组件只订阅自己需要的片段，避免任何状态变化引发全局重渲染。

### React 18+ Concurrent 特性（优先使用）

React 18 引入并发渲染，核心思路是**给状态更新打优先级标记**，让用户交互永远优先于低优先级更新。

**`useTransition`（推荐：搜索/筛选/导航等场景）**：

```tsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    setQuery(e.target.value)          // 高优先级：立即更新输入框
    startTransition(() => {
      setResults(filterData(e.target.value))  // 低优先级：结果可以延迟
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

**`useDeferredValue`（推荐：昂贵的派生渲染）**：

```tsx
function App() {
  const [text, setText] = useState('')
  const deferredText = useDeferredValue(text)  // 渲染落后于输入，但不阻塞输入

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <HeavyList query={deferredText} />  {/* deferredText 可能暂时落后 */}
    </>
  )
}
```

**自动批处理（React 18 新增）**：React 18 在 `setTimeout`、`Promise`、原生事件中也自动合并 setState，无需手动用 `unstable_batchedUpdates`。

```tsx
// React 18：这两次 setState 自动合并为一次渲染
setTimeout(() => {
  setA(1)  // 不触发渲染
  setB(2)  // 合并后触发一次渲染
}, 0)
```

**`Suspense` 数据边界（配合懒加载）**：

```tsx
// 路由级代码分割 + Suspense
const HeavyPage = React.lazy(() => import('./HeavyPage'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HeavyPage />
    </Suspense>
  )
}
```

**`startTransition`（非 Hook 场景）**：

```tsx
import { startTransition } from 'react'

// Class 组件或工具函数中使用
startTransition(() => {
  setState(newValue)  // 标记为低优先级
})
```

---

### React 19 React Compiler（自动 memoization）

> 适用版本：React 19+，需配合 babel-plugin-react-compiler

**核心原理**：编译器静态分析组件代码，自动插入 `useMemo` / `useCallback` / `React.memo` 等缓存指令，开发者无需手动编写。

**迁移前置检查**：

```bash
# 用官方 ESLint 插件扫描兼容性问题
npm install eslint-plugin-react-compiler --save-dev
```

```json
// .eslintrc
{
  "plugins": ["react-compiler"],
  "rules": { "react-compiler/react-compiler": "error" }
}
```

**编译器无法优化的场景（仍需手动处理）**：

| 场景                    | 原因                              | 解决方案                         |
| ----------------------- | --------------------------------- | -------------------------------- |
| 动态 `key` 依赖外部可变量 | 编译器无法追踪外部副作用          | 手动 `useMemo`                   |
| 外部可变引用（`ref.current`）| 编译器假设引用稳定              | 重构为 state 或明确标注依赖      |
| 第三方库不纯函数        | 编译器无法分析黑盒函数的副作用    | 包裹纯函数包装层                 |

**迁移建议**：现有 React 18 项目逐步迁移，先对叶子组件开启，稳定后再扩展到父组件。

---

### React 16.x 遗留项目优化

> 无法升级 React 版本时的最优实践

**Class 组件手动缓存**：

```tsx
// shouldComponentUpdate：精确控制重渲染
class ExpensiveComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.data !== this.props.data  // 引用对比
  }
  render() { /* ... */ }
}

// PureComponent：浅比较 props 和 state（注意：数组/对象需保证不可变性）
class ListItem extends React.PureComponent {
  render() { return <div>{this.props.label}</div> }
}
```

**render 函数中的性能陷阱**：

```tsx
// 错误：每次渲染都创建新的对象和函数
render() {
  return <Child style={{ color: 'red' }} onClick={() => this.handle()} />
  //              ^^^ 新对象          ^^^ 新函数 → 触发 Child 重渲染
}

// 正确：把样式和函数提到 render 外
const STYLE = { color: 'red' }
class Parent extends React.Component {
  handleClick = () => this.handle()
  render() {
    return <Child style={STYLE} onClick={this.handleClick} />
  }
}
```

**手动批处理（React 16 无自动批处理）**：

```tsx
import { unstable_batchedUpdates } from 'react-dom'

// setTimeout/异步回调中多次 setState 需手动合并
setTimeout(() => {
  unstable_batchedUpdates(() => {
    setA(1)
    setB(2)
  })
}, 0)
```

---

### Angular 变更检测深度优化

Angular 的变更检测由 Zone.js 驱动——它猴子补丁了所有异步 API（`setTimeout`、`addEventListener`、`Promise`、`XMLHttpRequest`），任何一个异步操作完成都会触发整个组件树的脏检查。优化核心是**减少检测频次 + 缩小检测范围**。

**`OnPush` 策略（必做）**：

```typescript
@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ item.name }}</div>`,
})
export class ItemComponent {
  @Input() item!: Item  // 只有 item 引用变化时才检测
}
```

`OnPush` 触发条件：`@Input` 引用变化 / `async pipe` 发射新值 / 组件内部事件 / 手动 `markForCheck()`。
使用 `OnPush` 时必须保证数据不可变性（修改时创建新对象/数组，而非直接 mutate）。

**`NgZone.runOutsideAngular()`（高频事件必做）**：

```typescript
@Component({ /* ... */ })
export class CanvasComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      // scroll/mousemove/requestAnimationFrame 在 Zone 外执行，不触发变更检测
      window.addEventListener('scroll', this.onScroll.bind(this), { passive: true })
      requestAnimationFrame(this.renderLoop.bind(this))
    })
  }

  onScroll() {
    // 只有真正需要更新 UI 时，才回到 Zone 内触发检测
    if (needsUpdate) {
      this.ngZone.run(() => this.updateVisibleItems())
    }
  }
}
```

**纯管道（Pure Pipe，替代模板内函数调用）**：

```typescript
// 错误：模板内调用函数，每次检测都执行
// <div>{{ formatDate(item.date) }}</div>

// 正确：纯管道自动缓存（相同输入不重复计算）
@Pipe({ name: 'formatDate', pure: true })
export class FormatDatePipe implements PipeTransform {
  transform(date: Date): string {
    return /* 格式化逻辑 */
  }
}
// <div>{{ item.date | formatDate }}</div>
```

**列表渲染 `trackBy`（Angular 16 及以前）**：

```typescript
// 组件
trackById(index: number, item: Item): number {
  return item.id  // 用唯一 id 而非 index，避免数据重排时重新渲染所有项
}

// 模板
// <div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
```

---

### Angular 16+ Signals（推荐新项目使用）

Signals 是细粒度响应式系统，与 Zone.js 变更检测并行存在，**只有读取了 signal 的组件才会在 signal 变化时更新**，彻底避免全树脏检查。

**基础用法**：

```typescript
import { signal, computed, effect } from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  // 配合 OnPush
  template: `<div>{{ count() }} — {{ doubled() }}</div>`,
})
export class CounterComponent {
  count = signal(0)  // 可写 signal
  doubled = computed(() => this.count() * 2)  // 派生 signal，自动缓存

  increment() {
    this.count.update(v => v + 1)  // 只有读取了 count 的组件会更新
  }

  constructor() {
    effect(() => {
      console.log('count changed:', this.count())  // 副作用追踪
    })
  }
}
```

**从 `BehaviorSubject` 迁移到 `signal()`**：

```typescript
// 旧方式（BehaviorSubject）
readonly items$ = new BehaviorSubject<Item[]>([])

// 新方式（signal）
readonly items = signal<Item[]>([])

// 模板中：items$ | async  →  items()
```

**`toSignal` / `toObservable`（渐进式迁移）**：

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop'

// 把 Observable 转为 signal（在已有 RxJS 代码中渐进迁移）
readonly data = toSignal(this.dataService.getData$(), { initialValue: [] })
```

---

### Angular 17+ `@defer` 块（内置延迟加载）

`@defer` 是 Angular 17 引入的模板级延迟加载，替代手动 `IntersectionObserver` + 动态 `import()`。

**按视口加载**（懒加载长页面的非首屏组件）：

```html
<!-- 组件进入视口时才加载 -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData" />
} @placeholder {
  <div class="chart-placeholder" style="height: 300px"></div>
} @loading (minimum 200ms) {
  <app-spinner />
} @error {
  <p>图表加载失败</p>
}
```

**按交互加载**（点击/悬停时才加载）：

```html
@defer (on interaction) {
  <app-rich-editor [(content)]="content" />
} @placeholder {
  <div class="editor-placeholder">点击开始编辑</div>
}
```

**按空闲时间加载**（浏览器空闲时加载低优先级模块）：

```html
@defer (on idle) {
  <app-analytics-widget />
}
```

**预取（`prefetch`）控制**：

```html
<!-- 立即预取 JS，但等到视口交叉时才渲染 -->
@defer (on viewport; prefetch on idle) {
  <app-heavy-section />
}
```

---

### Angular 模块懒加载

**路由级懒加载（所有版本）**：

```typescript
// app-routing.module.ts
{
  path: 'dashboard',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
}
```

**Standalone 组件懒加载（Angular 14+，粒度更细）**：

```typescript
// 不需要 NgModule 包装，直接懒加载单个组件
{
  path: 'profile',
  loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent)
}
```

**预加载策略（提升导航速度）**：

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules  // 路由加载完成后预加载所有懒加载模块
    // 或自定义策略：只预加载标记了 preload: true 的路由
  })]
})
```

---

## 三、长列表与大数据渲染

### 虚拟滚动（必做，列表 > 100 项时）

**原理**：只渲染视口内可见的列表项（通常 10～30 个），其余用占位元素撑高度。

**常用方案**：
- React：`react-window`（轻量）或 `react-virtualized`（功能全）
- Vue：`vue-virtual-scroller`
- Angular：`@angular/cdk/scrolling`（CDK VirtualScrollViewport）

**注意事项**：
- 固定行高比动态行高性能好；动态行高需要预估高度并在渲染后更新
- 虚拟滚动不适用于需要 DOM 全量存在的场景（如全文搜索高亮）

### 大数据分片渲染

```javascript
// 用 requestIdleCallback 把大量 DOM 操作拆分成多帧执行
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

## 四、主线程长任务优化

### 任务拆分（Short Task Scheduling）

```javascript
// 把大循环拆分成 < 50ms 的小片
async function processLargeArray(items) {
  const CHUNK_SIZE = 1000
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE)
    processChunk(chunk)
    // 让出主线程，允许浏览器处理用户交互
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
```

### Web Worker（CPU 密集任务必做）

适合移出主线程的任务：
- 大数据解析（JSON/CSV/Excel）
- 加密/解密/哈希计算
- 图像处理（压缩/滤镜）
- 复杂数学计算/路径规划

```javascript
// 主线程
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

## 五、内存泄漏防控

### 常见泄漏场景与修复

| 泄漏场景              | 修复方式                                                   |
| --------------------- | ---------------------------------------------------------- |
| 事件监听未移除        | `removeEventListener` 或 AbortController                   |
| 定时器/延时器未清理   | `clearInterval` / `clearTimeout` 在组件销毁时执行          |
| 网络请求未取消        | fetch 用 AbortController；axios 用 CancelToken            |
| 闭包持有大对象        | 检查回调函数是否意外捕获了大数组/DOM 引用                  |
| React useEffect 副作用 | 返回 cleanup 函数，取消订阅/移除监听/清理定时器            |
| Angular 订阅未取消    | `takeUntil(destroy$)` 或 `async pipe` 自动取消订阅         |

**定位工具**：Chrome DevTools → Memory → 两次 Heap Snapshot 对比 → 查看新增对象

---

## 六、Electron 专属优化

### 启动链路优化

**主进程入口瘦身**：
- 动态 `require`（用 `import()` 懒加载非必须模块）
- 禁止在入口文件做同步 IO、数据库初始化、配置读取等耗时操作
- 把插件加载、非核心服务注册延迟到首窗口 `ready-to-show` 之后

**渲染进程首屏加速**：
- 窗口创建时开启 `show: false`，等 `ready-to-show` 事件触发后再显示，避免白屏
- preload 脚本按需加载，只暴露必须的原生 API
- 骨架屏：用轻量原生闪屏页替代 Web 骨架屏

**V8 编译缓存**：
- 使用 `v8-compile-cache` 或 electron-builder 的 bytecode 缓存，减少二次启动的 JS 解析耗时

### IPC 通信优化

**禁止同步 IPC，始终用异步**：

```typescript
// 错误：同步 IPC，完全阻塞渲染进程主线程（甚至阻塞主进程）
const result = ipcRenderer.sendSync('get-data', params)

// 正确：异步 IPC，不阻塞主线程
const result = await ipcRenderer.invoke('get-data', params)
```

**高频场景（scroll/input 等）中 IPC 必须节流**：

```javascript
const throttledSync = throttle((data) => {
  ipcRenderer.send('sync-state', data)
}, 100)  // 最多每 100ms 发送一次
```

**大数据传输（避免序列化开销）**：

```javascript
// 用 SharedArrayBuffer 零拷贝共享内存
const sharedBuffer = new SharedArrayBuffer(1024 * 1024)
ipcRenderer.postMessage('share-buffer', null, [sharedBuffer])
// 主进程中
ipcMain.on('share-buffer', (event, _, [buffer]) => {
  const arr = new Int32Array(buffer)  // 直接读写，无需序列化
})
```

---

### UtilityProcess（Electron 22+，CPU 密集任务的正确归宿）

> 替代 `child_process.fork`，`UtilityProcess` 是 Electron 22 引入的原生进程 API，内置 IPC 通道，无需手动设置 `process.on('message')`。

**适合场景**：数据库操作、文件批量处理、加密解密、大数据解析、复杂算法。

**基础用法（主进程中创建）**：

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
    // 收到 worker 处理结果，转发给渲染进程
    mainWindow.webContents.send('worker-result', message)
  })

  workerProcess.on('exit', (code) => {
    console.log('Worker exited with code:', code)
    workerProcess = null
  })
}

// 主进程接收渲染进程请求，转发给 worker
ipcMain.handle('run-heavy-task', async (_, data) => {
  workerProcess?.postMessage({ type: 'process', data })
})
```

**Worker 脚本（worker.js）**：

```javascript
// worker.js（运行在独立进程）
process.parentPort.on('message', (event) => {
  const { type, data } = event.data
  if (type === 'process') {
    const result = doHeavyWork(data)  // 耗时计算，不阻塞主进程/渲染进程
    process.parentPort.postMessage({ type: 'result', result })
  }
})
```

**直接用 `MessagePort` 让渲染进程和 Worker 直接通信（跳过主进程转发）**：

```typescript
// main.ts：建立渲染进程 ↔ Worker 的直连通道
ipcMain.handle('connect-worker', (event) => {
  const { port1, port2 } = new MessageChannelMain()
  workerProcess?.postMessage({ type: 'port' }, [port1])
  event.senderFrame.postMessage('worker-port', null, [port2])
})

// renderer：直接向 worker 发消息，无需主进程中转
window.addEventListener('message', (event) => {
  if (event.data === 'worker-port') {
    const port = event.ports[0]
    port.onmessage = (e) => handleWorkerResult(e.data)
    port.postMessage({ type: 'process', data: largeData })
  }
})
```

---

### contextBridge 性能模式（Electron 12+）

> `contextBridge` 是 `contextIsolation: true` 下暴露 API 给渲染进程的唯一推荐方式。

**精简暴露原则（避免暴露大对象）**：

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// 错误：暴露完整的 ipcRenderer，带来安全风险和初始化开销
// contextBridge.exposeInMainWorld('ipc', ipcRenderer)

// 正确：只暴露渲染进程真正需要的最小 API 集
contextBridge.exposeInMainWorld('ynote', {
  // 批量 API 设计：一次 invoke 处理多个操作，减少 IPC 往返次数
  batchQuery: (queries: BatchQuery[]) => ipcRenderer.invoke('batch-query', queries),
  // 单一功能 API
  getNoteContent: (id: string) => ipcRenderer.invoke('get-note', id),
  saveNote: (id: string, content: string) => ipcRenderer.invoke('save-note', { id, content }),
  // 事件监听
  onSyncStatus: (callback: (status: SyncStatus) => void) => {
    ipcRenderer.on('sync-status', (_, status) => callback(status))
    return () => ipcRenderer.removeAllListeners('sync-status')  // 返回清理函数
  },
})
```

**批量 API 设计模式（减少 IPC 次数）**：

```typescript
// 错误：多次单独 IPC（N 次网络往返）
const title = await ynote.getNoteTitle(id)
const content = await ynote.getNoteContent(id)
const tags = await ynote.getNoteTags(id)

// 正确：一次 IPC 批量获取（1 次往返）
const { title, content, tags } = await ynote.getNoteDetail(id)
```

---

### remote 模块迁移（Electron < 12 遗留项目）

> `remote` 模块在 Electron 12 中废弃，14 中移除。每次 `remote.xxx` 调用都是**同步 IPC**，严重阻塞渲染进程主线程。

**问题诊断**：在 Performance 面板中，如果看到密集的同步 IPC 调用（通常标记为 `IPC_SYNC`），排查是否有 `remote` 使用。

**迁移模式：`remote.xxx` → `ipcRenderer.invoke` + 主进程 handler**：

```typescript
// 迁移前（错误：同步 IPC）
const { dialog } = require('electron').remote
const result = dialog.showOpenDialogSync({ properties: ['openFile'] })

// 迁移后（正确：异步 IPC）
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

**`remote.getCurrentWindow()` 迁移**：

```typescript
// 迁移前
const win = require('electron').remote.getCurrentWindow()
win.minimize()

// 迁移后（preload.ts）
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

### 进程资源管控

- 非活跃窗口降低渲染帧率：`win.webContents.setFrameRate(1)` 减少后台 CPU 占用
- 窗口销毁时彻底释放资源：移除所有 IPC 监听器、解除对 `win` 对象的引用
- 沙箱模式（Electron 20+ 默认开启）：`sandbox: true` + `contextIsolation: true` 减少渲染进程初始化开销，同时提升安全性

---

## 七、加载性能优化

### 代码分割

```javascript
// React 路由级分割
const LazyPage = React.lazy(() => import('./pages/HeavyPage'))

// 条件加载（仅在需要时加载）
const loadHeavyFeature = async () => {
  const { HeavyFeature } = await import('./features/HeavyFeature')
  return HeavyFeature
}
```

### 关键渲染路径

- 首屏必须的 CSS 内联到 `<head>`，非关键 CSS 异步加载
- 关键 JS 保持最小；非关键 JS 用 `defer` 或动态导入
- 用 `<link rel="preload">` 预加载首屏字体/图片；用 `<link rel="preconnect">` 提前建立跨域连接

### 图片优化

- 格式：WebP（通用）或 AVIF（更高压缩比）
- 尺寸：根据实际显示尺寸提供多分辨率（`srcset`）
- 懒加载：`<img loading="lazy">` 或 IntersectionObserver
- 重要图片：`<img loading="eager" fetchpriority="high">` 避免 LCP 延迟

---

## 八、性能预算与工程化管控

### 性能预算参考值（结合项目实际调整）

| 指标              | 建议红线          |
| ----------------- | ----------------- |
| 首屏 JS 总大小    | < 300KB（gzip 后）|
| LCP               | < 2.5s            |
| INP               | < 200ms           |
| CLS               | < 0.1             |
| Electron 冷启动   | < 2s              |
| 主线程长任务数    | 关键交互路径 0 个 |

### CI/CD 集成

```bash
# Lighthouse CI 示例（GitHub Actions）
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
  # lighthouserc.json 中配置 assert 阈值，不达标则流水线失败
```

webpack-bundle-analyzer 集成到构建流程，每次构建后生成包体积报告，发现异常体积增长时告警。
