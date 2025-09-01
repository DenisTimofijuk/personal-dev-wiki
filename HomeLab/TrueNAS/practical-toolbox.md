A **practical toolbox** of commands that cover the most common maintenance tasks on a TrueNAS Scale box (Debian Linux + ZFS).

---

## 🔍 System Monitoring

```bash
uptime               # Show how long system is running, and load average
htop                 # Interactive CPU, RAM, process monitor (install if missing)
top                  # Similar to htop but preinstalled
free -h              # Show memory usage
df -h                # Disk usage (human-readable)
du -sh /mnt/*        # Show dataset/folder sizes under /mnt
```

---

## 🗄️ Storage / ZFS

```bash
/sbin/zpool list                     # List pools, size, health
/sbin/zpool status                   # Check pool health, errors
/sbin/zpool scrub Pool_A              # Start scrub (replace Pool_A with your pool name)
/sbin/zpool status Pool_A             # Check progress of scrub
/sbin/zfs list                       # List datasets
/sbin/zfs get compression Pool_A     # Check compression setting
```

---

## ⚙️ Services

```bash
systemctl status ssh                  # Check SSH service status
systemctl status nfs-kernel-server    # Check NFS service (if used)
systemctl restart smb                 # Restart SMB/CIFS shares
systemctl list-units --type=service   # List running services
journalctl -xe                        # Show recent logs (errors)
journalctl --since "2025-09-01 17:18:00" --until "2025-09-01 18:00:00" # Show logs in time frame (errors)
```

---

## 👥 Users & Permissions

```bash
id                                   # Show groups of current user
groups                               # Same, shorter
who                                  # Who is logged in via SSH
last                                 # Last logins
```

---

## 🌐 Network

```bash
ip a                                 # Show all network interfaces and IPs
ping 8.8.8.8                         # Test internet connectivity
ss -tulpn                            # Show open ports and listening services
```

---

## 📂 File Management

```bash
ls -lh /mnt/                         # List datasets with sizes
cd /mnt/Pool_A/share                 # Navigate to share
cp file1 file2                       # Copy
mv file1 file2                       # Move/rename
rm file1                             # Delete (⚠ careful!)
nano filename.txt                    # Edit file (if nano installed)
```

---

## 🧹 Housekeeping

```bash
reboot                               # Reboot server
shutdown now                         # Shutdown immediately
sudo apt update && sudo apt upgrade  # Update system (if you enable sudo)
```

---

## 🚀 Pro-Tips for Mobile SSH

* **Aliases** → create shortcuts in `~/.bashrc`, e.g.

  ```bash
  alias zpools="/sbin/zpool list && /sbin/zpool status"
  alias mem="free -h && df -h"
  ```

  Then just type `zpools` or `mem`.

* **tmux** → Install and use `tmux` so if your phone disconnects, sessions persist.

* **Termux (Android app)** → You can even script commands from your phone.