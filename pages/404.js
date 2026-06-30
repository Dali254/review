import Link from 'next/link';
import Head from 'next/head';
import Icon from '../lib/icons';

export default function NotFound() {
  return (
    <>
      <Head><title>Page not found — ReviewKE</title></Head>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ fontSize: 96, fontWeight: 900, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg,#00C853,rgba(0,200,83,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 20 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: '#f1f5f9' }}>Page not found</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 32, maxWidth: 340 }}>This page doesn't exist. Go back to browsing and reviewing Kenyan businesses.</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'linear-gradient(135deg,#00C853,#007A3D)', color: '#000', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 15, boxShadow: '0 0 24px rgba(0,200,83,0.3)' }}>
          <Icon.Home size={17} /> Back to ReviewKE
        </Link>
      </div>
    </>
  );
}
