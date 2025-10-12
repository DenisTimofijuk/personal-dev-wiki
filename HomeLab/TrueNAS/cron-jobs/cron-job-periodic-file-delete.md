# Automated storage cleanup 

House security cameras *will* flood the dataset fast. With TrueNAS SCALE, you can automate cleanup so you never run out of space.

Since your cameras create a structure like:

```
/mnt/PoolName/CamRecordings/Reolink/YYYY/MM/DD
```

…the best method is a **Periodic Task (Cron Job)** that deletes files/folders older than a set number of days.



## 🔹 Step 1: Decide retention

Let’s say you want to keep **7 days** of recordings.
That means:

* Anything older than 7 days → auto-delete.
* New data always has space.

You can adjust (e.g. 14 or 30 days) depending on your disk size.



## 🔹 Step 2: Create a script

We’ll use the `find` command, which is perfect for this.
Example command (delete files older than 7 days):

```bash
find /mnt/PoolName/CamRecordings/Reolink/ -type d -mtime +7 -exec rm -rf {} +
```

Explanation:

* `-type d` → match directories
* `-mtime +7` → modified more than 7 days ago
* `-exec rm -rf {} +` → delete them

⚠️ Careful with this — it will permanently delete old dirs. Test with `-print` first instead of `-exec rm -rf` to see what would be deleted.



## 🔹 Step 3: Add as a Cron Job in SCALE

1. Go to **System Settings → Advanced → Cron Jobs → Add**
2. Fill in:

   * **Description**: `Delete old camera recordings`
   * **User**: `root` (so it can delete all dirs)
   * **Command**:

     ```bash
     find /mnt/PoolName/CamRecordings/Reolink/ -type d -mtime +7 -exec rm -rf {} +
     ```
   * **Schedule**: e.g. daily at 03:00 (when cameras record less).

     * Cron format: `0 3 * * *`
   * **Enabled**: ✅
3. Save.



## 🔹 Step 4: Test before enabling delete

Run once in "dry-run" mode:

```bash
find /mnt/PoolName/CamRecordings/Reolink/ -type d -mtime +7 -print
```

This just lists what would be deleted. If it looks correct → enable the real job.



## 🔹 Step 5: Optional — Use Quota as Backup Safety

Since you already allocated 1 TiB for this dataset, you can set a **dataset quota**:

* Go to **Storage → Datasets → CamRecordings → Edit Options**
* Set **Quota** = 1 TiB.

This ensures camera data won’t overflow into your other datasets.



✅ With this setup:

* Dataset is capped at 1 TiB.
* Files older than X days get purged nightly.
* Cameras never stop recording due to “disk full”.