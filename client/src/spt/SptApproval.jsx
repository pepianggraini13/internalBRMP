import React, { useState, useEffect } from 'react';
import { sptApiService } from './sptApi';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Check, 
  X,
  AlertCircle,
  Building,
  Calendar,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function SptApproval({ user, onNavigateToReport }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [sptList, setSptList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await sptApiService.getSpt(user);
      if (res && res.sptList) {
        setSptList(res.sptList);
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

  // Handle Approve by Kobag TU
  const handleApprove = async (sptId) => {
    setProcessingId(sptId);
    try {
      const note = notes[sptId] || 'Disetujui oleh Kepala Bagian Tata Usaha (Kobag TU). Lanjutkan penerbitan nomor naskah dinas resmi.';
      const res = await sptApiService.approveSpt(sptId, 'kobag_tu', note, user);
      if (res.success) {
        alert('Persetujuan tunggal Kobag TU berhasil disahkan! SPT siap diterbitkan nomor resmi dan dicetak.');
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyetujui SPT');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject by Kobag TU
  const handleReject = async (sptId) => {
    const reason = prompt('Masukkan catatan penolakan / arahan revisi untuk Panitera pengaju:');
    if (!reason) return;

    setProcessingId(sptId);
    try {
      const res = await sptApiService.rejectSpt(sptId, 'kobag_tu', reason);
      if (res.success) {
        alert('Usulan SPT berhasil ditolak / dikembalikan ke Panitera untuk perbaikan.');
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menolak SPT');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter list berdasarkan alur persetujuan tunggal Kobag TU
  const pendingList = sptList.filter(s => s.status === 'diajukan');
  const approvedList = sptList.filter(s => s.status === 'approved_kobag_tu' || s.status === 'terbit' || s.status === 'selesai');
  const rejectedList = sptList.filter(s => s.status === 'ditolak');

  return (
    <div className="spt-module-container">
      {/* Header */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <CheckCircle2 size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Approval Tunggal Surat Perintah Tugas (Kobag TU)</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Persetujuan Utama Kepala Bagian Tata Usaha</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            <span>Pejabat Penelaah: Kobag TU</span>
          </div>
        </div>
      </div>

      {/* Info Banner Alur Tunggal */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
        <ShieldCheck size={22} color="var(--primary-600)" style={{ flexShrink: 0 }} />
        <div style={{ color: '#334155', lineHeight: 1.5 }}>
          <strong>Persetujuan Efisien Satu Pintu:</strong> Sesuai instruksi pimpinan, persetujuan usulan SPT dari Panitera <strong>hanya memerlukan persetujuan dari Kepala Bagian Tata Usaha (Kobag TU)</strong> tanpa tahapan berjenjang unit kerja.
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-4">
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 16px', gap: '8px', borderRadius: '12px 12px 0 0', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('pending')}
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Clock size={16} />
            <span>1. Menunggu Approval Kobag TU</span>
            <span style={{ background: activeTab === 'pending' ? 'var(--primary-700)' : '#e2e8f0', color: activeTab === 'pending' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={16} />
            <span>2. Disetujui Kobag TU</span>
            <span style={{ background: activeTab === 'approved' ? 'var(--primary-700)' : '#e2e8f0', color: activeTab === 'approved' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {approvedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`btn ${activeTab === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <XCircle size={16} />
            <span>3. Ditolak / Perlu Revisi</span>
            <span style={{ background: activeTab === 'rejected' ? 'var(--primary-700)' : '#e2e8f0', color: activeTab === 'rejected' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {rejectedList.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Menunggu Persetujuan */}
        {activeTab === 'pending' && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                Antrean Usulan SPT yang Memerlukan Pengesahan Kobag TU
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Selaku Kobag TU, periksa substansi tugas, kesesuaian anggaran, dan personil pelaksana yang diajukan oleh Panitera.
              </p>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Memuat data pengajuan...</div>
            ) : pendingList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
                ✓ Tidak ada usulan penugasan dinas yang menunggu persetujuan Kobag TU saat ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingList.map((spt) => (
                  <div key={spt.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            Menunggu Approval Kobag TU
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            ID: <strong>{spt.id}</strong>
                          </span>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '4px 0' }}>
                          [{spt.klasifikasiNama || 'Penugasan Kedinasan'}] {spt.uraian || spt.untukMelaksanakan}
                        </h4>

                        <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                          <span>📍 Lokasi: <strong>{spt.tempatTujuan || spt.tujuanDaerah}</strong></span>
                          <span>📅 Jadwal: <strong>{spt.tanggalSpt || `${spt.tglMulai} s/d ${spt.tglSelesai}`}</strong> ({spt.lamaHari || `${spt.durasiHari || 1} hari`})</span>
                          <span>✍️ Diajukan Panitera: <strong>{spt.paniteraPengaju?.nama || 'Panitera BRMP'}</strong></span>
                        </div>

                        {/* Personil pelaksana */}
                        <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            👥 Personil Pelaksana Tugas ({spt.anggota?.length || 0} Pegawai):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(spt.anggota || spt.pegawaiBertugas || []).map((ang, i) => (
                              <span key={i} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#1e293b' }}>
                                <strong>{ang.nama}</strong> ({ang.peranDalamTugas || 'Pelaksana'})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Catatan Kobag TU input */}
                        <div style={{ marginTop: '14px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Catatan Pengesahan Kobag TU:
                          </label>
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="Contoh: Disetujui sesuai target kinerja BRMP DIY..."
                            value={notes[spt.id] || ''}
                            onChange={(e) => setNotes({ ...notes, [spt.id]: e.target.value })}
                            style={{ fontSize: '12.5px' }}
                          />
                        </div>
                      </div>

                      {/* Tombol aksi */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                        <button
                          onClick={() => handleApprove(spt.id)}
                          disabled={processingId === spt.id}
                          className="btn btn-primary"
                          style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <Check size={16} />
                          <span>Setujui (Kobag TU)</span>
                        </button>
                        <button
                          onClick={() => handleReject(spt.id)}
                          disabled={processingId === spt.id}
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '12.5px', color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <X size={15} />
                          <span>Tolak / Revisi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Riwayat Disetujui */}
        {activeTab === 'approved' && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>
              Daftar Usulan SPT yang Telah Disetujui Kobag TU
            </h3>
            {approvedList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Belum ada SPT yang disetujui.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {approvedList.map(spt => (
                  <div key={spt.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#166534', fontSize: '14px' }}>
                        {spt.nomorSpt ? `[${spt.nomorSpt}]` : `[${spt.id}]`} {spt.uraian}
                      </div>
                      <div style={{ fontSize: '12px', color: '#15803d', marginTop: '3px' }}>
                        📍 {spt.tujuanDaerah} | 📅 {spt.tanggalSpt} | Disetujui Kobag TU: <em>{spt.catatanKobagTu || 'Disetujui'}</em>
                      </div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
                      ✓ {spt.statusLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ditolak */}
        {activeTab === 'rejected' && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>
              Daftar Usulan SPT yang Ditolak Kobag TU
            </h3>
            {rejectedList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Tidak ada SPT yang ditolak.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rejectedList.map(spt => (
                  <div key={spt.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '14px' }}>
                      [{spt.id}] {spt.uraian}
                    </div>
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '3px' }}>
                      Alasan Penolakan: <strong>{spt.catatanPenolakan || 'Perlu perbaikan usulan'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
