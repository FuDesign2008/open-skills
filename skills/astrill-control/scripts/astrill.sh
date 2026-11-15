#!/bin/bash
# astrill.sh — Astrill VPN control (macOS, menu-bar GUI Toggle anchor + dual-probe verification)
# Usage: astrill.sh <status|on|off>
# Prerequisite: the agent host app holds the macOS Accessibility permission
# (System Settings → Privacy & Security → Accessibility)
# Field-tested: 2026-08-28 round-trip both ways (OpenVPN full-tunnel mode)
#
# DNS hygiene (field-tested 2026-11-14): Astrill does NOT restore the system DNS when it
# disconnects; it leaves the resolver on Cloudflare 1.1.1.2. Domestic platforms then resolve
# to their overseas entry points and time out over a direct connection. So `on` snapshots the
# pre-VPN DNS into ${ASTR_CONTROL_STATE_DIR:-~/.cache/astrill-control}/dns-baseline (only when
# the current DNS can be verified clean), and `off` restores it on EVERY disconnected path
# (including the early returns) and verifies the result instead of reporting success blindly.
# The domestic probe needs ASTR_CONTROL_DOMESTIC_DOMAIN; without it the probe is skipped and
# only the configured resolver values are reported (no DRIFT verdict, no failure).

set -u
APP="Astrill"
MENU_PROBE='tell application "System Events" to tell process "Astrill" to get name of every menu item of menu "Menu" of menu bar 1'

STATE_DIR="${ASTR_CONTROL_STATE_DIR:-$HOME/.cache/astrill-control}"
DNS_BASELINE="${STATE_DIR}/dns-baseline"
DOMESTIC_DOMAIN="${ASTR_CONTROL_DOMESTIC_DOMAIN:-}"
DNS_FALLBACK="${ASTR_CONTROL_DNS_FALLBACK:-223.5.5.5}"
DRY_RUN="${ASTR_CONTROL_DRY_RUN:-0}"

probe_configured() { [[ -n "$DOMESTIC_DOMAIN" ]]; }

ip_probe() { curl -s --max-time 6 ipinfo.io/ip 2>/dev/null || echo "ip-query-failed"; }
tunnel_up() { pgrep -x asovpnc >/dev/null 2>&1; }
app_running() { pgrep -x astrill >/dev/null 2>&1; }

# Read Menu items; prints "TOGGLE_ON" / "TOGGLE_OFF" / "NO_APP" / "GUI_ERROR"
menu_state() {
  if ! app_running; then echo "NO_APP"; return; fi
  local items
  items=$(osascript -e "$MENU_PROBE" 2>/dev/null)
  if [[ -z "$items" ]]; then echo "GUI_ERROR"; return; fi
  if [[ "$items" == *"Toggle OFF"* ]]; then echo "TOGGLE_OFF"   # connected (can disconnect)
  elif [[ "$items" == *"Toggle ON"* ]]; then echo "TOGGLE_ON"   # disconnected (can connect)
  else echo "GUI_ERROR"; fi
}

click_toggle() {  # $1 = "Toggle ON" | "Toggle OFF"
  osascript -e "tell application \"System Events\" to tell process \"Astrill\" to click menu item \"$1\" of menu \"Menu\" of menu bar 1" >/dev/null 2>&1
}

wait_gui_ready() {  # wait until the app GUI menu is reachable (GUI init takes seconds after open)
  for _ in $(seq 1 10); do
    local s; s=$(menu_state)
    [[ "$s" == "TOGGLE_ON" || "$s" == "TOGGLE_OFF" ]] && return 0
    sleep 2
  done
  return 1
}

# ── DNS helpers ──────────────────────────────────────────────────────────────
# Astrill rewrites the active network service's DNS while connected and never puts
# it back. Everything below reads/writes that service, discovered from the default
# route — never a hard-coded "Wi-Fi".

default_iface() {  # en1
  route -n get default 2>/dev/null | awk '/interface:/{print $2; exit}'
}

service_for_iface() {  # $1 = en1 -> "Wi-Fi"
  networksetup -listnetworkserviceorder 2>/dev/null | awk -v dev="$1" '
    /^\([0-9]+\) / { svc = $0; sub(/^\([0-9]+\) /, "", svc) }
    $0 ~ ("Device: " dev "\\)") { print svc; exit }
  '
}

active_service() {
  local iface
  iface=$(default_iface) || return 1
  [[ -n "$iface" ]] || return 1
  service_for_iface "$iface"
}

configured_dns() {  # explicit resolvers, one per line; empty = DHCP/automatic
  local svc
  svc=$(active_service) || return 1
  networksetup -getdnsservers "$svc" 2>/dev/null | grep -E '^[0-9]{1,3}(\.[0-9]{1,3}){3}$'
}

join_words() { tr '\n' ' ' | sed -E 's/[[:space:]]+$//'; }
last_line() { awk 'NF { line = $0 } END { if (line != "") print line }'; }

domestic_probe() {
  probe_configured || return 0
  dig +short +time=2 +tries=1 "$DOMESTIC_DOMAIN" 2>/dev/null
}
is_drifted() { grep -qi 'overseas'; }   # stdin = dig output

# One-word probe verdict: skipped (no domain configured) | failed | drift | ok
probe_state() {
  if ! probe_configured; then echo "skipped"; return; fi
  local probe
  probe=$(domestic_probe)
  if [[ -z "$probe" ]]; then echo "failed"; return; fi
  if printf '%s\n' "$probe" | is_drifted; then echo "drift"; else echo "ok"; fi
}

baseline_service() { sed -n 's/^service=//p' "$DNS_BASELINE" 2>/dev/null | head -1; }
baseline_dns()     { sed -n 's/^dns=//p'     "$DNS_BASELINE" 2>/dev/null | head -1; }

save_dns_baseline() {
  local svc dns_list state
  svc=$(active_service) || { echo "⚠ DNS baseline: could not identify the active network service"; return 1; }
  dns_list=$(configured_dns | join_words)

  # Only snapshot a resolver list that we could verify is clean. A first-run snapshot
  # taken while the machine is already drifting would record Cloudflare 1.1.1.2 as the
  # "baseline", so a later `off` would see target==current and no-op on a broken setup.
  state=$(probe_state)
  case "$state" in
    drift)
      echo "⚠ DNS baseline: current DNS already resolves overseas — refusing to snapshot it (baseline not saved); 'off' will restore DHCP"
      return 0
      ;;
    skipped)
      echo "DNS baseline: not saved (probe skipped: ASTR_CONTROL_DOMESTIC_DOMAIN is not configured); 'off' will restore DHCP"
      return 0
      ;;
    failed)
      echo "DNS baseline: not saved (current DNS could not be verified); 'off' will restore DHCP"
      return 0
      ;;
  esac

  mkdir -p "$STATE_DIR" 2>/dev/null || { echo "⚠ DNS baseline: cannot create ${STATE_DIR}"; return 1; }
  {
    printf 'service=%s\n' "$svc"
    printf 'dns=%s\n' "$dns_list"
    printf 'saved_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  } > "$DNS_BASELINE"
  echo "DNS baseline saved: ${svc} → ${dns_list:-DHCP}"
}

apply_dns() {  # $1 = service, $2 = space-separated resolvers ("" = DHCP)
  local svc=$1 list=$2
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] networksetup -setdnsservers \"${svc}\" ${list:-Empty}"
    return 0
  fi
  if [[ -z "$list" ]]; then
    networksetup -setdnsservers "$svc" Empty >/dev/null 2>&1 && return 0
    sudo -n networksetup -setdnsservers "$svc" Empty >/dev/null 2>&1 && return 0
  else
    # shellcheck disable=SC2086  # word splitting is intentional: one arg per resolver
    networksetup -setdnsservers "$svc" $list >/dev/null 2>&1 && return 0
    # shellcheck disable=SC2086
    sudo -n networksetup -setdnsservers "$svc" $list >/dev/null 2>&1 && return 0
  fi
  return 1
}

restore_dns() {
  local svc cur target source state bsvc bdns
  svc=$(active_service)
  if [[ -z "$svc" ]]; then
    echo "⚠ DNS: no default route / active network service — cannot restore"
    return 1
  fi
  cur=$(configured_dns | join_words)

  if [[ -f "$DNS_BASELINE" ]]; then
    bsvc=$(baseline_service)
    bdns=$(baseline_dns)
    if [[ "$bsvc" == "$svc" ]]; then
      target="$bdns"; source="baseline from ${bsvc}"
    else
      target=""; source="DHCP (baseline was for ${bsvc}, active service is ${svc})"
    fi
  else
    target=""; source="DHCP default (no baseline recorded)"
  fi

  state=$(probe_state)

  # Leave an already-clean configuration alone. DHCP (no explicit resolvers) is clean;
  # a custom resolver list is clean when the domestic probe confirms it is not drifting.
  # In particular, never write a recorded baseline back over a config the user fixed.
  if [[ -z "$cur" ]]; then
    echo "✅ DNS: already clean on ${svc} (DHCP) — no change"
    return 0
  fi
  if [[ "$state" == "ok" ]]; then
    echo "✅ DNS: ${svc} already resolves domestically (${cur}) — no change"
    return 0
  fi

  # Explicit resolvers that are not confirmed clean = suspected drift.
  echo "restoring DNS on ${svc}: ${cur:-DHCP} → ${target:-DHCP} [${source}]"
  if [[ "$DRY_RUN" == "1" ]]; then
    apply_dns "$svc" "$target"
    return 0
  fi
  if apply_dns "$svc" "$target"; then
    echo "✅ DNS: set ${svc} → ${target:-DHCP}"
    [[ "$(probe_state)" != "drift" ]] && return 0
  else
    echo "⚠ DNS: write to ${target:-DHCP} failed"
  fi

  # The recorded value did not clear the drift (or could not be written): DHCP next,
  # then the domestic public resolver.
  if [[ -n "$target" ]]; then
    echo "⚠ DNS: still drifting after ${target:-DHCP} — trying DHCP"
    if apply_dns "$svc" ""; then
      echo "✅ DNS: set ${svc} → DHCP"
      [[ "$(probe_state)" != "drift" ]] && return 0
    else
      echo "⚠ DNS: DHCP write failed"
    fi
  fi

  echo "⚠ DNS: trying the domestic fallback ${DNS_FALLBACK}"
  if apply_dns "$svc" "$DNS_FALLBACK"; then
    echo "✅ DNS: set ${svc} → ${DNS_FALLBACK} (fallback)"
    [[ "$(probe_state)" != "drift" ]] && return 0
  else
    echo "❌ DNS: could not write DNS on ${svc}"
    echo "   manual fix: sudo networksetup -setdnsservers \"${svc}\" ${DNS_FALLBACK}"
    return 1
  fi

  return 1
}

verify_dns() {
  local probe attempt
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "DNS verify: skipped (dry-run — nothing was written)"
    return 0
  fi
  if ! probe_configured; then
    echo "DNS verify: skipped (ASTR_CONTROL_DOMESTIC_DOMAIN not configured)"
    return 0
  fi
  for attempt in 1 2 3; do
    probe=$(domestic_probe)
    [[ -n "$probe" ]] && break
    [[ "$attempt" == "3" ]] || sleep 1
  done
  if [[ -z "$probe" ]]; then
    echo "⚠ DNS verify: ${DOMESTIC_DOMAIN} did not resolve — direct connections may still fail"
    return 1
  fi
  if printf '%s\n' "$probe" | is_drifted; then
    echo "⚠ DNS DRIFT: ${DOMESTIC_DOMAIN} → $(printf '%s\n' "$probe" | grep -i 'overseas' | head -1) — still an overseas entry"
    return 1
  fi
  echo "✅ DNS verified: ${DOMESTIC_DOMAIN} → $(printf '%s\n' "$probe" | last_line) (domestic)"
  return 0
}

dns_status_line() {
  local svc cur probe target verdict
  svc=$(active_service) || svc="(no active service)"
  cur=$(configured_dns | join_words)
  if ! probe_configured; then
    printf '%s → %s | probe: skipped (domain not configured)' "$svc" "${cur:-DHCP}"
    return 0
  fi
  probe=$(domestic_probe)
  target=$(printf '%s\n' "$probe" | last_line)
  [[ -n "$target" ]] || target="-"
  if [[ -z "$probe" ]]; then
    verdict="⚠ probe failed"
  elif printf '%s\n' "$probe" | is_drifted; then
    verdict="⚠ DNS DRIFT"
  else
    verdict="✅ domestic"
  fi
  printf '%s → %s | %s → %s %s' "$svc" "${cur:-DHCP}" "$DOMESTIC_DOMAIN" "$target" "$verdict"
}

finalize_off() {
  local ok=1
  restore_dns || ok=0
  verify_dns || ok=0
  if [[ "$ok" == "1" ]]; then
    if [[ "$DRY_RUN" == "1" ]]; then
      echo "✅ DNS dry-run complete (nothing written)"
    elif probe_configured; then
      echo "✅ direct-connection DNS ready"
    else
      echo "✅ DNS cleanup applied (verification skipped: domestic domain not configured)"
    fi
  else
    echo "⚠ DNS cleanup incomplete — run 'astrill.sh status' before relying on a direct connection"
    exit 1
  fi
}

cmd_status() {
  echo "── Astrill status ──"
  app_running && echo "app process:  running" || echo "app process:  not running"
  tunnel_up   && echo "VPN tunnel:   up" || echo "VPN tunnel:   down"
  local st; st=$(menu_state)
  case "$st" in
    TOGGLE_OFF) echo "GUI menu:     Toggle OFF (connected)" ;;
    TOGGLE_ON)  echo "GUI menu:     Toggle ON (disconnected)" ;;
    NO_APP)     echo "GUI menu:     app not running" ;;
    GUI_ERROR)  echo "GUI menu:     unreachable (check Accessibility permission / app launch)" ;;
  esac
  echo "DNS:          $(dns_status_line)"
  echo "exit IP:      $(ip_probe)"
}

cmd_on() {
  local st; st=$(menu_state)
  if [[ "$st" == "NO_APP" ]]; then
    echo "app not running, launching ${APP} ..."
    open -a "$APP" || { echo "❌ launch failed (does /Applications/Astrill.app exist?)"; exit 1; }
    wait_gui_ready || { echo "❌ GUI not ready within 20s"; exit 1; }
    st=$(menu_state)
  fi
  if [[ "$st" == "GUI_ERROR" ]]; then echo "❌ GUI unreachable — check the host app's Accessibility permission"; exit 1; fi
  if [[ "$st" == "TOGGLE_OFF" ]]; then echo "already connected, nothing to do"; exit 0; fi

  # Snapshot the pre-VPN DNS now; `off` restores it after every disconnect path.
  save_dns_baseline || true

  local ip_before; ip_before=$(ip_probe)
  echo "connecting (clicking Toggle ON)..."
  click_toggle "Toggle ON" || { echo "❌ click failed"; exit 1; }
  for _ in $(seq 1 15); do
    sleep 3
    if tunnel_up; then
      local ip_now; ip_now=$(ip_probe)
      echo "✅ connected | tunnel up | exit IP: ${ip_now} (before: ${ip_before})"
      exit 0
    fi
  done
  echo "❌ tunnel not up within 45s"; exit 1
}

cmd_off() {
  local st; st=$(menu_state)

  if [[ "$st" == "NO_APP" ]]; then
    echo "app not running = disconnected"
  elif [[ "$st" == "GUI_ERROR" ]]; then
    if tunnel_up; then
      echo "❌ GUI unreachable — check the host app's Accessibility permission"
      echo "   (VPN may still be up; DNS left untouched)"
      exit 1
    fi
    echo "⚠ GUI unreachable but tunnel is down — continuing with DNS cleanup"
  elif [[ "$st" == "TOGGLE_ON" ]]; then
    if tunnel_up; then
      # The GUI flips to Toggle ON ~10 s before asovpnc exits. Rewriting DNS while the
      # tunnel is still up would let the tunnel resolve the verification probe.
      echo "⚠ GUI says disconnected but the tunnel process is still up (teardown takes ~10 s)"
      echo "   DNS left untouched on purpose — restoring it while the tunnel is up would leak resolution"
      echo "   This is a protection, not a DNS failure. Re-run off once the tunnel is down."
      exit 1
    fi
    echo "already disconnected"
  elif ! tunnel_up; then
    echo "already disconnected (tunnel process gone)"
  else
    echo "disconnecting (clicking Toggle OFF, app stays alive)..."
    click_toggle "Toggle OFF" || { echo "❌ click failed (VPN may still be up; DNS left untouched)"; exit 1; }
    local down=0
    for _ in $(seq 1 10); do
      sleep 3
      if ! tunnel_up; then down=1; break; fi
    done
    if [[ "$down" != "1" ]]; then
      echo "❌ tunnel not down within 30s (fallback: osascript -e 'quit app \"Astrill\"'); DNS left untouched"
      exit 1
    fi
    echo "✅ disconnected | app running | exit IP: $(ip_probe)"
  fi

  # Every disconnected path — including the early returns above — must clean DNS.
  finalize_off
}

case "${1:-}" in
  status) cmd_status ;;
  on)     cmd_on ;;
  off)    cmd_off ;;
  *) echo "usage: astrill.sh <status|on|off>"; exit 2 ;;
esac
