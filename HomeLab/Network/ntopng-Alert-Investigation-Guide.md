# Investigating ntopng Alerts on Mirrored and VLAN Networks

Security dashboards are **detection evidence**, not incident verdicts. This guide gives a repeatable way to triage ntopng Host and Flow alerts without mistaking an anomaly score, mirrored-packet artifact, or failed connection for a confirmed compromise.

**Applies to:** ntopng Community installations using passive SPAN/port mirroring, including VLAN-routed networks. Interface labels, menu locations, check availability, thresholds, and alert semantics vary by installed version; verify them against your own build. Examples below are synthetic and do not represent a live network.

**Related setup guide:** [ntopng Configuration Guide](./ntopng%20Configuration%20Guide%20-%20Home%20Lab%20Setup.md).

## 1. Establish what the monitor actually sees

A SPAN session copies traffic from selected switch ports or VLANs to a monitoring interface. It does **not** necessarily capture every packet, every path, or both directions of every conversation.

Record before investigating:

- The exact source ports/VLANs being mirrored, destination interface, and capture-time packet-drop counters.
- Whether the interface is marked as **Mirrored Traffic** in the relevant ntopng configuration.
- Which internal networks ntopng considers *local*, including IPv4 and IPv6 where applicable.
- NAT/routing boundaries and whether the same forwarded conversation may appear at several observation points.
- Collector uptime, alert retention, duplicate notification suppression, and the report window/time zone.

### Why IP@VLAN can mislead

An ntopng display such as **`192.0.2.10@123`** may describe the VLAN context **where a packet was observed**, not the physical VLAN of the device whose IP is displayed. A routed packet copied from multiple switch ports can produce distinct host records or intermediate router-MAC associations.

Do not count separate `IP@VLAN` rows as distinct devices or sum their bytes as though they were independent traffic without validated identity, direction, and de-duplication. Cross-check a purported device identity against DHCP/ARP, switch MAC tables, the routing design, and (where necessary) a small, authorized packet capture.

## 2. Use the right alert view

ntopng editions and releases present alert navigation differently. In v7-style **Alerts Explorer**, the selected category and storage view both matter:

| View | Useful for | Does **not** prove |
| --- | --- | --- |
| **Requires Attention** | Records currently awaiting user attention | That no stored historical alerts were generated |
| **Historical / Archive** | Stored alert records within a bounded window | Complete packet capture or lossless alert transport |
| **Host** | Host-level behavior (for example, Flow Flood or Unexpected Gateway, when available) | A single reconstructable network conversation |
| **Flow** | Flow-level findings with endpoints, protocols and contributing checks | That a labeled application or attack succeeded |

Choose the appropriate category, select **Historical** when checking past detections, apply the **specific alert type**, and explicitly set the start/end time. Note the time zone shown by the UI. If a check was disabled, compare **new events after the change**, not old retained events or the absence of attention-required notifications.

## 3. Evidence checklist for one representative alert

Capture one concise row and, where available, its **Actions → Info / Flow Details** panel:

1. Exact timestamp and query window; Host versus Flow and Historical versus Requires Attention.
2. Alert name, contributing checks and individual scores, not just the combined score.
3. Source and destination IPs, observed VLAN tags, ports, transport and application *labels*.
4. Client-to-server and server-to-client packets/bytes, TCP flags or response evidence when exposed.
5. Repetition pattern: unique conversations versus repeated records, and affected source population.
6. Expected device/service role and any related authorized behavior.
7. Independent corroboration: firewall allow/deny decision, DNS server logs, switch counters, endpoint logs, or a narrowly scoped packet capture.
8. Collection limitations: missing reverse direction, SPAN drops, time gaps, duplicate suppression or incomplete attribution.

Use **observed**, **consistent with**, **unverified**, and **confirmed** deliberately. An nDPI application label, geolocation category, or MITRE mapping is a classification hint—not proof of the activity it suggests.

## 4. Common alert patterns and safer interpretations

| Detector / pattern | What the alert can indicate | What to verify before escalating |
| --- | --- | --- |
| **Unexpected DNS Server** | DNS traffic aimed at a destination outside the monitor's expected-server policy | Source identity, configured resolvers, permitted diagnostics, actual firewall redirect/drop behavior and whether a reply completed |
| **Unexpected Gateway** | An unexpected gateway association in ntopng's observed host data | Real gateway inventory, MAC ownership and whether routed/SPAN duplicates create misleading host associations |
| **Flow Flood** | A host-level flow-rate heuristic exceeded its configured threshold | Actual flows/packets/bytes, capture duplication, scheduled connection bursts and independent availability impact; not automatically DDoS |
| **Probing Attempt** | A heuristic match on a connection pattern | Distinct target ports/hosts, flags, direction, persistence and response; a short refused connection alone does not establish scanning |
| **Missing SNI TLS Extension** | TLS-related flow did not expose expected SNI metadata | Client behavior, protocol identification and whether the flow is ordinary service traffic; no SNI alone is not malware |
| **Blacklisted Country** | Endpoint address classified under a configured geographic/reputation rule | Whether communication was inbound/outbound, succeeded, belongs to an expected service, and how reliable the underlying classification is |

A flow with a combined score may include several contributing checks (for example, **Probing Attempt** plus **TCP Connection Issues**). This does not represent two confirmed incidents. Likewise, a one-way 1-packet connection attempt does not demonstrate successful access.

### DNS attempts versus successful policy bypass

A detector may label a packet addressed to an external resolver even if a router later **redirects or blocks** it. Treat these as different propositions:

- **Observed:** packet addressed to an unexpected DNS destination.
- **Hypothesis:** the endpoint tried to avoid the intended resolver or a monitoring tool generated a diagnostic probe.
- **Confirmed bypass:** independent enforcement-path evidence establishes that the traffic reached and used an unauthorized resolver contrary to policy.

Do **not** mark all DNS records from a shared host as authorized merely because the host also runs the approved DNS service. The originating process/container may be unknown. A parser that separately reports `sources: {...}` and `destinations: {...}` does **not** preserve source-to-destination pairings; never invent those pairs.

If changing the expected-server list, distinguish **ntopng's detector allowlist** from the firewall's actual enforcement. Check whether a generic/global allowlist entry also suppresses detection in networks where that destination is not operationally approved. Preserve the previous list and perform a targeted readback after any operator-approved change.

## 5. Decide what to keep, tune, or disable

Prefer **retain and investigate** when an alert can still carry valuable signal. A noisy detector should be disabled only when evidence supports the trade-off and that loss is explicitly accepted.

| Decision field | Record |
| --- | --- |
| Rule / scope | Exact Host/Flow detector and applicable network or hosts |
| Evidence | Representative timestamps, observed behavior and independent sources |
| Interpretation | Confirmed facts, alternatives and remaining unknowns |
| Action | Retain, narrow scope, tune threshold, or explicitly disable |
| Detection loss | What attacks or anomalies may no longer be detected |
| Backup / rollback | Previous precise setting and how to restore it |
| Post-change verification | Historical alert window, persistence readback, other detectors and reporting continuity |

For a production policy change: verify current settings, save a sanitized backup, make **one controlled change**, validate it over a reasonable natural observation window, and revert if essential visibility is lost. Do not disable broad alert categories simply to reduce dashboard totals.

## 6. Build reports that reveal real changes

Security reporting should separate **confirmed security failures**, **unresolved investigation candidates**, **known monitored behavior**, and **evidence-quality limitations**.

- Preserve raw detector-record counts, but do not label them as distinct network flows, packets, traffic bytes, breaches or successfully completed connections.
- Compare with a **comparable multi-day baseline**, not automatically with yesterday. Mark software/configuration transitions and missing evidence.
- Treat a known noisy source as *conditionally* expected: changes in destination, protocol, persistence or observed outcome still merit review.
- Prioritize new patterns and independent corroboration over absolute score or geolocation alone.
- Report capture drops, source gaps and duplicate-notification suppression; missing data is not zero activity.
- If exact endpoint relationships are absent, state that limitation rather than synthesizing a source→destination connection from separate aggregate totals.

For example, *“several detector records match a previously observed failed-connection pattern; no successful session established in the available sample”* is defensible. *“all those records are harmless scans”* is not.

## 7. Minimal verification after changing a detector

1. Read back the changed setting in the active application.
2. Query **Historical** alerts for the rule over a bounded **post-change** window.
3. Distinguish an empty historical result from an empty Requires Attention queue.
4. Verify unrelated detectors still produce expected observations and that downstream log parsing continues.
5. State any unresolved capture/transport fidelity limitations: a working report is not proof of lossless delivery.

## Safety and privacy

Use read-only review first; avoid unapproved scans or destructive packet-capture changes. For screenshots, exports and public troubleshooting questions, remove real addresses, hostnames, VLAN mappings, internal paths, credentials, MAC addresses and user identifiers. Replace them with documentation-only examples such as `192.0.2.10`, `198.51.100.20` and `example.com`.

For general product behavior and version-specific UI options, see the [official ntopng documentation](https://www.ntop.org/guides/ntopng/).
