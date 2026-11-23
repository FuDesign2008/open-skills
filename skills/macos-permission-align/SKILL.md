---
name: macos-permission-align
version: "1.0.0"
user-invocable: true
description: "Align macOS Privacy & Security (TCC) grants from a reference app to a target app: build a reference baseline from Unified Logging new-entry lines, register the target and any nested helper bundles, grant per System Settings panel where the OS allows pre-grant, verify with triple fresh evidence, and document rollback. Use when one app should match another's Accessibility, Screen Recording, Full Disk Access, Input Monitoring, or related grants, or when toggles look on but behavior still fails. Triggers — 「权限对齐」「和某个应用一样的权限」「给应用授权」「TCC 权限」「辅助功能没生效」「屏幕录制没生效」「完全磁盘访问」「应用不在权限列表」 / macOS permission align, TCC audit, grant accessibility, screen recording permission. Do NOT use on Windows or Linux, for direct TCC.db read/write, with SIP disabled, for Astrill/VPN control, or to report granted without fresh log, app, or probe evidence."
---

# macOS Permission Align

Methodology for replicating **Privacy & Security** grants between two macOS apps when there is no supported API to list TCC state. Field-tested on **macOS 27.x** (2026-11-23); panel titles and pre-grant rules may differ on other releases — see [Known limits](#known-limits).

## When to use

| Situation | Use this skill |
|-----------|----------------|
| New tool should match an existing app's permission profile | Yes |
| Debug "toggle is on" but feature still blocked | Yes |
| Enumerate what a reference app actually has granted | Yes |

Out of scope: non-macOS platforms, MDM/PPPC profile authoring as the primary path, jailbreak/SIP-off tricks, or editing `TCC.db` directly.

## Safety boundaries

- Grant changes go only through **System Settings** toggles (or the app's own permission prompts). No SIP changes, no database writes.
- Clicks and automation in Privacy panels are sensitive: proceed only after the user agrees to the planned grants for the named apps and bundle ids.
- Before any action that would **restore, raise, or foreground another app's window** on the user's display (for example reading System Settings while the user is working elsewhere), ask first.
- **Never** report a service as granted until **fresh** evidence from the verification stage says so. Mark system-limited items as **pending** instead of pass.

## Stage 0 — Clarify goal

1. **Reference app** — display name, install path, bundle id (`com.example.ref`).
2. **Target app** — same fields (`com.example.target`), or "install then align" if not present yet.
3. **Scope** — strict full parity vs minimum set required for a stated feature.
4. **Non-pregrantable services** — user accepts they stay **pending until first use** (Automation/AppleEvents per target, Microphone/Photos on some macOS versions without a "+" control).
5. **Evidence bar** — which functional probe (if any) proves the user's goal beyond log lines.

## Stage 1 — Reference baseline

Preferred: **Unified Logging** lines from `SecurityPrivacyExtension` when privacy panes load.

1. Open each relevant Privacy & Security pane (deep links in [reference.md](reference.md)) so settings extensions log state.
2. Query `new entry:` lines filtered by the reference bundle id; map each service to `full` or `none`.
3. Treat **nested helpers** (separate `.app` bundles inside the reference `.app`) as **their own** bundle ids — baseline them explicitly.

Fallback when logs are empty: ask the user to open panes and re-run, or use whatever UI-automation or accessibility tooling the host agent has to read list rows **while the pane window is visible** (unstable on recent macOS; see reference pitfalls).

Do **not** spend time on `TCC.db` or `tccutil list` — they do not provide a portable grant inventory on current macOS.

Log command patterns and service semantics: [reference.md](reference.md#baseline-from-unified-logging).

## Stage 2 — Register target app

1. Install or copy the target into `/Applications` (or user-stated path) using the channel the user chose (App Store, vendor installer, package manager, drag-and-drop).
2. **Validate identity** before granting:
   - `CFBundleIdentifier` from `Info.plist`
   - `codesign --verify --deep --strict` and `spctl -a -vvv -t install`
   - Team / Authority from `codesign -dv` (do not infer signing org from repo or vendor name alone)
3. **Launch once** so TCC registers the bundle.
4. **Discover helpers** — search under the `.app` for nested bundles (names often contain `computer`, `helper`, `agent`); record each helper's bundle id from its `Info.plist`.
5. If the target ships a **permissions status command or API** (JSON or plain text), note it for stage 4 — optional, not required for every app.

Details: [reference.md](reference.md#target-registration-and-helpers).

## Stage 3 — Grant per panel

Work from the baseline list:

1. Open the pane URL for each `kTCCService*` you need.
2. If the target (or helper) row exists, set the toggle **on**. If absent and the pane offers **+**, add via **Go to Folder** with the exact `.app` path — **helpers need their own `.app` path**, not only the main app.
3. Services the OS does not allow pre-granting: record **pending** with reason (e.g. Automation is per controlled app; Microphone/Photos may lack "+" on some versions).
4. **Full Disk Access** functionally covers many folder-level services; sub-rows may appear only after real access — do not fail parity solely because sub-toggles are missing when FDA is `full`.

Panel URL table and grant order hints: [reference.md](reference.md#privacy-pane-deep-links).

## Stage 4 — Verify (triple evidence)

For each in-scope service, collect up to three layers. **Pending** never counts as pass.

| Layer | What | Role |
|-------|------|------|
| A — Log | Fresh `new entry:` query for target (+ helper) bundle ids | Authoritative TCC mirror |
| B — App | Target's own permission API/CLI if present | Product-specific status |
| C — Probe | Minimal real action (open a pane, capture UI state, run one feature step) | Proves end-to-end |

Grade each item: **verified** (all applicable layers agree), **constructive** (proxy check only), **pending** (blocked by OS), **unknown** (inconclusive — say what is missing).

When reading System Settings UI programmatically, prefer short-lived reads while the pane window exists; avoid screen-grabbing restore unless the user approved it.

Verification recipes: [reference.md](reference.md#verification-commands).

## Stage 5 — Rollback

Document reversible steps **before** destructive cleanup:

1. `tccutil reset All <target-bundle-id>` for the main app and each helper bundle id that received grants.
2. Uninstall or remove the target app only when the user confirms data loss (caches, preferences, support folders).

Example sequence (placeholders): [reference.md](reference.md#rollback).

## Output summary

Deliver a compact report:

```text
reference: <name> (<bundle-id>)
target: <name> (<bundle-id>)
helpers: <bundle-id> … or none
baseline-services: <count>
aligned: <list with verified | pending | skipped-with-reason>
evidence: log (fresh) | app-api | probe — per service
rollback: <commands agreed with user>
```

## Known limits

- Accessibility pane **title string** on macOS 27 was observed once as "Device Control and Data Access" — **not re-confirmed** across navigations; treat pane URL as source of truth.
- Whether **Files & Folders** sub-rows can be created manually vs only after first access — **not fully verified** here.
- **Microphone / Photos** lacking "+" on macOS 27 — observed in one session; may vary by app type or OS point release.
- **Automation (AppleEvents)** via MDM/PPPC — not exercised on a non-managed machine.
- Strict cosmetic parity for media/automation services may be impossible without triggering first-use prompts; FDA may suffice for folder classes functionally.

Full pitfall list: [reference.md](reference.md#pitfalls).