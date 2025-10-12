# Useful Fedora Linux Commands

A comprehensive guide to essential commands for managing your Fedora Linux system.


## Network Share Management

### Mounting SMB/CIFS Shares

**Install required packages:**
```bash
sudo dnf install cifs-utils
```

**Create a mount point:**
```bash
sudo mkdir -p /mnt/share
```

**Mount SMB share temporarily:**
```bash
sudo mount -t cifs //SERVER_IP/share_name /mnt/share -o username=USERNAME
```

**Mount with additional options:**
```bash
sudo mount -t cifs //SERVER_IP/share_name /mnt/share -o username=USERNAME,uid=1000,gid=1000,file_mode=0755,dir_mode=0755
```

**Mount guest share (no authentication):**
```bash
sudo mount -t cifs //SERVER_IP/share_name /mnt/share -o guest,uid=1000,gid=1000
```

**Unmount a share:**
```bash
sudo umount /mnt/share
```

**Permanent mount (add to /etc/fstab):**
```
//SERVER_IP/share_name /mnt/share cifs credentials=/home/USER/.smbcredentials,uid=1000,gid=1000 0 0
```

Create credentials file `~/.smbcredentials`:
```
username=YOUR_USERNAME
password=YOUR_PASSWORD
```

Set proper permissions:
```bash
chmod 600 ~/.smbcredentials
```

### Mounting NFS Shares

**Install NFS utilities:**
```bash
sudo dnf install nfs-utils
```

**Mount NFS share:**
```bash
sudo mount -t nfs SERVER_IP:/export/path /mnt/nfs
```



## File Search and Management

### Finding Files with `find`

**List all files in a directory:**
```bash
find /mnt/movies -type f
```

**Save file list to text file:**
```bash
find /mnt/movies -type f > file_list.txt
```

**List files with detailed information:**
```bash
find /mnt/movies -type f -ls
```

**Find specific file types (videos):**
```bash
find /mnt/movies -type f \( -name "*.mp4" -o -name "*.mkv" -o -name "*.avi" \)
```

**Find files by name pattern:**
```bash
find /path -name "pattern*"
find /path -iname "pattern*"  # Case-insensitive
```

**Find files larger than a specific size:**
```bash
find /path -type f -size +1G  # Files larger than 1GB
find /path -type f -size -100M  # Files smaller than 100MB
```

**Find files modified in the last N days:**
```bash
find /path -type f -mtime -7  # Modified in last 7 days
find /path -type f -mtime +30  # Modified more than 30 days ago
```

**Find and execute commands on results:**
```bash
find /path -type f -name "*.log" -exec rm {} \;  # Delete log files
find /path -type f -name "*.txt" -exec wc -l {} \;  # Count lines in text files
```

**Find empty files and directories:**
```bash
find /path -type f -empty  # Empty files
find /path -type d -empty  # Empty directories
```

**Find files by permissions:**
```bash
find /path -type f -perm 0777  # World-writable files
find /path -type f -perm /u+x  # Executable by owner
```

**Count files in directory:**
```bash
find /path -type f | wc -l
```

**Find duplicate files by size:**
```bash
find /path -type f -printf "%s %p\n" | sort -n
```

### Using `locate` (faster alternative)

**Update database:**
```bash
sudo updatedb
```

**Search for files:**
```bash
locate filename
locate -i filename  # Case-insensitive
```

### Using `grep` for content search

**Search for text in files:**
```bash
grep -r "search_term" /path  # Recursive search
grep -ri "search_term" /path  # Case-insensitive
grep -rn "search_term" /path  # Show line numbers
grep -rl "search_term" /path  # Show only filenames
```



## System Package Management

### DNF Package Manager

**Update system:**
```bash
sudo dnf update
sudo dnf upgrade  # Same as update
```

**Search for packages:**
```bash
dnf search package_name
```

**Install packages:**
```bash
sudo dnf install package_name
sudo dnf install package1 package2 package3
```

**Remove packages:**
```bash
sudo dnf remove package_name
sudo dnf autoremove  # Remove unused dependencies
```

**List installed packages:**
```bash
dnf list installed
dnf list installed | grep package_name
```

**Show package information:**
```bash
dnf info package_name
```

**Check for available updates:**
```bash
dnf check-update
```

**Clean package cache:**
```bash
sudo dnf clean all
```

**List repositories:**
```bash
dnf repolist
```

**Enable/disable repositories:**
```bash
sudo dnf config-manager --set-enabled repo_name
sudo dnf config-manager --set-disabled repo_name
```



## System Information

**System version:**
```bash
cat /etc/fedora-release
hostnamectl
```

**Kernel version:**
```bash
uname -r
uname -a  # All system information
```

**CPU information:**
```bash
lscpu
cat /proc/cpuinfo
```

**Memory information:**
```bash
free -h
cat /proc/meminfo
```

**Disk usage:**
```bash
df -h  # Human-readable format
df -h /  # Specific partition
```

**Directory size:**
```bash
du -sh /path/to/directory
du -h --max-depth=1 /path  # Subdirectories size
```

**System uptime:**
```bash
uptime
```

**Logged in users:**
```bash
who
w  # More detailed information
```

**Hardware information:**
```bash
lshw  # Requires sudo
lspci  # PCI devices
lsusb  # USB devices
```



## File Operations

**Copy files:**
```bash
cp source destination
cp -r source_dir dest_dir  # Recursive (directories)
cp -p source dest  # Preserve attributes
```

**Move/rename files:**
```bash
mv source destination
```

**Remove files:**
```bash
rm file
rm -r directory  # Recursive
rm -rf directory  # Force recursive (use carefully!)
```

**Create directories:**
```bash
mkdir directory_name
mkdir -p parent/child/grandchild  # Create parent directories
```

**Create empty file:**
```bash
touch filename
```

**Change permissions:**
```bash
chmod 755 file  # rwxr-xr-x
chmod +x script.sh  # Add execute permission
chmod -R 644 directory  # Recursive
```

**Change ownership:**
```bash
sudo chown user:group file
sudo chown -R user:group directory
```

**Create symbolic link:**
```bash
ln -s /path/to/original /path/to/link
```

**Archive and compress:**
```bash
tar -czf archive.tar.gz /path/to/directory  # Create gzip archive
tar -xzf archive.tar.gz  # Extract gzip archive
tar -cjf archive.tar.bz2 /path/to/directory  # Create bzip2 archive
tar -xjf archive.tar.bz2  # Extract bzip2 archive
```

**Zip operations:**
```bash
zip -r archive.zip directory
unzip archive.zip
```



## Process Management

**List running processes:**
```bash
ps aux
ps aux | grep process_name
```

**Real-time process viewer:**
```bash
top
htop  # Better alternative (may need to install)
```

**Kill processes:**
```bash
kill PID
kill -9 PID  # Force kill
killall process_name  # Kill by name
pkill process_name  # Kill by pattern
```

**Background and foreground jobs:**
```bash
command &  # Run in background
jobs  # List background jobs
fg %1  # Bring job 1 to foreground
bg %1  # Resume job 1 in background
```

**System resource usage:**
```bash
vmstat  # Virtual memory statistics
iostat  # I/O statistics
```



## Network Commands

**Network interfaces:**
```bash
ip addr show
ip link show
nmcli device status  # NetworkManager
```

**Test connectivity:**
```bash
ping hostname
ping -c 4 hostname  # Send only 4 packets
```

**DNS lookup:**
```bash
nslookup domain.com
dig domain.com
host domain.com
```

**Network connections:**
```bash
ss -tuln  # All listening TCP/UDP ports
ss -tunap  # All connections with process info
netstat -tuln  # Alternative (older command)
```

**Download files:**
```bash
wget URL
curl -O URL  # Save with original filename
curl -o filename URL  # Save with custom filename
```

**Check open ports:**
```bash
sudo ss -tulpn
sudo netstat -tulpn
```

**Firewall management:**
```bash
sudo firewall-cmd --list-all  # List all rules
sudo firewall-cmd --add-port=8080/tcp --permanent  # Open port
sudo firewall-cmd --reload  # Apply changes
```



## Disk Management

**List block devices:**
```bash
lsblk
lsblk -f  # Include filesystem type
```

**Partition information:**
```bash
sudo fdisk -l
sudo parted -l
```

**Mount/unmount:**
```bash
sudo mount /dev/sdX1 /mnt/mountpoint
sudo umount /mnt/mountpoint
```

**Check filesystem:**
```bash
sudo fsck /dev/sdX1  # Filesystem check (unmounted only!)
```

**Format filesystem:**
```bash
sudo mkfs.ext4 /dev/sdX1  # Format as ext4
sudo mkfs.xfs /dev/sdX1  # Format as XFS
```

**Disk usage by directory:**
```bash
ncdu /path  # Interactive disk usage analyzer (may need to install)
```



## Additional Useful Commands

**System logs:**
```bash
journalctl  # View systemd logs
journalctl -f  # Follow logs in real-time
journalctl -u service_name  # Logs for specific service
journalctl --since "1 hour ago"
```

**Service management:**
```bash
sudo systemctl start service_name
sudo systemctl stop service_name
sudo systemctl restart service_name
sudo systemctl status service_name
sudo systemctl enable service_name  # Start on boot
sudo systemctl disable service_name
```

**Text file viewing:**
```bash
cat file  # View entire file
less file  # Paginated view
head -n 20 file  # First 20 lines
tail -n 20 file  # Last 20 lines
tail -f file  # Follow file updates
```

**Command history:**
```bash
history  # Show command history
history | grep search_term
!123  # Execute command number 123
!!  # Execute last command
```

**Screen/Tmux (terminal multiplexer):**
```bash
screen  # Start new session
screen -ls  # List sessions
screen -r  # Reattach to session
# Ctrl+A, D to detach
```



## Tips and Tricks

- Use `Tab` for command and filename auto-completion
- Use `Ctrl+R` to search command history
- Use `Ctrl+C` to cancel current command
- Use `man command_name` to view manual pages
- Use `command --help` for quick command help
- Use `alias` to create command shortcuts: `alias ll='ls -la'`
- Add frequently used aliases to `~/.bashrc` or `~/.bash_aliases`
