# macos-permission-align Specification

## Purpose
Align macOS Privacy & Security grants from a reference app to a target app using a Unified Logging baseline, System Settings grants, per-bundle helper identity, triple verification, honest pending for OS-limited services, safety boundaries, and documented rollback. Windows, Linux, and Astrill/VPN control stay out of scope.

## Requirements

### Requirement: macos-permission-align SHALL run on macOS permission-align requests

`macos-permission-align` MUST run when the user asks to align macOS app permissions, replicate a reference app's Privacy & Security profile, or debug grants that look on but still fail. Trigger phrases include 「权限对齐」「和某个应用一样的权限」「给应用授权」「TCC 权限」「辅助功能没生效」「屏幕录制没生效」「完全磁盘访问」「应用不在权限列表」 and "macOS permission align", "TCC audit", "grant accessibility", "screen recording permission".

#### Scenario: Explicit align request

- **WHEN** the user asks to match another app's macOS permissions or to grant a target app the same profile as a reference app
- **THEN** the agent follows this spec through clarify, baseline, register, grant, verify, and rollback documentation before claiming success

#### Scenario: Stuck toggle

- **WHEN** the user reports a Privacy & Security toggle appears on but the feature still fails
- **THEN** the agent runs baseline and triple verification rather than trusting the toggle alone

### Requirement: macos-permission-align SHALL clarify reference, target, and scope before granting

Before changing grants, the agent MUST record the reference app name, install path, and bundle id, the target app fields or an install-then-align plan, whether scope is full parity or minimum for a stated feature, user acceptance of pending non-pregrantable services, and the functional probe (if any) that proves the user's goal.

#### Scenario: Missing target bundle

- **WHEN** the target is not installed and the user chose install-then-align
- **THEN** the agent completes registration and first launch before grant panels

#### Scenario: Minimum scope

- **WHEN** the user names one feature instead of full parity
- **THEN** the agent limits in-scope services to that goal and reports skipped services with reason

### Requirement: macos-permission-align SHALL build the reference baseline from Unified Logging only

The agent MUST derive the reference grant picture from fresh Unified Logging `new entry:` lines filtered by the reference bundle id when privacy panes load. The agent MUST NOT use `TCC.db` reads or `tccutil list` as a portable grant inventory.

#### Scenario: Baseline from pane load

- **WHEN** the agent opens each in-scope Privacy & Security pane for the reference app
- **THEN** it maps each in-scope service to `full` or `none` from `new entry:` lines for that bundle id

#### Scenario: Empty logs

- **WHEN** the first log query returns no `new entry:` lines for the reference bundle
- **THEN** the agent asks the user to open the panes and re-runs the query or uses an approved visible-pane read, and does not fall back to `TCC.db`

### Requirement: macos-permission-align SHALL treat helper bundles as separate identities

Nested `.app` bundles inside a reference or target `.app` MUST each use their own bundle id from `Info.plist`. Baseline, grant, verify, and rollback MUST cover each helper separately; adding only the main app path MUST NOT count as granting a helper.

#### Scenario: Helper discovered under reference

- **WHEN** a nested bundle exists under the reference `.app`
- **THEN** the baseline lists that helper's bundle id and its per-service state

#### Scenario: Helper grant in panel

- **WHEN** a helper needs a grant and the pane offers **+**
- **THEN** the agent adds the helper's exact `.app` path, not only the main app

### Requirement: macos-permission-align SHALL register and validate the target before granting

The agent MUST install or place the target per the user's channel, validate `CFBundleIdentifier`, code signature and assessment (`codesign`, `spctl`), record signing team when visible, launch once so TCC registers the bundle, and list every helper bundle id under the target `.app`.

#### Scenario: Identity mismatch

- **WHEN** signature verification fails for the target `.app`
- **THEN** the agent does not grant and reports the failure before any toggle change

#### Scenario: First launch registration

- **WHEN** the target was never launched after install
- **THEN** the agent launches once before expecting list rows or log lines for the target bundle

### Requirement: macos-permission-align SHALL grant only through System Settings

Grant changes MUST go through System Settings toggles or the target app's own permission prompts only. The agent MUST open the pane URL for each in-scope service, enable existing rows or add via **+** with **Go to Folder** when offered, and MUST NOT edit `TCC.db`, disable SIP, or use unsupported jailbreak paths.

#### Scenario: Toggle on for listed row

- **WHEN** the target or helper row exists in the pane
- **THEN** the agent sets the toggle on for that bundle

#### Scenario: No unsupported write

- **WHEN** a shortcut would require SIP off or direct `TCC.db` write
- **THEN** the agent refuses and stays on System Settings only

### Requirement: macos-permission-align SHALL mark non-pregrantable services as pending

Services the OS does not allow pre-granting (for example Automation per controlled app, or Microphone/Photos when **+** is absent) MUST be recorded as **pending** with reason. **Pending** MUST NOT count as pass or aligned.

#### Scenario: Automation pending

- **WHEN** Automation cannot be pre-granted for the target without a first-use prompt
- **THEN** the report lists Automation as pending and does not claim parity

#### Scenario: Pending excluded from pass count

- **WHEN** the closing summary grades services
- **THEN** pending items are excluded from verified counts

### Requirement: macos-permission-align SHALL verify with triple evidence before claiming granted

For each in-scope service that is not pending, the agent MUST collect fresh evidence: (A) Unified Logging `new entry:` for target and helpers, (B) the target's own permission status API or CLI when present, and (C) a minimal functional probe when applicable. The agent MUST NOT report a service as granted unless applicable layers agree; inconclusive results MUST be **unknown** with what is missing stated.

#### Scenario: Log-only block

- **WHEN** layer A shows `none` but the toggle appears on
- **THEN** the agent does not claim granted and records unknown or not verified

#### Scenario: All applicable layers agree

- **WHEN** fresh log lines and an applicable probe both support `full` for a service
- **THEN** the agent may grade that service **verified**

### Requirement: macos-permission-align SHALL follow safety boundaries

The agent MUST obtain user agreement before planned grants for named apps and bundle ids. Before restoring, raising, or foregrounding another app's window on the user's display (including reading System Settings while the user works elsewhere), the agent MUST ask first. The agent MUST NOT disable SIP or write `TCC.db`.

#### Scenario: Planned grants need consent

- **WHEN** the agent is about to change Privacy toggles for named bundle ids
- **THEN** it states the plan and proceeds only after user agreement

#### Scenario: Screen restore needs consent

- **WHEN** verification would restore or foreground another app's window
- **THEN** the agent asks before that action

### Requirement: macos-permission-align SHALL document rollback before destructive cleanup

Before uninstall or bulk cleanup, the agent MUST document `tccutil reset All <bundle-id>` for the main app and each helper that received grants, and MUST remove or uninstall the target only after user confirmation of data loss (caches, preferences, support folders).

#### Scenario: Rollback command list

- **WHEN** grants were applied to target and helpers
- **THEN** the report lists one `tccutil reset All` command per affected bundle id agreed with the user

#### Scenario: Uninstall blocked without confirm

- **WHEN** uninstall would delete user data under the target app
- **THEN** the agent waits for explicit user confirmation

### Requirement: macos-permission-align package SHALL match repo skill rules

The directory and frontmatter `name` MUST be `macos-permission-align`. `user-invocable` MUST be true. The description MUST be one double-quoted line, include the Chinese trigger phrases in this spec, state Windows/Linux and Astrill/VPN boundaries, and stay within the description length lint. The body MUST be English, describe outcomes rather than platform-exclusive tools as required, and MUST NOT contain internal product names, hosts, ticket ids, or private paths.

#### Scenario: Description carries Chinese triggers

- **WHEN** the description is loaded for routing
- **THEN** it includes the Chinese permission-align phrases and excludes Astrill/VPN and non-macOS use

#### Scenario: De-identified body

- **WHEN** examples appear in the skill body or reference
- **THEN** they use generic bundle ids and paths only

### Requirement: macos-permission-align SHALL stay out of scope for non-macOS and Astrill/VPN

The skill MUST NOT run as the primary path on Windows or Linux, and MUST NOT control Astrill or general VPN workflows. VPN and Astrill requests MUST name `astrill-control` instead.

#### Scenario: Windows request

- **WHEN** the user asks for permission alignment on Windows or Linux
- **THEN** the agent declines this skill and does not apply macOS TCC steps

#### Scenario: VPN request

- **WHEN** the user asks to fix Astrill or VPN permissions
- **THEN** the agent names `astrill-control` and does not use this skill as the primary path
