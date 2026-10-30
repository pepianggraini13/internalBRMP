import React, { useState, useEffect } from 'react';
import { sptApiService } from './sptApi';
import { KLASIFIKASI_SPT_DEFAULT } from '../data/klasifikasiData';
import { ConflictChecker } from '../utils/conflictChecker';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight,
  Lock,
  UserCheck
} from 'lucide-react';

export default function PengajuanSpt({ user, onNavigateToReport }) {
  // Panitera Check State
  const [paniteraList, setPaniteraList] = useState([]);
  const [isPaniteraAuthorized, setIsPaniteraAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Step 1: Klasifikasi
  const [klasifikasiId, setKlasifikasiId] = useState('KLAS-01');
  
  // Step 2: Tanggal
  const [tglMulai, setTglMulai] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [tglSelesai, setTglSelesai] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  // Step 3: Anggota (115 Pegawai BRMP DIY)
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [searchPegawai, setSearchPegawai] = useState('');
  const [filterTimKerja, setFilterTimKerja] = useState('all');

  // Step 4: Lokasi / Tujuan
  const [tujuanDaerah, setTujuanDaerah] = useState('Kabupaten Sleman');
  const [tempatTujuan, setTempatTujuan] = useState('BPP Seyegan & Gapoktan Makmur Lestari');

  // Step 5: Uraian Tugas
  const [uraianTugas, setUraianTugas] = useState('Koordinasi pelaksanaan bimbingan teknis penerapan standar instrumen pertanian dan pemantauan alsintan di kelompok tani binaan.');

  // Data & State
  const [sptList, setSptList] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Initial Data & Verify Panitera Status
  const loadInitialData = async () => {
    try {
      setCheckingAuth(true);
      const [sptRes, pegRes, panList] = await Promise.all([
        sptApiService.getSpt(user),
        sptApiService.getPegawai(),
        sptApiService.getPanitera()
      ]);

      if (sptRes && sptRes.sptList) {
        setSptList(sptRes.sptList);
      }

      if (panList && Array.isArray(panList)) {
        setPaniteraList(panList);
      }

      // Validasi apakah pengguna adalah Panitera atau Admin
      const userNip = String(user?.nip || '').trim();
      const userId = String(user?.id || user?.pegawaiId || '').toUpperCase();
      const userRole = String(user?.sptRole || user?.role || '').toLowerCase();

      const isAdmin = userRole === 'admin' || userId === 'PEG-ADM' || user?.username === 'admin';
      const isPaniteraRole = userRole === 'panitera';
      const isInPaniteraList = (panList || []).some(p => 
        (p.nip && p.nip === userNip) || 
        (p.pegawaiId && String(p.pegawaiId).toUpperCase() === userId) ||
        (p.id && String(p.id).toUpperCase() === userId)
      );

      const authorized = isAdmin || isPaniteraRole || isInPaniteraList;
      setIsPaniteraAuthorized(authorized);

      if (pegRes && pegRes.length > 0) {
        setPegawaiList(pegRes);
        // Ketentuan: Nama Panitera TIDAK otomatis tertambah di dalam SPT
        // Panitera memilih sendiri personil yang akan ditugaskan
        setSelectedPegawai([]);
      }
    } catch (err) {
      console.error('Error loading initial SPT data:', err);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Real-Time Conflict Detection
  useEffect(() => {
    if (selectedPegawai.length > 0 && tglMulai && tglSelesai && sptList.length > 0) {
      const memberIds = selectedPegawai.map(p => p.nip || p.id || p.nama);
      const res = ConflictChecker.checkConflicts(memberIds, tglMulai, tglSelesai, null, sptList);
      setConflicts(res.conflicts || []);
    } else {
      setConflicts([]);
    }
  }, [selectedPegawai, tglMulai, tglSelesai, sptList]);

  // Calculate Duration
  const calculateDuration = () => {
    if (!tglMulai || !tglSelesai) return 1;
    const start = new Date(tglMulai);
    const end = new Date(tglSelesai);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // Toggle Member selection (Nama Panitera tidak otomatis tertambah)
  const toggleMember = (peg) => {
    const exists = selectedPegawai.find(p => p.nip === peg.nip);
    if (exists) {
      setSelectedPegawai(selectedPegawai.filter(p => p.nip !== peg.nip));
    } else {
      setSelectedPegawai([
        ...selectedPegawai,
        { ...peg, peranDalamTugas: selectedPegawai.length === 0 ? 'Penanggung Jawab (PJ)' : 'Anggota Pelaksana' }
      ]);
    }
  };

  // Change Member Role in task
  const updateMemberRole = (nip, role) => {
    setSelectedPegawai(selectedPegawai.map(p => 
      p.nip === nip ? { ...p, peranDalamTugas: role } : p
    ));
  };

  // Filtered pegawai list
  const filteredPegawai = pegawaiList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchPegawai.toLowerCase()) ||
                        (p.nip && p.nip.includes(searchPegawai)) ||
                        (p.unitKerja && p.unitKerja.toLowerCase().includes(searchPegawai.toLowerCase())) ||
                        (p.jabatan && p.jabatan.toLowerCase().includes(searchPegawai.toLowerCase()));
    const matchTim = filterTimKerja === 'all' || p.unitKerja === filterTimKerja;
    return matchSearch && matchTim;
  });

  // Unique Tim Kerja list for filter dropdown
  const uniqueTimKerja = Array.from(new Set(pegawaiList.map(p => p.unitKerja).filter(Boolean)));

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!isPaniteraAuthorized) {
      setErrorMsg('Akses Ditolak: Hanya Panitera yang berhak mengajukan usulan SPT.');
      return;
    }

    if (new Date(tglMulai) > new Date(tglSelesai)) {
      setErrorMsg('Tanggal mulai tidak boleh lebih lambat daripada tanggal selesai.');
      return;
    }

    if (selectedPegawai.length === 0) {
      setErrorMsg('Pilih minimal 1 orang personil pelaksana tugas.');
      return;
    }

    if (!uraianTugas.trim()) {
      setErrorMsg('Uraian tugas kedinasan wajib diisi.');
      return;
    }

    // Warning if conflict exists
    if (conflicts.length > 0) {
      const confirmSubmit = window.confirm(
        `PERINGATAN: Terdeteksi ${conflicts.length} bentrok jadwal anggota dengan SPT yang sedang aktif!\n\nApakah Anda selaku Panitera tetap ingin meneruskan pengajuan ini ke Kobag TU?`
      );
      if (!confirmSubmit) return;
    }

    setLoading(true);

    try {
      const selectedKlas = KLASIFIKASI_SPT_DEFAULT.find(k => k.id === klasifikasiId) || KLASIFIKASI_SPT_DEFAULT[0];

      const activePanitera = {
        id: user?.id || 'PAN-AKTIF',
        nama: user?.nama || 'Panitera BRMP DIY',
        nip: user?.nip || '-',
        unitKerja: user?.divisi || 'Kepaniteraan SPT'
      };

      const payload = {
        klasifikasiId: selectedKlas.id,
        klasifikasiNama: selectedKlas.nama,
        tglMulai,
        tglSelesai,
        dariTanggal: tglMulai,
        sampaiTanggal: tglSelesai,
        tujuanDaerah,
        kotaTujuan: tujuanDaerah,
        tempatTujuan,
        uraian: uraianTugas,
        untukMelaksanakan: uraianTugas,
        paniteraPengaju: activePanitera,
        pemohon: {
          id: selectedPegawai[0]?.id || selectedPegawai[0]?.pegawaiId || 'PEG-001',
          nama: selectedPegawai[0]?.nama || 'Pegawai Bertugas',
          nip: selectedPegawai[0]?.nip || '-',
          unitKerja: selectedPegawai[0]?.unitKerja || 'Balai Penerapan Standar Instrumen Pertanian DIY'
        },
        anggota: selectedPegawai,
        pegawaiBertugas: selectedPegawai
      };

      const res = await sptApiService.submitSpt(payload, user);

      if (res.success) {
        setSuccessMsg('Pengajuan SPT oleh Panitera berhasil diterbitkan! Usulan langsung masuk ke Kepala Bagian Tata Usaha (Kobag TU) untuk persetujuan tunggal.');
        setTimeout(() => {
          if (onNavigateToReport) {
            onNavigateToReport();
          }
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan SPT.');
    } finally {
      setLoading(false);
    }
  };

  const durasi = calculateDuration();

  // 1. Tampilan jika pengguna BUKAN Panitera
  if (!checkingAuth && !isPaniteraAuthorized) {
    return (
      <div className="spt-module-container" style={{ padding: '24px' }}>
        <div className="breadcrumb-banner no-print" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="breadcrumb-title">
              <Lock size={24} style={{ color: '#dc2626' }} />
              <span>Akses Khusus Panitera SPT</span>
            </h1>
            <div className="breadcrumb-path">
              <span>KITA BRMP DIY</span>
              <span>/</span>
              <span>SPT Digital</span>
              <span>/</span>
              <span className="current">Pengajuan Khusus Panitera</span>
            </div>
          </div>
          {onNavigateToReport && (
            <button 
              className="btn btn-primary"
              onClick={onNavigateToReport}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Lihat Informasi SPT Saya</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="card" style={{ padding: '36px', textAlign: 'center', maxWidth: '720px', margin: '0 auto', background: '#fff' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <Lock size={36} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Hanya Panitera yang Berhak Mengajukan SPT
          </h2>

          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
            Berdasarkan Standar Operasional Prosedur (SOP) Tata Naskah Dinas BRMP DIY terbaru, seluruh pengajuan Surat Perintah Tugas (SPT) dikelola secara terpusat oleh <strong>Panitera</strong> yang ditugaskan oleh Administrator.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', textAlign: 'left', marginBottom: '24px', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={16} color="#16a34a" />
              <span>Informasi Akses Anda:</span>
            </div>
            <div style={{ color: '#64748b' }}>
              Nama: <strong>{user?.nama || 'Pegawai'}</strong> (NIP: {user?.nip || '-'})
            </div>
            <div style={{ color: '#64748b', marginTop: '4px' }}>
              Status: <strong>Pegawai (Non-Panitera)</strong>
            </div>
            <div style={{ color: '#64748b', marginTop: '4px' }}>
              Role Panitera bersifat fleksibel dan dapat ditugaskan atau dicabut oleh Administrator Sistem di menu Administrasi SPT.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {onNavigateToReport && (
              <button 
                className="btn btn-primary"
                onClick={onNavigateToReport}
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={16} />
                <span>Buka Menu Informasi SPT Saya</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="spt-module-container">
      {/* Header Banner */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <FileText size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Formulir Pengajuan SPT (Portal Panitera)</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Pengajuan Khusus Panitera (Approval Tunggal Kobag TU)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Badge Panitera */}
          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={16} />
            <span>Panitera: {user?.nama?.split(' ')[0] || 'Aktif'}</span>
          </div>

          {onNavigateToReport && (
            <button 
              className="btn btn-secondary"
              onClick={onNavigateToReport}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Tracking & Informasi SPT</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Info Alur Terbaru */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
        <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
        <div style={{ color: '#166534' }}>
          <strong>Alur Kerja Ringkas:</strong> SPT diajukan oleh <strong>Panitera</strong> dan hanya memerlukan persetujuan langsung dari <strong>Kobag TU</strong>. Setelah disahkan Kobag TU, nomor dinas resmi & QR Keaslian siap diterbitkan.
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="card mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--primary-50)', borderBottom: '1px solid var(--primary-100)', borderRadius: '12px 12px 0 0', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>1</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>1. Klasifikasi Tugas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>2</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>2. Waktu & Durasi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>3</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>3. Personil Pelaksana</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>4</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>4. Wilayah & Uraian</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Alert Messages */}
          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Conflict Alert Banner */}
          {conflicts.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
                <AlertTriangle size={18} />
                <span>Peringatan Deteksi Bentrok Penugasan ({conflicts.length} Pegawai):</span>
              </div>
              <ul style={{ margin: '4px 0 0 20px', padding: 0, fontSize: '12.5px', lineHeight: 1.5 }}>
                {conflicts.map((cf, i) => (
                  <li key={i}>
                    <strong>{cf.pegawaiNama}</strong> telah dijadwalkan pada SPT <em>{cf.sptNomor || cf.sptId}</em> ({cf.sptTanggal}) dengan tujuan {cf.sptTujuan}.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Klasifikasi */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
              1. Pilih Klasifikasi Penugasan Kedinasan
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {KLASIFIKASI_SPT_DEFAULT.map((klas) => (
                <div 
                  key={klas.id}
                  onClick={() => setKlasifikasiId(klas.id)}
                  style={{
                    border: `2px solid ${klasifikasiId === klas.id ? 'var(--primary-600)' : '#e2e8f0'}`,
                    background: klasifikasiId === klas.id ? 'var(--primary-50)' : '#fff',
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-700)', background: 'var(--primary-100)', padding: '2px 8px', borderRadius: '4px' }}>
                      {klas.kode}
                    </span>
                    {klasifikasiId === klas.id && <CheckCircle2 size={16} color="var(--primary-600)" />}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {klas.nama}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                    Kategori: {klas.kategori}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Tanggal & Durasi */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
              2. Jadwal & Waktu Pelaksanaan Tugas
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tanggal Mulai
                </label>
                <input 
                  type="date"
                  className="form-control"
                  value={tglMulai}
                  onChange={(e) => setTglMulai(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tanggal Selesai
                </label>
                <input 
                  type="date"
                  className="form-control"
                  value={tglSelesai}
                  onChange={(e) => setTglSelesai(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Estimasi Total Durasi
                </label>
                <div style={{ height: '38px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-700)' }}>
                  <Clock size={16} style={{ marginRight: '8px' }} />
                  <span>{durasi} Hari Kalender</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Personil Pelaksana Tugas */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                3. Personil Pelaksana Tugas ({selectedPegawai.length} Orang Terpilih)
              </label>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                *Personil pertama otomatis menjadi Penanggung Jawab (PJ)
              </div>
            </div>

            {/* Selected Members Table or Guidance Placeholder */}
            {selectedPegawai.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', marginBottom: '16px' }}>
                <Users size={32} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
                <div style={{ fontWeight: 600, color: '#334155', fontSize: '13.5px' }}>
                  Belum ada personil pelaksana yang dipilih
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                  Sesuai ketentuan, <strong>nama Panitera tidak otomatis ditambahkan</strong> ke dalam SPT. Silakan pilih satu atau lebih pegawai dari daftar pencarian di bawah.
                </div>
              </div>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '10px 14px' }}>No</th>
                      <th style={{ padding: '10px 14px' }}>Nama & NIP Pegawai</th>
                      <th style={{ padding: '10px 14px' }}>Jabatan & Unit Kerja</th>
                      <th style={{ padding: '10px 14px' }}>Peran dalam SPT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPegawai.map((peg, index) => (
                      <tr key={peg.nip || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>{index + 1}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{peg.nama}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>NIP. {peg.nip}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ color: '#334155' }}>{peg.jabatan || 'Pegawai'}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{peg.unitKerja}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <select 
                            className="form-control"
                            value={peg.peranDalamTugas || (index === 0 ? 'Penanggung Jawab (PJ)' : 'Anggota Pelaksana')}
                            onChange={(e) => updateMemberRole(peg.nip, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <option value="Penanggung Jawab (PJ)">Penanggung Jawab (PJ)</option>
                            <option value="Anggota Pelaksana">Anggota Pelaksana</option>
                            <option value="Narasumber / Instruktur">Narasumber / Instruktur</option>
                            <option value="Pendamping Lapangan">Pendamping Lapangan</option>
                            <option value="Pengemudi Kedinasan">Pengemudi Kedinasan</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button 
                            type="button"
                            onClick={() => toggleMember(peg)}
                            style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Hapus dari daftar personil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Search Pegawai to Add */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Ketik nama atau NIP pegawai..."
                    value={searchPegawai}
                    onChange={(e) => setSearchPegawai(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                  />
                </div>
                <div style={{ width: '220px' }}>
                  <select 
                    className="form-control"
                    value={filterTimKerja}
                    onChange={(e) => setFilterTimKerja(e.target.value)}
                  >
                    <option value="all">Semua Tim Kerja</option>
                    {uniqueTimKerja.map((tim, i) => (
                      <option key={i} value={tim}>{tim}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pegawai Pill list */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filteredPegawai.slice(0, 24).map((p) => {
                  const isSelected = selectedPegawai.some(sp => sp.nip === p.nip);
                  return (
                    <button
                      key={p.nip}
                      type="button"
                      onClick={() => toggleMember(p)}
                      style={{
                        background: isSelected ? 'var(--primary-600)' : '#fff',
                        color: isSelected ? '#fff' : '#1e293b',
                        border: `1px solid ${isSelected ? 'var(--primary-600)' : '#cbd5e1'}`,
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{p.nama}</span>
                      {isSelected ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Lokasi & Uraian */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
              4. Wilayah Tujuan & Uraian Maksud Tugas Kedinasan
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Kota / Kabupaten Tujuan Daerah
                </label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Kabupaten Sleman, Kulon Progo, dll."
                  value={tujuanDaerah}
                  onChange={(e) => setTujuanDaerah(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tempat Spesifik / Lokasi Lapangan
                </label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Balai Penyuluhan Pertanian (BPP) & Gapoktan..."
                  value={tempatTujuan}
                  onChange={(e) => setTempatTujuan(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Uraian Maksud Penugasan Kedinasan (Untuk Melaksanakan)
              </label>
              <textarea 
                className="form-control"
                rows={3}
                placeholder="Jelaskan secara spesifik substansi tugas penerapan instrumen pertanian yang akan dilaksanakan..."
                value={uraianTugas}
                onChange={(e) => setUraianTugas(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            {onNavigateToReport && (
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={onNavigateToReport}
                disabled={loading}
              >
                Batal
              </button>
            )}
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading || !isPaniteraAuthorized}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
            >
              {loading ? (
                <span>Memproses Usulan...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Kirim Usulan SPT ke Kobag TU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
