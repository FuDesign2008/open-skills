# astrill-control Specification

## Purpose
Idempotent macOS Astrill VPN control via the bundled script: dual probes plus GUI menu text judge state; Accessibility prerequisite surfaced; OpenWeb boundary documented.

## Requirements

### Requirement: astrill-control SHALL provide idempotent VPN control via the bundled script

When the user asks to connect, disconnect, or inspect Astrill VPN on macOS, the skill MUST drive the bundled `scripts/astrill.sh` (`status` / `on` / `off`) rather than hand-written automation. Each mutating command MUST read the current state first and return success without acting when the desired state already holds. Disconnection MUST use the menu Toggle (app stays alive) instead of quitting the app.

#### Scenario: Connect requested while already connected

- **WHEN** the user asks to connect and the GUI menu shows `Toggle OFF` (connected state)
- **THEN** the script reports "already connected" and exits 0 without clicking anything

#### Scenario: App not running at connect time

- **WHEN** `on` is requested and the Astrill app process is absent
- **THEN** the script launches the app, waits for the GUI menu to become reachable, and proceeds to connect

### Requirement: state judgment SHALL combine dual probes with GUI menu text

Connection state MUST be judged from the tunnel process (`asovpnc`), the exit IP (`curl ipinfo.io/ip`), and the GUI menu item text together. A state transition is confirmed only when its probe evidence arrives (tunnel process appears/disappears within the polling window), not merely from UI feedback. When probes disagree, the GUI menu text is the primary judge.

#### Scenario: OpenWeb mode probe mismatch

- **WHEN** the GUI shows connected but the exit-IP probe still returns a local direct IP
- **THEN** the skill recognizes the OpenWeb (browser-only proxy) boundary — the tunnel probe does not apply and curl exit IP may not reflect browser proxy state — and resolves the question via the GUI menu text plus a mode check instead of declaring the VPN broken

### Requirement: the Accessibility prerequisite SHALL be surfaced

The skill MUST state the one-time prerequisite — the app hosting the agent holds the macOS Accessibility permission — and script failures with `GUI unreachable` MUST be attributed to that cause in the skill's guidance.

#### Scenario: GUI unreachable

- **WHEN** the script reports `GUI unreachable`
- **THEN** the agent explains the missing Accessibility permission for the host app and how to grant it, instead of retrying blindly
