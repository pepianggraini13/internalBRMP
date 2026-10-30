import React, { useState, useEffect } from 'react';
import { sptApiService } from './sptApi';
import QrKeaslian from './QrKeaslian';
import { KEMENTAN_LOGO_BASE64 } from '../data/logoData';
import { ConflictChecker } from '../utils/conflictChecker';
import { 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  ShieldCheck, 
  Check, 
  FileCheck,
  UserCheck,
  Lock,
  Award
} from 'lucide-react';

export default function ReportSpt({ user, onNavigateToPengajuan }) {
  const [sptList, setSptList] = useState([]);
  const [paniteraList, setPaniteraList] = useState([]);
  const [menimbangList, setMenimbangList] = useState([]);
  const [dasarList, setDasarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [printSpt, setPrintSpt] = useState(null);
  const [detailSpt, setDetailSpt] = useState(null);
  const [laporanModalSpt, setLaporanModalSpt] = useState(null);
  const [isiLaporanText, setIsiLaporanText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [laporanFileName, setLaporanFileName] = useState('');
  const [savingLaporan, setSavingLaporan] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await sptApiService.getSpt(user);
      if (res && res.sptList) {
        setSptList(res.sptList);
      }
      if (res && res.paniteraList) {
        setPaniteraList(res.paniteraList);
      }
      if (res && res.menimbang) {
        setMenimbangList(res.menimbang);
      }
      if (res && res.dasar) {
        setDasarList(res.dasar);
      }
    } catch (err) {
      console.error('Error loading SPT list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Evaluasi Peran Pengguna
  const userNip = String(user?.nip || '').trim();
  const userId = String(user?.id || user?.pegawaiId || '').toUpperCase();
  const userRole = String(user?.sptRole || user?.role || '').toLowerCase();

  const isPrivileged = 
    userRole === 'admin' || 
    userRole === 'kobag_tu' || 
    userRole === 'admin_sekretariat' ||
    userRole === 'panitera' ||
    userId === 'PEG-ADM' ||
    userId === 'PEG-002' ||
    userNip === '198101312009121004' ||
    (paniteraList || []).some(p => p.nip === userNip || p.pegawaiId === userId);

  // Filter SPT: Pegawai biasa HANYA bisa melihat SPT miliknya sendiri
  const userIsolatedSptList = sptList.filter(spt => {
    if (isPrivileged) return true;

    // Cek pemohon
    if (spt.pemohon?.nip && spt.pemohon.nip === userNip) return true;
    if (spt.pemohon?.id && String(spt.pemohon.id).toUpperCase() === userId) return true;
    if (spt.pemohon?.nama && user?.nama && spt.pemohon.nama.trim().toLowerCase() === user.nama.trim().toLowerCase()) return true;

    // Cek anggota / personil bertugas
    const inAnggota = (spt.anggota || []).some(a => 
      (a.nip && a.nip === userNip) || 
      (a.id && String(a.id).toUpperCase() === userId) ||
      (a.nama && user?.nama && a.nama.trim().toLowerCase() === user.nama.trim().toLowerCase())
    );
    if (inAnggota) return true;

    const inBertugas = (spt.pegawaiBertugas || []).some(b => 
      (b.nip && b.nip === userNip) || 
      (b.nama && user?.nama && b.nama.trim().toLowerCase() === user.nama.trim().toLowerCase())
    );
    if (inBertugas) return true;

    // Cek panitera pengaju
    if (spt.paniteraPengaju?.nip && spt.paniteraPengaju.nip === userNip) return true;

    return false;
  });

  // Filtered List berdasarkan Search & Status
  const filteredSptList = userIsolatedSptList.filter(spt => {
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'terbit' && (spt.status === 'terbit' || spt.isApproved)) ||
      (filterStatus === 'approved_kobag_tu' && spt.status === 'approved_kobag_tu') ||
      (filterStatus === 'diajukan' && spt.status === 'diajukan') ||
      (filterStatus === 'selesai' && spt.status === 'selesai') ||
      (filterStatus === 'ditolak' && spt.status === 'ditolak');

    const searchMatch = !searchQuery || 
      (spt.nomorSpt && spt.nomorSpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.id && spt.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.tujuanDaerah && spt.tujuanDaerah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.kotaTujuan && spt.kotaTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.tempatTujuan && spt.tempatTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.uraian && spt.uraian.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.paniteraPengaju?.nama && spt.paniteraPengaju.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.anggota && spt.anggota.some(a => a.nama.toLowerCase().includes(searchQuery.toLowerCase())));

    return statusMatch && searchMatch;
  });

  // Open Laporan Modal
  const openLaporanModal = (spt) => {
    setLaporanModalSpt(spt);
    setIsiLaporanText(spt.laporan?.isiLaporan || '');
    setLaporanFileName(spt.laporan?.fileLaporanName || '');
    setPhotoUrl('');
  };

  // Submit Laporan
  const handleSaveLaporan = async (e) => {
    e.preventDefault();
    if (!laporanModalSpt) return;
    setSavingLaporan(true);

    try {
      const payload = {
        isiLaporan: isiLaporanText,
        fotoUrl: photoUrl || null,
        fileLaporanName: laporanFileName || 'Laporan_Kegiatan_Dinas_BRMP.pdf'
      };

      const res = await sptApiService.submitLaporan(laporanModalSpt.id, payload);
      if (res.success) {
        alert('Laporan hasil tugas dinas berhasil disimpan!');
        setLaporanModalSpt(null);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan laporan.');
    } finally {
      setSavingLaporan(false);
    }
  };

  // Get Status Badge
  const getStatusBadge = (spt) => {
    if (spt.status === 'terbit' || (spt.isApproved && spt.nomorSpt)) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <CheckCircle2 size={13} />
          <span>SPT Terbit / Sah</span>
        </span>
      );
    }
    if (spt.status === 'approved_kobag_tu' || spt.isApproved) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <Check size={13} />
          <span>Disetujui Kobag TU</span>
        </span>
      );
    }
    if (spt.status === 'selesai') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <FileCheck size={13} />
          <span>Tugas Selesai</span>
        </span>
      );
    }
    if (spt.status === 'ditolak') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <AlertCircle size={13} />
          <span>Ditolak Kobag TU</span>
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
        <Clock size={13} />
        <span>Menunggu Kobag TU</span>
      </span>
    );
  };

  return (
    <div className="spt-module-container">
      {/* Header Banner */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <FileText size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Informasi & Tracking Surat Perintah Tugas (SPT)</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">
              {isPrivileged ? 'Arsip Seluruh SPT Dinas' : 'Informasi SPT Pribadi Pegawai'}
            </span>
          </div>
        </div>

        {onNavigateToPengajuan && isPrivileged && (
          <button 
            className="btn btn-primary"
            onClick={onNavigateToPengajuan}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Buat Usulan SPT Baru</span>
          </button>
        )}
      </div>

      {/* Info Banner Isolasi Data & Hak Akses */}
      {!isPrivileged ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0 }} />
          <div style={{ color: '#166534', lineHeight: 1.4 }}>
            <strong>Mode Pegawai:</strong> Anda hanya dapat melihat informasi Surat Perintah Tugas (SPT) atas nama Anda sendiri (<strong>{user?.nama || 'Pegawai'}</strong>). Pengajuan SPT hanya dapat dilakukan oleh Panitera.
          </div>
        </div>
      ) : (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <UserCheck size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div style={{ color: '#1e40af', lineHeight: 1.4 }}>
            <strong>Mode Wewenang Khusus ({userRole === 'panitera' ? 'Panitera' : userRole === 'kobag_tu' ? 'Kobag TU' : 'Administrator'}):</strong> Anda memiliki akses untuk memantau seluruh arsip SPT dinas BRMP DIY.
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card mb-4 no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              className="form-control"
              placeholder="Cari nomor SPT, tujuan daerah, nama panitera / personil pelaksana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Filter Status Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'terbit', label: 'SPT Terbit' },
              { id: 'approved_kobag_tu', label: 'Disetujui Kobag TU' },
              { id: 'diajukan', label: 'Menunggu Approval' },
              { id: 'selesai', label: 'Selesai' },
              { id: 'ditolak', label: 'Ditolak' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn ${filterStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus(tab.id)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card mb-4">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
            Daftar Surat Perintah Tugas ({filteredSptList.length} Dokumen Ditemukan)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Memuat arsip data SPT...
          </div>
        ) : filteredSptList.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <FileText size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
              Tidak ada data SPT yang sesuai
            </div>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
              {!isPrivileged 
                ? 'Belum ada Surat Perintah Tugas atas nama Anda yang terdaftar.'
                : 'Tidak ada usulan SPT dengan kriteria filter pencarian tersebut.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Nomor & ID SPT</th>
                  <th style={{ padding: '12px 16px' }}>Jadwal & Tujuan</th>
                  <th style={{ padding: '12px 16px' }}>Uraian Penugasan</th>
                  <th style={{ padding: '12px 16px' }}>Personil Bertugas</th>
                  <th style={{ padding: '12px 16px' }}>Panitera Pengaju</th>
                  <th style={{ padding: '12px 16px' }}>Status & QR Keaslian</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSptList.map((spt) => (
                  <tr key={spt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {spt.nomorSpt || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Menunggu Penomoran</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                        {spt.id}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        📍 {spt.tempatTujuan || spt.tujuanDaerah}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        📅 {spt.tanggalSpt || `${spt.tglMulai} s/d ${spt.tglSelesai}`} ({spt.lamaHari || `${spt.durasiHari || 1} hari`})
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                      <div style={{ color: '#334155', lineHeight: 1.4 }}>
                        {spt.uraian || spt.untukMelaksanakan}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: 600, marginTop: '3px' }}>
                        {spt.klasifikasiNama}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                        {spt.anggota?.[0]?.nama || 'Personil BRMP'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {(spt.anggota?.length || 1) > 1 
                          ? `+ ${(spt.anggota?.length || 1) - 1} Anggota Lainnya` 
                          : 'Personil Tunggal'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>
                        {spt.paniteraPengaju?.nama || "Devi Eka Nuvitasari, S.H."}
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        Panitera Resmi
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>{getStatusBadge(spt)}</div>
                        {/* Mini QR Badge */}
                        <div 
                          onClick={() => setPrintSpt(spt)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}
                          title="Lihat Sertifikat QR Keaslian"
                        >
                          <ShieldCheck size={12} />
                          <span>QR Keaslian: {spt.keaslian?.tglPengesahan || spt.tglPengajuan}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setDetailSpt(spt)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Lihat Rincian SPT & Timeline"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintSpt(spt)}
                          className="btn btn-primary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Cetak Naskah Resmi SPT dengan QR Code Keaslian"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openLaporanModal(spt)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Unggah Laporan Hasil Tugas"
                        >
                          <Upload size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: PRATINJAU & CETAK DOKUMEN NASKAH RESMI SPT      */}
      {/* ======================================================== */}
      {printSpt && (
        <div 
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={() => setPrintSpt(null)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="no-print" style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 700, fontSize: '14px' }}>
                  Format Naskah Resmi Surat Perintah Tugas (SPT) - Standar Kementan RI
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setPrintSpt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Body (Printable Area) */}
            <div style={{ padding: '30px 40px', overflowY: 'auto', flex: 1, background: '#fff', color: '#000', fontFamily: 'serif' }}>
              <div className="spt-official-document">
                {/* KOP RESMI KEMENTAN RI */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '16px' }}>
                  <img 
                    src={KEMENTAN_LOGO_BASE64} 
                    alt="Logo Kementerian Pertanian RI" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      KEMENTERIAN PERTANIAN
                    </div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      BADAN STANDARDISASI INSTRUMEN PERTANIAN
                    </div>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      BALAI PENERAPAN STANDAR INSTRUMEN PERTANIAN D.I. YOGYAKARTA
                    </div>
                    <div style={{ fontSize: '9pt', fontStyle: 'italic', marginTop: '2px', fontFamily: 'sans-serif' }}>
                      Jl. Stadion Maguwoharjo No. 22, Karangsari, Wedomartani, Ngemplak, Sleman, D.I. Yogyakarta 55584
                    </div>
                    <div style={{ fontSize: '8.5pt', fontFamily: 'sans-serif' }}>
                      Telepon: (0274) 884662 | Faksimili: (0274) 884662 | Pos-el: brmp.diy@pertanian.go.id
                    </div>
                  </div>
                </header>

                {/* JUDUL & NOMOR SURAT */}
                <div style={{ textAlign: 'center', margin: '20px 0 16px 0' }}>
                  <div style={{ fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '0.5px' }}>
                    SURAT PERINTAH TUGAS
                  </div>
                  <div style={{ fontSize: '10.5pt', fontWeight: 'bold', marginTop: '4px' }}>
                    NOMOR: {printSpt.nomorSpt || `USULAN-${printSpt.id}`}
                  </div>
                </div>

                {/* MENIMBANG */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', fontSize: '10.5pt', lineHeight: 1.5, marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>Menimbang</div>
                  <div>:</div>
                  <div>
                    <ol style={{ margin: 0, paddingLeft: '18px' }}>
                      {menimbangList.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '4px', textAlign: 'justify' }}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* DASAR */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', fontSize: '10.5pt', lineHeight: 1.5, marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold' }}>Dasar</div>
                  <div>:</div>
                  <div>
                    <ol style={{ margin: 0, paddingLeft: '18px' }}>
                      {dasarList.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '4px', textAlign: 'justify' }}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* MEMBERI PERINTAH */}
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', margin: '14px 0' }}>
                  MEMBERI PERINTAH:
                </div>

                {/* KEPADA */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', fontSize: '10.5pt', lineHeight: 1.5, marginBottom: '14px' }}>
                  <div style={{ fontWeight: 'bold' }}>Kepada</div>
                  <div>:</div>
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginTop: '2px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '25px' }}>No</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left' }}>Nama / NIP</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left' }}>Pangkat / Gol</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left' }}>Jabatan</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left' }}>Peran Tugas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(printSpt.anggota || printSpt.pegawaiBertugas || []).map((ang, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>{i + 1}.</td>
                            <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>
                              <strong>{ang.nama}</strong><br />
                              NIP. {ang.nip || '-'}
                            </td>
                            <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>{ang.golongan || '-'}</td>
                            <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>{ang.jabatan || 'Pegawai BRMP'}</td>
                            <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>{ang.peranDalamTugas || 'Pelaksana'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* UNTUK */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', fontSize: '10.5pt', lineHeight: 1.5, marginBottom: '18px' }}>
                  <div style={{ fontWeight: 'bold' }}>Untuk</div>
                  <div>:</div>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>1.</span>
                      <span>{printSpt.uraian || printSpt.untukMelaksanakan}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>2.</span>
                      <span>
                        Lokasi / Tempat Tujuan: <strong>{printSpt.tempatTujuan || printSpt.kotaTujuan || printSpt.tujuanDaerah}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>3.</span>
                      <span>
                        Waktu Pelaksanaan: Selama <strong>{printSpt.lamaHari || `${printSpt.durasiHari || 1} hari`}</strong> pada tanggal <strong>{printSpt.tanggalSpt || `${printSpt.tglMulai || printSpt.dariTanggal} s/d ${printSpt.tglSelesai || printSpt.sampaiTanggal}`}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>4.</span>
                      <span>
                        Pengajuan ini diajukan secara resmi oleh Panitera: <strong>{printSpt.paniteraPengaju?.nama || "Devi Eka Nuvitasari, S.H."}</strong> dan telah memperoleh persetujuan tunggal dari Kepala Bagian Tata Usaha (Kobag TU).
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>5.</span>
                      <span>
                        Biaya yang timbul akibat pelaksanaan Surat Perintah Tugas ini dibebankan pada DIPA Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta Tahun Anggaran Berjalan.
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>6.</span>
                      <span>
                        Setelah selesai melaksanakan tugas, pelaksana wajib menyampaikan laporan tertulis hasil pelaksanaan kegiatan kepada Kepala Balai.
                      </span>
                    </div>
                  </div>
                </div>

                {/* TANDA TANGAN & QR CODE KEASLIAN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', marginTop: '24px', fontSize: '10.5pt' }}>
                  <div></div>
                  <div style={{ textAlign: 'left' }}>
                    <div>Ditetapkan di: Yogyakarta</div>
                    <div>
                      Pada tanggal: <strong>{ConflictChecker.formatDateIndo(printSpt.keaslian?.tglPengesahan || printSpt.tglPengesahan || printSpt.tglPengajuan || printSpt.dariTanggal)}</strong>
                    </div>
                    <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                      Kepala Balai Penerapan Standar<br />
                      Instrumen Pertanian D.I. Yogyakarta,
                    </div>

                    {/* QR Code Keaslian dengan Tanggal & Validasi BSRE */}
                    <div style={{ margin: '14px 0' }}>
                      <QrKeaslian spt={printSpt} size={110} showDetails={true} />
                    </div>

                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      Dr. Soeharsono, S.Pt, M.Si
                    </div>
                    <div>NIP. 197109271998031002</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer no-print" style={{ padding: '14px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setPrintSpt(null)}
              >
                Tutup
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>🖨️ Cetak ke Kertas A4 / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RINCIAN SPT, PANITERA & TIMELINE APPROVAL       */}
      {/* ======================================================== */}
      {detailSpt && (
        <div 
          className="modal-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
          onClick={() => setDetailSpt(null)}
        >
          <div 
            style={{ background: '#fff', borderRadius: '14px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '3px 8px', borderRadius: '4px' }}>
                  {detailSpt.id}
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {detailSpt.nomorSpt || 'Usulan Surat Perintah Tugas'}
                </h3>
              </div>
              <button type="button" onClick={() => setDetailSpt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
                <QrKeaslian spt={detailSpt} size={80} showDetails={false} />
                <div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '13.5px' }}>
                    Sertifikasi QR Keaslian Dokumen
                  </div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                    Tanggal Pengesahan: <strong>{detailSpt.keaslian?.tglPengesahan || detailSpt.tglPengesahan || detailSpt.tglPengajuan}</strong>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11.5px', marginTop: '2px' }}>
                    Approval Tunggal: <strong>Agung Ariyanto, SEI., M.Ec., Dev. (Kobag TU)</strong>
                  </div>
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Maksud Penugasan Kedinasan:</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{detailSpt.uraian || detailSpt.untukMelaksanakan}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Tujuan Wilayah:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>📍 {detailSpt.tempatTujuan || detailSpt.tujuanDaerah}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Tanggal Pelaksanaan:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>📅 {detailSpt.tanggalSpt} ({detailSpt.lamaHari})</div>
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Panitera Pengaju:</span>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px', color: '#166534', fontWeight: 600 }}>
                  ✍️ {detailSpt.paniteraPengaju?.nama || "Devi Eka Nuvitasari, S.H."} (Panitera Resmi BRMP)
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '6px' }}>Personil Pelaksana Tugas:</span>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {(detailSpt.anggota || detailSpt.pegawaiBertugas || []).map((ang, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderBottom: i === (detailSpt.anggota?.length || 1) - 1 ? 'none' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{ang.nama}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>NIP. {ang.nip}</div>
                      </div>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#475569' }}>
                        {ang.peranDalamTugas || 'Pelaksana'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Status */}
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '6px' }}>Jejak Audit & Verifikasi:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(detailSpt.timeline || []).map((tl, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                      <span style={{ color: '#64748b', minWidth: '105px', fontFamily: 'monospace' }}>{tl.waktu}</span>
                      <div>
                        <strong>{tl.aktor}</strong>: {tl.aksi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailSpt(null)}>
                Tutup
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  const s = detailSpt;
                  setDetailSpt(null);
                  setPrintSpt(s);
                }}
              >
                Cetak Naskah Resmi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: UNGGAH LAPORAN & FOTO PERTANGGUNGJAWABAN       */}
      {/* ======================================================== */}
      {laporanModalSpt && (
        <div 
          className="modal-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
          onClick={() => setLaporanModalSpt(null)}
        >
          <div 
            style={{ background: '#fff', borderRadius: '14px', maxWidth: '580px', width: '100%', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Pelaporan Hasil Tugas Dinas ({laporanModalSpt.id})
              </h3>
              <button type="button" onClick={() => setLaporanModalSpt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLaporan}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Uraian Hasil Pelaksanaan Tugas Lapangan:
                </label>
                <textarea 
                  className="form-control"
                  rows={4}
                  placeholder="Deskripsikan capaian bimbingan teknis / koordinasi / pengujian yang telah terlaksana..."
                  value={isiLaporanText}
                  onChange={(e) => setIsiLaporanText(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Tautan URL Foto Dokumentasi Kegiatan:
                </label>
                <input 
                  type="url"
                  className="form-control"
                  placeholder="https://... atau foto dokumentasi kegiatan lapangan"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Nama Berkas Laporan Resmi (PDF):
                </label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Laporan_Bimtek_BPP_Sentolo.pdf"
                  value={laporanFileName}
                  onChange={(e) => setLaporanFileName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLaporanModalSpt(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingLaporan}>
                  {savingLaporan ? 'Menyimpan...' : 'Simpan Laporan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
