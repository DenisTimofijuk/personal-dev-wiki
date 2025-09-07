# TrueNAS SCALE – Post-Installation Checklist (Home Use)

* **Create an admin user:** After installation, use the UI to create a non-root “admin” user and disable the default root login. Newer SCALE versions deprecate root access, so configure all permissions under an administrative user. Also set that user’s email address (in Credentials → Local Users) so TrueNAS can send system notifications to you.

* **Network setup:** Assign a fixed IP (or ensure DHCP reservation) for the SCALE server so its address doesn’t change. In **System Settings → Network → Global Configuration**, configure:

  * **Hostname:** pick a name (e.g. `truenas`).
  * **Domain:** optional, e.g. `local`.
  * **Default Gateway:** router IP (e.g. `192.168.1.1`).
  * **Nameservers:** at least one DNS server (router IP, or `1.1.1.1`, `8.8.8.8`). Without this, updates and package downloads will fail with DNS errors.
  * Then configure your NIC with a static IP under **Interfaces** (make sure it doesn’t collide with DHCP range).

  ➡️ Test connectivity in **Shell** with:

  ```bash
  ping -c 3 1.1.1.1
  ping -c 3 update.ixsystems.com
  ```

  If the first works but the second fails, DNS is misconfigured.

* **Boot device and logs:** If your OS is on a small USB stick or old SSD, minimize its wear by moving logs and app data to the pool. Under **System Settings → Advanced** enable “System Dataset Pool” and point it to your data pool, and enable “Use System Dataset” for syslog. Backup config: also immediately download the system configuration file (**System Settings → General → Manage Configuration → Download**) and keep it safe. That way you can restore all settings if you ever reinstall SCALE.

* **Check for updates:** Go to **System → Updates** and install any pending patches. Before major upgrades, save a new boot environment and back up your config. TrueNAS will even prompt you when new releases are available.

## Storage and Datasets

* **Verify your pool:** Make sure your 2‑disk mirror is ONLINE and healthy (see Storage → Disks/Pool). By default ZFS compression (LZ4) is enabled, which is good. If you want, you can enable deduplication or encryption on new datasets, but for media storage these are optional. Plan your datasets now: e.g. create separate datasets for Media, Photos, Backups, etc.
* **Dataset settings:** For each dataset, consider setting share-friendly ACLs. In a home environment it’s common to use POSIX (UNIX) ACL mode so permissions are simple. For example, after creating datasets you can set ACL Mode: POSIX (Open) on each, which effectively allows any authenticated user to read/write (often fine for family use).
* **Shares**: Enable and configure the file-sharing service you need. For mixed Windows/Mac home networks, turn on SMB (the SMB service) and create SMB shares for each dataset (via Shares → Windows (SMB)). Linux clients can use Shares → UNIX (NFS) if desired.
* **Pool health tasks**: ZFS needs periodic scans. SCALE creates a default scrub task that runs weekly by default. A scrub scans all data for corruption. This is important: it will detect silent bit-rot and ensure redundancy.
* **SMART tests**: Enable S.M.A.R.T. monitoring on each disk and schedule tests under **Data Protection → S.M.A.R.T. Tests** (short weekly, long monthly). Avoid scheduling them at the same time as a scrub.

## Data Protection

* **Snapshots**: Use ZFS snapshots to protect your data. Add a task under **Data Protection → Periodic Snapshot Tasks**. Snapshots are quick, incremental “point-in-time” views. For home media, you might snapshot your media and documents daily (or every few hours during the day) and keep a rolling window (e.g. keep hourly for 24h, daily for a week, weekly for a month). The exact scheme depends on your needs, but even a daily snapshot with 30‑day retention can recover deleted or changed files. (Snapshots do not duplicate all data – if nothing changed it uses zero extra space.)
* **Replication/Backups**: Consider off-site backups. Use **Replication Tasks** to another NAS, or **Cloud Sync Tasks** for S3/Google Drive/Backblaze, etc.

## File Sharing & Services

* **SMB/NFS Service**: In **System Settings → Services**, enable SMB (and/or NFS if needed). Configure SMB shares for Windows/macOS clients. Click the pencil to edit SMB settings (most defaults are fine for home). Similarly enable SSH if you want command-line access. You can optionally enable SNMP for monitoring, or the Rsync service if you need rsync modules (e.g. for one-way file transfers). After enabling, make sure to start the service.
* **UPS (if available)**: If your server is on a UPS, enable the UPS service in Services. Configure it with your UPS type and USB path.
* **Time and Update Checks**: Ensure NTP is working so the clock stays accurate. Regularly check **System → Updates**.

## Certificates

* **Create an Internal Certificate Authority (CA):** (Credentials → Certificates → Certificate Authorities → Add). Use RSA, 2048/4096 bits, SHA256, 10 years validity.
* **Create an Internal Certificate:** (Credentials → Certificates → Certificates → Add). Sign it with your CA, set CN to your NAS hostname/IP, add SANs. Key Usage: digitalSignature, keyEncipherment. Extended Usage: TLS Web Server Authentication.
* **Apply it:**

  * **System → General → GUI SSL Certificate:** choose your cert for HTTPS.
  * **System Settings → Services → FTP → TLS:** enable TLS and select your cert for FTPS.
* Import the CA into your client devices to stop browser warnings.

## Apps, Containers and Remote Access

TrueNAS SCALE’s biggest advantage is built-in container orchestration:

* **Add App catalogs** (e.g. TrueCharts).
* **Adjust app settings**: disable Host Path Safety if you want apps to mount SMB datasets.
* **Install apps:** e.g. Jellyfin, Tailscale, Nextcloud.

## Alerts, Email and Monitoring

* **Email for system alerts:** Configure under **System Settings → General → Email**.
* **Alert service**: Add an Email alert service, send a test alert.
* **Dashboard and logs**: Monitor health and alerts regularly.

## Ongoing Maintenance

* **Regular tasks**: Verify scrubs and snapshots run.
* **Software updates**: Before updates, back up config and create a new boot environment.
* **Backups of config**: Save config after significant changes.
* **Future considerations**: Add drives, replication, UPS testing.

Following these steps will give you a solid, maintainable TrueNAS SCALE home server with proper network/DNS setup, working certificates for encrypted access, and reliable data protection.
