# Modul Backend SPT (Surat Perintah Tugas)

Modul ini bertanggung jawab atas seluruh logika bisnis, state data, dan routing API untuk **E-SPT (Surat Perintah Tugas)** BRMP DIY.

---

## 📁 Struktur Berkas

| Berkas | Deskripsi |
|---|---|
| `index.js` | Entry point modul backend SPT |
| `routes.js` | Endpoint REST API `/api/spt` |
| `sptStore.js` | Data store SPT, manajemen fleksibel Panitera, approval tunggal Kobag TU, isolasi data pegawai, dan QR keaslian |

---

## 📡 Daftar Endpoint API

- `GET /api/spt` — Ambil daftar SPT (terisolasi per akun pegawai jika non-admin) & konfigurasi dasar/menimbang
- `GET /api/spt/pegawai` — Ambil daftar 115 pegawai BRMP DIY untuk personil tugas
- `GET /api/spt/panitera` — Ambil daftar pegawai dengan peran Panitera aktif
- `POST /api/spt/panitera` — Penetapan Panitera baru oleh Administrator
- `DELETE /api/spt/panitera/:id` — Pencabutan peran Panitera oleh Administrator
- `POST /api/spt` — Buat pengajuan usulan SPT baru (**Hanya Panitera atau Admin**)
- `POST /api/spt/:id/approve` — Persetujuan tunggal Kobag TU
- `POST /api/spt/:id/reject` — Tolak / minta revisi SPT oleh Kobag TU
- `POST /api/spt/:id/terbitkan` — Penerbitan nomor surat resmi & pengesahan QR Keaslian
- `POST /api/spt/:id/laporan` — Submit laporan perjalanan dinas & foto dokumentasi
- `PUT /api/spt/menimbang` — Perbarui daftar klausul konsiderans menimbang
- `PUT /api/spt/dasar` — Perbarui daftar dasar hukum
