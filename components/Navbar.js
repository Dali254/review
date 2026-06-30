import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../lib/icons';

export default function Navbar({ user, onAuthClick, balance = 0 }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: 'Home' },
    { href: '/businesses', label: 'Browse', icon: 'Grid' },
    { href: '/wallet', label: 'Wallet', icon: 'Wallet' },
  ];

  return (
    <>
      <style>{`
        .nav-desktop-links { display: flex; gap: 4px; align-items: center; }
        .nav-balance-pill { display: flex; }
        @media (max-width: 640px) {
          .nav-desktop-links { display: none !important; }
          .nav-balance-pill { display: none !important; }
        }
        .mobile-bottom-nav { display: none; }
        @media (max-width: 640px) {
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(8,12,20,0.96);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-top: 1px solid rgba(255,255,255,0.08);
            z-index: 300;
            padding-bottom: env(safe-area-inset-bottom, 0);
          }
        }
      `}</style>

      {/* Top nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 16px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,12,20,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.25s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #00C853, #007A3D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0,200,83,0.3)',
          }}>
            <Icon.BarChart size={16} style={{ color: '#000' }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            ReviewKE
          </span>
        </Link>

        {/* Desktop center links */}
        <div className="nav-desktop-links">
          {navLinks.map(l => {
            const active = router.pathname === l.href;
            const IconComp = Icon[l.icon];
            return (
              <Link key={l.href} href={l.href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 9, fontSize: 14, fontWeight: 500,
                color: active ? '#00C853' : 'rgba(255,255,255,0.6)',
                background: active ? 'rgba(0,200,83,0.1)' : 'transparent',
                transition: 'all 0.15s', textDecoration: 'none',
              }}>
                <IconComp size={14} />
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user && (
            <Link href="/wallet" className="nav-balance-pill" style={{
              alignItems: 'center', gap: 6,
              padding: '7px 13px',
              background: 'rgba(0,200,83,0.08)',
              border: '1px solid rgba(0,200,83,0.2)',
              borderRadius: 9, fontSize: 13, fontWeight: 700,
              color: '#00C853', textDecoration: 'none',
            }}>
              <Icon.Wallet size={13} />
              KES {balance.toLocaleString()}
            </Link>
          )}
          <button onClick={onAuthClick} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 9, border: 'none',
            background: user ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #00C853, #007A3D)',
            color: user ? 'rgba(255,255,255,0.85)' : '#000',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: user ? 'none' : '0 0 16px rgba(0,200,83,0.3)',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}>
            <Icon.User size={14} />
            {user ? user.name.split(' ')[0] : 'Sign in'}
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {navLinks.map(l => {
          const active = router.pathname === l.href;
          const IconComp = Icon[l.icon];
          return (
            <Link key={l.href} href={l.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, padding: '10px 4px 8px',
              color: active ? '#00C853' : 'rgba(255,255,255,0.4)',
              fontSize: 10, fontWeight: 600, textDecoration: 'none',
              transition: 'color 0.15s',
            }}>
              <IconComp size={22} />
              {l.label}
            </Link>
          );
        })}
        <button onClick={onAuthClick} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '10px 4px 8px',
          color: user ? '#00C853' : 'rgba(255,255,255,0.4)',
          fontSize: 10, fontWeight: 600,
          background: 'none', border: 'none',
          transition: 'color 0.15s',
        }}>
          <Icon.User size={22} />
          {user ? user.name.split(' ')[0].slice(0, 8) : 'Sign in'}
        </button>
      </nav>
    </>
  );
}
