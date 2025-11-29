# Fedora Linux: Custom DNS Configuration Guide

This guide explains how to correctly configure custom DNS servers on Fedora Linux using NetworkManager and systemd‑resolved. It focuses on a clean, reliable initial setup and includes verification steps.


## 1. Overview

Fedora uses **systemd‑resolved** and **NetworkManager** to manage DNS. When configuring custom DNS servers, NetworkManager becomes the authoritative source.

Typical use cases:

* Use a local DNS resolver (e.g., AdGuard Home, Pi‑hole).
* Use public DNS servers (Cloudflare, Google, Quad9).
* Prevent the router or DHCP from overriding DNS settings.


## 2. Identify Your Network Connection

List all configured connections:

```bash
nmcli connection show
```

Find the active connection:

```bash
nmcli connection show --active
```

Use this connection name in all commands below.


## 3. Set Custom DNS Servers (IPv4)

Set one or more DNS servers:

```bash
nmcli connection modify <connection-name> ipv4.dns "<dns1> <dns2>"
```

Example (local resolver + fallback public DNS):

```bash
nmcli connection modify <connection-name> ipv4.dns "192.168.x.x 1.1.1.1"
```

Apply the changes:

```bash
nmcli connection up <connection-name>
```

### Prevent DHCP from overriding DNS

```bash
nmcli connection modify <connection-name> ipv4.ignore-auto-dns yes
nmcli connection up <connection-name>
```


## 4. Optional: Configure IPv6 DNS

If you use IPv6 resolvers:

```bash
nmcli connection modify <connection-name> ipv6.dns "<ipv6-dns>"
nmcli connection modify <connection-name> ipv6.ignore-auto-dns yes
nmcli connection up <connection-name>
```

If you prefer not to use IPv6 DNS at all:

```bash
nmcli connection modify <connection-name> ipv6.ignore-auto-dns yes
nmcli connection up <connection-name>
```


## 5. Confirm DNS Configuration

Check what systemd‑resolved is using:

```bash
resolvectl status
```

You should see:

* The DNS servers you configured.
* Correct "Current DNS Server".

Example output snippet:

```
Link 2 (enp3s0)
  Current DNS Server: 192.168.x.x
  DNS Servers: 192.168.x.x 1.1.1.1
```


## 6. Test DNS Functionality

### Test specific DNS server directly using dig

```bash
dig @<dns-ip> google.com
```

A working DNS server should return status **NOERROR**.

Example:

```bash
dig @192.168.x.x google.com
```

### Test system-wide DNS resolution

```bash
dig google.com
```

### Test AAAA (IPv6) resolution

```bash
dig aaaa google.com
```

If queries succeed and return addresses, DNS is functioning correctly.


## 7. Notes About Local DNS Servers

When using a local resolver (e.g., a device on your LAN):

* Ensure it supports recursive queries from LAN clients.
* Confirm it has valid upstream DNS servers.
* Some consumer routers do **not** act as full DNS resolvers. They may refuse direct DNS queries unless the client obtained its configuration via DHCP.

### Example: TP‑Link Router Case

Many TP‑Link home routers operate as **DHCP servers and DNS relays**, not full DNS resolvers. They may:

* Accept DNS queries only from DHCP‑assigned clients.
* Return **REFUSED** to manual or static clients.

In such setups, the correct DNS server is typically the device actually running DNS software (e.g., AdGuard Home / Pi‑hole), not the router itself.


## 8. Summary

1. Set custom DNS with NetworkManager.
2. Prevent DHCP from overwriting it.
3. Verify with `resolvectl status`.
4. Test functionality using `dig`.

This ensures Fedora consistently uses your chosen DNS servers and avoids unintended fallback to router‑advertised DNS.
