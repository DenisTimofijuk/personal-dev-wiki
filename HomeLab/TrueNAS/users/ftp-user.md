## 1. Create a Dedicated FTP User

1. Go to **Credentials → Local Users → Add**.
2. Set:

   * **Username**: e.g. `cameraftp`
   * **Password**: a strong one (you’ll enter it into the cameras later).
   * **Primary Group**: create a new group named `cameraftp` if prompted.
   * **Auxiliary Groups**: add *ftp*
   * **Home Directory**: point it to your dataset, e.g. `/mnt/PoolName/CamRecordings`.

     * If the dataset doesn’t exist, create it first under **Storage → Datasets**.
   * **Shell**: set to *nologin* (so the account isn’t usable for SSH).
3. Save the user.

---

## 2. Set Dataset Permissions

1. Go to **Storage → Datasets**.
2. Find your dataset (e.g. `CamRecordings`) and click **Edit Permissions**.
3. Choose **POSIX (Unix) ACL**.
4. Give the `cameraftp` user **Read+Write+Execute** (RWX) permissions.
5. Save.

---

## 3. Enable and Configure the FTP Service

1. Go to **System Settings → Services**.
2. Find **FTP**, click the **pencil icon** to configure:

   * **Port**: leave default (21).
   * **Allow Anonymous Login**: **off**.
   * **Require TLS**: optional. Some cameras don’t support FTPS, so if they only support plain FTP, leave TLS unchecked (less secure, but fine inside your LAN).
   * **Enable Local User Login**: **on**.
   * **Masquerade Address**: not needed unless your cameras are on another network/VPN.
   * **Chroot**: enable this so users are locked into their home directory (cameras will only see `/mnt/PoolName/CamRecordings`).
3. Save, then **flip the switch to start FTP service**.

   * Optionally, set **Start Automatically** if you want FTP always running.

---

## 4. Configure Your Cameras

* In the camera’s storage settings, enter:

  * **Server/IP**: the LAN IP of your NAS.
  * **Port**: 21.
  * **Username**: `cameraftp`.
  * **Password**: the password you set.
  * **Directory/Path**: leave blank or `/` (since the home dir *is* the dataset).

---

## 5. Verify

* From a PC, test FTP login using the new user:

  ```bash
  ftp <NAS-IP>
  # login as cameraftp, enter password
  ```
* You should land directly in `/mnt/PoolName/CamRecordings` and be able to upload files.