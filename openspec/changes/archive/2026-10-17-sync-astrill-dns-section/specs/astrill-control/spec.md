## ADDED Requirements

### Requirement: DNS residue SHALL be detected and recovered after `off`

When the network stays degraded after Astrill disconnects in tunnel mode, the skill MUST guide detection via the DNS-residue probe `scutil --dns | grep nameserver | grep -E "10\."` (a nameserver in the 10.x range = Astrill residue) and the route-residue probe `route -n get default | grep -q utun` (default route on a utun interface = route residue), run after every `off` before relying on the direct connection. Recovery MUST use `sudo networksetup -setdnsservers Wi-Fi Empty` followed by `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`, escalating to `sudo ipconfig set en0 BOOTP && sudo ipconfig set en0 DHCP` when the network is still degraded. When sudo cannot be completed non-interactively, the skill MUST hand the commands to the human or fall back to the GUI DHCP-lease renewal. The skill MUST note that the network service name (`Wi-Fi`) and interface (`en0`) vary by the local setup.

#### Scenario: Network stays degraded after `off`

- **WHEN** `off` completed with the dual probes confirming disconnection, yet DNS resolution stays slow or failing
- **THEN** the skill runs the DNS-residue and route-residue probes and, on a hit, applies the DNS-clear plus cache-flush recovery, escalating to the full DHCP renew when still degraded

#### Scenario: sudo unavailable non-interactively

- **WHEN** residue recovery is needed and sudo cannot be completed non-interactively
- **THEN** the skill hands the recovery commands to the human, or directs the human to the GUI DHCP-lease renewal (System Settings → Wi-Fi → Details → TCP/IP → Renew DHCP Lease)
