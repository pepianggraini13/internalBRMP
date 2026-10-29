import React, { useState, useEffect } from 'react';
import PengajuanSpt from './PengajuanSpt';
import ReportSpt from './ReportSpt';
import SptApproval from './SptApproval';
import SptAdmin from './SptAdmin';
import SptSop from './SptSop';
import { sptApiService } from './sptApi';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Settings, 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Shield 
} from 'lucide-react';

export function resolveSptRole(user, paniteraList = []) {
  if (!user) return 'user';
  
  const r = String(user.sptRole || user.roleDefault || user.role || '').toLowerCase();
  if (['admin', 'admin_sekretariat', 'kobag_tu', 'panitera', 'user'].includes(r)) {
    return r;
  }

  const nip = String(user.nip || '').trim();
  const id = String(user.id || user.pegawaiId || '').toUpperCase();

  // 1. Administrator Sistem
  if (id === 'PEG-ADM' || user.systemRole === 'admin' || user.username === 'admin') {
    return 'admin';
  }

  // 2. Kobag TU (Approval Tunggal)
  if (nip === '198101312009121004' || id === 'PEG-002') {
    return 'kobag_tu';
  }

  // 3. Panitera SPT (Daftar Dinamis & Bawaan)
  const defaultPaniteraNips = ['198906012015032004', '199111042023212041'];
  const defaultPaniteraIds = ['PEG-004', 'PEG-017'];
  const isInDynamicPanitera = Array.isArray(paniteraList) && paniteraList.some(p => 
    (p.nip && p.nip === nip) || 
    (p.pegawaiId && String(p.pegawaiId).toUpperCase() === id) ||
    (p.id && String(p.id).toUpperCase() === id)
  );

  if (defaultPaniteraNips.includes(nip) || defaultPaniteraIds.includes(id) || isInDynamicPanitera) {
    return 'panitera';
  }

  // 4. Admin Sekretariat (Tata Persuratan)
  if (
    nip === '199103102025211055' || 
    id === 'PEG-021' ||
    user.username === 'admin.sekretariat'
  ) {
    return 'admin_sekretariat';
  }

  return 'user';
}

export default function SptProgram({ user, targetView = 'tracking' }) {
  const [paniteraList, setPaniteraList] = useState([]);
  
  // Map incoming targetView to module subview
  const normalizeView = (v) => {
    if (!v) return 'tracking';
    if (v === 'pengajuan' || v === 'spt-pengajuan') return 'pengajuan';
    if (v === 'approval' || v === 'approval-kobag' || v === 'spt-approval' || v === 'spt-approval-kobag') return 'approval';
    if (v === 'admin' || v === 'admin-sekretariat' || v === 'spt-admin' || v === 'spt-admin-sekretariat') return 'admin';
    if (v === 'sop' || v === 'spt-sop') return 'sop';
    return 'tracking';
  };

  const [activeTab, setActiveTab] = useState(() => normalizeView(targetView));

  // Sync when prop targetView changes
  useEffect(() => {
    setActiveTab(normalizeView(targetView));
  }, [targetView]);

  // Load panitera list to ensure accurate role detection
  useEffect(() => {
    sptApiService.getPanitera()
      .then(list => {
        if (Array.isArray(list)) setPaniteraList(list);
      })
      .catch(() => {});
  }, []);

  const role = resolveSptRole(user, paniteraList);
  const isPanitera = role === 'panitera' || role === 'admin';
  const isKobagTu = role === 'kobag_tu' || role === 'admin';
  const isAdmin = role === 'admin' || role === 'admin_sekretariat';

  const roleLabelMap = {
    admin: "Administrator Sistem",
    admin_sekretariat: "Admin Sekretariat (Tata Persuratan)",
    kobag_tu: "Kobag TU (Approval Tunggal)",
    panitera: "Panitera SPT (Pengaju Resmi)",
    user: "Pegawai BRMP DIY (Pelaksana Tugas)"
  };

  return (
    <div className="spt-program-container" style={{ width: '100%', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Module Subnav Bar */}
      <div 
        className="no-print"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`btn ${activeTab === 'tracking' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={15} />
            <span>Informasi & Tracking SPT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pengajuan')}
            className={`btn ${activeTab === 'pengajuan' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>Pengajuan SPT (Panitera)</span>
            {!isPanitera && <Lock size={12} style={{ opacity: 0.6 }} />}
          </button>

          {(isKobagTu || isAdmin) && (
            <button
              type="button"
              onClick={() => setActiveTab('approval')}
              className={`btn ${activeTab === 'approval' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '13px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={15} />
              <span>Approval Kobag TU</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '13px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Settings size={15} />
              <span>Administrasi & Panitera</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('sop')}
            className={`btn ${activeTab === 'sop' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={15} />
            <span>Pedoman SOP</span>
          </button>
        </div>

        {/* User Session Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              {user?.nama || 'Pegawai BRMP DIY'}
            </div>
            <div style={{ fontSize: '11px', color: isPanitera ? '#15803d' : isKobagTu ? '#7e22ce' : '#64748b', fontWeight: 600 }}>
              {roleLabelMap[role] || 'Pegawai'}
            </div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isPanitera ? '#dcfce7' : isKobagTu ? '#f3e8ff' : '#e2e8f0', color: isPanitera ? '#166534' : isKobagTu ? '#7e22ce' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            {isPanitera ? <UserCheck size={16} /> : isKobagTu ? <ShieldCheck size={16} /> : <FileText size={16} />}
          </div>
        </div>
      </div>

      {/* Dynamic View Content */}
      <div style={{ flex: 1, padding: '20px 24px' }}>
        {activeTab === 'tracking' && (
          <ReportSpt 
            user={user} 
            onNavigateToPengajuan={() => setActiveTab('pengajuan')} 
          />
        )}

        {activeTab === 'pengajuan' && (
          <PengajuanSpt 
            user={user} 
            onNavigateToReport={() => setActiveTab('tracking')} 
          />
        )}

        {activeTab === 'approval' && (
          <SptApproval 
            user={user} 
            onNavigateToReport={() => setActiveTab('tracking')} 
          />
        )}

        {activeTab === 'admin' && (
          <SptAdmin 
            user={user} 
          />
        )}

        {activeTab === 'sop' && (
          <SptSop />
        )}
      </div>
    </div>
  );
}
