# TrueNAS SCALE – Common Troubleshooting Guide

## 🔹 Network & DNS Issues

**Symptom:** Updates fail with error:

```
Cannot connect to host update.ixsystems.com:443 ssl:default [Temporary failure in name resolution]
```

**Cause:** DNS not configured when using static IP.

**Fix:**

1. Go to **System Settings → Network → Global Configuration**.
2. Set:

   * **Default Gateway** = your router IP (e.g. `192.168.1.1`).
   * **Nameservers** = router IP or public DNS (e.g. `1.1.1.1`, `8.8.8.8`).
3. Save, then test in **Shell**:

   ```bash
   ping -c 3 1.1.1.1
   ping -c 3 update.ixsystems.com
   ```

   * If IP works but domain fails → DNS misconfigured.
   * If neither works → check gateway/router.

---

## 🔹 Certificate Warnings in Browser

**Symptom:** Browser shows *Not Secure* or *Untrusted Certificate*.

**Cause:** Using self-signed/internal cert not trusted by default.

**Fix:**

* Export your **Internal CA certificate** from **Credentials → Certificates → Certificate Authorities**.
* Import it into your client PC/phone trust store.
* After import, certificates signed by this CA will be trusted locally.

---

## 🔹 FTP over TLS (FTPS) Fails

**Symptom:** FTP client cannot connect with TLS.

**Cause:** TLS not enabled or certificate not applied.

**Fix:**

1. Go to **System Settings → Services → FTP**.
2. Enable **TLS** and select your Internal Certificate.
3. In your FTP client (e.g. FileZilla), select **Require Explicit FTP over TLS**.

---

## 🔹 SMB/NFS Not Using Certificates

**Symptom:** Expectation that SMB/NFS will use TLS certificates.

**Note:** SMB/NFS in TrueNAS do not use SSL certs. For encryption:

* **SMB:** Enable SMB encryption in share settings.
* **NFS:** Use Kerberos if advanced security is required.

---

## 🔹 Lost Web UI Access After Network Change

**Symptom:** Cannot access TrueNAS Web UI after changing network settings.

**Fix:**

* Connect via console (direct monitor/keyboard or IPMI).
* Reset network interface or set DHCP temporarily.
* Re-apply correct static IP, gateway, and DNS.

---

## 🔹 Disk or Pool Issues

**Symptom:** Pool shows as *Degraded* or a disk reports errors.

**Fix:**

1. Check alerts in the dashboard for details.
2. Go to **Storage → Pools → Status** to see which disk is affected.
3. If a disk has failed:

   * Replace the disk physically.
   * In the UI, select the failed disk and choose **Replace**.
   * Pick the new disk from the list.
   * ZFS will begin a resilver (rebuild) process.
4. Monitor resilver progress in the **Tasks** panel or Pool status.
5. After completion, the pool should return to *Healthy*.

**Tip:** Always run regular **scrubs** and **SMART tests** so you detect failing disks early.
