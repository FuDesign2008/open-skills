---
name: astrill-control
version: "1.1.0"
user-invocable: true
description: "Control Astrill VPN on macOS through its menu-bar GUI: status (app / tunnel / GUI menu / DNS / exit IP), connect, disconnect — all idempotent, verified by dual probes (tunnel process + exit IP) plus GUI menu state. Restores the system DNS Astrill leaves behind after disconnect. Use whenever the user mentions Astrill, asks to turn the VPN on or off, connect or disconnect the VPN, check VPN status or exit IP, or needs to switch VPN state around network-sensitive steps where one platform requires the proxy and another requires a direct connection. Prerequisite (one-time): the app hosting the agent holds the macOS Accessibility permission. Do NOT use for other VPN clients or general network debugging. Triggers — 「Astrill」「打开 VPN」「连接 VPN」「VPN 开」「VPN on」「断开 VPN」「关掉 VPN」「VPN 关」「VPN off」「查 VPN 状态」「VPN 状态」「切换 VPN」「VPN 出口 IP」 / Astrill, turn on VPN, connect VPN, disconnect VPN, turn off VPN, check VPN status, toggle VPN, VPN exit IP."
---

# Astrill VPN Control (macOS Menu-Bar Toggle + Dual-Probe Verification)

> The Astrill macOS app ships no official CLI. Its menu-bar item `Menu → Toggle ON/OFF` can be located and clicked via AppleScript (System Events), and the menu item text mirrors the connection state — that menu anchor is what this skill relies on. Field-tested 2026-08-28 on OpenVPN full-tunnel mode with an on↔off round-trip.

## Usage

Run the bundled script from this skill's base directory (the directory containing this SKILL.md):

```bash
bash <skill-dir>/scripts/astrill.sh status   # inspect: app / tunnel / GUI menu / DNS / exit IP
bash <skill-dir>/scripts/astrill.sh on       # connect (snapshots DNS; idempotent: no-op when already connected)
bash <skill-dir>/scripts/astrill.sh off      # disconnect + restore DNS (idempotent: DNS is not rewritten when it is already clean; app stays alive)
```

Resolve `<skill-dir>` from the skill base directory announced at load time; when unavailable, ask the user for the installed skill path.

## State Machine and Probes

| Signal | How collected | Meaning |
|---|---|---|
| App process | `pgrep -x astrill` | prerequisite for GUI control; kept alive after `off` so `on` reconnects faster |
| VPN tunnel | `pgrep -x asovpnc` | primary judge under OpenVPN mode; teardown takes ~10 s (script polls through it) |
| GUI menu | System Events reads items of the `Menu` menu | `Toggle OFF` present = connected; `Toggle ON` present = disconnected |
| System DNS | `networksetup -getdnsservers <service>` + `dig +short <your-domestic-domain>` | explicit resolvers on the default-route service; a CNAME containing `overseas` = `⚠ DNS DRIFT` |
| Exit IP | `curl --max-time 6 ipinfo.io/ip` | cross-check: connected → foreign node IP; disconnected → local direct IP |

`on` and `off` are idempotent: each reads the current state first. `off` rewrites DNS only when the current resolver is not confirmed clean, so a repeated call over a clean configuration changes nothing.

## DNS Restore After Disconnect

Astrill rewrites the active network service's DNS while connected and does not put it back on disconnect — the resolver stays on Cloudflare `1.1.1.2`. A domestic platform then resolves to its overseas entry point and times out over a direct connection (field-tested 2026-11-14: a domestic hostname resolved through an `overseas…` CDN CNAME to a foreign IP, and its HTTPS request timed out at 20 s while a control domestic request answered in about 1.4 s).

- `on` snapshots the active service name + resolver list to `${ASTR_CONTROL_STATE_DIR:-~/.cache/astrill-control}/dns-baseline` before clicking Toggle ON — but only when the current DNS can be verified clean. A resolver list that already hits an overseas entry (or cannot be verified) is never recorded as a baseline; a first run on an already-drifting machine therefore leaves no bad baseline behind, and `off` restores DHCP instead.
- `off` restores DNS on **every** disconnected path — tunnel torn down, already disconnected, tunnel process already gone, app not running. It checks the current state first: DHCP, or a resolver list that resolves domestically, is left untouched. Only a suspected drift is rewritten, in order: recorded baseline → DHCP (`networksetup -setdnsservers <service> Empty`) → domestic fallback `223.5.5.5`. The service is discovered from the default route (`route -n get default` → `networksetup -listnetworkserviceorder`), never a hard-coded `Wi-Fi`.
- A recorded baseline never overwrites a configuration that is already clean. If the baseline value itself still resolves overseas after being applied, `off` falls back to DHCP and then to the domestic resolver instead of reporting success on a known-bad value.
- After restoring, `off` resolves `<your-domestic-domain>` and fails loudly (`⚠ DNS DRIFT …` + exit 1) when the answer still matches an overseas entry. It never reports success blindly.
- `status` prints the active service → resolvers, the domestic probe result, and `⚠ DNS DRIFT` when detected.
- When `ASTR_CONTROL_DOMESTIC_DOMAIN` is not configured, the overseas probe is skipped: `status` and `off` report the configured resolver values, mark probe-dependent judgments `skipped (domain not configured)`, raise no DRIFT verdict, and do not treat the missing probe as a failure.

Environment overrides: `ASTR_CONTROL_STATE_DIR` (baseline location), `ASTR_CONTROL_DOMESTIC_DOMAIN` (domestic probe hostname; no default — when unset the probe is skipped as described above), `ASTR_CONTROL_DNS_FALLBACK` (default `223.5.5.5`), `ASTR_CONTROL_DRY_RUN=1` (print the `networksetup` write instead of applying it; verification is skipped too).

## Verification

The bundled test suite stubs every system command (including `networksetup` and `sudo`) and never touches the real DNS:

```bash
bash <skill-dir>/evals/test-dns-restore.sh
```

## One-Time Prerequisite: Accessibility Permission

The app that hosts the agent (terminal, IDE, or desktop app) must hold the macOS Accessibility permission: System Settings → Privacy & Security → Accessibility → add the host app. Without it the script reports `GUI unreachable` and the status output names the cause.

## Known Boundaries

- **OpenVPN vs OpenWeb**: probes are most accurate under OpenVPN (full tunnel). In OpenWeb (browser-only proxy) mode the `asovpnc` tunnel probe does not apply — the GUI menu text stays the primary judge, and the exit-IP probe (curl) may not reflect the browser proxy state.
- **Teardown latency**: after Toggle OFF the tunnel process exits ~10 s later than the UI flips; the script's 30 s polling window covers it.
- **Toggle, not quit**: `quit app` also disconnects but drops the GUI session; the script uses Toggle so the app keeps running and a later `on` reconnects without relaunching.
- **DNS write privilege**: `networksetup -setdnsservers` requires admin/root privileges (`man networksetup` documents the restriction; the binary gates on `runningWithAdminPrivileges`). The script tries the unprivileged call first, then `sudo -n` (non-interactive; only succeeds when NOPASSWD is configured). If both fail it prints the exact manual `sudo networksetup -setdnsservers …` command and exits non-zero — it does not silently succeed.
- **DNS restore is refused while the tunnel may still be up**: when the GUI is unreachable but the tunnel process is alive, or when the GUI already shows Toggle ON but `asovpnc` has not exited yet (teardown takes ~10 s), `off` leaves DNS untouched and exits non-zero — restoring DNS outside a live tunnel would leak resolution. The output states this is a protection measure, not a DNS failure; re-run `off` once the tunnel is down.
- **Service switch between `on` and `off`**: if the active network service changed, DHCP is restored on the current service instead of transplanting the old service's baseline resolvers.
- **Menu drift after updates**: macOS or Astrill major updates may rename menus. When `Menu` or `Toggle ON/OFF` disappears, re-probe with `osascript -e 'tell application "System Events" to tell process "Astrill" to get name of every menu of menu bar 1'` and update the script accordingly.
- **Bash pitfall when editing the script**: after a `$var`, a CJK/full-width character makes bash merge the following UTF-8 bytes into the variable name (`set -u` then reports unbound variable). Always write `${var}`.
