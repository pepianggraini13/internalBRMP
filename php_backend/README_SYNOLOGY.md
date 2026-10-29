# 📋 PANDUAN DEPLOY INTERNAL BRMP DIY DI SYNOLOGY WEB STATION (SQLite Edition)

Paket ini adalah **Sistem Lengkap Internal BRMP DIY** (Frontend Web App, REST API Backend, dan ADMS Receiver Mesin Absensi) yang dirancang khusus untuk deployment di **Synology Web Station** berbasis **SQLite 3**.

---

## ⚡ Keunggulan Paket Ini:
1. **Zero Configuration (Berbasis SQLite 3)**:
   - Database tersimpan rapi di folder khusus: `database/absensi.sqlite`.
   - Sudah langsung terisi seluruh master data pegawai (116 pegawai), data mesin absensi, skema cuti 2 tahun, dan tabel riwayat presensi.
   - Dilengkapi proteksi `database/.htaccess` agar tidak bisa diunduh sembarangan lewat internet.
   - **TIDAK PERLU** menginstall MariaDB atau MySQL di Synology Package Center.
2. **All-in-One Deployment**:
   - Berisi aplikasi web frontend terbaru (React Vite build) dengan fitur **Pengajuan Cuti Resmi BKN (A4)** dan kuota 2 tahun ($N$ dan $N-1$).
   - Dilengkapi **ADMS Receiver Engine** untuk mesin absensi fisik (Solution / ZKTeco) via port 80/HTTP push.
   - Portal penugasan SPT (`/spt-portal` atau `/brmpSPT`).
3. **Sangat Ringan & Cepat**:
   - Database SQLite berjalan dengan mode high-performance *Write-Ahead Logging (WAL)*.

---

## 🚀 Langkah Deploy di Synology NAS:

### 1. Extract File ke Web Station
- Buka **Synology DSM** -> **File Station**.
- Buka folder `web` (atau folder virtual host yang Anda gunakan, misal: `/web/brmp`).
- Upload dan Extract file ZIP ini langsung ke folder document root tersebut.

### 2. Atur Izin Akses (Permissions)
Agar web server dan PHP dapat membaca dan menulis database SQLite serta log presensi:
1. Di **File Station**, klik kanan pada folder tempat Anda mengekstrak file (misal `/web/brmp`) -> pilih **Properties**.
2. Buka tab **Permission**.
3. Pastikan user / user group **`http`** memiliki izin **Read & Write** (Baca & Tulis).
4. Centang opsi **"Apply to this folder, sub-folders and files"** lalu klik **Save**.

### 3. Setting Web Station di Synology DSM
1. Buka **Web Station** di DSM.
2. Di menu **Web Service**, pastikan PHP versi 8.0, 8.1, atau 8.2 terpasang dengan ekstensi:
   - `pdo_sqlite` (Wajib)
   - `sqlite3` (Wajib)
   - `curl`, `json`, `mbstring`, `openssl`
3. Di menu **Web Portal** / **Virtual Host**:
   - Buat portal baru berbasis folder tempat Anda mengekstrak file tadi.
   - Pilih backend **Apache HTTP Server** (direkomendasikan agar membaca `.htaccess` otomatis) ATAU **Nginx** (gunakan aturan di file `nginx_synology.conf`).

### 4. Konfigurasi Mesin Absensi Fisik (ADMS)
Pada mesin absensi fisik (Solution / ZKTeco di Lobi):
1. Masuk ke **Menu** -> **Komunikasi** -> **Cloud Server / ADMS Setting**:
   - **Server Address**: Masukkan IP Synology atau Domain lokal (contoh: `192.168.2.100` atau `adms.brmpdiy.id`)
   - **Server Port**: Port web station Anda (biasanya `80`)
   - **Enable Cloud / ADMS**: `ON`
2. Simpan dan restart komunikasi mesin. Begitu mesin tersambung, log absensi otomatis terkirim dan tersimpan ke `absensi.sqlite`.

---

## 🔍 Uji Coba & Verifikasi:
- **Web Portal BRMP**: Buka `http://[IP_SYNOLOGY]/` di browser (Aplikasi web internal langsung muncul).
- **API Health Check**: Buka `http://[IP_SYNOLOGY]/api/health` (muncul status JSON ok).
- **ADMS Receiver Handshake**: Buka `http://[IP_SYNOLOGY]/iclock/cdata?SN=TEST` (harus muncul tulisan `OK`).
