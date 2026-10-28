# ntopng Configuration Guide - Home Lab Setup

*Illustrative configuration and verification guide for ntopng on a passive, switch-mirrored monitoring interface.*

> **Historical context:** This article originated in November 2025. Its original check lists, edition entitlements, interface options and deployment-specific settings are **not a current configuration export**. This revision replaces outdated assertions with general guidance. Verify every applicable UI option, script entitlement and threshold against your installed ntopng version before applying a change.
>
> For an evidence-based workflow covering DNS, gateway, Flow Flood, Probing Attempt and other alerts, see [Investigating ntopng Alerts on Mirrored and VLAN Networks](./ntopng-Alert-Investigation-Guide.md).

**Updated:** 2026-10-28  
**Scope:** ntopng Community / Free installations; feature availability varies by build  
**Example platform:** TrueNAS SCALE or another Linux host receiving traffic from a managed switch's SPAN port

## Overview

A managed switch can mirror selected traffic to a passive monitoring interface for protocol analysis, host/flow observations and anomaly detection. This does **not** automatically provide full-network visibility.

A basic topology contains:

- A managed switch with explicitly selected **mirror sources** (ports, VLANs or both).
- A **mirror destination** connected to the monitoring host's capture interface.
- Existing routing and firewall devices whose decisions must be verified **separately** from ntopng observations.
- An explicitly documented set of local IPv4/IPv6 networks so local/remote interpretation reflects the routed topology.

Avoid publishing actual physical port assignments, interface MAC addresses, IP assignments or private network diagrams.

### Important visibility boundaries

- SPAN may copy the same routed conversation from more than one path. A distinct `IP@VLAN` host record is **not** necessarily a distinct physical host.
- A mirror port or capture host can drop packets under load. Configured sampling rate 1 does **not** establish lossless visibility.
- Incomplete reverse traffic can make a connection look one-way; a detector record does not necessarily prove a completed session.
- Counts of **alerts** are not counts of **network flows**, transferred bytes or independently confirmed security incidents.

## Prerequisites

1. Configure and verify switch source/destination mirroring according to the switch manual. Confirm which tagged/untagged traffic reaches the monitor.
2. Choose the monitoring host interface and confirm it receives the intended passive traffic. Use a separate management path; do not assume the mirror-only interface can transmit diagnostic packets.
3. Record the observed router, local-network, DNS and DHCP policy **privately** before setting expectations in ntopng.
4. Check ntopng edition/version and capture interface statistics before trusting feature names or historical data.

## Interface Configuration

**Typical navigation:** `Interfaces → select interface → Settings` (version-dependent).

| Setting or check | Recommended review |
| --- | --- |
| **Mirrored Traffic** | Enable when available for a passive SPAN interface; verify the setting persists. |
| **Interface speed** | Set/inspect only according to the actual capture link; do not assume a particular speed. |
| **Ingress sampling** | Value `1` usually denotes no intentional sampling; separately monitor interface and SPAN packet loss. |
| **Local Broadcast Domain Hosts Identifier** | Inspect the actual supported behavior; mirrored capture can limit MAC attribution. |
| **Local Networks / local-versus-remote** | Define the actual local prefixes using the supported configuration mechanism; verify several known internal endpoints after a restart. |
| **Top talkers** | Enable if supported and useful, but validate measurement windows, mirror duplication, missing packets and identity semantics before treating rankings as complete. |
| **Active network discovery** | Avoid launching active probes from an isolated mirror-only interface. If needed, configure discovery on a separately authorized, routable interface. |

### MAC- and VLAN-based attribution

Gateway/router MAC addresses can be reference inputs for traffic direction in some configurations, but are **not** a substitute for validating physical endpoint identity. Routing plus SPAN can associate a client's IP with a router MAC in one observation context and the real device MAC in another. Do not infer rogue hosts or incorrect VLAN placement solely from these UI rows.

## Behavioral Checks

**Typical navigation:** `Settings → Preferences / Behavioural Checks` (varies by release).

The historical installation used particular enabled/disabled checks and count totals; those are neither a recommendation nor a verified current Community feature inventory. Some checks are version- or license-dependent. Audit only the detectors relevant to the monitoring objective.

| Example detector | What it can help detect | Essential qualification |
| --- | --- | --- |
| Unexpected DNS Server | DNS destinations outside an expected-server policy | Destination mismatch is **not** proof that firewall DNS enforcement was bypassed. |
| Unexpected DHCP Server | Potentially unapproved DHCP-service behavior | Verify DHCP source, VLAN and packet semantics; benign lab services may exist. |
| Unexpected SMTP/NTP Server | Unexpected service destinations/sources | Compare against documented exceptions; avoid treating every external NTP attempt as malicious. |
| Unexpected Gateway | Gateway associations not matching the detector's expectations | SPAN/routed `IP@VLAN` host artifacts can create false gateway associations. |
| Flow Flood | High observed host-level connection/flow-rate behavior | A rate threshold is not itself DDoS evidence; check capture duplication and scheduled bursts. |
| Probing Attempt | Heuristically suspicious connection patterns | A refused or short connection alone does not prove scanning. |
| Missing SNI TLS Extension | TLS traffic without exposed SNI information | Some benign clients and protocols lack SNI; verify service context. |
| Blacklisted Country | Traffic involving policy-classified address geographies | Geography alone cannot establish compromise, successful communication or malicious intent. |

Do not assume that a combined alert score equals multiple independent incidents. Review the individual checks contributing to a Flow alert, and confirm whether the alert originated in **Host** or **Flow** history.

For specific triage and safe rule changes, use the [alert investigation guide](./ntopng-Alert-Investigation-Guide.md).

## Network Configuration

Some builds expose expected DNS/DHCP/NTP/SMTP/gateway lists through the UI, preferences or documented APIs. Storage and update methods **vary by release**; an empty field in one export does not prove that a live persistent list is empty.

| Expected-service policy | How to decide an entry belongs |
| --- | --- |
| DNS | Compare the **actual current** production DNS upstreams and internal DNS services with the intended network policy. |
| DHCP | Use the known authorized server/relay inventory; distinguish broadcasts observed on mirrored VLANs. |
| NTP | Observe legitimate sync destinations and policy before adding exceptions. |
| SMTP | Compare authorized mail services and source roles; do not assume an empty list automatically produces every conceivable alert. |
| Gateways | Use the real gateway inventory and account for routed/mirrored host identity artifacts. |

**Detector allowlisting and firewall policy are separate controls.** An expected-server entry can reduce ntopng detection without allowing any packet through the router. Conversely, an unexpected DNS alert cannot prove an unauthorized resolver was reached. Check whether generic/global expected-server entries apply beyond the intended VLAN.

For changes: preserve the precise previous list, obtain approval, modify only the targeted setting, perform an independent readback, and compare new **Historical** alerts over a bounded post-change period. Avoid broad configuration imports, blanket detector disables, or undocumented persistence edits.

## Runtime Preferences

The available options change between versions. Prioritize behavior and risks rather than copying a fixed historical checklist:

- Keep routine logging reasonably bounded; enable verbose traces temporarily for a specific investigation.
- Protect the ntopng management interface with appropriate network restrictions and authentication. **Do not recommend an empty access-control policy by default.**
- Enable or disable active monitoring, timeseries families, protocol discovery and host caches according to the current edition, available storage and operational need.
- Validate flow-key and host-identity behavior across VLANs and routers before interpreting per-device counts; IP-only and MAC-based grouping both have limitations.
- Be cautious with automatic discovery on passive capture-only paths and avoid intrusive probing without explicit authorization.
- Treat interface traffic direction, sampled data and application classification as measurements with stated limitations, not ground truth.

## Expected Performance

Do not reuse CPU, memory or enabled-rule counts from a different installation as universal thresholds. Measure a local baseline at representative traffic levels:

1. ntopng and host CPU/RAM over ordinary periods and bursts.
2. Capture interface and upstream SPAN packet drops, including intervals of overload.
3. ntopng process restarts, data-directory permissions, storage writes and timeseries continuity.
4. Event retention, alert export or forwarding success, and the latency/availability of the UI.

A running collector with valid daily alert records can still have missing mirrored packets or lossy notification delivery. Document both the success criterion and its coverage limits.

## Troubleshooting

### Missing or misleading local/remote classification

Confirm the actual configured local networks, the service startup options/preferences and the active capture context. A `local` flag is not inferred reliably merely from a private-looking address; after modifying the local-network configuration, verify several representative internal hosts.

### Unexpected Gateway or duplicate host identities

Check whether an observed client IP occurs under multiple VLAN contexts, whether one row carries a router MAC and whether the real device is present with its own MAC in another context. Reconcile against switch/ARP/DHCP inventory; avoid disabling all gateway checks until the detector's loss of coverage is understood.

### Unexpected DNS Server notifications

Compare observed destinations to actual DNS-production settings, and keep diagnostic probes separate from authorized DNS upstreams. The originating process on a shared host may be unknown. Verify router redirect/deny behavior independently; do not label an attempt a successful bypass.

### Flow Flood, Probing Attempt or Missing SNI

Inspect one or two **Historical** records with full details; note individual check contributions, direction, flags/response, cadence, expected workload and any capture loss. Rate-triggered or failed attempts are not automatically attacks. Document unknowns and avoid global false-positive suppression without corroboration.

### Active discovery or capture errors

A dedicated SPAN interface may have no usable transmit path. Diagnose discovery separately from passive capture and look at the source/destination mirroring configuration, interface link state, driver counters and drop statistics.

### CPU spikes in the monitoring host

Attribute load to the responsible process and workload with operating-system tools. Do not presume ntopng, a file-transfer service or application protocol is responsible solely because they coexist on the host.

## Post-Installation Verification

After a normal observation window:

1. Verify the selected source traffic, VLAN visibility, network classification and packet-drop counters.
2. In **Alerts Explorer**, distinguish **Requires Attention** from **Historical** records and compare counts using the same alert type and time range.
3. Validate the expected-server configuration with a readback, not only a successful save response.
4. Check that other meaningful detectors remain enabled after any targeted tuning.
5. If exporting alerts to another system, confirm it can parse subsequent records; do not claim event-by-event losslessness without independent transport evidence.
6. Record a small rule-decision table with observation, interpretation, keep/tune/disable choice, detection loss, validation and rollback.

## Network Context Reference

Use **roles**, not a copied private device inventory, when sharing this guide:

| Role | Example placeholder |
| --- | --- |
| Monitoring host | `[MONITOR_HOST]` |
| Managed switch SPAN source/destination | `[MIRROR_SOURCE]` / `[MIRROR_DESTINATION]` |
| Authorized DNS service | `[DNS_SERVICE]` |
| Routed gateway | `[GATEWAY]` |
| Test destination (documentation-only) | `198.51.100.20` |

This guide intentionally does not publish physical switch port mappings, device-specific hostnames, actual VLAN allocations or production IP addresses.

## Additional Resources

- [Official ntopng documentation](https://www.ntop.org/guides/ntopng/) — check the installed release and edition.
- [Investigating ntopng Alerts on Mirrored and VLAN Networks](./ntopng-Alert-Investigation-Guide.md) — practical evidence checklist and rule decision framework.

## Change Log

- **2025-11-04:** Original illustrative installation and preferences guide recorded.
- **2026-10-28:** Reframed as historical/version-dependent; removed deployment-specific topology and stale check counts, clarified SPAN/VLAN identity, DNS-policy versus enforcement, alert interpretation, capture limitations and safe change verification.

## Future Enhancements

Potential extensions—richer traffic history, dashboards and external reporting—should be considered only after validating Community edition availability, packet coverage, counter units, host identity, and the intended measurement window. These are **options**, not confirmed existing capabilities or instructions to deploy.

*End of ntopng configuration guide.*
