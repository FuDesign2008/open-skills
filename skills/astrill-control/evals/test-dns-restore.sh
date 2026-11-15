#!/bin/bash
# test-dns-restore.sh — sandboxed tests for the DNS snapshot/restore path in astrill.sh.
#
# Every system command the script touches (pgrep / osascript / route / networksetup /
# dig / curl / sudo) is stubbed on PATH, and the baseline state lives in a temp dir.
# The real system DNS is never read or written. Safe to run anywhere.
#
# Run: bash skills/astrill-control/evals/test-dns-restore.sh
#
# Covered branches: already-disconnected (GUI Toggle ON), tunnel-process-gone,
# full disconnect, no baseline → DHCP, DHCP failure → fallback, already-clean no-op,
# drift verification failure, status drift flag, `on` baseline capture, dry-run,
# drifting-first-run baseline refusal, bad-baseline-over-clean no-op, drifting
# baseline recovery, Toggle-ON-while-tunnel-up protection, and the unverifiable-probe
# policy (skipped/failed): trusted baseline restored, otherwise explicit resolvers are
# left untouched with a manual command and a non-zero exit.

set -u

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TARGET="$SCRIPT_DIR/../scripts/astrill.sh"

SANDBOX=$(mktemp -d "${TMPDIR:-/tmp}/astrill-dns-test.XXXXXX") || exit 1
trap 'rm -rf "$SANDBOX"' EXIT

BIN="$SANDBOX/bin"
STATE="$SANDBOX/state"
PROBE_DOMAIN="probe.example.com"
mkdir -p "$BIN" "$STATE"

# ── stubs (never reach the real system) ──────────────────────────────────────
cat > "$BIN/pgrep" <<STUB
#!/bin/bash
case "\${2:-}" in
  astrill) [[ "\$(cat "$SANDBOX/app" 2>/dev/null)" == "up" ]] && exit 0 || exit 1 ;;
  asovpnc) [[ "\$(cat "$SANDBOX/tunnel" 2>/dev/null)" == "up" ]] && exit 0 || exit 1 ;;
esac
exit 1
STUB

cat > "$BIN/osascript" <<STUB
#!/bin/bash
script="\${2:-}"
if [[ "\$script" == *"name of every menu item"* ]]; then
  case "\$(cat "$SANDBOX/menu" 2>/dev/null)" in
    TOGGLE_ON)  echo "Toggle ON";  exit 0 ;;
    TOGGLE_OFF) echo "Toggle OFF"; exit 0 ;;
  esac
  exit 0   # GUI_ERROR: app alive but no readable menu
fi
if [[ "\$script" == *"click menu item"* ]]; then
  echo "\$script" >> "$SANDBOX/clicks.log"
  if [[ "\$script" == *"Toggle OFF"* ]]; then
    echo down > "$SANDBOX/tunnel"; echo TOGGLE_ON > "$SANDBOX/menu"
  else
    echo up   > "$SANDBOX/tunnel"; echo TOGGLE_OFF > "$SANDBOX/menu"
  fi
fi
exit 0
STUB

cat > "$BIN/route" <<STUB
#!/bin/bash
[[ "\$1" == "-n" && "\$2" == "get" && "\$3" == "default" ]] || exit 1
printf '   route to: default\n  interface: %s\n' "\$(cat "$SANDBOX/iface" 2>/dev/null || echo en1)"
exit 0
STUB

cat > "$BIN/networksetup" <<STUB
#!/bin/bash
case "\$1" in
  -listnetworkserviceorder)
    cat <<'OUT'
An asterisk (*) denotes that a network service is disabled.
(1) Ethernet
(Hardware Port: Ethernet, Device: en0)

(2) Wi-Fi
(Hardware Port: Wi-Fi, Device: en1)
OUT
    ;;
  -getdnsservers)
    if [[ -s "$SANDBOX/dns" ]]; then cat "$SANDBOX/dns"; else echo "There aren't any DNS Servers set on \$2."; fi
    ;;
  -setdnsservers)
    echo "\$*" >> "$SANDBOX/setdns.log"
    if [[ "\${3:-}" == "Empty" ]]; then
      if [[ -f "$SANDBOX/empty_fail" ]]; then echo "setdnsservers failed" >&2; exit 1; fi
      : > "$SANDBOX/dns"
    else
      shift 2
      printf '%s\n' "\$@" > "$SANDBOX/dns"
    fi
    ;;
esac
exit 0
STUB

cat > "$BIN/dig" <<STUB
#!/bin/bash
# Record the full argv so tests can prove the probe domain is wired through.
printf '%s\n' "\$*" >> "$SANDBOX/dig.log"
# The probe must query the configured domestic hostname; any other name answers
# nothing (NXDOMAIN-like), so a broken domain wiring turns "drift/ok" into "failed".
name=""
for arg in "\$@"; do
  case "\$arg" in +*) ;; *) name="\$arg" ;; esac
done
[[ "\$name" == "$PROBE_DOMAIN" ]] || exit 0
# dig_fail simulates an unanswered query; dig_force an unfixable drift.
if [[ -f "$SANDBOX/dig_fail" ]]; then exit 0; fi
if [[ -f "$SANDBOX/dig_force" ]]; then cat "$SANDBOX/dig_force"; exit 0; fi
# Otherwise the answer follows the resolver list the script wrote, so a
# successful restore flips the probe to clean.
dns=\$(tr '\n' ' ' < "$SANDBOX/dns" 2>/dev/null)
case "\$dns" in
  *"1.1.1.2"*) printf 'overseas-cdn.probe.example.com.\n203.0.113.10\n' ;;
  *)           printf 'domestic-origin.probe.example.com.\n192.0.2.20\n' ;;
esac
exit 0
STUB

cat > "$BIN/curl" <<STUB
#!/bin/bash
echo "198.51.100.7"
STUB

# Never let a NOPASSWD sudo in the host reach the real networksetup.
cat > "$BIN/sudo" <<STUB
#!/bin/bash
echo "stub-sudo \$*" >> "$SANDBOX/sudo.log"
exit 1
STUB

chmod +x "$BIN"/*

# ── helpers ──────────────────────────────────────────────────────────────────
PASS=0
FAIL=0
ok()  { PASS=$((PASS + 1)); printf '  ✅ %s\n' "$1"; }
bad() { FAIL=$((FAIL + 1)); printf '  ❌ %s\n' "$1"; }

expect_eq() {  # actual expected description
  if [[ "$1" == "$2" ]]; then ok "$3"; else bad "$3 (got [$1], want [$2])"; fi
}
expect_contains() {  # file pattern description
  if grep -q -- "$2" "$1" 2>/dev/null; then ok "$3"; else bad "$3 (missing [$2] in $(basename "$1"))"; fi
}
expect_output() {  # output pattern description
  if printf '%s\n' "$1" | grep -q -- "$2"; then ok "$3"; else bad "$3 (missing [$2] in output)"; fi
}
expect_not_output() {  # output pattern description
  if printf '%s\n' "$1" | grep -q -- "$2"; then bad "$3 (unexpected [$2] in output)"; else ok "$3"; fi
}
expect_absent() {  # path description
  if [[ ! -e "$1" ]]; then ok "$2"; else bad "$2 (unexpected file $1)"; fi
}

reset() {
  rm -rf "$STATE"; mkdir -p "$STATE"
  rm -f "$SANDBOX/dns" "$SANDBOX/setdns.log" "$SANDBOX/clicks.log" \
        "$SANDBOX/empty_fail" "$SANDBOX/sudo.log" "$SANDBOX/dig_force" \
        "$SANDBOX/dig_fail" "$SANDBOX/dig.log"
  echo up       > "$SANDBOX/app"
  echo up       > "$SANDBOX/tunnel"
  echo TOGGLE_OFF > "$SANDBOX/menu"
  echo en1      > "$SANDBOX/iface"
}

write_baseline() {  # $1 service, $2 dns list
  mkdir -p "$STATE"
  printf 'service=%s\ndns=%s\nsaved_at=test\n' "$1" "$2" > "$STATE/dns-baseline"
}

run() {  # $1 = subcommand; extra env via caller
  PATH="$BIN:$PATH" ASTR_CONTROL_STATE_DIR="$STATE" ASTR_CONTROL_DOMESTIC_DOMAIN="$PROBE_DOMAIN" \
    bash "$TARGET" "$1" 2>&1
}

run_off() {
  PATH="$BIN:$PATH" ASTR_CONTROL_STATE_DIR="$STATE" ASTR_CONTROL_DRY_RUN="${DRY_RUN:-0}" \
    ASTR_CONTROL_DOMESTIC_DOMAIN="$PROBE_DOMAIN" bash "$TARGET" off 2>&1
}

run_no_probe() {  # $1 = subcommand; probe intentionally unconfigured
  PATH="$BIN:$PATH" ASTR_CONTROL_STATE_DIR="$STATE" ASTR_CONTROL_DOMESTIC_DOMAIN="" \
    bash "$TARGET" "$1" 2>&1
}

read_dns() { tr '\n' ' ' < "$SANDBOX/dns" 2>/dev/null | sed -E 's/[[:space:]]+$//'; }

# ── 1. already disconnected (GUI Toggle ON) still restores DNS ───────────────
printf '\n[1] off while already disconnected (GUI Toggle ON)\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5 119.29.29.29"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi 223.5.5.5 119.29.29.29" "baseline DNS restored on the early-return path"
expect_eq "$(read_dns)" "223.5.5.5 119.29.29.29" "system DNS now matches the baseline"
expect_output "$out" "DNS verified" "verification ran and passed"

# ── 2. idempotent: a second off does not rewrite DNS ─────────────────────────
printf '\n[2] idempotent repeated off\n'
: > "$SANDBOX/setdns.log"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_eq "$(wc -l < "$SANDBOX/setdns.log" | tr -d ' ')" "0" "no write when DNS is already clean"

# ── 3. tunnel process gone (GUI still says connected) restores DNS ───────────
printf '\n[3] off when the tunnel process is already gone\n'
reset
echo TOGGLE_OFF > "$SANDBOX/menu"
echo down       > "$SANDBOX/tunnel"
echo "1.1.1.2"  > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5 119.29.29.29"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi 223.5.5.5 119.29.29.29" "DNS restored without clicking"

# ── 4. full disconnect path: click, then restore ─────────────────────────────
printf '\n[4] full disconnect (Toggle OFF → restore)\n'
reset
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5 119.29.29.29"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$SANDBOX/clicks.log" "Toggle OFF" "clicked Toggle OFF"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi 223.5.5.5 119.29.29.29" "DNS restored after disconnect"

# ── 5. no baseline → DHCP ────────────────────────────────────────────────────
printf '\n[5] off with no baseline → DHCP\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi Empty" "DHCP restore used when no baseline exists"
expect_eq "$(read_dns)" "" "resolver list cleared"

# ── 6. DHCP write fails → domestic public DNS fallback ───────────────────────
printf '\n[6] DHCP restore failure → 223.5.5.5 fallback\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
touch "$SANDBOX/empty_fail"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi Empty" "tried DHCP first"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi 223.5.5.5" "fell back to the domestic resolver"
expect_eq "$(read_dns)" "223.5.5.5" "fallback DNS applied"

# ── 7. verification failure is loud, not a silent success ────────────────────
printf '\n[7] overseas resolution after restore → warning + non-zero\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5"
printf 'overseasv4.cdn.example.net.\n203.0.113.77\n' > "$SANDBOX/dig_force"
out=$(run_off); rc=$?
expect_eq "$rc" "1" "exit 1 on drift"
expect_output "$out" "DNS DRIFT" "warned about the overseas entry"
expect_output "$out" "DNS cleanup incomplete" "reported incomplete cleanup"

# ── 8. status flags DNS drift ────────────────────────────────────────────────
printf '\n[8] status reports DNS drift\n'
reset
echo "1.1.1.2" > "$SANDBOX/dns"
out=$(run status)
expect_output "$out" "DNS:" "DNS line present"
expect_output "$out" "⚠ DNS DRIFT" "drift flagged"
expect_output "$out" "1.1.1.2" "current resolver shown"
expect_contains "$SANDBOX/dig.log" "$PROBE_DOMAIN" "the probe queries the configured domestic domain"

# ── 9. on captures the baseline before connecting ────────────────────────────
printf '\n[9] on saves the pre-VPN baseline\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
printf '223.5.5.5\n119.29.29.29\n' > "$SANDBOX/dns"
out=$(run on); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$STATE/dns-baseline" "service=Wi-Fi" "baseline records the network service"
expect_contains "$STATE/dns-baseline" "dns=223.5.5.5 119.29.29.29" "baseline records the resolver list"

# ── 10. dry-run never writes ─────────────────────────────────────────────────
printf '\n[10] dry-run does not touch DNS\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5"
out=$(DRY_RUN=1 run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_eq "$(cat "$SANDBOX/setdns.log" 2>/dev/null | wc -l | tr -d ' ')" "0" "no setdnsservers call in dry-run"
expect_output "$out" "\[dry-run\]" "printed the intended command"

# ── 11. a drifting first run must not snapshot itself as the baseline ─────────
printf '\n[11] on does not snapshot a drifting resolver as the baseline\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
out=$(run on); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_absent "$STATE/dns-baseline" "no baseline written while the DNS is drifting"
expect_output "$out" "not saved" "explains that the baseline was refused"

# ── 12. a bad baseline never overwrites a configuration the user fixed ───────
printf '\n[12] bad baseline does not overwrite an already-clean config\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
printf '223.5.5.5\n' > "$SANDBOX/dns"
write_baseline "Wi-Fi" "1.1.1.2"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_eq "$(cat "$SANDBOX/setdns.log" 2>/dev/null | wc -l | tr -d ' ')" "0" "no write when the current DNS already resolves domestically"
expect_eq "$(read_dns)" "223.5.5.5" "clean resolver list preserved"
expect_output "$out" "already resolves domestically" "reported the no-op"

# ── 13. a baseline whose own value is drifting is replaced, not rewritten ────
printf '\n[13] drifting baseline value is replaced instead of rewritten\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "1.1.1.2"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi Empty" "DHCP used when the recorded value itself is drifting"
expect_eq "$(read_dns)" "" "resolver list cleared"

# ── 14. tunnel still alive on a Toggle ON GUI: DNS is left untouched ─────────
printf '\n[14] Toggle ON but tunnel still up leaves DNS untouched\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo up        > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5"
out=$(run_off); rc=$?
expect_eq "$rc" "1" "non-zero while the tunnel may still be up"
expect_eq "$(cat "$SANDBOX/setdns.log" 2>/dev/null | wc -l | tr -d ' ')" "0" "no DNS write while the tunnel is up"
expect_output "$out" "still up" "explains that the tunnel is still up"
expect_output "$out" "protection" "states that skipping DNS is protection, not failure"

# ── 15. unverifiable probe + custom DNS + no baseline: leave DNS untouched ───
printf '\n[15] unconfigured probe + custom DNS + no baseline → conservative no-write\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
out=$(run_no_probe off); rc=$?
expect_eq "$rc" "1" "non-zero: DNS was not verified as restored"
expect_eq "$(cat "$SANDBOX/setdns.log" 2>/dev/null | wc -l | tr -d ' ')" "0" "zero DNS writes when drift cannot be judged"
expect_eq "$(read_dns)" "1.1.1.2" "the user's custom resolvers are preserved"
expect_output "$out" "left untouched" "states that DNS was left untouched"
expect_output "$out" "conservative choice, not an error" "explains this is conservative, not a failure"
expect_output "$out" "ASTR_CONTROL_DOMESTIC_DOMAIN" "tells the user how to enable verification"
expect_output "$out" 'setdnsservers "Wi-Fi" Empty' "prints the manual recovery command"
out=$(run_no_probe status)
expect_output "$out" "probe: skipped (domain not configured)" "status marks the probe as skipped"
expect_not_output "$out" "DNS DRIFT" "status does not flag drift without a probe"

# ── 16. unverifiable probe + trusted baseline: restore the baseline ──────────
printf '\n[16] unconfigured probe + trusted baseline → baseline restored\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5 119.29.29.29"
out=$(run_no_probe off); rc=$?
expect_eq "$rc" "0" "exit 0 when a trusted baseline can be restored"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi 223.5.5.5 119.29.29.29" "the trusted baseline is applied"
expect_eq "$(read_dns)" "223.5.5.5 119.29.29.29" "system DNS now matches the baseline"
expect_output "$out" "not verified" "flags the write as unverified"

# ── 17. probe gets no answer + custom DNS + no baseline: no write ────────────
printf '\n[17] probe failed (no answer) + custom DNS → conservative no-write\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
touch "$SANDBOX/dig_fail"
out=$(run_off); rc=$?
expect_eq "$rc" "1" "non-zero: drift could not be judged"
expect_eq "$(cat "$SANDBOX/setdns.log" 2>/dev/null | wc -l | tr -d ' ')" "0" "zero DNS writes on a failed probe"
expect_eq "$(read_dns)" "1.1.1.2" "custom resolvers preserved on a failed probe"
expect_output "$out" "left untouched" "reports that DNS was left untouched"

# ── 18. explicit drift + custom DNS: recover through the normal chain ────────
printf '\n[18] explicit drift + custom DNS → baseline restored\n'
reset
echo TOGGLE_ON > "$SANDBOX/menu"
echo down      > "$SANDBOX/tunnel"
echo "1.1.1.2" > "$SANDBOX/dns"
write_baseline "Wi-Fi" "223.5.5.5"
out=$(run_off); rc=$?
expect_eq "$rc" "0" "exit 0 after a verified restore"
expect_contains "$SANDBOX/setdns.log" "Wi-Fi 223.5.5.5" "baseline applied when drift is confirmed"
expect_eq "$(read_dns)" "223.5.5.5" "resolver list now matches the baseline"
expect_output "$out" "DNS verified" "verification ran and passed"

# ── summary ──────────────────────────────────────────────────────────────────
printf '\n─────────────────────────────\n'
printf 'PASS: %d  FAIL: %d\n' "$PASS" "$FAIL"
[[ "$FAIL" == "0" ]]
