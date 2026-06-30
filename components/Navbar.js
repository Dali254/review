import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../lib/icons';

export default function Navbar({ user, onAuthClick, balance = 0 }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: 'Home' },
    { href: '/businesses', label: 'Browse', icon: 'Grid' },
    { href: '/wallet', label: 'Wallet', icon: 'Wallet' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,12,20,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00C853, #007A3D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,200,83,0.3)',
          }}>
            <Icon.BarChart size={18} style={{ color: '#000' }} />
          </div>
          <span style={{
            fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px',
            fontFamily: "'Syne', sans-serif",
            background: 'linear-gradient(90deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ReviewKE
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(l => {
            const active = router.pathname === l.href;
            const IconComp = Icon[l.icon];
            return (
              <Link key={l.href} href={l.href} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: active ? '#00C853' : 'rgba(255,255,255,0.65)',
                background: active ? 'rgba(0,200,83,0.1)' : 'transparent',
                transition: 'all 0.2s', textDecoration: 'none',
              }}>
                <IconComp size={15} />
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user && (
            <Link href="/wallet" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px',
              background: 'rgba(0,200,83,0.08)',
              border: '1px solid rgba(0,200,83,0.2)',
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: '#00C853', textDecoration: 'none',
            }}>
              <Icon.Wallet size={14} />
              KES {balance.toLocaleString()}
            </Link>
          )}
          <button onClick={onAuthClick} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: user ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00C853, #007A3D)',
            color: user ? 'rgba(255,255,255,0.85)' : '#000',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: user ? 'none' : '0 0 20px rgba(0,200,83,0.3)',
            transition: 'all 0.2s',
          }}>
            <Icon.User size={15} />
            {user ? user.name.split(' ')[0] : 'Sign in'}
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <style>{`
          .desktop-nav { display: flex; }
          .mobile-bottom-nav { display: none; }
          @media (max-width: 640px) {
            .desktop-nav { display: none !important; }
            .mobile-bottom-nav {
              display: flex !important;
              position: fixed; bottom: 0; left: 0; right: 0;
              background: rgba(8,12,20,0.9);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border-top: 1px solid rgba(255,255,255,0.08);
              z-index: 200; padding: 8px 0 env(safe-area-inset-bottom, 0);
            }
          }
        `}</style>
        {[...navLinks, { href: '/auth', label: user ? user.name.split(' ')[0] : 'Sign in', icon: 'User', action: onAuthClick }].map(l => {
          const active = router.pathname === l.href && l.href !== '/auth';
          const IconComp = Icon[l.icon];
          return (
            <div key={l.label} onClick={l.action || undefined} style={{ flex: 1 }}>
              {l.action ? (
                <button style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '6px 4px', fontSize: 10, fontWeight: 600,
                  background: 'none', border: 'none', color: active ? '#00C853' : 'rgba(255,255,255,0.45)',
                }}>
                  <IconComp size={20} />
                  {l.label}
                </button>
              ) : (
                <Link href={l.href} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '6px 4px', fontSize: 10, fontWeight: 600,
                  color: active ? '#00C853' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                }}>
                  <IconComp size={20} />
                  {l.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
