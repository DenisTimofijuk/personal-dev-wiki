# ntopng Configuration Guide - Home Lab Setup

*Configuration guide for ntopng monitoring on TrueNAS Server A with port mirroring*

**Last updated:** 2025-11-04  
**ntopng version:** Free/Community Edition  
**Environment:** TrueNAS Scale, monitoring mirrored traffic from gateway and DNS router


## Overview

This guide documents the configuration of ntopng on TrueNAS Server A (192.168.1.181) for network-wide traffic analysis. The setup monitors mirrored traffic from:
- **Port 13:** Technicolor F1 Router (192.168.1.1) - Gateway/WAN traffic
- **Port 14:** TP-Link Archer C1200 (192.168.1.2) - DHCP/DNS server
- **Mirror destination:** Port 29 - TrueNAS Server A

### Key Features Enabled
- Network-wide traffic visibility
- Ad-blocking DNS monitoring (AdGuard Home integration)
- IoT device behavior tracking
- Security anomaly detection
- Countries and protocol analysis


## Prerequisites

### Network Setup Required
- HP ProCurve switch with port mirroring configured:
  - Source ports: 13, 14
  - Destination port: 29
- Static IP on monitoring interface: 192.168.1.181
- Interface name: `enp2s0` (adjust based on your system)

### Known Limitations (Free Version)
- No flow export
- Limited historical data retention
- No enterprise features (LDAP, SNMP device monitoring, etc.)


## Interface Configuration

**Navigation:** `Interfaces → [Select Interface] → Settings`

### Basic Settings

| Setting | Value | Notes |
|---------|-------|-------|
| **Custom Name** | `Mirror-Gateway-DNS` | Descriptive name for mirrored traffic |
| **Interface Speed** | `1000` Mbit/s | Gigabit ethernet |
| **Ingress Packets Sampling Rate** | `1` | No sampling, capture all packets |
| **Local Broadcast Domain Hosts Identifier** | `IP Address` | Forced by mirrored traffic mode |

### Critical Checkboxes

✅ **Create Interface Top Talkers** - ENABLE
- Identifies devices generating most traffic
- Essential for home lab monitoring

✅ **Mirrored Traffic** - ENABLE ⚠️ **CRITICAL**
- **Must be enabled** for port mirror setups
- Tells ntopng this is read-only traffic capture
- Without this, traffic direction detection fails

✅ **Periodic Interface Network Discovery** - ENABLE
- Automatically discovers and maps network topology
- Useful for 192.168.1.0/24 network

### MAC Address Based Traffic Directions

**Value:** `A0:B5:3C:45:58:40,B0-4E-26-94-A9-B5`

These MAC addresses help ntopng determine traffic direction:
- `A0:B5:3C:45:58:40` = Technicolor F1 (192.168.1.1) - Gateway
- `B0-4E-26-94-A9-B5` = TP-Link C1200 (192.168.1.2) - DHCP/DNS router

**Why needed:** With mirrored traffic, ntopng cannot automatically determine if packets are ingress (incoming) or egress (outgoing). These gateway MACs serve as reference points.

### Settings to Leave Disabled

❌ **Dynamic Traffic Disaggregation:** `None`  
❌ **Duplicate Disaggregated Traffic:** Disabled  
❌ **Push Alerted Hosts to PF_RING:** Disabled (not using PF_RING)


## Behavioral Checks

**Navigation:** `Settings → Preferences → Alerts → Behavioral Checks`

**Status:** 90 checks enabled out of 112 total

### Manually Enabled Checks (6 additional)

The following checks were enabled beyond the defaults:

#### 1. **Unexpected DNS Server** ✅
- **Category:** Cybersecurity
- **Severity:** Error
- **Purpose:** Detect devices bypassing AdGuard DNS (192.168.1.181)
- **Why important:** Ensures ad-blocking and DNS filtering works network-wide

#### 2. **Unexpected DHCP Server** ✅
- **Category:** Cybersecurity
- **Severity:** Error
- **Purpose:** Detect rogue DHCP servers
- **Why important:** Protects against DHCP spoofing attacks

#### 3. **Unexpected SMTP Server** ✅
- **Category:** Cybersecurity
- **Severity:** Error
- **Purpose:** Detect unauthorized email servers
- **Why important:** No email servers should run on home network; catches spam/malware

#### 4. **Unexpected NTP Server** ✅
- **Category:** Cybersecurity
- **Severity:** Error
- **Purpose:** Detect suspicious time servers
- **Why important:** Some malware uses NTP for C&C communications

#### 5. **Scan** ✅
- **Category:** Intrusion Detection
- **Severity:** Error
- **Threshold:** > 20 Ports (5 Minutes)
- **Purpose:** Detect port scanning activity
- **Why important:** Identifies compromised IoT devices (cameras, smart plugs)

#### 6. **Dangerous Host** ✅
- **Category:** Intrusion Detection
- **Severity:** Error
- **Threshold:** > 1000 Score (Minute)
- **Purpose:** Composite alert based on multiple suspicious behaviors
- **Why important:** Catches hosts exhibiting multiple anomalies

#### 7. **Remote Connection** ✅
- **Category:** Cybersecurity
- **Severity:** Notice
- **Purpose:** Alert on RDP/SSH/VNC/TeamViewer usage
- **Why important:** Know when devices are being accessed remotely

#### 8. **DNS Server Contacts** ✅
- **Category:** Cybersecurity
- **Severity:** Notice
- **Threshold:** > 5 Contacts (Minute)
- **Purpose:** Detect DNS tunneling attempts
- **Why important:** Complements "Unexpected DNS server" check

#### 9. **Flow Flood** ✅
- **Category:** Intrusion Detection
- **Severity:** Error
- **Threshold:** > 256 Flows/sec (Minute)
- **Purpose:** Detect connection flood attacks or compromised devices
- **Why important:** IoT botnets often generate high connection rates

#### 10. **IP/MAC Reassoc/Spoofing** ✅
- **Category:** Cybersecurity
- **Severity:** Warning
- **Purpose:** Detect ARP spoofing attacks
- **Why important:** Protects against man-in-the-middle attacks on LAN

### Checks Kept Disabled

❌ **IEC Unexpected TypeID** - Industrial control protocol, not relevant  
❌ **Periodic Flow** - Too noisy for home lab  
❌ **Blacklisted Country** - Manual maintenance required  
❌ **TCP Flow Reset** - Too many false positives  
❌ **Remote to Remote Flow** - Not useful with mirrored traffic  
❌ **VLAN Bidirectional Traffic** - VLANs not implemented yet  
❌ **SMTP/NTP Server Contacts** - Covered by "Unexpected" versions  
❌ **Domain Names Contacts** - Too noisy (250 threshold too high)  
❌ **ICMP Flood** - Uncommon in home networks  
❌ **SYN Scan Victim** - Threshold too high (32k) for home use  
❌ **HTTP Susp. Content** - Causes false positives with ESET antivirus


## Network Configuration

**Navigation:** `Settings → Preferences → Network Configuration`

These whitelists define allowed servers for the "Unexpected X Server" alerts.

### Configuration Values

| Setting | Value | Purpose |
|---------|-------|---------|
| **DNS Servers** | `192.168.1.181,192.168.1.1` | AdGuard Home (primary), F1 router (fallback) |
| **NTP Servers** | *Leave empty initially* | Observe legitimate NTP traffic first, then whitelist |
| **DHCP Servers** | `192.168.1.2` | TP-Link Archer C1200 (only DHCP server) |
| **SMTP Servers** | *Leave empty* | No email servers allowed = all SMTP triggers alert |
| **Network Gateways** | `192.168.1.1` | Technicolor F1 (only gateway) |

### Important Notes

- **Empty SMTP list:** This is intentional. Any SMTP traffic will trigger alerts, catching spam and malware.
- **NTP servers:** After 24-48 hours of monitoring, check which NTP servers your devices legitimately use, then add them to the whitelist.
- **DNS configuration:** Critical for ensuring AdGuard Home is being used network-wide.


## Runtime Preferences

**Navigation:** `Settings → Preferences → Runtime Preferences`

### Core Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Active Monitoring** | ✅ Enabled | Monitors host reachability |
| **Midnight Stats Reset** | ✅ Enabled | Clean daily stats for easier pattern tracking |
| **Active Local Hosts Cache** | ✅ Enabled | Protects against data loss on crashes |
| **Log level** | Default (Normal/Info) | Standard logging |
| **Enable Trace Log** | ❌ Disabled | Only for debugging |
| **Enable HTTP Access Log** | ❌ Disabled | Not needed for home lab |
| **Enable Host Pool Events Log** | ❌ Disabled | Not using host pools |
| **Mask Host IP Addresses** | ❌ Disabled | This is your home network |

### Flow Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Use MAC Address in Flow Key** | ❌ Disabled | IP-based keys sufficient with static DHCP |
| **Flow Table Begin Column** | ✅ Enabled | Useful to see when flows started |
| **Flow Table Time** | Duration | More useful than "last seen" time |

### Network Discovery

| Setting | Value | Reason |
|---------|-------|--------|
| **Network Discovery** | ✅ Enabled | Basic discovery features |
| **Active Network Discovery** | ❌ Disabled | ⚠️ **CRITICAL:** Cannot work on mirror port (read-only) |
| **Network Discovery Debug** | ❌ Disabled | Only for troubleshooting |

**Important:** Active Network Discovery sends ARP/MDNS packets, which is impossible on a mirrored port. Enabling this will cause errors.

### Post-NAT Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Use Post-Nat Destination IPv4** | ❌ Disabled | Not using NetFlow/IPFIX with NAT data |
| **Use Post-Nat Source IPv4** | ❌ Disabled | Not using NetFlow/IPFIX with NAT data |

### Protocol Learning Periods

| Setting | Value | Notes |
|---------|-------|-------|
| **IEC60870 Learning Period** | 6 hours (default) | Not used in this network |
| **ModbusTCP Learning Period** | 6 hours (default) | Eport-PE11 uses Modbus |

### Statistics & Timeseries

| Setting | Value | Reason |
|---------|-------|--------|
| **Fingerprint Statistics** | ✅ Enabled | Helps identify device types |
| **Sites Collection** | ✅ Enabled | Track visited domains |
| **One-Way Traffic Timeseries** | ❌ Disabled | Reduces noise from scanning/probing |

### Timeseries Options

| Setting | Value | Reason |
|---------|-------|--------|
| **MAC Addresses - Traffic** | ✅ Enabled | Useful with 21 static DHCP devices |
| **VLANs** | ❌ Disabled | VLANs not implemented yet |
| **Autonomous Systems** | Optional | Enable if interested in ISP/company tracking |
| **Countries** | ✅ Enabled | ⚠️ Important: Tracks Eport-PE11 China connections |
| **Internals** | ❌ Disabled | Only for debugging ntopng itself |

### System Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Automatic Updates** | ❌ Disabled | Manual control over ntopng restarts |
| **Access Control List** | Empty | No access restrictions needed |
| **Interface Name Only** | ❌ Disabled | Show full interface details |


## Expected Performance

### Normal CPU Usage (on TrueNAS Server A)

**Baseline:** 6-15% CPU  
**Peak:** 20-30% CPU (during traffic bursts)  
**Memory:** ~270MB RAM (1.6-1.7% on 16GB system)

### Why This is Normal

You're monitoring:
- **2 mirrored ports** with all gateway and DNS traffic
- **6 PoE cameras** streaming high-resolution video via FTP
- **21+ active devices** with static DHCP reservations
- **Multiple IoT devices** constantly phoning home
- **84 behavioral checks** running in real-time
- **Deep packet inspection** (nDPI) on every packet

### Performance Monitoring

Check ntopng's own health:
- **System → Internals** - Processing statistics
- **Interface Stats** - Look for packet drops

### When to Be Concerned

⚠️ Investigate if:
- CPU stays consistently **above 50%**
- ntopng web interface becomes **unresponsive**
- You see **packet drops** in interface statistics
- Memory usage grows **above 1GB**


## Troubleshooting

### Common Issues

#### 1. Traffic Direction Warnings

**Symptom:** ntopng shows warnings about unable to determine traffic direction

**Solution:** Verify MAC addresses are correctly configured:
```
A0:B5:3C:45:58:40,B0-4E-26-94-A9-B5
```

**Check MACs match:**
```bash
# On TP-Link C1200
ip link show | grep ether

# On Technicolor F1
# Access web interface: Status → Device Info
```

#### 2. DHCP Host Monitoring Alert

**Symptom:** Alert: "This interface is monitoring DHCP hosts. Please consider changing the Local Broadcast Domain Hosts Identifier preference to 'MAC Address'"

**Resolution:** This is **expected behavior** with mirrored traffic. The setting is automatically forced to "IP Address" and cannot be changed. You can safely ignore this alert.

#### 3. High CPU Usage from proftpd

**Symptom:** proftpd process using high CPU alongside ntopng

**Explanation:** This is normal. Your 6 PoE cameras upload video via FTP to TrueNAS Server A. FTP is CPU-intensive.

**Mitigation (if needed):**
- Consider switching cameras to SMB/NFS storage
- Reduce camera resolution/framerate
- Use hardware-accelerated video encoding on cameras

#### 4. Active Network Discovery Errors

**Symptom:** Errors about inability to send ARP/MDNS packets

**Solution:** Ensure "Active Network Discovery" is **DISABLED**. Mirror ports are read-only and cannot send packets.

#### 5. Alerts from ESET Antivirus

**Known behavior:** ESET antivirus updates trigger "HTTP Susp. User-Agent" alerts because the updater doesn't send User-Agent headers.

**Resolution:** This is expected. Verify ESET is installed on the alerting device. See network documentation "Known Alerts" section.

#### 6. Eport-PE11 Phoning Home

**Known behavior:** Eport-PE11 device (192.168.1.99) contacts Chinese servers (bridge.iotworkshop.com) every minute.

**Note:** Device works fine when blocked at firewall. This is documented privacy concern. Monitor under "Countries" stats.


## Post-Installation Tasks

### After 24-48 Hours

1. **Review NTP servers:**
   - Navigate to: `Hosts → All Hosts`
   - Filter by protocol: NTP
   - Identify legitimate NTP servers
   - Add to Network Configuration whitelist

2. **Check for false positives:**
   - Review triggered alerts
   - Adjust thresholds if needed
   - Whitelist legitimate traffic patterns

3. **Monitor performance:**
   - Check CPU usage trends
   - Look for packet drops
   - Verify no memory leaks

### Integration with Home Assistant

Your Home Assistant (192.168.1.94) can potentially integrate with ntopng:
- Monitor network bandwidth per device
- Create automations based on device connectivity
- Track data usage for IoT devices

*Note: Integration may require custom scripts or MQTT bridge (not covered in this guide)*


## Network Context Reference

### Monitored Devices (Partial List)

**Infrastructure:**
- 192.168.1.1 - Technicolor F1 (Gateway)
- 192.168.1.2 - TP-Link C1200 (DHCP/DNS)
- 192.168.1.181 - TrueNAS Server A (This server)
- 192.168.1.177 - TrueNAS Server B
- 192.168.1.94 - Home Assistant

**Energy Management:**
- 192.168.1.99 - Eport-PE11 (Smart Meter)
- 192.168.1.101 - Solis Datalogger (Solar)
- 192.168.1.211 - Dyness (Battery Backup)
- 192.168.1.228 - Shelly (Ventilation Control)

**Cameras (6x):**
- 192.168.1.93, .95, .111, .133, .179, .233

**Network:**
- 192.168.1.66 - AirTies WiFi Extender

**IoT Devices:**
- Multiple Shelly smart plugs (2.4 GHz WiFi)
- Samsung smartphones, projector
- Various WiFi clients via AirTies extender


## Additional Resources

- **ntopng Documentation:** https://www.ntop.org/guides/ntopng/
- **Network Documentation:** See `Network Documentation – Denis Home Lab Smart.md`
- **Port Mirroring Config:** HP ProCurve E3500yl-48G manual


## Change Log

**2025-11-04:**
- Initial ntopng setup on TrueNAS Server A
- Configured interface for mirrored traffic monitoring
- Enabled 90 behavioral checks (84 default + 6 custom)
- Configured network whitelists for DNS, DHCP, Gateway
- Optimized runtime preferences for home lab environment


## Future Enhancements

Potential improvements documented in network documentation:
- [ ] Implement VLANs (separate IoT, cameras, servers)
- [ ] Add Grafana dashboard integration
- [ ] Export flow data to external SIEM
- [ ] Implement automated alerting (email/Telegram)
- [ ] Create Home Assistant integration for bandwidth monitoring
- [ ] Set up ntopng data backup/retention policy


*End of ntopng Configuration Guide*