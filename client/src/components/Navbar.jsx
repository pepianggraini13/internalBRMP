import React from 'react';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar({ user, isUserAdmin, isMobileMenuOpen, onToggleMobileMenu, onLogout }) {
  return (
    <header 
      className="top-navbar no-print" 
      style={{ 
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)', 
        boxShadow: '0 2px 10px rgba(6, 78, 59, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        height: '64px'
      }}
    >
      <div className="brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile Hamburger Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          title={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo Lambang Lingkaran Kementan / BRMP DIY */}
        <div 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#fef08a',
            border: '2px solid #eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            flexShrink: 0
          }}
          title="Kementerian Pertanian - BRMP DIY"
        >
          <img 
            src="/logo-kementan.png" 
            alt="Logo BRMP" 
            style={{ width: '84%', height: '84%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
          BRMP DIY
        </span>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ 
          fontSize: '0.78rem', 
          fontWeight: 700, 
          color: '#a7f3d0', 
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          {isUserAdmin ? 'ADMINISTRATOR' : (user?.roleLabel || user?.nama || 'PEGAWAI')}
        </span>

        {/* Tombol Logout Navbar */}
        <button
          onClick={onLogout}
          title="Keluar dari Akun"
          aria-label="Logout"
          style={{
            background: 'rgba(239, 68, 68, 0.18)',
            color: '#fecaca',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            borderRadius: '7px',
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#b91c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
            e.currentTarget.style.color = '#fecaca';
            e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)';
          }}
        >
          <LogOut size={14} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
