# D-Link DGS-1100-08V2 – Initial Access & Static IP Setup (Fedora)

Short, repeatable procedure for accessing a **factory‑reset DGS‑1100‑08V2** from **Fedora Linux** and assigning a proper static IP.


## Factory Defaults

* **Switch IP:** `10.90.90.90`
* **Subnet:** `255.0.0.0` (`/8`)
* **DHCP:** Disabled
* **Login:** `admin` / *(blank)*
* **Management VLAN:** VLAN 1


## 1. Identify Network Interface

```bash
ip -br link
```

Example:

```
enp3s0   UP
```

(Optional helper variable)

```bash
IFACE=enp3s0
```


## 2. Add Temporary IP (non‑destructive)

Adds a **secondary IP** without touching your static configuration.

```bash
sudo ip addr add 10.90.90.10/8 dev $IFACE
```

Verify:

```bash
ip addr show dev $IFACE
```


## 3. Access Web UI

Open browser:

```
http://10.90.90.90
```


## 4. Configure Proper Static IP on Switch

**Menu:** Network → IPv4 Interface

Example (adjust to your LAN):

* **IP Mode:** Static
* **IP Address:** `192.168.1.2`
* **Subnet Mask:** `255.255.255.0`
* **Gateway:** `192.168.1.1` *(optional but recommended)*
* **Management VLAN:** VLAN 1

Apply / Save configuration.


## 5. Remove Temporary IP from Fedora

```bash
sudo ip addr del 10.90.90.10/8 dev $IFACE
```


## 6. Verify Access

```bash
ping 192.168.1.2
```

Access:

```
http://192.168.1.2
```


## Notes / Warnings

* Do **not** change Management VLAN unless VLANs are already planned
* Avoid IPs inside DHCP pool
* Save config explicitly (D‑Link does not always auto‑persist)
* Change admin password after setup


## Reset Reminder

If reset is needed again, repeat **steps 1–6** exactly.
