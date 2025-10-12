# VLAN Management on HP E3500yl-48G (via Web UI)

This guide covers basic VLAN creation, assignment, and deletion using the HP E3500yl-48G switch web interface.



## 🟢 Creating a VLAN
1. Log in to the switch web UI.
2. Navigate to **VLAN Configuration**.
3. Click **Add VLAN**.
   - **VLAN ID**: Choose an unused ID (e.g., `20`).
   - **VLAN Name**: Optional label.
   - Leave **Management VLAN** unchecked (unless you intend to manage the switch via this VLAN).
4. Click **Apply**.



## 🟡 Assigning Ports to a VLAN
- Ports can be in multiple VLANs (tagged), but only **untagged in one VLAN**.
- Rules:
  - **Untagged** → Device does not support VLAN tagging (PCs, routers, cameras).
  - **Tagged** → Trunk link to another switch or VLAN-aware device (e.g., managed switch, hypervisor).
  - **No** → Port is not part of this VLAN.
  - **Forbid** → Explicitly blocks this VLAN from the port.

### Example: Isolate a router on VLAN 20
1. Add **port 44** as **Untagged** in VLAN 20.
   - This removes it from VLAN 1 automatically.
2. If needed, add **port 15** as **Tagged** in VLAN 20 for trunking.
3. Apply changes.



## 🔴 Deleting a VLAN
A VLAN cannot be deleted while any port is assigned to it.

### Steps to delete VLAN 20:
1. Go to **VLAN 1** (default VLAN).
2. Re-assign any **untagged ports** from VLAN 20 back to VLAN 1.
   - Example: Set **port 44** as **Untagged** in VLAN 1.
3. Go to **VLAN 20** and set all ports to **No** (remove Tagged/Untagged members).
4. Once no ports remain in VLAN 20, delete VLAN 20 from the VLAN list.



## ⚠️ Best Practices
- **Do not remove VLAN 1 untagged membership from your management port** (you’ll lose access to the web UI).
- Keep a **console cable** handy for recovery if VLAN misconfiguration locks you out.
- Use **Tagged VLANs** only for uplinks or devices that explicitly support VLAN tagging.


