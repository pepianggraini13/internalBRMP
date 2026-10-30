# 🗄️ Database Internal BRMP DIY

Folder ini dipisahkan khusus untuk mengelola seluruh file database sistem:

### 1. `absensi.sqlite` (Database Aktif Utama)
- **Tipe**: SQLite 3 Engine
- **Fungsi**: Digunakan oleh aplikasi web BRMP DIY dan mesin absensi (ADMS) untuk menyimpan seluruh:
  - Data Master Pegawai (`tb_pegawai` / `t_ptk`)
  - Riwayat & Pengajuan Cuti BKN (`tb_cuti`)
  - Konfigurasi Mesin Absensi (`tb_adms_machines` / `tweb_mesin`)
  - Log Presensi Masuk & Pulang (`tb_adms_logs` / `tweb_pegawai_hadir`)
- **Keamanan**: Dilindungi file `.htaccess` agar tidak dapat diunduh langsung lewat browser.

### 2. `brmp_database.sql` (Cadangan MySQL / MariaDB)
- **Tipe**: MySQL Dump Schema & Data
- **Fungsi**: Skema cadangan jika suatu saat sistem ingin dimigrasikan ke MySQL/cPanel atau phpMyAdmin.

---
*Lokasi Database:* `/database/absensi.sqlite`
