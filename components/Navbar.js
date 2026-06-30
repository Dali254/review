import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../lib/icons';
import { useCurrency } from '../lib/CurrencyContext';

function CurrencySwitcher({ compact = false }) {
  const { currency, toggleCurrency, rate } = useCurrency();
  return (
    <button
      onClick={toggleCurrency}
      title={`1 USD = KES ${rate} — click to switch`}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: compact ? '6px 10px' : '7px 12px',
        background: 'var(--brand-gradient-soft)',
        border: '1.5px solid var(--purple-mid)',
        borderRadius: 8,
        fontSize: 13, fontWeight: 700,
        color: 'var(--purple)',
        cursor: 'pointer',
      }}
    >
      <Icon.DollarSign size={13} />
      <span style={{ color: currency === 'KES' ? 'var(--pink)' : 'var(--text-muted)' }}>KES</span>
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/</span>
      <span style={{ color: currency === 'USD' ? 'var(--pink)' : 'var(--text-muted)' }}>USD</span>
    </button>
  );
}

export default function Navbar({ user, onAuthClick, balance = 0 }) {
  const router = useRouter();
  const { format, toggleCurrency, currency } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user ? user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '';

  return (
    <>
      <style>{`
        .nav-links { display:flex; gap:6px; align-items:center; }
        .mobile-nav { display:none !important; }
        .nav-currency-desktop { display:flex !important; }
        .nav-portal-badge { display:inline; }
        @media(max-width:820px){
          .nav-portal-badge { display:none !important; }
          nav.main-nav { padding:0 14px !important; }
        }
        @media(max-width:640px){
          .nav-links { display:none !important; }
          .nav-currency-desktop { display:none !important; }
          .mobile-nav { display:flex !important; position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #e8ecf0; z-index:200; padding-bottom:env(safe-area-inset-bottom,0); }
        }
        @media(max-width:380px){
          .nav-user-label { display:none !important; }
        }
      `}</style>

      <nav className="main-nav" style={{ background:'#fff', borderBottom:'1px solid #e8ecf0', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-glow-purple)' }}>
            <Icon.BarChart size={18} style={{ color:'#fff' }} />
          </div>
          <div>
            <span style={{
              fontSize:18, fontWeight:800, letterSpacing:'-0.3px',
              background:'var(--brand-gradient)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>ReviewKE</span>
            <span className="nav-portal-badge" style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500, marginLeft:8, background:'#f1f5f9', padding:'2px 8px', borderRadius:20 }}>Reviewer Portal</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {[{href:'/businesses',label:'Businesses'},{href:'/',label:'How It Works'}].map(l=>(
            <Link key={l.href} href={l.href} style={{ padding:'7px 14px', borderRadius:8, fontSize:14, fontWeight:500, color: router.pathname===l.href ? 'var(--pink)' : 'var(--text-secondary)', background: router.pathname===l.href ? 'var(--pink-light)' : 'transparent', textDecoration:'none', transition:'all .15s' }}>
              {l.label}
            </Link>
          ))}
          <Link href="/wallet" style={{ padding:'7px 14px', borderRadius:8, fontSize:14, fontWeight:500, color: router.pathname==='/wallet' ? 'var(--pink)' : 'var(--text-secondary)', background: router.pathname==='/wallet' ? 'var(--pink-light)' : 'transparent', textDecoration:'none' }}>
            Wallet {user && balance > 0 && <span style={{ background:'var(--brand-gradient)', color:'#fff', fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:20, marginLeft:4 }}>{format(balance)}</span>}
          </Link>
        </div>

        {/* Right — currency switcher + user */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="nav-currency-desktop">
            <CurrencySwitcher />
          </div>

          {user ? (
            <button onClick={onAuthClick} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 14px 6px 6px', background:'#f8f9fc', border:'1.5px solid var(--border)', borderRadius:24, cursor:'pointer', fontSize:14, fontWeight:600, color:'var(--text)' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>{initials}</div>
              <span className="nav-user-label">{user.name.split(' ')[0]}</span>
              <Icon.ChevronDown size={14} style={{ color:'var(--text-muted)' }} />
            </button>
          ) : (
            <button onClick={onAuthClick} style={{ padding:'9px 20px', background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'var(--shadow-glow-purple)' }}>
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" style={{ display:'flex' }}>
        {[{href:'/',icon:'Home',label:'Home'},{href:'/businesses',icon:'Grid',label:'Browse'},{href:'/wallet',icon:'Wallet',label:'Wallet'}].map(l=>{
          const IC = Icon[l.icon];
          const active = router.pathname === l.href;
          return (
            <Link key={l.href} href={l.href} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 4px 8px', fontSize:10, fontWeight:600, color: active ? 'var(--pink)' : '#94a3b8', textDecoration:'none' }}>
              <IC size={22} />{l.label}
            </Link>
          );
        })}
        <button onClick={toggleCurrency} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 4px 8px', fontSize:10, fontWeight:600, color:'var(--purple)', background:'none', border:'none' }}>
          <Icon.DollarSign size={22} />{currency}
        </button>
        <button onClick={onAuthClick} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 4px 8px', fontSize:10, fontWeight:600, color: user ? 'var(--pink)' : '#94a3b8', background:'none', border:'none' }}>
          <Icon.User size={22} />
          {user ? user.name.split(' ')[0].slice(0,7) : 'Sign in'}
        </button>
      </nav>
    </>
  );
}
