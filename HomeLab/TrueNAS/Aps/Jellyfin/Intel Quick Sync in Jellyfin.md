# Enabling Intel Quick Sync (QSV) in Jellyfin on TrueNAS SCALE

This guide explains how to enable **Intel Quick Sync hardware acceleration** for Jellyfin on **TrueNAS SCALE 2025**, using an Intel CPU with an integrated GPU (e.g., i5-7400, Intel HD 630).  

With QSV enabled, video transcoding is offloaded to the iGPU, reducing CPU usage drastically (from ~50% to ~5% in testing).

---

## 🖥️ System Setup
- **Hardware:** Lenovo PC with Intel i5-7400 (Intel HD Graphics 630, no dedicated GPU)  
- **OS:** TrueNAS SCALE 2025  
- **App:** Official Jellyfin app from the TrueNAS SCALE catalog  
- **Clients tested:**  
  - Web browser (forces transcoding)  
  - SMB share (direct play)  
  - Android TV app  

---

## ⚙️ Step 1. Verify GPU device on host

Run on TrueNAS host:

```bash
ls -l /dev/dri/
````

Expected output:

```
/dev/dri/card0
/dev/dri/renderD128
```

* `card0` → control device
* `renderD128` → **render node used by applications (Jellyfin/ffmpeg)**

Check GPU type:

```bash
lspci | grep VGA
```

Expected output (for i5-7400):

```
00:02.0 VGA compatible controller: Intel Corporation HD Graphics 630 (rev 04)
```

---

## ⚙️ Step 2. Configure Jellyfin App in TrueNAS SCALE

1. Go to **Apps → Installed Applications → Jellyfin → Edit**.
2. In **Resources → GPU**, assign **1 GPU** (Intel iGPU). In newer SCALE versions this may appear as “Passthrough available (non-NVIDIA) GPU”.

   * This ensures `/dev/dri` is passed into the container.
3. Save & redeploy the app.

---

## ⚙️ Step 3. Enable Quick Sync in Jellyfin

Inside Jellyfin Web UI:

1. Go to **Dashboard → Playback → Transcoding**.
2. Set **Hardware Acceleration** = **Intel Quick Sync (QSV)**.
3. Set **Device** = `/dev/dri/renderD128`.
4. Enable hardware decoding for supported codecs:

   * H.264, H.265/HEVC, MPEG-2, VP8, VP9.
5. Save settings and restart Jellyfin.

---

## 🐛 Step 4. Common Issues & Debugging

### ❌ Problem: CPU stays high (\~45–50%) in Web client

* **Cause:** Jellyfin was still using software transcoding (`libx264`).
* **Fix:** Ensure **QSV device** is set to `/dev/dri/renderD128`.

### ❌ Problem: Logs empty or unclear

* Jellyfin’s **container logs** may reset or look empty.
* Play a video and watch **CPU usage**:

  * If \~50% → still CPU software transcoding.
  * If \~2–8% → QSV hardware transcoding active. ✅

### 🔍 How to confirm QSV usage

1. **Jellyfin Logs**
   Look for lines like:

   ```
   ffmpeg: Using hardware accelerated decode with vaapi
   ffmpeg: Using hardware accelerated encode with h264_qsv
   ```

   If you see `libx264` → software only.

2. **Active Session Info (if available)**

   * In **Dashboard → Playback → Active Sessions**, click your stream.
   * Should show `h264_qsv` under transcoding info.

3. **Inside the container**

   ```bash
   kubectl exec -it deploy/jellyfin -- bash
   ls -l /dev/dri/
   ```

   Must show `renderD128`.

---

## ✅ Results

* **SMB Direct Play:** \~3% CPU (no transcoding needed).
* **Jellyfin Web Client (before QSV):** \~45–50% CPU (software transcoding).
* **Jellyfin Web Client (after QSV):** \~2–8% CPU (hardware transcoding working).

This confirms that Intel Quick Sync is active and Jellyfin is using the iGPU for video transcoding.

---

## 📌 Notes

* Web browser clients often force transcoding even if the codec is supported. That’s normal.
* SMB or native app playback may direct play the file (no transcoding → low CPU anyway).
* For advanced debugging, use `vainfo` on the host to list supported codecs.
* Some TrueNAS SCALE builds may require installing extra Intel drivers (`intel-media-driver`), but for the i5-7400 HD 630 this usually works out-of-the-box.

---

## 🎉 Conclusion

With Intel Quick Sync enabled via `/dev/dri/renderD128`, Jellyfin can offload transcoding to the iGPU, drastically lowering CPU usage and improving performance on large screens (e.g., projectors).