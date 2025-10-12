# TrueNAS SCALE SSH User Login Guide

This document describes how to set up SSH key-based login for a TrueNAS SCALE user, disable password authentication for SSH, and safely maintain access.


## Prerequisites

- Access to the TrueNAS SCALE web User Interface (UI) with administrator privileges.  
- A Fedora (or other Linux) machine where you can generate or already have an SSH key pair.  
- Network access from Fedora to the TrueNAS server (LAN or allowed network).


## Step 1: Generate SSH Key Pair (on Fedora)

If you do not already have a public/private key pair you want to use:

```bash
# Generate an Ed25519 key (recommended)
ssh-keygen -t ed25519 -f ~/.ssh/truenas_id_ed25519 -C "username@fedora-to-truenas"

# This creates:
#   ~/.ssh/truenas_id_ed25519        ← private key (keep this secure, permissions 600)
#   ~/.ssh/truenas_id_ed25519.pub    ← public key
```

Copy or note down the contents of the `.pub` file:

```bash
cat ~/.ssh/truenas_id_ed25519.pub
```


## Step 2: Create or Prepare the User on TrueNAS

1. Log in to TrueNAS web UI.
2. Navigate: **Credentials → Local Users**.
3. Click **Add** (or edit existing user).

   * Choose a **Username**.
   * Set a **Full Name** or description (optional).
   * Give/set a **Password** (only required if you want password fallback temporarily).
   * Ensure **Create Home Directory** is selected; choose the dataset or path you prefer.
   * Set a valid **Shell** (e.g. `/bin/bash` or `/usr/bin/bash`); **do not** use `nologin`.
4. Save the user.


## Step 3: Add Your Public Key to the User’s Authorized Keys

1. In TrueNAS UI → **Credentials → Local Users → Edit** the user.
2. Expand the **Authentication** section.
3. Find **Authorized Keys** (or “SSH Public Key / SSH Key(s)” field).
4. Paste the contents of your Fedora public key file (the `.pub`) into that field (single line typically starting with `ssh-ed25519 ...`).

   * Or upload the public key file if UI allows “Choose File / Upload Key”.
5. Save the user.


## Step 4: Configure SSH Service Settings

1. In TrueNAS UI → **System Settings → Services**.

2. Find **SSH**, click **Edit**.

   In the **Basic/General Settings**:

   * **Allow Password Authentication**:

     * Initially, this can be *enabled* so you can test and/or use password login if needed.
     * Later, once key-based login works reliably, you can disable this to force key only.

   * **Password Login Groups**:

     * If password auth is enabled, specify which user groups are permitted to log in using passwords.
     * Only users in those groups (and with password login enabled individually) will be allowed password SSH login.

3. Save these settings.

4. Make sure **SSH service** is *enabled* to start automatically and is currently running.


## Step 5: Connect from Fedora & Test Key-Based SSH

From your Fedora terminal:

```bash
ssh -i ~/.ssh/truenas_id_ed25519 username@TRUENAS_IP
```

* If SSH connects and **does not ask you for a password**, then your key-based login is working.

* If it still asks for a password or you get `Permission denied (publickey)` or similar, check:

  * That the public key is exactly and correctly in the Authorized Keys field in TrueNAS.
  * That the user has a valid shell and home directory.
  * That SSH service allows public key auth (this is default).
  * Permissions on user’s home, `.ssh` folder, `authorized_keys` file are set properly (700 for `.ssh`, 600 for `authorized_keys`, correct owner).


## Step 6: Disable Password Authentication (Once Key Works)

After confirming key-based login works:

1. Go back to **System Settings → Services → SSH → Edit** in the UI.
2. Uncheck / disable **Allow Password Authentication**.
3. Save.

(Optional) Also verify:

* The user’s “SSH password login enabled” field (in user settings) is disabled.
* The user is not in any group listed in *Password Login Groups* (or those groups are empty).

4. Test again:

```bash
ssh -i ~/.ssh/truenas_id_ed25519 username@TRUENAS_IP
```

* This should still work.

Then try:

```bash
ssh username@TRUENAS_IP
```

* This should no longer allow login via password (should fail if password auth is disabled).


## Best Practices & Troubleshooting

| Item                                                | Why It Matters                                                                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Valid shell                                         | Without a valid shell, user cannot get an interactive SSH session.                                                                                     |
| Correct permissions on `.ssh` and `authorized_keys` | If permissions are too open, SSH daemon may reject the key for security.                                                                               |
| Home directory existence                            | SSH key is stored under user’s home; if home isn’t created or is wrong, it won’t work.                                                                 |
| Using non-root user                                 | Avoid enabling root login; use a user with reduced privilege, or admin user.                                                                           |
| Disable password login after key works              | Reduces attack surface; keys are more secure than passwords.                                                                                           |
| Backup access plan                                  | If you disable password login and lose your private key, you could lock yourself out; keep fallback if possible for emergencies (e.g. console access). |


## Example Config Summary

Here’s what your final configuration should look like:

* **TrueNAS user**: `username` with:

  * Home directory present, shell = `/usr/bin/bash` (or similar).
  * Public key in `Authorized Keys`.
  * Password login disabled (for this user) (optional, if you want no fallback).

* **SSH service settings**:

  * `Allow Password Authentication`: **disabled**.
  * `Password Login Groups`: none (or empty).
  * SSH service enabled and running.

* **From Fedora**:

  * SSH command with `-i` to your private key works.
  * SSH command without key / using password is rejected.


## Useful TrueNAS Documentation References

* TrueNAS SSH service screen options: *Allow Password Authentication*, *Password Login Groups*. ([TrueNAS Open Enterprise Storage][1])
* Managing local users: enabling shells, home directories, disabling user password login if needed. ([TrueNAS Open Enterprise Storage][2])
* Adding user authorized public keys under Credentials → Users. ([TrueNAS Open Enterprise Storage][3])


## Full Workflow at a Glance

1. Generate key pair on client.
2. Create user on TrueNAS (home + shell).
3. Paste public key into user’s `Authorized Keys`.
4. Enable SSH service; temporarily enable password authentication if needed.
5. Test SSH from client using key.
6. Once successful, disable password authentication.
7. Verify everything works (key login works; password login fails).


> *This guide is specific to TrueNAS SCALE (2025 / version 26.x / Electric Eel and newer releases). UI layout or labels may change slightly in future versions — always verify with official TrueNAS documentation.*


## Change Log / Notes

* **Date**: *\[fill in current date]* — password authentication disabled after testing.
* **Firewall / network**: ensure SSH port (default 22) is accessible only where needed.
* **Key backup**: store private key safely (e.g. encrypted backup).


[1]: https://www.truenas.com/docs/scale/scaleuireference/systemsettings/services/sshservicescreenscale/?utm_source=chatgpt.com "SSH Service Screen"
[2]: https://www.truenas.com/docs/scale/scaletutorials/credentials/managelocalusersscale/?utm_source=chatgpt.com "Managing Users | TrueNAS Documentation Hub"
[3]: https://www.truenas.com/docs/scale/25.10/scaletutorials/credentials/backupcredentials/addsshconnectionkeypair/?utm_source=chatgpt.com "Adding SSH Credentials"
