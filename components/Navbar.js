import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../lib/icons';

export default function Navbar({ user, onAuthClick, balance = 0 }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user ? user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '';

  return (
    <>
      <style>{`
        .nav-links { display:flex; gap:6px; align-items:center; }
        .mobile-nav { display:none !important; }
        @media(max-width:640px){
          .nav-links { display:none !important; }
          .mobile-nav { display:flex !important; position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #e8ecf0; z-index:200; padding-bottom:env(safe-area-inset-bottom,0); }
        }
      `}</style>

      <nav style={{ background:'#fff', borderBottom:'1px solid #e8ecf0', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'var(--pink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.BarChart size={18} style={{ color:'#fff' }} />
          </div>
          <div>
            <span style={{ fontSize:18, fontWeight:800, color:'var(--pink)', letterSpacing:'-0.3px' }}>ReviewKE</span>
            <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500, marginLeft:8, background:'#f1f5f9', padding:'2px 8px', borderRadius:20 }}>Reviewer Portal</span>
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
            Wallet {user && balance > 0 && <span style={{ background:'var(--pink)', color:'#fff', fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:20, marginLeft:4 }}>KES {balance.toLocaleString()}</span>}
          </Link>
        </div>

        {/* Right — user */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {user ? (
            <button onClick={onAuthClick} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 14px 6px 6px', background:'#f8f9fc', border:'1.5px solid var(--border)', borderRadius:24, cursor:'pointer', fontSize:14, fontWeight:600, color:'var(--text)' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--pink)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>{initials}</div>
              {user.name.split(' ')[0]}
              <Icon.ChevronDown size={14} style={{ color:'var(--text-muted)' }} />
            </button>
          ) : (
            <button onClick={onAuthClick} style={{ padding:'9px 20px', background:'var(--pink)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(233,30,140,0.3)' }}>
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
        <button onClick={onAuthClick} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 4px 8px', fontSize:10, fontWeight:600, color: user ? 'var(--pink)' : '#94a3b8', background:'none', border:'none' }}>
          <Icon.User size={22} />
          {user ? user.name.split(' ')[0].slice(0,7) : 'Sign in'}
        </button>
      </nav>
    </>
  );
}
