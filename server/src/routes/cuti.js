import { Router } from 'express';
import { users, cutiHistory, addCuti, verifyCuti } from '../data/store.js';

const router = Router();

// GET /api/cuti - Ambil riwayat cuti & daftar antrean verifikasi
router.get('/', (req, res) => {
  const { nip, role } = req.query;

  let user = users[1]; // Default Agnita
  if (nip) {
    const found = users.find(u => u.nip === nip || String(u.id) === String(nip));
    if (found) user = found;
  }

  // Filter list depending on user request
  // Pemohon sees their own submissions; Admin & Verifikator see all or relevant
  let myHistory = cutiHistory;
  if (user && user.approvalRole === 'pemohon' && !role?.includes('admin')) {
    myHistory = cutiHistory.filter(c => c.nip === user.nip || String(c.pegawaiId) === String(user.id));
  }

  // Antrean antrean
  const pendingCuti = cutiHistory.filter(c => c.status === 'dalam_proses' || c.status.startsWith('menunggu'));

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        jabatan: user.jabatan,
        divisi: user.divisi,
        systemRole: user.systemRole,
        approvalRole: user.approvalRole,
        roleLabel: user.roleLabel,
        sisaCuti: (Number(user.sisaCutiN) || 0) + (Number(user.sisaCutiN1) || 0),
        sisaCutiN: user.sisaCutiN !== undefined ? Number(user.sisaCutiN) : 12,
        sisaCutiN1: user.sisaCutiN1 !== undefined ? Number(user.sisaCutiN1) : 0,
        cutiTerpakai: user.cutiTerpakai || 0,
        expiredCuti: user.expiredCuti || "31-12-2026",
        masaKerja: user.masaKerja || "01 Tahun 03 Bulan",
        alamat: user.alamat || "Yogyakarta",
        noHp: user.noHp || "085268238966",
        sisaCutiText: `2026 - Total Sisa ${(Number(user.sisaCutiN) || 0) + (Number(user.sisaCutiN1) || 0)} Hari (N-1: ${user.sisaCutiN1 || 0} Hari, N: ${user.sisaCutiN || 12} Hari)`
      },
      jenisCutiOptions: [
        "Tahunan",
        "Sakit",
        "Alasan Penting",
        "Melahirkan",
        "Karena Istri Melahirkan",
        "Cuti Besar",
        "Cuti di Luar Tanggungan Negara"
      ],
      history: cutiHistory, // Semua history untuk verifikator & admin
      myHistory: myHistory, // History khusus pegawai yang sedang login
      pendingVerif1: pendingCuti,
      pendingVerif2: pendingCuti,
      pendingCuti,
      summary: {
        totalPengajuan: cutiHistory.length,
        dalamProses: pendingCuti.length,
        menungguVerif1: pendingCuti.length,
        menungguVerif2: 0,
        disetujui: cutiHistory.filter(c => c.status === 'disetujui').length,
        ditolak: cutiHistory.filter(c => c.status.startsWith('ditolak')).length
      }
    }
  });
});

// POST /api/cuti - Pegawai mengajukan cuti baru
router.post('/', (req, res) => {
  const { 
    pegawaiId,
    nip, 
    nama, 
    jabatan, 
    divisi, 
    jenisCuti, 
    tanggalMulai, 
    tanggalAkhir, 
    alasan,
    alamatCuti,
    noTelpCuti,
    masaKerja
  } = req.body;

  if (!jenisCuti || !tanggalMulai || !tanggalAkhir || !alasan) {
    return res.status(400).json({
      success: false,
      message: 'Jenis cuti, tanggal mulai, tanggal akhir, dan alasan cuti wajib diisi'
    });
  }

  // Calculate day difference
  const start = new Date(tanggalMulai);
  const end = new Date(tanggalAkhir);

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: 'Tanggal akhir cuti tidak boleh lebih awal dari tanggal mulai cuti'
    });
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Format date helper: YYYY-MM-DD -> DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  // Find user data
  const user = users.find(u => u.nip === nip || String(u.id) === String(pegawaiId)) || users[1];
  const totalSisa = (Number(user.sisaCutiN) || 0) + (Number(user.sisaCutiN1) || 0);

  // Check sisa cuti if Tahunan
  if (jenisCuti === 'Tahunan' && totalSisa < diffDays) {
    return res.status(400).json({
      success: false,
      message: `Total sisa kuota cuti tahunan tidak mencukupi (Tersisa: ${totalSisa} hari, Pengajuan: ${diffDays} hari)`
    });
  }

  const newCuti = addCuti({
    pegawaiId: user.id,
    nip: user.nip,
    nama: user.nama,
    jabatan: user.jabatan,
    divisi: user.divisi,
    tanggalPengajuan: todayStr,
    tanggalMulai: formatDate(tanggalMulai),
    tanggalAkhir: formatDate(tanggalAkhir),
    jumlahHari: diffDays,
    jatahTahun: "2026",
    jenisCuti,
    alasan,
    alamatCuti: alamatCuti || user.alamat || "Yogyakarta",
    noTelpCuti: noTelpCuti || user.noHp || "085268238966",
    masaKerja: masaKerja || user.masaKerja || "01 Tahun 03 Bulan"
  });

  res.status(201).json({
    success: true,
    message: 'Pengajuan cuti berhasil dibuat dan berstatus DALAM PROSES! Silahkan ikuti alur pengajuan cuti (cetak formulir, mintakan tanda tangan atasan, lalu serahkan ke petugas untuk di-ACC).',
    data: newCuti
  });
});

// POST /api/cuti/:id/verify - Verifikasi & Selesaikan Alur oleh Petugas Kepegawaian (Memotong Kuota Sistem)
router.post('/:id/verify', (req, res) => {
  const { id } = req.params;
  const { tahap = 'selesai', action = 'approve', verifikatorUser, catatan } = req.body;

  const result = verifyCuti(id, tahap, {
    action,
    verifikatorUser,
    catatan
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: result.message,
    data: result.data
  });
});

// POST /api/cuti/:id/selesaikan - Route eksplisit penyelesaian alur oleh Petugas
router.post('/:id/selesaikan', (req, res) => {
  const { id } = req.params;
  const { verifikatorUser, catatan } = req.body;

  const result = verifyCuti(id, 'selesai', {
    action: 'acc',
    verifikatorUser,
    catatan
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: result.message,
    data: result.data
  });
});

// DELETE /api/cuti/:id - Pembatalan cuti oleh pemohon jika masih dalam proses
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = cutiHistory.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data cuti tidak ditemukan' });
  }

  if (cutiHistory[index].status === 'disetujui') {
    return res.status(400).json({ 
      success: false, 
      message: 'Pengajuan cuti yang sudah di-ACC / disetujui tidak dapat dibatalkan langsung' 
    });
  }

  cutiHistory.splice(index, 1);
  res.json({
    success: true,
    message: 'Pengajuan cuti berhasil dibatalkan'
  });
});

export default router;

