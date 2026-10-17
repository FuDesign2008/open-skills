---
name: sms-code-reader
version: "1.0.0"
user-invocable: true
description: "Read SMS verification codes on macOS via a direct SQLite read of the Messages database (chat.db) — replaces the human who reads the code aloud in AI automation flows. Use when an automation hits a phone-verification step (login / e-sign / identity confirmation) and the code arrives over the iPhone→Mac Messages sync channel. Triggers — 「读取验证码」「自动获取验证码」「短信验证码自动化」「读取短信验证码」「验证码自动读取」 / read SMS verification code, get verification code, SMS code automation. Prerequisites: the terminal app holds Full Disk Access; iPhone-Mac Text Message Forwarding is enabled; iPhone and Mac sit on the same network. Returns the code string, or the failure cause plus a fallback suggestion; codes stay valid ~5 minutes — freshness window and polling rhythm in the body. Do NOT use for email or authenticator-app codes."
---

# sms-code-reader · SMS Verification Code Reading on macOS (Messages chat.db)

> Mechanism: the verification SMS arrives on the iPhone, Text Message Forwarding syncs it into Mac Messages, it lands in `~/Library/Messages/chat.db` (SQLite), and this skill reads it directly — replacing the human who reads the code aloud in an automation flow. Field-tested end to end across 2026-09/10 on live verification-code automation chains.

## Prerequisites

- **Full Disk Access** for the terminal app hosting the agent (System Settings → Privacy & Security → Full Disk Access; restart the terminal after granting).
- **Text Message Forwarding** enabled on the iPhone (Settings → Apps → Messages → Text Message Forwarding).
- **iPhone and Mac on the same network** — see the infrastructure dependency section.

## Pre-flight checks (first use, or when reads fail)

```bash
# 1. Permission check (authorization denied = not granted)
sqlite3 ~/Library/Messages/chat.db "SELECT count(*) FROM message LIMIT 1;" 2>&1
# authorization denied → guide the user: System Settings → Privacy & Security → Full Disk Access → add the terminal app (Terminal/iTerm2/VS Code) → restart the terminal for it to take effect
# one-click panel: open "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"

# 2. Sync health diagnosis (when no fresh code arrives)
ls -la ~/Library/Messages/chat.db*   # db/wal mtime — mtime stuck hours ago = zero sync
pgrep -lf Messages                    # process alive
nc -z -w 3 courier.push.apple.com 5223 2>&1   # APNs reachable
# db alive but no new SMS → iPhone side: re-toggle Text Message Forwarding (Settings → Apps → Messages → Text Message Forwarding)
```

## Core read (call after the code is triggered)

```bash
# Generic code (【XX】验证码：NNNNNN pattern, within 2-minute freshness)
sqlite3 ~/Library/Messages/chat.db "SELECT datetime(date/1000000000 + 978307200, 'unixepoch', 'localtime'), substr(text, instr(text, '验证码：')+4, 6) FROM message WHERE text LIKE '%验证码%' ORDER BY date DESC LIMIT 3;"

# Specific sender (replace <sender> with the service name)
sqlite3 ~/Library/Messages/chat.db "SELECT datetime(date/1000000000 + 978307200, 'unixepoch', 'localtime'), substr(text, instr(text, '验证码：')+4, 6) FROM message WHERE text LIKE '%<sender>%验证码%' ORDER BY date DESC LIMIT 1;"
```

The pattern targets Chinese verification SMS (【sender】…验证码：NNNNNN); adjust the LIKE and extraction pattern for other message formats.

**Freshness gate (mandatory)**: compare each returned timestamp against the current time and accept only codes 0-240 s old (codes are valid ~5 minutes; the window leaves sync-delay margin). Entering a stale code always fails (field lesson: during a sync delay a 6-hour-old code was read).

## Timing rhythm

1. Trigger the code (click "get code" on the page) → the platform shows "sent" + a 60 s countdown
2. Wait 30-90 s (iPhone reception + iCloud sync-to-Mac delay)
3. Poll (every 15 s, up to 4 times) → take the first in-window code → enter it
4. On sync failure run the sync health diagnosis (pre-flight check 2) → fix (re-toggle forwarding) → re-trigger and read
5. All attempts failed → fallback: ask the user to read the code from the iPhone (~10 s in the field)

## Known failure modes

| Failure | Signature | Handling |
|---|---|---|
| Permission missing | authorization denied | Full Disk Access + restart the terminal |
| Sync channel broken | db alive (mtime fresh) but no new SMS; yesterday's codes readable, today's missing | re-toggle Text Message Forwarding on the iPhone (session rebuild takes minutes); still broken → human-read fallback |
| Stale code | timestamp judged STALE (e.g. 24555 s old) | discard, re-read/re-trigger — never enter a stale code |
| **chat.db iCloud sync rollback** | a just-read code (within 2 minutes, judged FRESH) later disappears from the db on re-check; the latest record rolls back hours — iCloud sync overwrites the local WAL with an older snapshot | use the code the moment it is read (read → fill → submit in one motion, no interval re-checks); if the code fails to match, re-trigger "get code" and read again — trust the live read, not the db's "latest" record |
| **Mac Messages sync stall** | no new code within the 270 s polling window + `chat.db-wal` mtime frozen (stuck at the last activity moment); Messages process alive + APNs reachable (iPhone side excluded) — Mac local db writing stalled | `killall Messages` + `open -a Messages` restart → wal mtime updates immediately, sync recovers in seconds; the failed step then goes through a recovery round (see the Mac-side stall section) |

## ⭐ Mac-side sync stall: criteria and recovery

**Scenario**: the third sync-fault class, alongside the iPhone-side faults. In one field batch, 10 of 11 code triggers succeeded and the single failure was Mac-side: after a trigger, zero new codes landed in chat.db within the 270 s polling window → the discipline recorded NO_CODE and skipped (no re-trigger), and the chain continued with its later steps.

**Three-step criteria** (when chat.db shows no new code for 270 s, run in order):

1. **`chat.db-wal` mtime frozen** — stuck at the last activity moment (>5 min without update) with no new code = Mac Messages sync stall signal;
2. **Contrast-exclude the iPhone side**: `pgrep -lf Messages` process alive + `nc -z -w 3 courier.push.apple.com 5223` APNs reachable (ICMP unreachable is Apple-normal, not a fault) — both normal → the fault is **Mac local db writing**, not the forwarding link or gateway rate-limiting;
3. **Distinguish from the three iPhone-side classes** (low battery / away on another network / night auto power mode): those have no Mac-side wal freeze — diagnose in reverse order (Mac wal mtime first, then the phone).

**Recovery (seconds)**: `killall Messages` + `open -a Messages` → the wal mtime updates immediately and sync recovers (in the field case the next code landed right after the restart and was picked up; the later steps benefited directly). After recovery: ① an in-flight chain continues (its later steps verify the link is back); ② the failed step goes through a recovery round — re-trigger "get code" → poll chat.db → fill and submit (in the field case the recovery-round code arrived within ~2 s and the submission closed the loop).

**Discipline**: 270 s without a code → no re-trigger — the first code may never have synced to the db; re-triggering only burns the platform's rate-limit quota (the field batch burned zero extra triggers on this discipline). After recovery, one fresh trigger lands.

## ⭐ Root cause: iPhone low-battery power mode suspends forwarding

**Low battery (<20%) → iOS power mode → Text Message Forwarding suspended** — the most likely root cause of "sync works on and off" (easily misjudged as network/session issues before this was pinned down).

- Signature: irregular on/off sync (follows the battery level); recovers after charging above 20%
- Triage order: ask the iPhone battery first, then network/switches
- Pre-unattended check: confirm the iPhone battery is above 50% (or plugged in)
- Night auto power mode: an overnight run may lose sync while the battery check passes — the iPhone can enter power mode on a timer (field case: four polls + two re-triggers + full link diagnosis all STALE through a late-night window, recovered in the morning at home). Reserve a human code-reading fallback for overnight unattended runs; budget this variable into the plan.

## Privacy boundary

Only verification-code-pattern messages are queried (`LIKE '%验证码%'`); no other SMS content is read or stored; the time-window filter narrows the exposure further.

## ⭐ Infrastructure dependency: iPhone and Mac on the same network

**The iPhone and the Mac must sit in the same network environment** — Text Message Forwarding rides the same-network push channel:

| Scenario | Sync state |
|---|---|
| iPhone and Mac on the same network | works — ~2 s from trigger to db (field: readable 2 s after the trigger) |
| iPhone taken away (different network) | complete sync loss — all new codes missing (field: codes unreadable for a whole day; recovered on return home) |

**Triage**: when no fresh code arrives, first ask "is the iPhone on the same network as the Mac" — infrastructure before software (one field day was spent re-checking chat.db permissions/process/APNs — all normal — while this prerequisite was the broken one).

**Unattended implication**: with the iPhone away, the code step necessarily falls back to a human reading the code (~10 s each) or the run interrupts — budget this variable into unattended plans.
