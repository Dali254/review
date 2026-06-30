import Link from 'next/link';
import Head from 'next/head';
import Icon from '../lib/icons';

export default function NotFound() {
  return (
    <>
      <Head><title>Page not found — ReviewKE</title></Head>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:24, textAlign:'center', background:'var(--bg)' }}>
        <div style={{ width:72, height:72, borderRadius:20, background:'var(--pink-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Icon.Search size={32} style={{ color:'var(--pink)' }}/>
        </div>
        <div style={{ fontSize:80, fontWeight:900, color:'var(--pink-mid)', lineHeight:1, marginBottom:16 }}>404</div>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:10, color:'var(--text)' }}>Page not found</h1>
        <p style={{ color:'var(--text-secondary)', marginBottom:28, maxWidth:300, fontSize:14 }}>This page doesn't exist. Go back to reviewing Kenyan businesses.</p>
        <Link href="/businesses" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', background:'var(--brand-gradient)', color:'#fff', borderRadius:12, fontWeight:700, fontSize:14, boxShadow:'var(--shadow-glow-purple)' }}>
          <Icon.Grid size={16}/>Back to ReviewKE
        </Link>
      </div>
    </>
  );
}
