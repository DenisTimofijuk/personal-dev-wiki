# Troubleshooting Report: systemd-resolved Bypassing AdGuard Home DNS

## Executive Summary

A Fedora Linux workstation was bypassing its configured AdGuard Home DNS server (192.168.1.181) and falling back to the secondary DNS server (1.1.1.1), defeating network-wide ad blocking. The root cause was **AdGuard Home not including EDNS (Extension Mechanisms for DNS) information in blocked domain responses**, causing systemd-resolved to mark the DNS server as "degraded" and prefer the fallback server.

**Solution:** Enable "EDNS Client Subnet" in AdGuard Home DNS settings.


## Problem Description

### Symptoms
- Fedora PC configured with AdGuard Home as primary DNS (192.168.1.181)
- Direct DNS queries with `dig` worked perfectly and showed EDNS support
- systemd-resolved was bypassing AdGuard and using Cloudflare (1.1.1.1) instead
- AdGuard query logs showed minimal traffic from the Fedora PC
- Other network devices were using AdGuard correctly

### Initial Observations
```bash
$ resolvectl status
Global
  Current DNS Server: 192.168.1.181  ✓ Correct
  
Link 2 (enp3s0)
  Current DNS Server: 1.1.1.1        ✗ Wrong!
  DNS Servers: 192.168.1.181 1.1.1.1
```


## Investigation Process

### Step 1: Verify EDNS Support
We tested whether AdGuard properly supported EDNS:

```bash
$ dig +edns=1 @192.168.1.181 google.com
# Result: EDNS working perfectly ✓
```

This confirmed AdGuard itself supported EDNS when queried directly.

### Step 2: Examine systemd-resolved Logs
```bash
$ sudo journalctl -u systemd-resolved | grep -i "degraded\|edns"
```

**Critical finding:**
```
systemd-resolved: Using degraded feature set UDP instead of UDP+EDNS0 for DNS server 192.168.1.181
```

systemd-resolved was **downgrading** the connection to AdGuard from "UDP+EDNS0" to plain "UDP", indicating it detected EDNS support issues.

### Step 3: Enable Debug Logging
We enabled detailed debug logging to capture the exact moment of failure:

```bash
$ sudo mkdir -p /etc/systemd/system/systemd-resolved.service.d/
$ sudo tee /etc/systemd/system/systemd-resolved.service.d/debug.conf > /dev/null <<EOF
[Service]
Environment=SYSTEMD_LOG_LEVEL=debug
EOF
$ sudo systemctl daemon-reload
$ sudo systemctl restart systemd-resolved
```

### Step 4: Capture Live DNS Traffic
```bash
$ sudo tcpdump -i enp3s0 -n port 53 -vv -w ~/dns-traffic.pcap
```

**Key Discovery:** Direct queries from `dig` included proper EDNS OPT records, but responses from AdGuard to systemd-resolved queries for **blocked domains** were missing EDNS information.

### Step 5: Identify the Trigger
Debug logs revealed the exact query that caused degradation:

```
Looking up RR for api.honeycomb.io IN A
Server doesn't support EDNS(0) properly, downgrading feature level...
Using degraded feature set UDP instead of UDP+EDNS0 for DNS server 192.168.1.181
```

**Root Cause Identified:**
- AdGuard blocked `api.honeycomb.io` (via configured blocklists)
- AdGuard's blocking mode returned responses **without EDNS support**
- systemd-resolved detected this as "server doesn't support EDNS properly"
- systemd-resolved permanently downgraded the connection
- With degraded status, 1.1.1.1 (which still had full EDNS support) became preferred


## Root Cause Analysis

### Why AdGuard's Blocked Responses Lacked EDNS

AdGuard Home has multiple "blocking modes" that determine how blocked domains are handled:

1. **Default (0.0.0.0)** - Returns IP address 0.0.0.0
2. **REFUSED** - Returns DNS REFUSED error code
3. **NXDOMAIN** - Returns "domain doesn't exist"
4. **Custom IP** - Returns a specified IP address

**The Problem:** In certain configurations, AdGuard's blocked responses were **minimal DNS packets** that excluded the EDNS OPT record, even though AdGuard supported EDNS for legitimate queries.

### Why systemd-resolved is Strict About EDNS

systemd-resolved performs **EDNS capability negotiation** with DNS servers:

1. First query: Sends request **with EDNS** enabled
2. Expects response: Should also **include EDNS** in the answer section
3. If EDNS is missing: Interprets as "server doesn't support EDNS"
4. Downgrades connection: Switches to plain UDP (no EDNS)
5. Server ranking: Prefers servers with better capabilities

This is correct behavior per DNS standards - systemd-resolved is being a proper DNS client. The issue was AdGuard's inconsistent EDNS support.

### The Cascade Effect

```
1. Browser queries blocked domain (api.honeycomb.io)
   ↓
2. AdGuard returns blocked response WITHOUT EDNS
   ↓
3. systemd-resolved: "Server doesn't support EDNS" → DEGRADE
   ↓
4. systemd-resolved now prefers 1.1.1.1 (still has EDNS)
   ↓
5. All subsequent queries bypass AdGuard ✗
```


## Solution

### Primary Fix: Enable EDNS Client Subnet in AdGuard

**Steps:**
1. Open AdGuard Home web interface (http://192.168.1.181)
2. Navigate to **Settings → DNS Settings**
3. Scroll to **"EDNS Client Subnet"** section
4. **Enable** the "Use EDNS Client Subnet" option
5. Click **Save**

**What this does:** Forces AdGuard to include EDNS OPT records in **all** DNS responses, including blocked domains, ensuring consistent EDNS support that systemd-resolved expects.

### Restart systemd-resolved
```bash
$ sudo systemctl restart systemd-resolved
$ resolvectl flush-caches
```

### Verification
```bash
# Check current DNS server status
$ resolvectl status

# Monitor for degradation messages (should be none)
$ sudo journalctl -u systemd-resolved -f | grep -i "degraded"

# Verify AdGuard is receiving queries
# Check AdGuard Home → Query Log for recent queries from your IP
```


## Alternative Solutions Considered

### Option 1: Change AdGuard Blocking Mode ❌
We initially tried changing from "Default (0.0.0.0)" to "REFUSED" and then "NXDOMAIN". While this improved the situation, it didn't fully resolve the issue because blocked responses still lacked proper EDNS formatting.

### Option 2: Whitelist Problematic Domains ❌
We identified that `api.honeycomb.io` (Brave browser telemetry) was a frequent trigger. Whitelisting it reduced the frequency of issues but didn't address the root cause. Other blocked domains would still trigger degradation.

### Option 3: Disable systemd-resolved's Strict EDNS Checking ❌
This would involve creating custom systemd-resolved configuration to be less strict. However, this weakens DNS security and proper protocol compliance. Not recommended.

### Option 4: Enable EDNS Client Subnet ✓
**This was the correct fix.** It ensures AdGuard includes EDNS support in all responses consistently, which is what systemd-resolved expects from a properly configured DNS server.


## Technical Details

### EDNS (Extension Mechanisms for DNS)
EDNS0 is defined in RFC 6891 and provides:
- Larger UDP packet sizes (beyond 512 bytes)
- Support for additional flags and options
- Required for modern DNS features (DNSSEC, DNS cookies, client subnet information)

A proper EDNS response includes an OPT pseudo-record:
```
;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
```

### Why Direct dig Queries Worked
`dig` is a simple DNS client that:
- Sends query with EDNS
- Accepts any valid DNS response
- Doesn't perform capability negotiation
- Doesn't maintain server state

systemd-resolved is a **caching DNS stub resolver** that:
- Maintains persistent connections to upstream DNS servers
- Performs capability negotiation and server ranking
- Remembers which servers support which features
- Routes queries to the "best" available server


## Lessons Learned

### For Network Administrators

1. **DNS blockers must provide consistent EDNS support** - It's not enough for EDNS to work on legitimate queries; blocked responses must also include proper EDNS formatting.

2. **Test with actual clients, not just dig** - Direct DNS tools don't replicate the complex behavior of modern stub resolvers like systemd-resolved.

3. **Monitor DNS server status regularly** - Use `resolvectl status` and check for "degraded" warnings in logs.

4. **Enable EDNS Client Subnet in AdGuard Home** - This should be standard configuration for AdGuard deployments, especially on networks with systemd-resolved clients.

### For AdGuard Home Users

**Recommended Configuration:**
- **Settings → DNS Settings → EDNS Client Subnet:** ✓ Enabled
- **Blocking Mode:** Any mode works once EDNS is properly configured
- **Rate Limit:** Set appropriately for your network (0 for unlimited, or 50+ for most home networks)
- **Upstream Timeout:** Minimum 10 seconds

### For systemd-resolved Users

systemd-resolved's strict EDNS enforcement is **correct behavior**. The issue was not with systemd-resolved, but with DNS servers providing inconsistent EDNS support. Don't disable or work around systemd-resolved's standards compliance.


## Prevention & Monitoring

### Regular Health Checks
```bash
# Check for degraded DNS servers
$ resolvectl status | grep -i "current dns"

# Monitor systemd-resolved logs
$ sudo journalctl -u systemd-resolved --since "1 hour ago" | grep -i "degraded\|edns"

# Verify DNS query distribution
# Check AdGuard Home query logs to ensure your devices are using it
```

### Network-Wide Verification
After implementing this fix, verify that **all devices** on the network are properly using AdGuard Home:
- Check AdGuard Home statistics dashboard
- Verify blocked query counts align with expected network activity
- Test ad-blocking functionality on various devices


## Conclusion

This issue demonstrates the importance of **complete DNS protocol compliance** for DNS servers in modern networks. While AdGuard Home is an excellent DNS filtering solution, its default configuration may not include full EDNS support in all response types.

**The solution was simple:** Enable "EDNS Client Subnet" in AdGuard Home settings, ensuring all DNS responses include proper EDNS formatting that systemd-resolved requires.

This fix is **non-intrusive**, doesn't require changes to client configurations, and ensures full compatibility with RFC-compliant DNS clients like systemd-resolved.


## Appendix: Diagnostic Commands Reference

### Quick Status Check
```bash
resolvectl status
resolvectl statistics
```

### View Recent DNS Activity
```bash
sudo journalctl -u systemd-resolved --since "1 hour ago"
```

### Test DNS Server Directly
```bash
dig +edns=0 @192.168.1.181 google.com
dig +edns=1 @192.168.1.181 google.com
```

### Capture DNS Traffic
```bash
sudo tcpdump -i eth0 -n port 53 -vv
```

### Reset DNS State
```bash
sudo resolvectl flush-caches
sudo resolvectl reset-server-features
sudo systemctl restart systemd-resolved
```

### Check for EDNS Degradation
```bash
sudo journalctl -u systemd-resolved | grep -i "degraded\|edns"
```


## References

- RFC 6891: Extension Mechanisms for DNS (EDNS(0))
- systemd-resolved documentation: https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html
- AdGuard Home documentation: https://github.com/AdguardTeam/AdGuardHome/wiki


**Document Version:** 1.0  
**Date:** November 2025  
**Status:** Resolved ✓