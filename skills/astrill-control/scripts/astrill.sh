#!/bin/bash
# astrill.sh — Astrill VPN control (macOS, menu-bar GUI Toggle anchor + dual-probe verification)
# Usage: astrill.sh <status|on|off>
# Prerequisite: the agent host app holds the macOS Accessibility permission
# (System Settings → Privacy & Security → Accessibility)
# Field-tested: 2026-08-28 round-trip both ways (OpenVPN full-tunnel mode)

set -u
APP="Astrill"
MENU_PROBE='tell application "System Events" to tell process "Astrill" to get name of every menu item of menu "Menu" of menu bar 1'

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
  for i in $(seq 1 10); do
    local s; s=$(menu_state)
    [[ "$s" == "TOGGLE_ON" || "$s" == "TOGGLE_OFF" ]] && return 0
    sleep 2
  done
  return 1
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

  local ip_before; ip_before=$(ip_probe)
  echo "connecting (clicking Toggle ON)..."
  click_toggle "Toggle ON" || { echo "❌ click failed"; exit 1; }
  for i in $(seq 1 15); do
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
  if [[ "$st" == "NO_APP" ]]; then echo "app not running = disconnected, nothing to do"; exit 0; fi
  if [[ "$st" == "GUI_ERROR" ]]; then echo "❌ GUI unreachable — check the host app's Accessibility permission"; exit 1; fi
  if [[ "$st" == "TOGGLE_ON" ]]; then echo "already disconnected, nothing to do"; exit 0; fi
  if ! tunnel_up; then echo "already disconnected (tunnel process gone), nothing to do"; exit 0; fi

  echo "disconnecting (clicking Toggle OFF, app stays alive)..."
  click_toggle "Toggle OFF" || { echo "❌ click failed"; exit 1; }
  for i in $(seq 1 10); do
    sleep 3
    if ! tunnel_up; then
      echo "✅ disconnected | app running | exit IP: $(ip_probe)"
      exit 0
    fi
  done
  echo "❌ tunnel not down within 30s (fallback: osascript -e 'quit app \"Astrill\"')"; exit 1
}

case "${1:-}" in
  status) cmd_status ;;
  on)     cmd_on ;;
  off)    cmd_off ;;
  *) echo "usage: astrill.sh <status|on|off>"; exit 2 ;;
esac
