import { Router } from 'express';
import { 
  sptList, 
  paniteraList,
  getPaniteraList,
  addPanitera,
  removePanitera,
  isUserPanitera,
  getSptListForUser,
  addSpt, 
  approveSpt, 
  rejectSpt,
  terbitkanSpt,
  updateLaporan, 
  saveMenimbang,
  saveDasar,
  DEFAULT_MENIMBANG, 
  DEFAULT_DASAR,
  KLASIFIKASI_SPT_DEFAULT 
} from './sptStore.js';
import { DATA_PEGAWAI_BRMP } from '../data/pegawai.js';

const router = Router();

// GET /api/spt - List all SPT & configurations (filtered for regular users)
router.get('/', (req, res) => {
  const userNip = req.query.userNip || req.headers['x-user-nip'];
  const userId = req.query.userId || req.headers['x-user-id'];
  const userRole = req.query.userRole || req.headers['x-user-role'];
  const userNama = req.query.userNama || req.headers['x-user-nama'];

  const currentUser = userNip || userId ? {
    nip: userNip,
    id: userId,
    role: userRole,
    nama: userNama
  } : null;

  // Filter SPT berdasarkan pengguna: Pegawai biasa hanya melihat SPT miliknya sendiri
  const filteredList = currentUser ? getSptListForUser(currentUser) : sptList;

  res.json({
    success: true,
    data: {
      sptList: filteredList,
      totalCount: filteredList.length,
      paniteraList: getPaniteraList(),
      menimbang: DEFAULT_MENIMBANG,
      dasar: DEFAULT_DASAR,
      klasifikasi: KLASIFIKASI_SPT_DEFAULT
    }
  });
});

// GET /api/spt/pegawai - Get list of 115 pegawai BRMP DIY
router.get('/pegawai', (req, res) => {
  res.json({
    success: true,
    data: DATA_PEGAWAI_BRMP
  });
});

// GET /api/spt/panitera - List active Panitera
router.get('/panitera', (req, res) => {
  res.json({
    success: true,
    data: getPaniteraList()
  });
});

// POST /api/spt/panitera - Add new Panitera (Admin only)
router.post('/panitera', (req, res) => {
  try {
    const { pegawai, adminName } = req.body;
    if (!pegawai) {
      return res.status(400).json({
        success: false,
        message: 'Data pegawai yang akan diangkat sebagai Panitera wajib disertakan.'
      });
    }

    const added = addPanitera(pegawai, adminName || 'Administrator Sistem');
    res.status(201).json({
      success: true,
      message: `Pegawai ${added.nama} berhasil ditambahkan sebagai Panitera SPT.`,
      data: added,
      paniteraList: getPaniteraList()
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Gagal menambahkan Panitera'
    });
  }
});

// DELETE /api/spt/panitera/:id - Remove Panitera role (Admin only)
router.delete('/panitera/:id', (req, res) => {
  const { id } = req.params;
  const removed = removePanitera(id);

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: 'Panitera tidak ditemukan atau sudah tidak aktif.'
    });
  }

  res.json({
    success: true,
    message: 'Peran Panitera berhasil dicabut dari pegawai.',
    paniteraList: getPaniteraList()
  });
});

// POST /api/spt - Create new SPT (Hanya Panitera yang bisa mengajukan)
router.post('/', (req, res) => {
  const { 
    dariTanggal, 
    sampaiTanggal, 
    tglMulai,
    tglSelesai,
    uraian, 
    untukMelaksanakan,
    kotaTujuan, 
    tujuanDaerah,
    tempatTujuan, 
    pegawaiBertugas,
    anggota,
    klasifikasiId,
    klasifikasiNama,
    pemohon,
    paniteraPengaju,
    submitter
  } = req.body;

  const activeSubmitter = submitter || paniteraPengaju || req.headers['x-user-nip'] ? {
    nip: req.headers['x-user-nip'],
    role: req.headers['x-user-role'],
    nama: req.headers['x-user-nama']
  } : null;

  // Validasi: Pastikan pengaju adalah Panitera atau Admin
  if (activeSubmitter && !isUserPanitera(activeSubmitter)) {
    return res.status(403).json({
      success: false,
      message: 'Akses Ditolak: Hanya pegawai yang ditugaskan sebagai Panitera yang dapat mengajukan usulan SPT.'
    });
  }

  const start = dariTanggal || tglMulai;
  const end = sampaiTanggal || tglSelesai;
  const desc = uraian || untukMelaksanakan;
  const kota = kotaTujuan || tujuanDaerah;
  const personil = pegawaiBertugas || anggota;

  if (!start || !end || !desc || !kota || !personil || personil.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Semua kolom formulir SPT wajib diisi (Tanggal Mulai, Tanggal Selesai, Uraian Tugas, Tujuan Daerah, dan Anggota/Personil)'
    });
  }

  try {
    const newSpt = addSpt({
      dariTanggal: start,
      sampaiTanggal: end,
      tglMulai: start,
      tglSelesai: end,
      uraian: desc,
      untukMelaksanakan: desc,
      kotaTujuan: kota,
      tujuanDaerah: kota,
      tempatTujuan: tempatTujuan || kota,
      pegawaiBertugas: personil,
      anggota: personil,
      klasifikasiId: klasifikasiId || "KLAS-01",
      klasifikasiNama: klasifikasiNama || "Perjalanan Dinas Dalam Daerah DIY",
      pemohon,
      paniteraPengaju: activeSubmitter || paniteraPengaju
    }, activeSubmitter);

    res.status(201).json({
      success: true,
      message: 'Pengajuan SPT oleh Panitera berhasil disimpan dan diteruskan ke Kepala Bagian Tata Usaha (Kobag TU)',
      data: newSpt
    });
  } catch (err) {
    res.status(403).json({
      success: false,
      message: err.message || 'Gagal membuat pengajuan SPT'
    });
  }
});

// POST /api/spt/:id/approve - Approval SPT hanya perlu dari Kobag TU
router.post('/:id/approve', (req, res) => {
  const { role, catatan, approver } = req.body;
  const updated = approveSpt(req.params.id, role || 'kobag_tu', catatan || '', approver);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Persetujuan Kobag TU berhasil disahkan. SPT siap untuk penerbitan nomor resmi dan cetak dokumen.',
    data: updated
  });
});

// POST /api/spt/:id/reject - Reject by Kobag TU
router.post('/:id/reject', (req, res) => {
  const { role, reason } = req.body;
  const updated = rejectSpt(req.params.id, role || 'kobag_tu', reason);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Status SPT berhasil diperbarui (Ditolak Kobag TU / Perlu Revisi Panitera)',
    data: updated
  });
});

// POST /api/spt/:id/terbitkan - Issue official SPT number & finalize QR authenticity
router.post('/:id/terbitkan', (req, res) => {
  const { nomorSpt, fileTtdName } = req.body;
  const updated = terbitkanSpt(req.params.id, nomorSpt, fileTtdName);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Nomor surat dinas resmi berhasil diterbitkan dengan QR Keaslian tervalidasi',
    data: updated
  });
});

// POST /api/spt/:id/laporan - Submit report & photos
router.post('/:id/laporan', (req, res) => {
  const { isiLaporan, fotoUrl, fileLaporanName } = req.body;

  if (!isiLaporan) {
    return res.status(400).json({
      success: false,
      message: 'Uraian hasil pelaksanaan tugas dinas wajib diisi'
    });
  }

  const updated = updateLaporan(req.params.id, isiLaporan, fotoUrl, fileLaporanName);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Laporan hasil tugas dinas berhasil disimpan',
    data: updated
  });
});

// PUT /api/spt/menimbang - Save updated Menimbang items
router.put('/menimbang', (req, res) => {
  const { menimbang } = req.body;
  const updated = saveMenimbang(menimbang);
  res.json({
    success: true,
    message: 'Konsiderans Menimbang berhasil diperbarui',
    data: updated
  });
});

// PUT /api/spt/dasar - Save updated Dasar Hukum items
router.put('/dasar', (req, res) => {
  const { dasar } = req.body;
  const updated = saveDasar(dasar);
  res.json({
    success: true,
    message: 'Konsiderans Dasar Hukum berhasil diperbarui',
    data: updated
  });
});

export default router;
