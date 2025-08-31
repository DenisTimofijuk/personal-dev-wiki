## 🔹 Certificates: what and why

* Certificates = digital “ID cards” your server shows to prove it’s trusted.
* They are required for **secure connections**:

  * HTTPS (NAS web UI over TLS)
  * FTPS (FTP over TLS)

Without them, you’re on **plain HTTP/FTP**, which works but sends passwords/data unencrypted on the LAN. Inside your LAN it’s not terrible, but for remote access (or peace of mind) you want encryption.

---

## 🔹 Which type to use (RSA vs ECC)?

* **RSA certificate**: older, very common, compatible with everything.
* **ECC certificate**: newer, faster, more efficient, but some very old clients (think Windows XP, ancient cameras) may not support it.

👉 For **maximum compatibility** (especially since cameras might not support ECC):
**Choose an RSA certificate**.

---

## 🔹 Options in TrueNAS

1. **Internal Certificate Authority (CA)**

   * You create your own "mini-CA" inside TrueNAS, then generate a certificate signed by it.
   * Good for internal use, but your browsers/devices won’t automatically trust it → you’d need to import your CA cert into your PC/phone to stop browser warnings.

2. **Import Certificate**

   * If you already have one from Let’s Encrypt or another CA.
   * Useful if you own a domain name and want a "real" trusted cert.

3. **Self-Signed/Internal Certificate** (simplest)

   * TrueNAS can just make a self-signed certificate without a CA.
   * Works fine, but browsers will warn "not trusted."
   * For LAN-only usage, this is fine — you can accept the warning.

---

## 🔹 Recommended path for you (home NAS, no domain):

* Create an **Internal Certificate** → type **RSA**.
* Name it `truenas.local-cert` (or similar).
* Validity: 10 years.
* Apply it to:

  * **System → General → GUI SSL Certificate** (to enable HTTPS on the NAS web UI).
  * **FTP Service → TLS Certificate** (to enable FTPS).

After that:

* You’ll access your NAS UI at `https://192.168.1.146/` (browser will warn you about “untrusted cert” unless you import it).
* FTP clients (like FileZilla) will ask you to accept the cert once, then they’ll encrypt the connection (FTPS).

---

## 🔹 For external secure access

If you plan to use **Tailscale** (like you said earlier), you don’t really need a public cert from Let’s Encrypt — Tailscale encrypts everything already.
But if one day you want **public HTTPS** without warnings, you’d need:

* A domain name pointing to your NAS, and
* A Let’s Encrypt certificate (TrueNAS can automate this if you set up DNS challenges).

---

✅ **So for now:**

* Create an **Internal RSA certificate** in TrueNAS.
* Apply it to both **GUI (HTTPS)** and **FTP (TLS)**.
* Accept the warnings when you connect.
