import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, ShieldCheck } from 'lucide-react';

export default function CutiFormulirBkn({ cuti, onClose }) {
  if (!cuti) return null;

  // Add class to body when modal opens for isolated 1-page print
  useEffect(() => {
    document.body.classList.add('bkn-print-active');
    return () => {
      document.body.classList.remove('bkn-print-active');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Helper formatting
  const todayStr = cuti.tanggalPengajuan || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const jenis = (cuti.jenisCuti || '').toLowerCase();
  const isTahunan = jenis.includes('tahunan');
  const isBesar = jenis.includes('besar');
  const isSakit = jenis.includes('sakit');
  const isMelahirkan = jenis.includes('melahirkan') && !jenis.includes('istri');
  const isPenting = jenis.includes('penting') || jenis.includes('alasan');
  const isCltn = jenis.includes('tanggungan') || jenis.includes('cltn');

  const sisaN1 = cuti.catatanCuti?.n1 !== undefined ? cuti.catatanCuti.n1 : 0;
  const sisaN = cuti.catatanCuti?.n !== undefined ? cuti.catatanCuti.n : (cuti.sisaCuti || 12);
  const sisaN2 = cuti.catatanCuti?.n2 !== undefined ? cuti.catatanCuti.n2 : 0;

  const isApproved = cuti.status === 'disetujui';

  const modalContent = (
    <div className="bkn-modal-overlay">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="bkn-control-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#15803d', color: '#fff', padding: '6px', borderRadius: '6px' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>
              Formulir Permintaan & Pemberian Cuti (Format Resmi BKN)
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              ID: {cuti.id} • Status: <strong style={{ color: isApproved ? '#15803d' : '#d97706' }}>{cuti.statusLabel || cuti.status}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrint}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
            }}
          >
            <Printer size={16} />
            <span>Cetak Formulir (1 Lembar A4)</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={16} />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* Sheet Container (Screen & Print) */}
      <div className="bkn-sheet-container">
        <div className="bkn-a4-page">
          {/* Header Place & Date */}
          <div style={{ textAlign: 'right', fontSize: '8.8pt', marginBottom: '4px', fontFamily: '"Bookman Old Style", Georgia, serif' }}>
            Yogyakarta, {todayStr}
          </div>

          {/* Kepada Tujuan */}
          <div style={{ fontSize: '8.8pt', lineHeight: '1.2', marginBottom: '5px', fontFamily: '"Bookman Old Style", Georgia, serif' }}>
            Kepada<br />
            Yth. Kepala Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta<br />
            di Yogyakarta
          </div>

          {/* Judul Formulir */}
          <div style={{
            textAlign: 'center',
            fontSize: '10pt',
            fontWeight: 'bold',
            textDecoration: 'underline',
            marginBottom: '6px',
            fontFamily: '"Bookman Old Style", Georgia, serif',
            letterSpacing: '0.4px'
          }}>
            FORMULIR PERMINTAAN DAN PEMBERIAN CUTI
          </div>

          {/* I. DATA PEGAWAI */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="4" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  I. DATA PEGAWAI
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: '18%', fontWeight: 500 }}>Nama</td>
                <td style={{ width: '38%', fontWeight: 'bold' }}>{cuti.nama || '-'}</td>
                <td style={{ width: '14%', fontWeight: 500 }}>NIP</td>
                <td style={{ width: '30%', fontWeight: 'bold' }}>{cuti.nip || '-'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Jabatan</td>
                <td>{cuti.jabatan || '-'}</td>
                <td style={{ fontWeight: 500 }}>Masa Kerja</td>
                <td>{cuti.masaKerja || '01 Tahun 03 Bulan'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Unit Kerja</td>
                <td colSpan="3">{cuti.divisi || 'Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta'}</td>
              </tr>
            </tbody>
          </table>

          {/* II. JENIS CUTI YANG DIAMBIL */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="4" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  II. JENIS CUTI YANG DIAMBIL **
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: '40%' }}>1. Cuti Tahunan</td>
                <td style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                  {isTahunan ? '√' : ''}
                </td>
                <td style={{ width: '40%' }}>2. Cuti Besar</td>
                <td style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                  {isBesar ? '√' : ''}
                </td>
              </tr>
              <tr>
                <td>3. Cuti Sakit</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                  {isSakit ? '√' : ''}
                </td>
                <td>4. Cuti Melahirkan</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                  {isMelahirkan ? '√' : ''}
                </td>
              </tr>
              <tr>
                <td>5. Cuti Karena Alasan Penting</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                  {isPenting ? '√' : ''}
                </td>
                <td>6. Cuti di Luar Tanggungan Negara</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                  {isCltn ? '√' : ''}
                </td>
              </tr>
            </tbody>
          </table>

          {/* III. ALASAN CUTI */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  III. ALASAN CUTI
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '3px 5px' }}>
                  {cuti.alasan || 'Tidak ada keterangan'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* IV. LAMANYA CUTI */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="4" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  IV. LAMANYA CUTI
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: '15%', fontWeight: 500 }}>Selama</td>
                <td style={{ width: '35%', fontWeight: 'bold' }}>
                  {cuti.jumlahHari || 1} (hari)
                </td>
                <td style={{ width: '15%', fontWeight: 500 }}>Tanggal</td>
                <td style={{ width: '35%', fontWeight: 'bold' }}>
                  {cuti.tanggalMulai} s.d. {cuti.tanggalAkhir}
                </td>
              </tr>
            </tbody>
          </table>

          {/* V. CATATAN CUTI (3 TAHUN KUOTA) */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="5" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  V. CATATAN CUTI ***
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" style={{ fontWeight: 'bold', width: '50%', background: '#fafafa' }}>
                  1. CUTI TAHUNAN
                </td>
                <td style={{ width: '40%', fontWeight: 500 }}>2. CUTI BESAR</td>
                <td style={{ width: '10%', textAlign: 'center' }}>{isBesar ? '√' : ''}</td>
              </tr>
              <tr>
                <td style={{ width: '15%', textAlign: 'center', fontWeight: 'bold' }}>Tahun</td>
                <td style={{ width: '15%', textAlign: 'center', fontWeight: 'bold' }}>Sisa</td>
                <td style={{ width: '20%', textAlign: 'center', fontWeight: 'bold' }}>Keterangan</td>
                <td style={{ fontWeight: 500 }}>3. CUTI SAKIT</td>
                <td style={{ textAlign: 'center' }}>{isSakit ? '√' : ''}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>N – 2</td>
                <td style={{ textAlign: 'center' }}>{sisaN2 > 0 ? sisaN2 : '-'}</td>
                <td style={{ textAlign: 'center' }}>-</td>
                <td style={{ fontWeight: 500 }}>4. CUTI MELAHIRKAN</td>
                <td style={{ textAlign: 'center' }}>{isMelahirkan ? '√' : ''}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>N – 1</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sisaN1}</td>
                <td style={{ textAlign: 'center' }}>{sisaN1 > 0 ? `${sisaN1} hari` : '0 hari'}</td>
                <td style={{ fontWeight: 500 }}>5. CUTI KARENA ALASAN PENTING</td>
                <td style={{ textAlign: 'center' }}>{isPenting ? '√' : ''}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>N</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sisaN}</td>
                <td style={{ textAlign: 'center' }}>{sisaN > 0 ? `${sisaN} hari` : '0 hari'}</td>
                <td style={{ fontWeight: 500 }}>6. CUTI DI LUAR TANGGUNGAN NEGARA</td>
                <td style={{ textAlign: 'center' }}>{isCltn ? '√' : ''}</td>
              </tr>
            </tbody>
          </table>

          {/* VI. ALAMAT SELAMA MENJALANKAN CUTI & TANDA TANGAN */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="3" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  VI. ALAMAT SELAMA MENJALANKAN CUTI
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: '45%', verticalAlign: 'top', padding: '3px 5px' }}>
                  <div style={{ fontSize: '7.2pt', color: '#64748b', marginBottom: '1px' }}>Alamat:</div>
                  <div style={{ fontWeight: 600 }}>{cuti.alamatCuti || 'Yogyakarta'}</div>
                </td>
                <td style={{ width: '25%', verticalAlign: 'top', padding: '3px 5px' }}>
                  <div style={{ fontSize: '7.2pt', color: '#64748b', marginBottom: '1px' }}>Telp / HP:</div>
                  <div style={{ fontWeight: 'bold' }}>{cuti.noTelpCuti || '-'}</div>
                </td>
                <td style={{ width: '30%', textAlign: 'center', verticalAlign: 'top', padding: '3px 5px' }}>
                  <div style={{ marginBottom: '18px', fontSize: '7.8pt' }}>Hormat saya,</div>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    {cuti.nama || '................................'}
                  </div>
                  <div style={{ fontSize: '7.2pt' }}>NIP. {cuti.nip || '..........................'}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="4" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  VII. PERTIMBANGAN ATASAN LANGSUNG **
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                <td style={{ width: '25%' }}>DISETUJUI</td>
                <td style={{ width: '25%' }}>PERUBAHAN ***</td>
                <td style={{ width: '25%' }}>DITANGGUHKAN ***</td>
                <td style={{ width: '25%' }}>TIDAK DISETUJUI ****</td>
              </tr>
              <tr style={{ height: '18px', textAlign: 'center', fontSize: '11pt', fontWeight: 'bold' }}>
                <td>{isApproved ? '√' : ''}</td>
                <td></td>
                <td></td>
                <td>{cuti.status === 'ditolak' ? '√' : ''}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', padding: '3px 14px 4px 0' }}>
                  <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '190px' }}>
                    <div style={{ height: '18px' }}></div>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      {cuti.atasanLangsung?.nama || 'Agung Ariyanto, SEI, M.Ec.Dev'}
                    </div>
                    <div style={{ fontSize: '7.2pt' }}>
                      NIP. {cuti.atasanLangsung?.nip || '198101312009121004'}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG */}
          <table className="bkn-table">
            <thead>
              <tr>
                <th colSpan="4" style={{ textAlign: 'left', background: '#f8fafc', fontWeight: 'bold' }}>
                  VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                <td style={{ width: '25%' }}>DISETUJUI</td>
                <td style={{ width: '25%' }}>PERUBAHAN ***</td>
                <td style={{ width: '25%' }}>DITANGGUHKAN ***</td>
                <td style={{ width: '25%' }}>TIDAK DISETUJUI ****</td>
              </tr>
              <tr style={{ height: '18px', textAlign: 'center', fontSize: '11pt', fontWeight: 'bold' }}>
                <td>{isApproved ? '√' : ''}</td>
                <td></td>
                <td></td>
                <td>{cuti.status === 'ditolak' ? '√' : ''}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', padding: '3px 14px 4px 0' }}>
                  <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '190px' }}>
                    <div style={{ height: '18px' }}></div>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      {cuti.pejabatBerwenang?.nama || 'Dr. Soeharsono, S.Pt, M.Si'}
                    </div>
                    <div style={{ fontSize: '7.2pt' }}>
                      NIP. {cuti.pejabatBerwenang?.nip || '197109271998031002'}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Catatan Kaki */}
          <div style={{ fontSize: '6.5pt', color: '#334155', marginTop: '3px', lineHeight: '1.15', fontFamily: '"Bookman Old Style", Georgia, serif' }}>
            <div>Catatan: * Coret yang tidak perlu | ** Pilih salah satu dengan memberi tanda centang | *** Diisi oleh pejabat kepegawaian | **** Diberi tanda centang dan alasannya</div>
            <div style={{ fontWeight: 'bold', marginTop: '1px' }}>
              N = Cuti tahun berjalan | N – 1 = Sisa cuti 1 tahun sebelumnya | N – 2 = Sisa cuti 2 tahun sebelumnya
            </div>
          </div>
        </div>
      </div>

      {/* Screen styling & Isolated Print styling */}
      <style>{`
        @media screen {
          .bkn-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-y: auto;
            padding: 20px 10px;
          }

          .bkn-control-bar {
            background: #ffffff;
            padding: 10px 18px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 820px;
            margin-bottom: 12px;
          }

          .bkn-sheet-container {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .bkn-a4-page {
            background: #ffffff;
            width: 210mm;
            min-height: 297mm;
            padding: 10mm 14mm;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            border-radius: 2px;
            color: #000000;
            font-family: "Bookman Old Style", "Times New Roman", serif;
            font-size: 8.5pt;
            box-sizing: border-box;
          }
        }

        .bkn-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 3.5px;
          font-size: 7.8pt;
          font-family: "Bookman Old Style", "Times New Roman", serif;
        }

        .bkn-table th, .bkn-table td {
          border: 1px solid #000000;
          padding: 1.8px 4px;
          vertical-align: middle;
        }

        @media print {
          @page {
            size: A4 portrait !important;
            margin: 6mm 10mm 5mm 10mm !important;
          }

          body.bkn-print-active {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body.bkn-print-active #root,
          body.bkn-print-active > *:not(.bkn-modal-overlay) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          .bkn-control-bar {
            display: none !important;
          }

          .bkn-modal-overlay {
            position: static !important;
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }

          .bkn-sheet-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .bkn-a4-page {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
            break-inside: avoid !important;
          }

          .bkn-table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 3px !important;
            font-size: 7.5pt !important;
          }

          .bkn-table th, .bkn-table td {
            padding: 1.5px 3.5px !important;
          }
        }
      `}</style>
    </div>
  );

  // Render via portal directly into document.body to isolate print page completely
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
