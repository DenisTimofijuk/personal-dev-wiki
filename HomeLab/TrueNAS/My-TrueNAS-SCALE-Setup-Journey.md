# 📓 My TrueNAS SCALE Setup Journey

System:  
- OS: TrueNAS SCALE 25.04.2.1  
- Hardware: AMD A6-3500 APU, 23 GiB RAM  
- Pool: 2-disk mirror (7.28 TiB usable)  

Goal: Media storage, documents, apps (Jellyfin, Tailscale, custom Docker), FTP for IP cameras.


## 🟢 Step 1: Fresh Install & Basic Settings
- Installed TrueNAS SCALE.  
- Created a **non-root admin user** (disabled root login).  
- Set **hostname, static IP, DNS, timezone**.  
- Added **email address** for alerts.  
- Downloaded a copy of the **system configuration backup**.  


## 🟢 Step 2: Storage Pool & Datasets
- Created pool with **mirror (2 disks, 7.28 TiB)**.  
- Made separate datasets:  
  - `Media` (movies, shows)  
  - `Documents` (personal files)  
  - `Backups` (system backups, snapshots)  
  - `CamRecordings` (for cameras)  
- Left **compression (lz4)** on.  
- Scheduled **scrub tasks** (monthly).  
- Added **SMART tests** (short weekly, long monthly).  


## 🟢 Step 3: Alerts & Monitoring
- Configured **email alerts** (*System → General → Email*).  
- Added alert service and tested mail.  
- Made sure **system dataset is stored on the pool**, not boot drive.  
- Checked **Dashboard & Reporting** for system stats.  


## 🟢 Step 4: Apps Setup
- Added **TrueCharts catalog**:  
  - `https://github.com/truecharts/catalog`  
- Changed app settings:  
  - Enabled *Host Network*  
  - Disabled *Host Path Safety Checks*  
- Installed first apps:  
  - **Jellyfin** → media dataset  
  - **Tailscale** → remote access without port forwarding  
  - Plan: custom apps with Docker later  


## 🟢 Step 5: Backup Strategy
- Configured **ZFS snapshots**:  
  - Daily snapshots, 30 days retention.  
- (Optional in future) Replication to another NAS.  
- (Optional in future) Cloud sync (Google Drive, S3, B2).  


## 🟢 Step 6: FTP for Security Cameras
### Create User
- Made user `cameraftp`, home directory `/mnt/PoolName/CamRecordings`.  
- Disabled SMB user flag (not needed).  
- Shell: `nologin`.  

### Dataset Permissions
- Dataset = `CamRecordings`.  
- Used preset ACL = **POSIX_HOME**.  
- Set **Owner (User)** = `cameraftp`.  

### Enable FTP
- Went to *Services → FTP → Configure*.  
  - Enabled **local user login**.  
  - Chroot = enabled (restricts cameras to their folder).  
  - TLS = planned with certificate (see below).  
- Cameras log in via:  
  - Server: `192.168.1.146`  
  - Port: `21`  
  - User/pass: `cameraftp`  


## 🟢 Step 7: Manage Camera Storage
- Cameras save in structure `/Reolink/YYYY/MM/DD`.  
- Dataset size reserved: **1 TiB**.  

### Automatic Cleanup
Cron job (daily, 03:00) to delete recordings older than 7 days:  
```bash
find /mnt/PoolName/CamRecordings/Reolink/ -type d -mtime +7 -exec rm -rf {} +
```

* Tested first with `-print` before enabling.
* Added **dataset quota** of 1 TiB to stop overflow into other data.


## 🟢 Step 8: Certificates & Secure Access

Wanted **HTTPS** for TrueNAS UI and **FTPS** for cameras.

### RSA vs ECC

* RSA = widely supported, best for compatibility.
* ECC = faster, but not supported everywhere.
* ✅ Chose **RSA** for home use.

### Create Internal Certificate

* *System → Certificates → Add → Internal Certificate*

  * Type: RSA
  * Name: `truenas-local-cert`
  * Validity: 10 years

### Apply Certificate

* *System → General → GUI SSL Certificate* = `truenas-local-cert`.
* *Services → FTP → TLS Certificate* = `truenas-local-cert`.

Now:

* Access web UI via `https://192.168.1.146/` (browser shows self-signed warning).
* FTP client (FileZilla) can use FTPS for encryption.


## 🟢 Step 9: Future Ideas

* Explore more apps (Nextcloud, Photoprism).
* Set up **remote replication** or **cloud sync**.
* Maybe move cameras to **SMB/NFS share** later (if supported).
* If I get a domain: use **Let’s Encrypt** for trusted HTTPS.


## 📌 Current Status

* NAS is storing media & documents.
* Jellyfin running.
* Tailscale working for external access.
* Cameras successfully recording via FTP, with auto-cleanup.
* Web UI & FTP now secured with self-signed certificate.

🎉 Fully functional home TrueNAS server for hobbyist use!