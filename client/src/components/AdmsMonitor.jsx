import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Cpu,
  Activity,
  Wifi,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Server,
  Search,
  Filter,
  Users,
  Plus,
  Trash2,
  MapPin,
  HardDrive,
  Calendar
} from 'lucide-react';

export default function AdmsMonitor({ user }) {
  const [machines, setMachines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if current logged-in user is an Administrator
  const isAdmin =
    user?.systemRole === 'admin' ||
    user?.role === 'admin' ||
    user?.approvalRole === 'admin' ||
    user?.nip === '198001012005011001';

  // Filters
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'yesterday', or specific YYYY-MM-DD
  const [customDate, setCustomDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State Form Tambah Mesin Baru
  const [newMachine, setNewMachine] = useState({
    sn: '',
    namaMesin: '',
    ip: '',
    port: '4370',
    lokasi: 'Kantor BRMP DIY'
  });
  const [machineLoading, setMachineLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, lRes] = await Promise.all([
        apiService.getAdmsMachines(),
        apiService.getAdmsLogs(user?.nip || '', isAdmin ? 'admin' : 'pegawai', 'all')
      ]);
      setMachines(mRes || []);
      setLogs(lRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 8 seconds for new logs from machine
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [user?.nip, isAdmin]);

  // Load employee list for Admin dropdown
  useEffect(() => {
    if (isAdmin) {
      apiService.getUsers().then(res => {
        if (res && res.length > 0) setAllUsers(res);
      }).catch(() => { });
    }
  }, [isAdmin]);

  const handleAddMachine = async (e) => {
    e.preventDefault();
    if (!newMachine.sn.trim() || !newMachine.namaMesin.trim()) {
      setErrorMsg('Serial Number (SN) dan Nama Mesin wajib diisi.');
      return;
    }
    setSuccessMsg('');
    setErrorMsg('');
    setMachineLoading(true);

    try {
      const res = await apiService.createAdmsMachine(newMachine);
      if (res.success) {
        setSuccessMsg(res.message || 'Mesin absensi berhasil ditambahkan!');
        setNewMachine({
          sn: '',
          namaMesin: '',
          ip: '',
          port: '4370',
          lokasi: 'Kantor BRMP DIY'
        });
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menambahkan mesin absensi.');
    } finally {
      setMachineLoading(false);
    }
  };

  const handleDeleteMachine = async (sn, namaMesin) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus mesin "${namaMesin}" (${sn})?`)) {
      return;
    }
    setSuccessMsg('');
    setErrorMsg('');
    setDeleteLoading(sn);

    try {
      const res = await apiService.deleteAdmsMachine(sn);
      if (res.success) {
        setSuccessMsg(res.message || `Mesin ${sn} berhasil dihapus.`);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menghapus mesin.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const dYest = new Date();
  dYest.setDate(dYest.getDate() - 1);
  const yestStr = dYest.toISOString().split('T')[0];
  const availableDates = Array.from(new Set((logs || []).map(l => l.tanggal).filter(Boolean))).sort().reverse();

  // Filter logs strictly: Regular employees only see their own logs; Admin can see all with filters
  const displayedLogs = (logs || []).filter(item => {
    if (!isAdmin) {
      const uNip = String(user?.nip || '').trim();
      const uPin = String(user?.pinMesin || '').trim();
      const uNama = String(user?.nama || '').toLowerCase().trim();
      const lPin = String(item.pin || '').trim();
      const lNama = String(item.nama || '').toLowerCase().trim();

      const matchNip = uNip && (lPin === uNip || (lPin.length >= 10 && lPin.includes(uNip)));
      const matchPin = uPin && (lPin === uPin);
      const matchNama = uNama && (lNama === uNama || lNama.includes(uNama));

      return matchNip || matchPin || matchNama;
    }

    // Admin filters
    if (filterEmployee !== 'all') {
      const lPin = String(item.pin || '').trim();
      if (lPin !== filterEmployee && !lPin.includes(filterEmployee)) return false;
    }

    if (filterStatus !== 'all') {
      if (item.statusAbsen !== filterStatus) return false;
    }

    // Filter Tanggal (Semua Riwayat / Hari Ini / Kemarin / Tanggal Tertentu)
    if (filterDate === 'today') {
      if (item.tanggal !== todayStr) return false;
    } else if (filterDate === 'yesterday') {
      if (item.tanggal !== yestStr) return false;
    } else if (filterDate === 'custom' && customDate) {
      if (item.tanggal !== customDate) return false;
    } else if (filterDate !== 'all') {
      if (item.tanggal !== filterDate) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchN = String(item.nama || '').toLowerCase().includes(q);
      const matchP = String(item.pin || '').toLowerCase().includes(q);
      const matchS = String(item.sn || '').toLowerCase().includes(q);
      if (!matchN && !matchP && !matchS) return false;
    }

    return true;
  });


  return (
    <div>
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="breadcrumb-title">
              <Cpu size={24} style={{ color: 'var(--primary-600)' }} />
              <span>Monitoring Integrasi Mesin Absensi (ADMS)</span>
            </h1>
            <div className="breadcrumb-path">
              <span>KITA BRMP DIY</span>
              <span>/</span>
              <span>Info Absensi</span>
              <span>/</span>
              <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>Protokol ADMS Cloud</span>
            </div>
          </div>

          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan Log</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div style={{
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-300)',
          color: 'var(--primary-900)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--primary-600)' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Status Mesin & Tambah Mesin Baru */}
      <div className="adms-grid">

        {/* Left: Info Konfigurasi & Mesin yang Terkoneksi */}
        <div className="brmp-card" style={{ padding: '1.5rem', gridColumn: isAdmin ? 'auto' : '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={20} style={{ color: 'var(--primary-600)' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Mesin Presensi Terkoneksi
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              {machines.length} Mesin Aktif
            </span>
          </div>

          {/* Connected Machines List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
            {machines.map((m, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid #e2e8f0', 
                  borderRadius: '10px', 
                  padding: '12px 14px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Cpu size={19} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{m.namaMesin}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '3px', fontSize: '0.72rem', color: '#64748b' }}>
                      <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>SN: {m.sn}</span>
                      <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>IP: {m.ip}:{m.port || '4370'}</span>
                      {m.lokasi && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#047857', fontWeight: 600 }}>
                          <MapPin size={11} /> {m.lokasi}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                      Sync: {m.lastSync ? new Date(m.lastSync).toLocaleString('id-ID') : '-'} &bull; {m.totalLogs || 0} Log Absensi
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                    <span>{m.status || 'Online'}</span>
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteMachine(m.sn, m.namaMesin)}
                      disabled={deleteLoading === m.sn}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        borderRadius: '6px',
                        padding: '5px 7px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Hapus Mesin Presensi"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info Parameter Setting di Mesin Fisik */}
          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Parameter Cloud Server di Mesin Fisik (ZKTeco / Solution):
            </h4>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Cloud Server:</span>
                <strong style={{ color: 'var(--primary-700)' }}>ENABLE / AKTIF</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Server IP / Host:</span>
                <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>IP Server / Domain</code>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Server Port:</span>
                <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>5000</code>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Target Jalur URL:</span>
                <strong style={{ color: 'var(--primary-700)' }}>/iclock/cdata</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form Tambah Mesin ADMS Baru (Khusus Akses Administrator) */}
        {isAdmin && (
          <div className="brmp-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <Plus size={20} style={{ color: 'var(--primary-600)' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Tambah Mesin Presensi ADMS
              </h3>
            </div>

            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748b' }}>
              Daftarkan unit mesin presensi fingerprint / face recognition baru ke dalam sistem jaringan BRMP DIY:
            </p>

            <form onSubmit={handleAddMachine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Nama Mesin Presensi <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Mesin Fingerprint Lobi Timur Gedung A"
                  value={newMachine.namaMesin}
                  onChange={(e) => setNewMachine({ ...newMachine, namaMesin: e.target.value })}
                  style={{ height: '40px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Serial Number (SN) Mesin <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: UCR6235200085 (tertera di belakang mesin)"
                  value={newMachine.sn}
                  onChange={(e) => setNewMachine({ ...newMachine, sn: e.target.value.toUpperCase() })}
                  style={{ height: '40px', fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    IP Address Mesin
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="192.168.2.75"
                    value={newMachine.ip}
                    onChange={(e) => setNewMachine({ ...newMachine, ip: e.target.value })}
                    style={{ height: '40px', fontFamily: 'monospace' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    Port Mesin
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="4370"
                    value={newMachine.port}
                    onChange={(e) => setNewMachine({ ...newMachine, port: e.target.value })}
                    style={{ height: '40px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Lokasi Pemasangan
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Pintu Masuk Lobi Utama / Ruang Tata Usaha"
                  value={newMachine.lokasi}
                  onChange={(e) => setNewMachine({ ...newMachine, lokasi: e.target.value })}
                  style={{ height: '40px' }}
                />
              </div>

              <button
                type="submit"
                disabled={machineLoading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  padding: '11px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: machineLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.25rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={18} />
                <span>{machineLoading ? 'Mendaftarkan Mesin...' : 'Tambah Mesin Presensi'}</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Tabel Log Absensi Real-time dari Mesin */}
      <div className="brmp-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: 'var(--primary-600)' }} />
              <span>
                {isAdmin ? 'Log Riwayat Scan Mesin ADMS (Seluruh Pegawai)' : 'Log Riwayat Presensi Pribadi Anda'}
              </span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
              {isAdmin
                ? 'Mode Administrator: Memantau dan mengaudit seluruh catatan kehadiran pegawai dari mesin fingerprint kantor'
                : `Hanya menampilkan catatan scan absensi untuk akun Anda: ${user?.nama || 'Pegawai'} (NIP: ${user?.nip})`
              }
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin ? (
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} />
                <span>Mode Admin ({displayedLogs.length} Data)</span>
              </span>
            ) : (
              <span style={{ background: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <UserCheck size={14} style={{ color: 'var(--primary-600)' }} />
                <span>{displayedLogs.length} Riwayat Scan Anda</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Controls Toolbar (Available for Admin & Pegawai) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Quick Date Switcher Pills */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} style={{ color: 'var(--primary-600)' }} />
              <span>Rentang Waktu:</span>
            </span>

            <button
              type="button"
              onClick={() => { setFilterDate('all'); setCustomDate(''); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filterDate === 'all' ? 'var(--primary-600)' : '#cbd5e1',
                background: filterDate === 'all' ? 'var(--primary-600)' : '#ffffff',
                color: filterDate === 'all' ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Semua Riwayat (Full: {logs.length} Data)
            </button>

            <button
              type="button"
              onClick={() => { setFilterDate('today'); setCustomDate(''); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filterDate === 'today' ? 'var(--primary-600)' : '#cbd5e1',
                background: filterDate === 'today' ? 'var(--primary-600)' : '#ffffff',
                color: filterDate === 'today' ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Hari Ini ({logs.filter(l => l.tanggal === todayStr).length} Data)
            </button>

            <button
              type="button"
              onClick={() => { setFilterDate('yesterday'); setCustomDate(''); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filterDate === 'yesterday' ? 'var(--primary-600)' : '#cbd5e1',
                background: filterDate === 'yesterday' ? 'var(--primary-600)' : '#ffffff',
                color: filterDate === 'yesterday' ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Kemarin ({logs.filter(l => l.tanggal === yestStr).length} Data)
            </button>
          </div>

          {/* Detailed Dropdown Filters & Search */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              <Filter size={15} style={{ color: 'var(--primary-600)' }} />
              <span>Detail Filter:</span>
            </div>

            {/* Filter by Tanggal Dropdown */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                fontWeight: 600,
                color: '#1e293b'
              }}
            >
              <option value="all">📅 Semua Tanggal (Full History)</option>
              <option value="today">📅 Hari Ini ({todayStr})</option>
              <option value="yesterday">📅 Kemarin ({yestStr})</option>
              {availableDates.filter(d => d !== todayStr && d !== yestStr).map(d => (
                <option key={d} value={d}>📅 Tanggal {d} ({(logs || []).filter(l => l.tanggal === d).length} Log)</option>
              ))}
              <option value="custom">📅 Pilih Tanggal Tertentu...</option>
            </select>

            {/* Custom Date Input (shown if "custom" is selected) */}
            {filterDate === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--primary-600)',
                  fontSize: '0.82rem',
                  background: '#ffffff'
                }}
              />
            )}

            {/* Filter by Pegawai (Admin only) */}
            {isAdmin && (
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: '#ffffff',
                  minWidth: '200px'
                }}
              >
                <option value="all">Semua Pegawai ({logs.length} Log)</option>
                {(allUsers.length > 0 ? allUsers : defaultEmployees).map(p => (
                  <option key={p.nip || p.id} value={p.nip}>{p.nama} ({p.nip})</option>
                ))}
              </select>
            )}

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff'
              }}
            >
              <option value="all">Semua Status (Masuk & Pulang)</option>
              <option value="Masuk">Masuk Saja</option>
              <option value="Pulang">Pulang Saja</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={isAdmin ? "Cari nama pegawai, NIP, atau SN mesin..." : "Cari jam atau keterangan absen..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: '#ffffff'
                }}
              />
            </div>

            {(filterEmployee !== 'all' || filterStatus !== 'all' || filterDate !== 'all' || searchQuery.trim() || customDate) && (
              <button
                type="button"
                onClick={() => { setFilterEmployee('all'); setFilterStatus('all'); setFilterDate('all'); setCustomDate(''); setSearchQuery(''); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.78rem',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Regular Pegawai Banner */}
        {!isAdmin && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UserCheck size={16} />
            <span>
              Privasi aktif: Hanya Anda (<strong>{user?.nama}</strong>) dan Administrator Kepegawaian yang memiliki izin melihat riwayat kehadiran ini.
            </span>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="brmp-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>NO</th>
                <th>PEGAWAI</th>
                <th>TANGGAL & JAM SCAN</th>
                <th>STATUS ABSEN</th>
                <th>KETERANGAN KEDINASAN</th>
                <th>SERIAL NUMBER MESIN</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                    <Clock size={36} style={{ margin: '0 auto 10px auto', color: '#94a3b8', display: 'block' }} />
                    <strong style={{ fontSize: '0.95rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                      {isAdmin
                        ? 'Tidak ada data log yang cocok dengan filter pencarian.'
                        : 'Belum Ada Catatan Log Scan untuk Akun Anda'
                      }
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {isAdmin
                        ? 'Silakan coba ubah pilihan filter pegawai, status, atau kata kunci pencarian.'
                        : `Catatan scan kehadiran Anda (NIP: ${user?.nip}) akan otomatis terekam setelah Anda tap sidik jari / scan wajah di mesin kantor, atau Anda dapat menggunakan simulator di atas untuk uji coba.`
                      }
                    </span>
                  </td>
                </tr>
              ) : (
                displayedLogs.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.nama}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {item.pin}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 600 }}>{item.jabatan}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{item.jam}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.tanggal}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.statusAbsen === 'Masuk' ? '#dcfce7' : '#e0e7ff',
                        color: item.statusAbsen === 'Masuk' ? '#15803d' : '#4338ca'
                      }}>
                        {item.statusAbsen === 'Masuk' ? '✓ Masuk' : '→ Pulang'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.keterangan?.includes('Terlambat') ? '#b91c1c' : '#15803d' }}>
                        {item.keterangan}
                      </span>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569' }}>
                        {item.sn}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

