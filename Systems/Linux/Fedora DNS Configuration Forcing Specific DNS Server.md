# Fedora DNS Configuration: Forcing Specific DNS Server

## Problem

Fedora system configured to use a specific DNS server (e.g., AdGuard, Pi-hole) for IPv4, but systemd-resolved was falling back to the router's DNS via IPv6 DHCPv6 advertisements.

## Diagnosis Commands

### Check Current DNS Configuration

```bash
resolvectl status
```

This shows which DNS servers are currently being used and where they come from.

### Identify IPv6 Link-Local Address

If you see an IPv6 link-local address (starts with `fe80::`) and want to find its corresponding IPv4:

```bash
# Show IPv6 neighbors with their MAC addresses
ip -6 neigh show dev <interface>

# Show IPv4 neighbors with their MAC addresses
ip neigh show

# Find specific device by MAC address
ip neigh show | grep <mac-address>
```

### Check NetworkManager Connection Settings

```bash
# List all connections
nmcli connection show

# View detailed connection settings
nmcli connection show "<connection-name>"
```

Look for these key settings:
- `ipv4.dns` - Your configured IPv4 DNS
- `ipv6.method` - How IPv6 is configured (auto/manual/disabled)
- `ipv6.ignore-auto-dns` - Whether to ignore router-provided DNS
- `IP6.DNS[1]` - Currently active IPv6 DNS

## Root Cause

When `ipv6.method` is set to `auto`, the router can advertise its own DNS server via DHCPv6/SLAAC. systemd-resolved may prioritize this over manually configured IPv4 DNS.

## Solution

### Recommended: Ignore Auto-Configured IPv6 DNS

Keep IPv6 working but ignore DNS from router advertisements:

```bash
nmcli connection modify <connection-name> ipv6.ignore-auto-dns yes
nmcli connection up <connection-name>
```

### Verify the Fix

```bash
resolvectl status
```

Check that only your desired DNS server is listed as "Current DNS Server".

## Alternative Solutions

### Option 1: Set IPv6 DNS Explicitly

If your DNS server has an IPv6 address:

```bash
nmcli connection modify <connection-name> ipv6.dns "<ipv6-address>"
nmcli connection modify <connection-name> ipv6.ignore-auto-dns yes
nmcli connection up <connection-name>
```

### Option 2: IPv6 Link-Local Only

Keep basic IPv6 connectivity without DHCPv6:

```bash
nmcli connection modify <connection-name> ipv6.method link-local
nmcli connection up <connection-name>
```

### Option 3: Disable IPv6 Completely

If IPv6 is not needed:

```bash
nmcli connection modify <connection-name> ipv6.method disabled
nmcli connection up <connection-name>
```

### Option 4: Configure Router

Configure your router to advertise your preferred DNS server in IPv6 router advertisements instead of itself.

## Testing Commands

### Test DNS Server Connectivity

```bash
# Test IPv4 DNS server
ping -c 2 <dns-server-ip>

# Test IPv6 link-local (requires interface specification)
ping -c 2 <ipv6-address>%<interface>
```

### Test DNS Resolution

```bash
# Query a domain
nslookup google.com

# Or use dig for more details
dig google.com

# Check which DNS server resolved the query
resolvectl query google.com
```

### Check Network Neighbor Tables

```bash
# View all IPv4 neighbors (ARP table)
ip neigh show

# View all IPv6 neighbors (NDP table)
ip -6 neigh show

# View neighbors on specific interface
ip neigh show dev <interface>
ip -6 neigh show dev <interface>
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `resolvectl status` | Show current DNS configuration |
| `nmcli connection show` | List NetworkManager connections |
| `nmcli connection show "<name>"` | View connection details |
| `ip neigh show` | Show IPv4 neighbor table |
| `ip -6 neigh show` | Show IPv6 neighbor table |
| `nmcli connection modify <name> ipv6.ignore-auto-dns yes` | Ignore router DNS |
| `nmcli connection up <name>` | Apply connection changes |
| `ping <address>` | Test connectivity |
| `nslookup <domain>` | Test DNS resolution |

## Common Scenarios

### Scenario 1: Router Overriding DNS via IPv6
**Symptom:** Custom DNS configured but router's DNS is being used  
**Fix:** `nmcli connection modify <name> ipv6.ignore-auto-dns yes`

### Scenario 2: Want to Use IPv6 DNS
**Symptom:** DNS server has IPv6 but not configured  
**Fix:** Set `ipv6.dns` and enable `ipv6.ignore-auto-dns`

### Scenario 3: Don't Need IPv6
**Symptom:** IPv6 causing DNS issues  
**Fix:** Set `ipv6.method disabled`