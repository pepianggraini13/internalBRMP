import React, { useState, useEffect } from 'react';
import { sptApiService } from './sptApi';
import { 
  FileCheck, 
  Settings, 
  Scale, 
  BookOpen, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  Printer, 
  Building,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  Shield
} from 'lucide-react';

export default function SptAdmin({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('panitera'); // 'panitera' | 'penerbitan' | 'menimbang' | 'dasar' | 'pegawai'
  const [sptList, setSptList] = useState([]);
  const [paniteraList, setPaniteraList] = useState([]);
  const [menimbangList, setMenimbangList] = useState([]);
  const [dasarList, setDasarList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Panitera management state
  const [searchPegawaiPanitera, setSearchPegawaiPanitera] = useState('');
  const [processingPanitera, setProcessingPanitera] = useState(false);

  // Penomoran modal/form state
  const [selectedSptToTerbit, setSelectedSptToTerbit] = useState(null);
  const [nomorSptInput, setNomorSptInput] = useState('');
  const [fileTtdName, setFileTtdName] = useState('');

  // Menimbang & Dasar editor state
  const [newMenimbangItem, setNewMenimbangItem] = useState('');
  const [newDasarItem, setNewDasarItem] = useState('');
  const [searchPegawai, setSearchPegawai] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sptRes, pegRes, panList] = await Promise.all([
        sptApiService.getSpt(user),
        sptApiService.getPegawai(),
        sptApiService.getPanitera()
      ]);

      if (sptRes) {
        if (sptRes.sptList) setSptList(sptRes.sptList);
        if (sptRes.menimbang) setMenimbangList(sptRes.menimbang);
        if (sptRes.dasar) setDasarList(sptRes.dasar);
      }
      if (pegRes) {
        setPegawaiList(pegRes);
      }
      if (panList) {
        setPaniteraList(panList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ==========================================
  // PANITERA MANAGEMENT ACTIONS (FLEKSIBEL)
  // ==========================================
  const handleAddPanitera = async (pegawai) => {
    if (!pegawai) return;
    setProcessingPanitera(true);
    try {
      const adminName = user?.nama || 'Administrator Sistem';
      const res = await sptApiService.addPanitera(pegawai, adminName);
      if (res.success) {
        alert(`Pegawai ${pegawai.nama} berhasil ditetapkan sebagai Panitera SPT!`);
        setSearchPegawaiPanitera('');
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan Panitera');
    } finally {
      setProcessingPanitera(false);
    }
  };

  const handleRemovePanitera = async (panitera) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin mencabut peran Panitera dari ${panitera.nama}?\n\nSetelah dicabut, pegawai ini tidak lagi dapat mengajukan usulan SPT.`
    );
    if (!confirmDelete) return;

    setProcessingPanitera(true);
    try {
      const res = await sptApiService.removePanitera(panitera.id || panitera.nip);
      if (res.success) {
        alert(`Peran Panitera dari ${panitera.nama} berhasil dicabut.`);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus Panitera');
    } finally {
      setProcessingPanitera(false);
    }
  };

  // Filtered pegawai untuk penambahan Panitera
  const candidatePegawai = pegawaiList.filter(p => {
    const isAlreadyPanitera = paniteraList.some(pan => pan.nip === p.nip || pan.pegawaiId === p.id);
    if (isAlreadyPanitera) return false;

    if (!searchPegawaiPanitera.trim()) return true;
    const q = searchPegawaiPanitera.toLowerCase();
    return p.nama.toLowerCase().includes(q) || 
           (p.nip && p.nip.includes(q)) || 
           (p.unitKerja && p.unitKerja.toLowerCase().includes(q));
  });

  // Action: Terbitkan Nomor Resmi
  const handleOpenTerbitkan = (spt) => {
    setSelectedSptToTerbit(spt);
    setNomorSptInput(spt.nomorSpt || `B-${Math.floor(100 + Math.random() * 900)}/KP.320/H.14.7/10/2026`);
    setFileTtdName('');
  };

  const submitTerbitkan = async (e) => {
    e.preventDefault();
    if (!selectedSptToTerbit || !nomorSptInput.trim()) return;

    try {
      const res = await sptApiService.terbitkanSpt(selectedSptToTerbit.id, {
        nomorSpt: nomorSptInput.trim(),
        fileTtdName: fileTtdName || `SPT_${selectedSptToTerbit.id}_resmi_ttd.pdf`
      });

      if (res.success) {
        alert('Nomor dinas resmi berhasil diterbitkan dengan QR Keaslian tervalidasi!');
        setSelectedSptToTerbit(null);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menerbitkan nomor SPT');
    }
  };

  // Action: Save Menimbang
  const handleAddMenimbang = () => {
    if (!newMenimbangItem.trim()) return;
    setMenimbangList([...menimbangList, newMenimbangItem.trim()]);
    setNewMenimbangItem('');
  };

  const handleRemoveMenimbang = (idx) => {
    setMenimbangList(menimbangList.filter((_, i) => i !== idx));
  };

  const handleSaveAllMenimbang = async () => {
    try {
      const res = await sptApiService.saveMenimbang(menimbangList);
      if (res.success) {
        alert('Konsiderans Menimbang resmi berhasil disimpan!');
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan konsiderans Menimbang');
    }
  };

  // Action: Save Dasar
  const handleAddDasar = () => {
    if (!newDasarItem.trim()) return;
    setDasarList([...dasarList, newDasarItem.trim()]);
    setNewDasarItem('');
  };

  const handleRemoveDasar = (idx) => {
    setDasarList(dasarList.filter((_, i) => i !== idx));
  };

  const handleSaveAllDasar = async () => {
    try {
      const res = await sptApiService.saveDasar(dasarList);
      if (res.success) {
        alert('Konsiderans Dasar Hukum resmi berhasil disimpan!');
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan konsiderans Dasar Hukum');
    }
  };

  // Filter pending terbit
  const readyToIssueSpt = sptList.filter(s => s.status === 'approved_kobag_tu' || !s.nomorSpt);

  return (
    <div className="spt-module-container">
      {/* Header Banner */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <FileCheck size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Administrasi SPT & Pengelolaan Role Panitera</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Pengaturan Fleksibel Panitera, Nomor Resmi & Konsiderans</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu Nav */}
      <div className="card mb-4">
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 16px', gap: '8px', borderRadius: '12px 12px 0 0', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('panitera')}
            className={`btn ${activeSubTab === 'panitera' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserCheck size={16} />
            <span>1. Kelola Role Panitera (Fleksibel)</span>
            <span style={{ background: activeSubTab === 'panitera' ? 'var(--primary-700)' : '#e2e8f0', color: activeSubTab === 'panitera' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {paniteraList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('penerbitan')}
            className={`btn ${activeSubTab === 'penerbitan' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            <span>2. Penomoran Dinas & Cetak</span>
            <span style={{ background: activeSubTab === 'penerbitan' ? 'var(--primary-700)' : '#e2e8f0', color: activeSubTab === 'penerbitan' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {readyToIssueSpt.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('menimbang')}
            className={`btn ${activeSubTab === 'menimbang' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Scale size={16} />
            <span>3. Konsiderans Menimbang</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dasar')}
            className={`btn ${activeSubTab === 'dasar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            <span>4. Dasar Hukum</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pegawai')}
            className={`btn ${activeSubTab === 'pegawai' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={16} />
            <span>5. Master Pegawai (115)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* SUBTAB 1: KELOLA ROLE PANITERA FLEKSIBEL                */}
        {/* ======================================================== */}
        {activeSubTab === 'panitera' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="var(--primary-600)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Pengaturan Fleksibel Peran Panitera SPT
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                Panitera adalah pegawai yang memiliki wewenang khusus untuk menyusun dan mengajukan permohonan Surat Perintah Tugas (SPT).
                Sebagai Administrator, Anda dapat <strong>menambah pegawai menjadi Panitera</strong> atau <strong>mencabut peran Panitera</strong> kapan saja sesuai kebutuhan rotasi penugasan.
              </p>
            </div>

            {/* Form Tambah Panitera */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={16} color="var(--primary-600)" />
                <span>Tambah Pegawai Baru Sebagai Panitera SPT</span>
              </h4>

              <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '12px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Cari pegawai berdasarkan nama atau NIP..."
                  value={searchPegawaiPanitera}
                  onChange={(e) => setSearchPegawaiPanitera(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              {/* Kandidat Pegawai Dropdown / Quick Select */}
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {candidatePegawai.slice(0, 16).map(peg => (
                  <button
                    key={peg.nip}
                    type="button"
                    onClick={() => handleAddPanitera(peg)}
                    disabled={processingPanitera}
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#166534',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600
                    }}
                    title="Klik untuk mengangkat menjadi Panitera"
                  >
                    <span>+ {peg.nama}</span>
                    <span style={{ fontSize: '10px', color: '#15803d', opacity: 0.8 }}>({peg.nip})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabel Daftar Panitera Aktif */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '12px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13.5px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Daftar Panitera Aktif Saat Ini ({paniteraList.length} Orang)</span>
                <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>● Sinkronisasi Real-Time</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '10px 16px', width: '30px' }}>No</th>
                    <th style={{ padding: '10px 16px' }}>Nama & NIP Panitera</th>
                    <th style={{ padding: '10px 16px' }}>Jabatan & Unit Kerja</th>
                    <th style={{ padding: '10px 16px' }}>Tanggal Penetapan</th>
                    <th style={{ padding: '10px 16px' }}>Ditugaskan Oleh</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Aksi Administrator</th>
                  </tr>
                </thead>
                <tbody>
                  {paniteraList.map((pan, idx) => (
                    <tr key={pan.id || pan.nip} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{pan.nama}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>NIP. {pan.nip}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#334155' }}>{pan.jabatan}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{pan.unitKerja}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {pan.tglDitugaskan || '2026-10-01'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {pan.ditugaskanOleh || 'Administrator'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemovePanitera(pan)}
                          disabled={processingPanitera}
                          className="btn btn-secondary"
                          style={{
                            background: '#fee2e2',
                            borderColor: '#fca5a5',
                            color: '#b91c1c',
                            padding: '6px 12px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Cabut peran Panitera dari pegawai ini"
                        >
                          <Trash2 size={13} />
                          <span>Cabut Role Panitera</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 2: PENOMORAN RESMI & TERBITKAN                   */}
        {/* ======================================================== */}
        {activeSubTab === 'penerbitan' && (
          <div style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Penerbitan Nomor Resmi Naskah Dinas SPT (Tata Persuratan)
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Setelah usulan SPT disetujui Kobag TU, Admin Sekretariat memberikan nomor surat resmi sesuai klasifikasi agenda persuratan dinas.
            </p>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '10px 16px' }}>ID SPT</th>
                    <th style={{ padding: '10px 16px' }}>Uraian Penugasan</th>
                    <th style={{ padding: '10px 16px' }}>Tujuan & Jadwal</th>
                    <th style={{ padding: '10px 16px' }}>Nomor SPT Saat Ini</th>
                    <th style={{ padding: '10px 16px' }}>Status Persetujuan</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sptList.map((spt) => (
                    <tr key={spt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#64748b' }}>{spt.id}</td>
                      <td style={{ padding: '10px 16px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{spt.uraian}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Diajukan: {spt.paniteraPengaju?.nama || 'Panitera'}</div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div>{spt.tujuanDaerah}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{spt.tanggalSpt}</div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {spt.nomorSpt ? (
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{spt.nomorSpt}</span>
                        ) : (
                          <span style={{ color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                            Belum Diberi Nomor
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: spt.isApproved ? '#16a34a' : '#b45309' }}>
                          {spt.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenTerbitkan(spt)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {spt.nomorSpt ? 'Ubah Nomor' : 'Terbitkan Nomor'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Terbitkan Nomor */}
            {selectedSptToTerbit && (
              <div 
                className="modal-backdrop"
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
                onClick={() => setSelectedSptToTerbit(null)}
              >
                <div 
                  style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700 }}>
                    Terbitkan Nomor Naskah Resmi ({selectedSptToTerbit.id})
                  </h3>
                  <form onSubmit={submitTerbitkan}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Nomor Surat Perintah Tugas Resmi:
                      </label>
                      <input 
                        type="text"
                        className="form-control"
                        value={nomorSptInput}
                        onChange={(e) => setNomorSptInput(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Nama Berkas Naskah Digital Ter-TTD:
                      </label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="Contoh: SPT_Resmi_B-142_Kementan_ttd.pdf"
                        value={fileTtdName}
                        onChange={(e) => setFileTtdName(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setSelectedSptToTerbit(null)}>
                        Batal
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Simpan & Terbitkan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 3: MENIMBANG                                     */}
        {/* ======================================================== */}
        {activeSubTab === 'menimbang' && (
          <div style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Konsiderans Menimbang Resmi
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Poin-poin pertimbangan formal yang dicantumkan dalam naskah dinas resmi SPT BRMP DIY.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {menimbangList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{idx + 1}.</span>
                  <div style={{ flex: 1, fontSize: '13px', color: '#1e293b' }}>{item}</div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveMenimbang(idx)}
                    style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text"
                className="form-control"
                placeholder="Tambahkan poin menimbang baru..."
                value={newMenimbangItem}
                onChange={(e) => setNewMenimbangItem(e.target.value)}
              />
              <button type="button" onClick={handleAddMenimbang} className="btn btn-secondary">
                Tambah
              </button>
            </div>

            <button type="button" onClick={handleSaveAllMenimbang} className="btn btn-primary">
              Simpan Konsiderans Menimbang
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 4: DASAR HUKUM                                   */}
        {/* ======================================================== */}
        {activeSubTab === 'dasar' && (
          <div style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Konsiderans Dasar Hukum
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Regulasi hukum dan pedoman peraturan yang menjadi dasar pelaksanaan tugas kedinasan.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {dasarList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{idx + 1}.</span>
                  <div style={{ flex: 1, fontSize: '13px', color: '#1e293b' }}>{item}</div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveDasar(idx)}
                    style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text"
                className="form-control"
                placeholder="Tambahkan dasar hukum baru..."
                value={newDasarItem}
                onChange={(e) => setNewDasarItem(e.target.value)}
              />
              <button type="button" onClick={handleAddDasar} className="btn btn-secondary">
                Tambah
              </button>
            </div>

            <button type="button" onClick={handleSaveAllDasar} className="btn btn-primary">
              Simpan Dasar Hukum
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 5: MASTER 115 PEGAWAI BRMP DIY                   */}
        {/* ======================================================== */}
        {activeSubTab === 'pegawai' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Master Data Pegawai BRMP DIY ({pegawaiList.length} ASN/PPPK)
              </h3>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Cari pegawai..."
                  value={searchPegawai}
                  onChange={(e) => setSearchPegawai(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '10px 14px' }}>ID</th>
                    <th style={{ padding: '10px 14px' }}>Nama & NIP</th>
                    <th style={{ padding: '10px 14px' }}>Jabatan</th>
                    <th style={{ padding: '10px 14px' }}>Gol</th>
                    <th style={{ padding: '10px 14px' }}>Unit Kerja</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status Panitera</th>
                  </tr>
                </thead>
                <tbody>
                  {pegawaiList
                    .filter(p => !searchPegawai || p.nama.toLowerCase().includes(searchPegawai.toLowerCase()) || (p.nip && p.nip.includes(searchPegawai)))
                    .slice(0, 30)
                    .map((p) => {
                      const isPan = paniteraList.some(pan => pan.nip === p.nip || pan.pegawaiId === p.id);
                      return (
                        <tr key={p.id || p.nip} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#64748b' }}>{p.id}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.nama}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>NIP. {p.nip}</div>
                          </td>
                          <td style={{ padding: '10px 14px' }}>{p.jabatan}</td>
                          <td style={{ padding: '10px 14px' }}>{p.golongan || '-'}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569' }}>{p.unitKerja}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            {isPan ? (
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                                Panitera Aktif
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddPanitera(p)}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                + Jadikan Panitera
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
