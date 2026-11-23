# macos-permission-align — reference

Verification anchor: **macOS 27.x**, arm64, field-tested **2026-11-23**. Adjust pane names and pre-grant rules when behavior on another version disagrees.

## Why not TCC.db or tccutil list

| Approach | Result on recent macOS |
|----------|-------------------------|
| `/Library/Application Support/com.apple.TCC/TCC.db` | `stat` may succeed for root; `sqlite3` often returns **authorization denied** |
| `~/Library/Application Support/com.apple.TCC/TCC.db` | Path commonly **absent** |
| `tccutil` | **reset** only — no inventory |

Spend effort on Unified Logging and panel toggles instead.

## Baseline from Unified Logging

Use **`/usr/bin/log`**, not the shell builtin `log` (zsh maps `log` to `log` without forwarding `show`).

### Open panes to seed logs

Open each in-scope Privacy pane (see [deep links](#privacy-pane-deep-links)) once before querying.

### Query template

Reference bundle `com.example.ref`:

```bash
/usr/bin/log show --last 12h --style compact \
  --predicate 'eventMessage CONTAINS "new entry:" AND eventMessage CONTAINS "com.example.ref"' \
  | grep -o 'new entry: kTCCService[A-Za-z]* [a-z0-9._-]* [a-z]*' | sort -u
```

Example line: `new entry: kTCCServiceAccessibility com.example.ref full` — trailing token `full` = granted, `none` = not granted.

### Normalize to a table

```bash
/usr/bin/log show --last 7d --style compact \
  --predicate 'eventMessage CONTAINS "new entry:" AND eventMessage CONTAINS "com.example.ref"' \
  | sed -E 's/.*new entry: ([^ ]+) ([^ ]+) (.*)$/\2 | \1 | \3/' | sort -u
```

Sample shape (de-identified):

```text
com.example.ref | kTCCServiceAccessibility | full
com.example.ref | kTCCServiceScreenCapture | full
com.example.ref.helper | kTCCServiceAccessibility | full
```

When duplicate rows exist over time, treat the **latest** event as current or cross-check layer B/C.

### kTCCService semantics (common grants)

| Service constant | Typical user-facing pane | Notes |
|------------------|--------------------------|-------|
| `kTCCServiceAccessibility` | Accessibility | Required for UI automation of other apps |
| `kTCCServiceScreenCapture` | Screen Recording | Distinct from screenshots in some products |
| `kTCCServiceListenEvent` | Input Monitoring | Keyboard/mouse events |
| `kTCCServiceSystemPolicyAllFiles` | Full Disk Access | Often covers folder sub-policies in practice |
| `kTCCServiceSystemPolicyDesktopFolder` etc. | Files & Folders sub-rows | May appear only after app access |
| `kTCCServiceMicrophone` | Microphone | May be prompt-only on some OS builds |
| `kTCCServicePhotos` | Photos | Same |
| `kTCCServiceAppleEvents` | Automation | **Per target application** — not bulk pre-grantable |
| `kTCCServiceMediaLibrary` | Media & Apple Music | Use `Privacy_Media`, not `Privacy_MediaLibrary` (wrong query opens root) |

## Target registration and helpers

### Bundle id

```bash
/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' \
  /Applications/Example.app/Contents/Info.plist
```

Expect `com.example.target`.

### Signing and notarization

```bash
codesign --verify --deep --strict /Applications/Example.app
codesign -dv --verbose=2 /Applications/Example.app 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority'
spctl -a -vvv -t install /Applications/Example.app
```

### Find nested helper apps

```bash
find /Applications/Example.app -maxdepth 6 \( -iname '*computer*' -o -iname '*helper*' -o -iname '*.app' \) -type d
```

Read each helper's `Info.plist` for its bundle id (e.g. `com.example.target.computer-use`). Grant **Accessibility** and **Screen Recording** separately for helper and main when both appear in baseline.

### First launch

Open the main app once so Privacy lists can show the bundle before "+" add flows.

## Privacy pane deep links

Template:

```text
x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?<Query>
```

Open with the host agent's native "open URL" capability.

| Permission | Query | Observed window title (macOS 27) |
|------------|-------|--------------------------------|
| Full Disk Access | `Privacy_AllFiles` | Full Disk Access |
| Accessibility | `Privacy_Accessibility` | Title observed once as "Device Control and Data Access" — verify locally |
| Screen Recording | `Privacy_ScreenCapture` | Screen & System Audio Recording |
| Input Monitoring | `Privacy_ListenEvent` | Input Monitoring |
| App Management | `Privacy_AppBundles` | App Management |
| Files & Folders | `Privacy_FilesAndFolders` | Files & Folders |
| Microphone | `Privacy_Microphone` | Microphone |
| Photos | `Privacy_Photos` | Photos |
| Media & Apple Music | `Privacy_Media` | Media & Apple Music |
| Automation | (no stable deep link verified here) | Use in-app trigger or manual navigation |

### Manual add flow (when "+" exists)

1. Open pane → **+** → **Go to Folder** (⌘⇧G) → paste `/Applications/Example.app` or helper `.app` path → enable toggle.

## Grant matrix (pre-grant vs pending)

| Class | Pre-grant via pane "+" | Typical handling |
|-------|------------------------|------------------|
| Accessibility, Screen Recording, FDA, Input Monitoring, App Management | Usually yes, once app registered | Stage 3 |
| Automation (AppleEvents) | No — per controlled app | **pending** until first control attempt |
| Microphone, Photos | Often no "+" on macOS 27 in test | **pending** until app requests |
| Files & Folders sub-folders | Sub-rows may lag first access | FDA `full` may be enough functionally |

## Verification commands

### Layer A — Log (target)

```bash
/usr/bin/log show --last 2h --style compact \
  --predicate 'eventMessage CONTAINS "new entry:" AND (eventMessage CONTAINS "com.example.target" OR eventMessage CONTAINS "com.example.target.computer-use")' \
  | grep -o 'new entry: kTCCService[A-Za-z]* [a-z0-9._-]* [a-z]*' | sort -u
```

### Layer B — App-reported status (when present)

If the target exposes a permissions JSON CLI, run it and map fields (e.g. `accessibility=granted`, `nextStep=null`). Command path varies by vendor — discover from docs or `--help`.

### Layer C — UI probe (intent)

Goal: confirm the target can **read or interact** with a System Settings privacy row relevant to the failure.

Use whichever combination the host supports: accessibility tree of the settings window, short-lived automation while the pane is frontmost, or a user-confirmed manual check. Avoid raising/restoring windows on the user's screen without consent.

When parsing JSON from UI tools, some payloads embed raw control characters — parsers may need non-strict JSON if the tool emits them.

## Rollback

```bash
tccutil reset All com.example.target
tccutil reset All com.example.target.computer-use
```

Add one `tccutil reset All <helper-bundle-id>` per helper granted.

Uninstall steps depend on install channel; confirm zap of `~/Library/Application Support/`, Caches, and Preferences with the user before `rm` or package-manager `--zap`.

## Pitfalls

1. **Helper ≠ main app** — granting Accessibility on `Example.app` does not grant the nested `Example Computer Use.app`.
2. **`log` builtin** — always `/usr/bin/log show`.
3. **System Settings window lifetime** — panes may close within seconds; re-open deep link before each read.
4. **AppleScript / System Events alone** — `entire contents` of the settings window may flap between success and `Invalid index`; treat as secondary to log evidence.
5. **Stale log lines** — `sort -u` hides time order; narrow time window or grep latest timestamps when in doubt.
6. **Wrong media query** — `Privacy_MediaLibrary` lands on Privacy root, not Media pane.
7. **Signing vs distribution name** — trust `codesign -dv`, not GitHub org or DMG filename.
8. **Claiming grant from toggle screenshot** — UI can lie until layer A refreshes.
9. **FDA vs folder toggles** — missing Desktop/Documents sub-rows with FDA `full` is often acceptable for parity goals.
10. **Screen restore / focus steal** — any "bring settings to front" automation needs explicit user OK.