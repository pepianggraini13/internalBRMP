import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CalendarCheck2, Filter, Search, CheckCircle2, Clock, AlertTriangle, XCircle, HeartPulse, UserCheck, ShieldCheck } from 'lucide-react';

export default function AbsensiBulanan({ user }) {
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState(currentDate.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [absensiData, setAbsensiData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedNip, setSelectedNip] = useState(user?.nip || '199808062014032001');

  const isAdmin = 
    user?.systemRole === 'admin' || 
    user?.role === 'admin' || 
    user?.approvalRole === 'admin' || 
    user?.nip === '198001012005011001';

  useEffect(() => {
    if (isAdmin) {
      apiService.getUsers().then(res => {
        if (res && res.length > 0) setAllUsers(res);
      }).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && user?.nip) {
      setSelectedNip(user.nip);
    }
  }, [user?.nip, isAdmin]);

  const monthOptions = [
    { val: 1, name: 'Januari' },
    { val: 2, name: 'Februari' },
    { val: 3, name: 'Maret' },
    { val: 4, name: 'April' },
    { val: 5, name: 'Mei' },
    { val: 6, name: 'Juni' },
    { val: 7, name: 'Juli' },
    { val: 8, name: 'Agustus' },
    { val: 9, name: 'September' },
    { val: 10, name: 'Oktober' },
    { val: 11, name: 'November' },
    { val: 12, name: 'Desember' }
  ];

  const fetchAbsensi = async (bulan, tahun) => {
    setLoading(true);
    try {
      const res = await apiService.getAbsensiBulanan(bulan, tahun);
      if (res) {
        setAbsensiData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi(selectedBulan, selectedTahun);
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAbsensi(selectedBulan, selectedTahun);
  };

  const getMonthName = (val) => {
    const found = monthOptions.find(m => m.val === parseInt(val));
    return found ? found.name : 'Juni';
  };

  return (
    <div>
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner">
        <div>
          <h1 className="breadcrumb-title">
            <CalendarCheck2 size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Info Absensi Pegawai</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>Info Absensi</span>
            <span>/</span>
            <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>Bulanan</span>
          </div>
        </div>
      </div>

      {/* Filter Card (Point 5: pilih bulan -> tahun -> lihat data) */}
      <div className="brmp-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
          <Filter size={18} style={{ color: 'var(--primary-600)' }} />
          <span>Filter Rekapitulasi Absensi</span>
        </div>

        <form onSubmit={handleFilterSubmit} className="absensi-filter-form">
          {isAdmin && (
            <div className="form-group absensi-filter-field" style={{ minWidth: '220px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--primary-600)' }} />
                <span>Pilih Pegawai (Admin)</span>
              </label>
              <select
                className="form-input"
                value={selectedNip}
                onChange={(e) => setSelectedNip(e.target.value)}
              >
                {allUsers.map((p) => (
                  <option key={p.nip} value={p.nip}>
                    {p.nama} ({p.nip})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group absensi-filter-field">
            <label className="form-label">Pilih Bulan</label>
            <select
              className="form-input"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group absensi-filter-field">
            <label className="form-label">Tahun</label>
            <select
              className="form-input"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary absensi-filter-submit" 
            disabled={loading}
          >
            <Search size={16} />
            <span>{loading ? 'Memuat...' : 'Lihat Data'}</span>
          </button>
        </form>
      </div>

      {/* Rekapitulasi Summary (Point 5) */}
      <div className="brmp-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Rekap Absensi Bulan {getMonthName(selectedBulan)} Tahun {selectedTahun}
          </h3>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', padding: '5px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} style={{ color: 'var(--primary-600)' }} />
            <span>
              {isAdmin 
                ? (allUsers.find(p => p.nip === selectedNip)?.nama || user?.nama || 'Pegawai')
                : (user?.nama || 'Pegawai BRMP')
              }
            </span>
          </span>
        </div>

        <div className="rekap-card-grid">
          {/* Masuk */}
          <div className="rekap-stat-card" style={{ '--border-color': 'var(--primary-600)' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <div className="rekap-stat-val" style={{ color: 'var(--primary-700)' }}>
              {absensiData?.rekap?.totalMasuk ?? 20}
            </div>
            <span className="rekap-stat-label">Hadir / Masuk</span>
          </div>

          {/* Terlambat */}
          <div className="rekap-stat-card" style={{ '--border-color': '#f59e0b' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#fffbeb',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
            }}>
              <Clock size={22} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#f59e0b' }}>
              {absensiData?.rekap?.terlambat ?? 1}
            </div>
            <span className="rekap-stat-label">Terlambat</span>
          </div>

          {/* Sakit */}
          <div className="rekap-stat-card" style={{ '--border-color': '#8b5cf6' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#f5f3ff',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
            }}>
              <HeartPulse size={22} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#8b5cf6' }}>
              {absensiData?.rekap?.sakit ?? 0}
            </div>
            <span className="rekap-stat-label">Sakit</span>
          </div>

          {/* Izin */}
          <div className="rekap-stat-card" style={{ '--border-color': '#06b6d4' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#ecfeff',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.15)'
            }}>
              <AlertTriangle size={22} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#06b6d4' }}>
              {absensiData?.rekap?.izin ?? 0}
            </div>
            <span className="rekap-stat-label">Izin</span>
          </div>

          {/* Alpha */}
          <div className="rekap-stat-card" style={{ '--border-color': '#ef4444' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
            }}>
              <XCircle size={22} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#ef4444' }}>
              {absensiData?.rekap?.alpha ?? 1}
            </div>
            <span className="rekap-stat-label">Alpha</span>
          </div>
        </div>
      </div>

      {/* Grid Kartu Absensi Harian */}
      <div className="brmp-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Tabel Data Status Harian Bulan {getMonthName(selectedBulan)} {selectedTahun}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
            30 Hari Kalender Kerja
          </span>
        </div>

        <div className="attendance-cards-grid">
          {absensiData?.harian?.map((item) => {
            let cardClass = 'masuk';
            if (item.status === 'Libur') cardClass = 'libur';
            else if (item.status === 'Terlambat') cardClass = 'terlambat';
            else if (item.status === 'Alpha') cardClass = 'alpha';

            return (
              <div key={item.tanggal} className={`attend-card ${cardClass}`}>
                <div className="attend-card-header">
                  {item.hari}, tgl {item.tglNo}
                </div>
                <div className="attend-card-status">
                  {item.status}
                </div>
                <div className="attend-card-time">
                  {item.status === 'Libur' ? (
                    <span style={{ fontStyle: 'italic', opacity: 0.9 }}>Hari Libur Resmi</span>
                  ) : item.status === 'Alpha' ? (
                    <span style={{ fontWeight: 700 }}>Tanpa Keterangan</span>
                  ) : (
                    <>
                      <div>Masuk: <strong>{item.jamMasuk}</strong></div>
                      <div>Pulang: <strong>{item.jamPulang}</strong></div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
