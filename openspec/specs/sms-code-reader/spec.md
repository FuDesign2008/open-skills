# sms-code-reader Specification

## Purpose
Freshness-gated macOS SMS verification-code reading via a direct SQLite read of the Messages `chat.db`: reads paced around the iPhone→Mac sync delay, sync failures triaged infrastructure-first, Mac-side stalls diagnosed by wal-mtime freeze and recovered by restarting Messages, iCloud rollbacks countered by immediate use and re-trigger, human fallback when all reads fail.

## Requirements

### Requirement: sms-code-reader SHALL read verification codes from the macOS Messages database with a mandatory freshness gate

When a verification code is needed for an automation step, the skill MUST read codes from `~/Library/Messages/chat.db` via the documented SQLite queries (generic verification-code pattern; optional sender filter), and queries MUST stay limited to verification-code-pattern messages (`LIKE '%验证码%'`) — no other SMS content is read or stored. A returned code MUST be accepted only when its timestamp falls within 0-240 s of the current time (codes are valid ~5 minutes; the window leaves sync-delay margin). A code outside the window MUST be discarded without ever being entered.

#### Scenario: Fresh code within the window

- **WHEN** a query returns a code whose timestamp is within 0-240 s of now
- **THEN** the skill returns/enters that code for the automation step

#### Scenario: Stale code outside the window

- **WHEN** a query returns a code whose timestamp is hours old
- **THEN** the skill discards it, re-reads or re-triggers, and never enters the stale code

### Requirement: reads SHALL be paced around the iPhone-to-Mac sync delay with a human fallback

After the code is triggered on the target platform, the skill MUST wait 30-90 s for iPhone reception plus iCloud sync before expecting the code, then poll (every 15 s, up to 4 times) and take the first in-window code. When all reads fail, the skill MUST fall back to asking the user to read the code from the iPhone (~10 s) instead of retrying indefinitely.

#### Scenario: Code just triggered

- **WHEN** the platform confirms "code sent" with its countdown
- **THEN** the skill waits 30-90 s before the first poll and polls every 15 s up to 4 times, rather than reading instantly and failing

#### Scenario: All polls missed

- **WHEN** the polling attempts all return no in-window code
- **THEN** the skill asks the user to read the code from the iPhone as the fallback

### Requirement: sync failures SHALL be triaged infrastructure-first

When no fresh code arrives, the skill MUST check the infrastructure prerequisites before deeper software probes: whether the iPhone is on the same network as the Mac (different network = complete sync loss, recovers on return), and the iPhone battery level (below ~20% → iOS power mode suspends Text Message Forwarding; irregular on/off sync follows the battery level). When the database is alive (mtime fresh) but no new SMS lands, the skill MUST attribute the fault to the iPhone side and re-toggle Text Message Forwarding (session rebuild takes minutes).

#### Scenario: iPhone away on a different network

- **WHEN** no fresh code arrives and the iPhone is away from the Mac's network
- **THEN** the skill attributes the loss to the network split (complete sync loss) instead of re-checking chat.db permissions/process/APNs in a loop

#### Scenario: iPhone battery low

- **WHEN** sync works on and off with no regular pattern
- **THEN** the skill asks the iPhone battery first and attributes the suspension to low-battery power mode, recovering after charging above ~20%

### Requirement: Mac-side sync stall SHALL be diagnosed by wal-mtime freeze and recovered by restarting Messages

When chat.db shows no new code for ~270 s from the trigger (the timing rhythm's four polls exhaust by ~150 s; the sync-health diagnosis covers the gap), the skill MUST run the three-step criteria: (1) `chat.db-wal` mtime frozen at the last activity moment (>5 min without update) = Mac-side stall signal; (2) contrast-exclude the iPhone side — Messages process alive plus APNs reachable (ICMP unreachable is Apple-normal) means the fault is Mac local database writing; (3) distinguish from the iPhone-side classes (low battery / away network / night auto power mode), which have no Mac-side wal freeze. Recovery MUST be `killall Messages` + `open -a Messages` (wal mtime updates immediately, sync recovers in seconds). While stalled, the skill MUST NOT re-trigger the code (the first code may never have synced; re-triggering burns the platform's rate-limit quota); after recovery one fresh trigger lands.

#### Scenario: Stall diagnosed and recovered

- **WHEN** ~270 s pass with zero new codes, `chat.db-wal` mtime is frozen, and the Messages process plus APNs are healthy
- **THEN** the skill restarts Messages (`killall Messages` + `open -a Messages`), confirms wal mtime updates, and continues the chain — the failed step goes through a recovery round (re-trigger → poll → submit)

#### Scenario: No re-trigger while stalled

- **WHEN** the no-code window closes and the stall is confirmed
- **THEN** the skill records the miss and skips without re-triggering, and after recovery performs exactly one fresh trigger

### Requirement: iCloud sync rollback SHALL be countered by immediate use and re-trigger

A just-read in-window code can later disappear from chat.db with the latest record rolling back hours — iCloud sync overwriting the local WAL with an older snapshot. The skill MUST treat read→fill→submit as one motion without interval re-checks of the database, and when a submitted code fails to match, the skill MUST re-trigger the code and read fresh instead of trusting the database's "latest" record.

#### Scenario: Just-read code later missing from the database

- **WHEN** a code that was read fresh (in-window) is later absent from chat.db or the latest record has rolled back hours
- **THEN** the skill recognizes the iCloud rollback, keeps using the already-read code for the current step, and re-triggers for the next code rather than re-reading the rolled-back database
