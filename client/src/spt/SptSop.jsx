import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, FileText, ArrowRight, UserCheck, Award, Lock } from 'lucide-react';

export default function SptSop() {
  const sopAlurBaru = [
    {
      step: 1,
      tahap: "Pengajuan Terpusat oleh Panitera",
      pelaksana: "Panitera SPT Resmi",
      sla: "Maks. 2 Jam",
      deskripsi: "Pengajuan usulan penugasan dinas disusun dan diinput ke sistem e-SPT secara eksklusif oleh Panitera yang telah ditetapkan Administrator.",
      output: "Draft usulan SPT tercatat di sistem e-SPT dengan status 'diajukan'."
    },
    {
      step: 2,
      tahap: "Verifikasi Bentrok & Validasi Personil",
      pelaksana: "Sistem Otomatis KITA BRMP",
      sla: "Real-Time (Instan)",
      deskripsi: "Sistem memeriksa jadwal 115 pegawai BRMP DIY secara otomatis untuk mencegah tumpang tindih penugasan di tanggal yang sama.",
      output: "Hasil deteksi zero-conflict jadwal dinas."
    },
    {
      step: 3,
      tahap: "Persetujuan Tunggal Kobag TU",
      pelaksana: "Kepala Bagian Tata Usaha (Kobag TU)",
      sla: "Maks. 4 Jam Kerja",
      deskripsi: "Kepala Bagian Tata Usaha menelaah kesesuaian anggaran DIPA, urgensi tugas, dan personil yang ditugaskan tanpa tahapan berjenjang.",
      output: "Pengesahan status usulan menjadi 'approved_kobag_tu'."
    },
    {
      step: 4,
      tahap: "Penomoran Resmi & QR Keaslian",
      pelaksana: "Admin Tata Persuratan / Sekretariat",
      sla: "Maks. 1 Jam Kerja",
      deskripsi: "Penerbitan nomor surat dinas resmi Kementan RI dan pembuatan QR Code Keaslian BSRE BSSN bertanggal pengesahan.",
      output: "Naskah resmi SPT terbit siap cetak dan terverifikasi digital."
    },
    {
      step: 5,
      tahap: "Pelaksanaan & Akses Informasi Pegawai",
      pelaksana: "Pegawai Pelaksana Tugas",
      sla: "Sesuai Durasi SPT",
      deskripsi: "Pegawai yang bertugas memantau informasi SPT masing-masing melalui portal e-SPT dan melaksanakan tugas kedinasan di lapangan.",
      output: "Pelaksanaan tugas dinas sesuai SPT resmi."
    },
    {
      step: 6,
      tahap: "Pelaporan Hasil & Pertanggungjawaban",
      pelaksana: "Pelaksana Tugas / Panitera",
      sla: "Maks. H+3 Selesai Tugas",
      deskripsi: "Unggah uraian hasil kegiatan dinas, bukti foto dokumentasi lapangan, dan berkas pertanggungjawaban dinas.",
      output: "Status SPT 'selesai' dengan arsip dokumen tersimpan."
    }
  ];

  return (
    <div className="spt-module-container">
      {/* Header */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <BookOpen size={24} style={{ color: 'var(--primary-600)' }} />
            <span>SOP Penerbitan SPT & Matriks Wewenang Baru</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Alur Panitera & Approval Tunggal Kobag TU</span>
          </div>
        </div>
        <div>
          <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            Regulasi SOP: No. 04/BRMP.DIY/SPT/2026
          </span>
        </div>
      </div>

      <div className="card mb-4">
        <div style={{ padding: '24px' }}>
          {/* 4 Pilar Pembaharuan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <UserCheck size={18} />
                <span>1. Hak Pengajuan Eksklusif Panitera</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#15803d', lineHeight: 1.5 }}>
                Pengajuan SPT dikelola khusus oleh Panitera terpusat. Peran Panitera bersifat fleksibel dan dapat diatur Administrator.
              </p>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <CheckCircle2 size={18} />
                <span>2. Approval Tunggal Kobag TU</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#1e3a8a', lineHeight: 1.5 }}>
                Memangkas birokrasi berjenjang. Usulan langsung diajukan ke Kobag TU untuk verifikasi satu pintu yang cepat.
              </p>
            </div>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <Lock size={18} />
                <span>3. Isolasi Privasi Data Pegawai</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                Pegawai non-pejabat hanya dapat melihat informasi Surat Perintah Tugas (SPT) atas nama dirinya sendiri.
              </p>
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <Award size={18} />
                <span>4. Sertifikasi QR Keaslian & Tanggal</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#581c87', lineHeight: 1.5 }}>
                Setiap dokumen SPT resmi dilengkapi QR Code Keaslian bersertifikasi BSRE BSSN dengan tanggal pengesahan yang valid.
              </p>
            </div>
          </div>

          {/* Bagan 6 Tahap Alur */}
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Bagan Alur Standar Pelayanan Penerbitan SPT Baru:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {sopAlurBaru.map((step) => (
              <div 
                key={step.step}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    {step.step}
                  </span>
                  <span style={{ fontSize: '11px', background: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    SLA: {step.sla}
                  </span>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', margin: '4px 0' }}>
                  {step.tahap}
                </h4>

                <div style={{ fontSize: '11.5px', color: 'var(--primary-700)', fontWeight: 700, marginBottom: '6px' }}>
                  Pelaksana: {step.pelaksana}
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 10px 0', flex: 1 }}>
                  {step.deskripsi}
                </p>

                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', fontSize: '11px', color: '#475569' }}>
                  <strong>Output:</strong> {step.output}
                </div>
              </div>
            ))}
          </div>

          {/* Matriks RACI */}
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
            Matriks Wewenang & Tanggung Jawab RACI:
          </h3>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'center' }}>
                <tr>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Aktivitas / Tahapan Layanan</th>
                  <th style={{ padding: '10px 14px' }}>Panitera SPT</th>
                  <th style={{ padding: '10px 14px' }}>Kobag TU</th>
                  <th style={{ padding: '10px 14px' }}>Admin / Tata Usaha</th>
                  <th style={{ padding: '10px 14px' }}>Pegawai Bertugas</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>1. Pengusulan SPT Baru</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#dcfce7', fontWeight: 'bold', color: '#166534' }}>R (Responsible)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>A (Accountable)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>C (Consulted)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>2. Penetapan Role Panitera (Fleksibel)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>C (Consulted)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#dcfce7', fontWeight: 'bold', color: '#166534' }}>R/A (Authorized)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>3. Persetujuan Tunggal Usulan</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#dcfce7', fontWeight: 'bold', color: '#166534' }}>A (Accountable)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>4. Penerbitan Nomor Resmi & QR Keaslian</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#dcfce7', fontWeight: 'bold', color: '#166534' }}>R (Responsible)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>5. Pelaksanaan & Pelaporan Tugas</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>C (Consulted)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>I (Informed)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#dcfce7', fontWeight: 'bold', color: '#166534' }}>R (Responsible)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
