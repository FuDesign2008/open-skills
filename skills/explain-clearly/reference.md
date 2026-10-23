# explain-clearly — Worked Examples

Two complete examples calibrated from real Q&A sessions (de-identified: project details replaced with generic placeholders). Example 1 is a "what is X" mechanism question. Example 2 is a "can A talk to B" topology question.

## Example 1 — "What is IPC?"

IPC is the mechanism by which separate processes exchange data and invoke each other's capabilities.

The operating system isolates each process's memory, so one process cannot read another's variables. The table is the explanation. It is a labeled public Electron pattern, because this session has no project files for the concept.

| Channel | Mechanism | Typical use |
|---|---|---|
| renderer ↔ main | Electron `ipcRenderer` / `ipcMain` | UI calls into the main process |
| main ↔ worker | Node `fork` + `process.send` | main forwarding work to a long-lived worker |

Those channels exist because isolation would otherwise leave each process sealed. The question asks what IPC is, so the page stops there.

## Example 2 — "Can the renderer talk to the server directly?"

No. In this generic Electron layout, each side holds one channel and both channels end at main.

```
renderer
   │  Electron IPC
   ▼
main
   │  Node fork IPC
   ▼
server
```

The renderer only holds `ipcRenderer`, so that pipe ends at main. The server only holds `process.send`, so that pipe ends at main. The diagram already shows the relay, and the question is whether the two can talk, so the page stops there. The snippet below is a labeled public pattern, not files from the current session.

```ts
// hop 1: renderer → main (main-process.ts)
ipcMain.on(EventType.SaveNoteContent, (event, id, content) => {
    // hop 2: main → server
    messenger.sendToServer('saveNoteContent', { id, content });
});
```

## Calibration notes

- Depth: match the amount of cause the question needs. A broad "what is X" names the subject in one sentence under the title and then gives the relevant mechanism in its shape. A narrower question ("can A do B") puts the direct answer in that sentence.
- Localization: when the user's codebase contains the concept, replace the generic table or diagram above with real files and lines read in this session.
- Visuals: Example 1 uses a table because it compares channels, one row per item. Example 2 uses one static diagram because it is a relay topology. Match the visual to the first matching shape.
