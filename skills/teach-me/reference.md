# teach-me — Worked Examples

Two complete examples calibrated from real Q&A sessions (de-identified: project details replaced with generic placeholders). Example 1 is a "what is X" mechanism question; Example 2 is a "can A talk to B" topology question.

## Example 1 — "What is IPC?"

### Rational track

**1. One-sentence definition**: IPC (Inter-Process Communication) is the mechanism by which separate processes exchange data and invoke each other's capabilities.

**2. Why it exists**: the operating system isolates each process's memory — process A cannot directly read or write process B's variables. Cooperation between processes therefore requires OS-provided channels; those channels are IPC. Without them, every multi-process app would be a set of sealed rooms that can never cooperate.

**3. Concrete shape in the asker's world** *(generic Electron desktop app — no real-codebase footprint in this session; adapt to the user's actual files when present)*: Electron apps are multi-process by design, with two distinct IPC channels:

| Channel | Mechanism | Typical use |
|---|---|---|
| renderer ↔ main | Electron `ipcRenderer` / `ipcMain` | UI → main-process calls (window controls, persistence) |
| main ↔ server | Node `fork` + `process.send` / `process.on('message')` | main forwarding requests to a long-lived worker process |

Design context: in this app, an offline-rescue feature deliberately writes backups via IPC instead of HTTP — HTTP travels the network stack and can hang (a real incident lost user content to a hung save request, `ERR_NETWORK_IO_SUSPENDED`), while IPC is an in-process channel that keeps working when the network stack is hung.

**4. Key design implication**: when a feature must survive network failure, route it over IPC and have the main process write locally — do not trust an HTTP endpoint with last-resort persistence.

### Intuitive track

Picture each process as a **separate house**: the walls are memory isolation; no house can see inside another; cooperation needs dedicated lines.

- **HTTP** = driving on the **public road** (the network stack): traffic jams (hangs), road closures (connection failures).
- **IPC** = a **direct intercom line** strung between the houses: when the road jams or closes, the intercom still works.

So the rescue flow in essence: the save request "drove onto the road" and got stuck in traffic → grab the intercom and dictate the content straight to the neighboring main process → main writes it down → the content survives.

**One-line memory anchor**: IPC is "the line between processes that talks without the network" — the rescue works precisely because when the network died, this line was still alive.

## Example 2 — "Can the renderer talk to the server directly?"

### Rational track

**Direct answer**: no — messages must relay through main (two hops).

**1. One-sentence definition (of the topology)**: in an Electron app, renderer↔server communication is an indirect, main-relayed topology — each side holds exactly one channel, and both channels terminate at main.

**2. Why**: process hierarchy dictates the wiring:

```
renderer (Chromium render process)
   │  Electron IPC: ipcRenderer ↔ ipcMain
   ▼
main (main process)
   │  Node fork IPC: process.send ↔ process.on('message')
   ▼
server (forked child process)
```

- The renderer only holds Electron's `ipcRenderer`; the far end of that pipe is main — it cannot reach the server.
- The server only holds `process.send`; the far end is main — it cannot reach the renderer.

**3. Concrete shape** *(generic two-hop pattern; cite the user's real files when present)*:

```ts
// hop 1: renderer → main (main-process.ts)
ipcMain.on(EventType.SaveNoteContent, (event, id, content) => {
    // hop 2: main → server
    messenger.sendToServer('saveNoteContent', { id, content });
});
```

```ts
// server-side dispatch (server.ts)
case 'saveNoteContent': { /* persist */ }
```

**4. Key design implication**: this is why the rescue path is "renderer → main writes directly" rather than "renderer → server": (1) the renderer cannot reach the server without two hops; (2) the server may be entirely hung (the suspected root cause), so relaying through it could hang too. Having main handle the write itself removes both risks at once.

### Intuitive track

Picture three people, where **main is the switchboard operator**: renderer and server don't know each other and have no direct-dial numbers — every call goes through the operator, who transfers it.

In the rescue scenario, the server may already be "unreachable" (hung) — waiting for the operator to transfer you to a dead extension is pointless. So the rescue has the **operator handle the matter directly**: hand the content to main, and main writes it to a local file, never touching the server. Like calling the front desk for help and the receptionist just does it instead of transferring you to an extension nobody answers.

**One-line memory anchor**: renderer and server have no direct dial — everything relays through main the operator; the rescue is reliable precisely because it bypasses the server and lets the operator act directly.

## Calibration notes

- Depth: a broad "what is X" question gets the full 4+2 structure; a narrower question ("can A do B") still gets both tracks but leads with the direct answer.
- Localization: when the user's codebase contains the concept, replace the generic table/snippets above with real files and lines read in-session — the structure stays, the evidence localizes.
- Visuals: the channel table in Example 1 and the ASCII topology in Example 2 are instances of the skill's visual-aids rule — a table for the multi-channel mapping, a diagram for the relay topology. Copy this shape: match the visual form to what the concept is.
