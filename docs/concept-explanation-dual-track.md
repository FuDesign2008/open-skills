# 技术概念双轨讲解法（理性认识 + 感性认识）

> 本文档记录两次关于「IPC」的问答，作为抽象成 skill 的素材（范例已脱敏通用化；已落地为 `skills/teach-me/`）。
>
> 核心方法：给开发者讲解一个技术概念时，用**双轨**——
> ① **理性认识**（机制 / 原理 / 代码证据），② **感性认识**（生活类比 / 直觉 / 一句话记住）。
> 双轨互补：理性轨建立准确心智模型，感性轨降低理解门槛、便于记忆与转述。

---

## 方法论模板（可复用）

### 理性认识（三到四步）

1. **一句话定义**：它是什么
2. **为什么需要**：解决了什么问题（往往从"没有它会怎样"切入）
3. **本项目/场景的具体形态**：落到调用方熟悉的代码/架构，给出现成证据（文件、行号、API）
4. **关键设计含义**：这个机制在本场景里直接导致了什么设计决策（收尾呼应业务）

### 感性认识（两步）

1. **生活类比**：把抽象机制映射到一个具体、可脑补的画面
2. **一句话记住**：压成一句能脱口而出的记忆锚点

> 判断标准：感性认识必须**不损失理性认识的关键约束**（类比可以简化，但不能引入错误直觉）。

---

## 范例 1：IPC 是什么？

### 理性认识

**一句话定义**：IPC = Inter-Process Communication（进程间通信）——不同进程之间交换数据、调用能力的机制。

**为什么需要**：操作系统把每个进程的**内存隔离**开——进程 A 的代码不能直接读写进程 B 的内存变量。进程之间要协作，就必须通过操作系统提供的「管道」来通信，这就是 IPC。

**本项目（某 Electron 桌面应用）的具体形态**：Electron 应用天生多进程，两套不同 IPC：

| 通道 | 底层机制 | 本项目例子 |
|---|---|---|
| renderer ↔ main | Electron `ipcRenderer` / `ipcMain` | `saveBackup`、`saveNoteContent` |
| main ↔ server | Node `fork` + `process.send` / `process.on('message')` | `messenger.sendToServer` / `sendToMain` |

**关键设计含义**：抢救走 IPC 而非 HTTP 是项目的一项设计决策，也是多起案例根因的直接呼应——HTTP 走网络栈（会挂起，正是案例根因 `ERR_NETWORK_IO_SUSPENDED`），IPC 走进程内部通道（网络栈挂了照样通）。所以抢救链路「renderer 超时 → IPC → main 直写 → 绕开可能卡死的 server」。

### 感性认识

把每个进程想成**一栋独立的房子**：有墙（内存隔离），房子 A 里的人看不到房子 B 里发生什么，协作必须拉专线。

- **HTTP** = 开汽车走**公共马路**（网络栈），会堵车（挂起）、会断路（连接失败）。
- **IPC** = 两栋房子之间直接拉的**对讲机线**（进程间通道），马路堵了断了，对讲机照样喊话。

于是抢救逻辑的本质：保存请求「开车出门」堵路上了 → 抄起对讲机把内容直接喊给隔壁 main → main 记下来 → 内容保住。

**一句话记住**：IPC 就是「进程之间不走网络、直接喊话的那根线」，保存失败抢救能救回内容，靠的正是**网络断了这根线还在**。

---

## 范例 2：renderer 和 server 可以 IPC 通信吗？

### 理性认识

**直接答案**：不能直接通信，必须经 main 中转（两跳）。

**为什么**：进程层级决定了各自只有一根「只接 main」的线：

```
renderer（渲染进程）
   │  Electron IPC：ipcRenderer ↔ ipcMain
   ▼
main（主进程）
   │  Node fork IPC：process.send ↔ process.on('message')
   ▼
server（子进程）
```

- **renderer** 是 Chromium 渲染进程，手里只有 Electron 的 `ipcRenderer`，另一头只能接 main；够不到 server。
- **server** 是 main `fork` 的 Node 子进程，手里只有 `process.send`，另一头只能接 main；够不到 renderer。

**代码证据**（现成的两跳范例，`saveNoteContent`）：

```ts
// 第一跳 renderer → main（main-process.ts）
ipcMain.on(EventType.SaveNoteContent, (event, id, content) => {
    // 第二跳 main → server
    messenger.sendToServer('saveNoteContent', { id, content });
});
```
```ts
// server 端 process.on('message') 分发（server.ts）
case 'saveNoteContent': { ... }
```

**关键设计含义**：这解释了抢救为什么是「renderer → main 直写」而非「renderer → server」——① renderer 够不到 server（要两跳）；② server 可能整体卡死（案例怀疑点），经它中转可能同样卡死。所以方案让 main 直接写备份文件、绕开 server。

### 感性认识

把三个进程想成**三个人**，main 是**总机接线员**：

- renderer 和 server 互不认识、没有直拨号码，要说话都得先拨总机（main），总机再转接。

而抢救场景是 server 可能已「失联」（卡死）——此时还指望总机转接给 server 就白等了。于是抢救让**总机（main）自己把事情办了**：内容交给 main，main 抄笔写进本地文件，根本不去找 server。就像打电话给总机办事，总机直接替你办，而不是转接给一个可能没人接的分机。

**一句话记住**：renderer 和 server 之间没有直拨，都得经 main 这个总机转接；抢救之所以可靠，正是它**绕过 server，让 main 这个总机直接办事**。

---

## 抽象成 skill 的初步思路

- **skill 定位**：当用户（开发者）问「X 是什么」「A 和 B 能通信吗」这类**概念解释 / 机制澄清**问题时，用「理性认识 + 感性认识」双轨作答。
- **触发场景**：技术概念讲解、架构机制澄清、进程/通信/协议类「是什么/为什么/能不能」问题。
- **输出结构**：理性认识（定义 → 为什么 → 本项目形态+代码证据 → 设计含义）+ 感性认识（生活类比 + 一句话记住）。
- **红线**：感性类比不得引入错误直觉；代码证据必须落到真实文件/行号（不编造）；理性轨必须准确，感性轨才允许简化。
- **决定（2026-08-26）**：独立成 skill `teach-me`（见 `skills/teach-me/`），方法论入 SKILL.md、脱敏范例入 reference.md；上机/操作教学类请求不归该 skill（走 `teach`）。

---

## 附：原始问答上下文

- 项目：某 Electron 桌面应用（main 进程 + fork 出的 server 子进程）+ web renderer
- 相关背景：保存失败抢救方案；多起笔记丢失案例的根因（保存 HTTP 链路挂起）
- 记录日期：2026-08-26
