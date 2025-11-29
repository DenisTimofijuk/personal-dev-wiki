# Fedora DNS Configuration: Forcing a Specific DNS Server

## Problem

A Fedora system was configured to use a specific IPv4 DNS server (e.g., AdGuard, Pi-hole), but systemd-resolved still used the router’s IPv6 DNS advertised via DHCPv6/SLAAC.

## Diagnosis

### Check Active DNS

```bash
resolvectl status
```

### Inspect Neighbor Tables

```bash
ip -6 neigh show dev <interface>
ip neigh show
ip neigh show | grep <mac-address>
```

### Inspect NetworkManager Connection

```bash
nmcli connection show
nmcli connection show "<connection-name>"
```

Key fields:

* `ipv4.dns`
* `ipv6.method`
* `ipv6.ignore-auto-dns`
* `IP6.DNS[1]`

## Root Cause

With `ipv6.method=auto`, the router may supply its own DNS via DHCPv6. systemd-resolved may prefer it over the manually configured IPv4 DNS.

## Fix

### Ignore Auto-Provided IPv6 DNS (recommended)

```bash
nmcli connection modify <connection> ipv6.ignore-auto-dns yes
nmcli connection up <connection>
```

### Verify

```bash
resolvectl status
```

## Alternatives

### Explicit IPv6 DNS

```bash
nmcli connection modify <connection> ipv6.dns "<ipv6-address>"
nmcli connection modify <connection> ipv6.ignore-auto-dns yes
nmcli connection up <connection>
```

### IPv6 Link-Local Only

```bash
nmcli connection modify <connection> ipv6.method link-local
nmcli connection up <connection>
```

### Disable IPv6

```bash
nmcli connection modify <connection> ipv6.method disabled
nmcli connection up <connection>
```

### Configure Router

Adjust router RAs to advertise your preferred IPv6 DNS.

## Testing

### Connectivity

```bash
ping -c 2 <dns-ip>
ping -c 2 <ipv6-address>%<interface>
```

### Resolution

```bash
nslookup google.com
dig google.com
resolvectl query google.com
```

### Neighbor Tables

```bash
ip neigh show
ip -6 neigh show
ip neigh show dev <interface>
ip -6 neigh show dev <interface>
```

## Quick Reference

| Command                                                   | Purpose                |
| --------------------------------------------------------- | ---------------------- |
| `resolvectl status`                                       | Show DNS configuration |
| `nmcli connection show`                                   | List connections       |
| `nmcli connection modify <name> ipv6.ignore-auto-dns yes` | Ignore router DNS      |
| `ip neigh show` / `ip -6 neigh show`                      | View ARP/NDP neighbors |

## Common Scenarios

### Router Overriding DNS

Fix:

```bash
nmcli connection modify <name> ipv6.ignore-auto-dns yes
```

### Need IPv6 DNS

Set `ipv6.dns` and ignore auto DNS.

### IPv6 Not Needed

Disable IPv6 entirely.

## Setting DNS with NetworkManager

### IPv4

```bash
nmcli connection modify <connection> ipv4.dns "8.8.8.8 8.8.4.4"
nmcli connection up <connection>
```

### IPv6

```bash
nmcli connection modify <connection> ipv6.dns "2001:4860:4860::8888"
nmcli connection up <connection>
```

### Prevent DHCP Overrides

```bash
nmcli connection modify <connection> ipv4.ignore-auto-dns yes
nmcli connection modify <connection> ipv6.ignore-auto-dns yes
nmcli connection up <connection>
```

### Find Connection Name

```bash
nmcli connection show
nmcli connection show --active
```