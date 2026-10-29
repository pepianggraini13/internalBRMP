# Modul SPT (Surat Perintah Tugas) - BRMP DIY

Folder ini khusus mewadahi seluruh antarmuka, logika alur kerja, dan komponen fitur **SPT (Surat Perintah Tugas)** Standar Kementerian Pertanian RI untuk Balai Penerapan Standar Instrumen Pertanian (BRMP) DIY.

---

## 📁 Struktur Berkas

| Berkas | Deskripsi |
|---|---|
| `index.js` | Entry point & re-export seluruh komponen modul SPT |
| `SptProgram.jsx` | Modul navigasi utama React SPT dengan sinkronisasi sesi pengguna & role |
| `PengajuanSpt.jsx` | Formulir pengajuan usulan penugasan dinas baru (**Khusus Panitera & Admin**) |
| `ReportSpt.jsx` | Halaman tracking status SPT, isolasi data pribadi pegawai, dan pratinjau dokumen dengan QR Keaslian |
| `SptApproval.jsx` | Halaman persetujuan tunggal **Kepala Bagian Tata Usaha (Kobag TU)** |
| `SptAdmin.jsx` | Administrasi SPT, **pengelolaan fleksibel role Panitera**, penomoran resmi dinas, dan konsiderans |
| `SptSop.jsx` | Halaman pedoman Standar Operasional Prosedur (SOP) & matriks wewenang RACI terbaru |
| `QrKeaslian.jsx` | Komponen QR Code SVG resmi bersertifikat BSRE BSSN dengan tanggal validasi & modal sertifikat |
| `sptApi.js` | Layanan API klien khusus modul SPT |

---

## 👥 Alur & Role Pegawai di SPT

1. **Role Panitera (`panitera`)**:
   - **Hanya Panitera yang berhak mengajukan permohonan SPT.**
   - Peran ini bersifat fleksibel dan dapat ditambah/dikurangi kapan saja oleh Administrator di tab Administrasi.
2. **Approval Tunggal Kobag TU (`kobag_tu`)**:
   - Usulan dari Panitera langsung diverifikasi dan disetujui satu pintu oleh Kepala Bagian Tata Usaha (Kobag TU).
3. **Privasi & Isolasi Data Pegawai (`user`)**:
   - Pegawai biasa hanya dapat melihat informasi Surat Perintah Tugas (SPT) atas nama dirinya sendiri (sebagai pemohon atau anggota yang bertugas).
4. **QR Code Keaslian Dokumen Dinas**:
   - Naskah SPT dilengkapi QR Code SVG resmi berstandar BSRE BSSN lengkap dengan **tanggal pengesahan** dan **tanggal verifikasi keaslian**.

---

## 🔗 Endpoint Backend Terkait
- `GET /api/spt` — Mengambil daftar SPT (terisolasi per user) & konfigurasi
- `GET /api/spt/panitera` — Mengambil daftar Panitera aktif
- `POST /api/spt/panitera` — Menetapkan pegawai baru sebagai Panitera (Admin)
- `DELETE /api/spt/panitera/:id` — Mencabut peran Panitera (Admin)
- `POST /api/spt` — Pengajuan usulan SPT baru (**Wajib Panitera/Admin**)
- `POST /api/spt/:id/approve` — Persetujuan tunggal Kobag TU
- `POST /api/spt/:id/reject` — Penolakan atau permintaan revisi oleh Kobag TU
- `POST /api/spt/:id/terbitkan` — Penerbitan nomor surat resmi & pengesahan QR Keaslian
- `POST /api/spt/:id/laporan` — Submit laporan perjalanan dinas & foto dokumentasi
