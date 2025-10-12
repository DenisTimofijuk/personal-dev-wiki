# Network Testing with `iperf3`

This guide explains how we used `iperf3` to debug home network issues (TrueNAS server, Fedora PC, Wi-Fi clients, and projector). It includes setup, commands, and how to interpret the results.



## 1. Introduction

`iperf3` is a professional network testing tool used to measure:

* **Throughput** (bandwidth in Mbit/s or Gbit/s)
* **Packet loss** (important for UDP tests)
* **Jitter** (latency variation, critical for streaming/VoIP)
* **Retransmissions** (for TCP tests, a sign of packet loss or congestion)

We used `iperf3` to compare:

* **Wired backbone (Fedora PC ↔ TrueNAS)**
* **Wireless clients (S24 smartphone, projector)**
* **Effects of extender vs direct Wi-Fi connection**



## 2. Setup

### On the **TrueNAS server**

Install and start `iperf3` in **server mode**:

```bash
iperf3 -s
```

By default, it listens on port **5201**.

### On the **Fedora PC (wired client)**

No extra setup is required. Ensure it can reach the TrueNAS server over the LAN.

### On **Wi-Fi devices (S24, projector)**

* **Android (S24):** Install [Magic iPerf app](https://play.google.com/store/apps/details?id=tech.misfitlabs.iperf) or \[Termux] and run the same commands.
* **Projector (if no native shell):** Not always possible. Instead, test using smartphone on the same Wi-Fi segment.



## 3. Commands Used

### 3.1 TCP Test (Throughput & Retransmits)

From Fedora PC → TrueNAS:

```bash
iperf3 -c 192.168.1.244
```

Reverse direction (TrueNAS → PC):

```bash
iperf3 -c 192.168.1.244 -R
```

**We looked at:**

* **Bitrate (Mbits/sec):** Should approach maximum link speed (≈940 Mbps for gigabit Ethernet).
* **Retr:** Retransmissions should be `0` (any >0 means packet loss/congestion).



### 3.2 UDP Test (Packet Loss & Jitter)

From Fedora PC → TrueNAS (simulate streaming at 100 Mbps):

```bash
iperf3 -c 192.168.1.244 -u -b 100M -t 30 --get-server-output
```

Reverse direction (server sends):

```bash
iperf3 -c 192.168.1.244 -u -b 100M -t 30 -R --get-server-output
```

**We looked at:**

* **Bitrate:** Should stay near the target (100 Mbit/s in this case).
* **Lost/Total Datagrams:** Shows actual packet loss (0% is excellent).
* **Jitter (ms):** Should stay <5 ms on Wi-Fi, <1 ms on wired.



### 3.3 Varying Bandwidths

To simulate different types of traffic:

```bash
iperf3 -c 192.168.1.244 -u -b 20M -t 30 --get-server-output   # Light streaming
iperf3 -c 192.168.1.244 -u -b 50M -t 30 --get-server-output   # HD video
iperf3 -c 192.168.1.244 -u -b 100M -t 30 --get-server-output  # Heavy use
iperf3 -c 192.168.1.244 -u -b 300M -t 30 --get-server-output  # Stress test
```



### 3.4 Small Packet Test (SMB-like load)

Since SMB uses many small packets, we tested with smaller datagram size:

```bash
iperf3 -c 192.168.1.244 -u -b 30M -l 512 -t 30 --get-server-output
```



## 4. How to Interpret Results

### Example: Wired TCP (Fedora PC → TrueNAS)

```
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-10.00  sec  1.10 GBytes   943 Mbits/sec    0
```

✅ \~940 Mbps throughput, **0 retransmits** = wired link perfect.



### Example: Wired UDP (Fedora PC → TrueNAS)

```
[ ID] Interval           Transfer     Bitrate         Jitter    Lost/Total Datagrams
[  5]   0.00-30.00  sec   358 MBytes   100 Mbits/sec  0.010 ms  0/258987 (0%)
```

✅ Zero packet loss, near-zero jitter → excellent for streaming.



### Example: Wi-Fi Client

```
[ ID]   0.00-30.00  sec   180 MBytes   50 Mbits/sec  3.2 ms  250/258000 (0.1%)
```

⚠️ Throughput capped at 50 Mbps, jitter >3 ms, packet loss 0.1% → wireless bottleneck.



## 5. What We Discovered

* **Fedora PC ↔ TrueNAS (wired):** Stable \~940 Mbps, 0 loss, 0 retransmits. Backbone is solid.
* **Wi-Fi client (S24):** Inconsistent throughput (20–300 Mbps), occasional loss. Extender likely weak point.
* **SMB issues:** SMB over Wi-Fi stutters with packet loss, while Jellyfin/YouTube tolerate it thanks to buffering.



## 6. Troubleshooting Workflow

1. **Baseline wired test**: confirm server ↔ PC link is stable.
2. **Wi-Fi UDP test**: measure packet loss & jitter on wireless devices.
3. **Test extender vs direct AP**: bypass extender and rerun tests.
4. **Check channel interference**: use Wi-Fi analyzer app, adjust router channel.
5. **Simulate load**: test different bandwidths and packet sizes.
6. **Document results**: save iperf3 logs for later comparison.



✅ With this approach, you can quickly pinpoint whether network issues come from backbone, Wi-Fi, or client devices.
