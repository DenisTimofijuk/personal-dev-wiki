# Certificates: what and why

* Certificates = digital “ID cards” your server shows to prove it’s trusted.
* They are required for **secure connections**:

  * HTTPS (NAS web UI over TLS)
  * FTPS (FTP over TLS)

Without them, you’re on **plain HTTP/FTP**, which works but sends passwords/data unencrypted on the LAN. Inside your LAN it’s not terrible, but for remote access (or peace of mind) you want encryption.


## Which type to use (RSA vs ECC)?

* **RSA certificate**: older, very common, compatible with everything.
* **ECC certificate**: newer, faster, more efficient, but some very old clients (think Windows XP, ancient cameras) may not support it.

👉 For **maximum compatibility** (especially since cameras might not support ECC):
**Choose an RSA certificate**.


## Options in TrueNAS

1. **Certificate Authority (CA)**

   * First create your own internal CA. This CA can sign all future certificates you generate.
   * Benefits: you can reuse it for multiple services, and if you import the CA into your PC/phone, browser warnings disappear.

2. **Internal Certificate** (signed by your CA)

   * After creating a CA, generate an Internal Certificate and sign it with that CA.
   * Use this for the NAS web UI and FTPS.

3. **Self-Signed Certificate** (without CA)

   * TrueNAS can also make a one-off self-signed certificate.
   * Works fine, but every device will warn that it’s “not trusted.”
   * Simpler, but less flexible than using a CA.


## Recommended path for you (home NAS, no domain):

1. **Create an Internal Certificate Authority (CA):**

   * **Type:** Internal CA.
   * **Name:** `MyNAS-CA`.
   * **Key Type:** RSA, **Key Length:** 2048 or 4096, **Digest:** SHA256.
   * **Lifetime:** e.g. 3650 days (\~10 years).
   * **Common Name (CN):** `MyNAS-CA`.
   * Enable **Basic Constraints: CA = true**.

   ➡️ Download the CA certificate and import it into your PC/phone trust store if you want to avoid browser warnings.

2. **Create an Internal Certificate:**

   * **Type:** Internal Certificate.
   * **Name:** `truenas.local-cert` (or similar).
   * **Signing CA:** select the CA you just created.
   * **Key Type:** RSA, **Key Length:** 2048, **Digest:** SHA256.
   * **Lifetime:** 365–730 days (renew every year or two).
   * **Common Name (CN):** the NAS hostname or IP you use (e.g. `truenas.local` or `192.168.1.146`).
   * **Subject Alternative Names (SANs):** add both the IP and hostname.
   * **Key Usage:** digitalSignature, keyEncipherment.
   * **Extended Key Usage:** TLS Web Server Authentication.

3. **Apply the certificate:**

   * **System → General → GUI SSL Certificate:** select your new cert to enable HTTPS on the NAS web UI.
   * **System Settings → Services → FTP → TLS Settings:** check Enable TLS and select your cert for FTPS.
   * SMB/NFS don’t use TLS certs, but you can enable SMB encryption inside SMB settings if needed.


## After setup

* You’ll access your NAS UI at `https://192.168.1.146/` (browser will warn unless you imported the CA).
* FTP clients (like FileZilla) will ask you to accept the cert once; after that connections are encrypted.


## For external secure access

If you plan to use **Tailscale**, you don’t need a public cert — Tailscale already encrypts traffic.
If you later want **public HTTPS** without warnings, you’ll need:

* A domain name pointing to your NAS.
* A Let’s Encrypt certificate (TrueNAS supports ACME/DNS authenticators).


✅ **So for now:**

* Create an Internal CA and Internal RSA certificate.
* Apply it to both GUI (HTTPS) and FTP (TLS).
* Optionally import the CA cert into your devices to stop warnings.
