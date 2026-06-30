import Link from 'next/link';
import Head from 'next/head';
import Icon from '../lib/icons';

export default function NotFound() {
  return (
    <>
      <Head><title>Page not found — ReviewKE</title></Head>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: 'rgba(0,200,83,0.2)', lineHeight: 1, marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#f1f5f9' }}>Page not found</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 28, maxWidth: 300, fontSize: 14 }}>This page doesn't exist. Go back to browsing Kenyan businesses.</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg,#00C853,#007A3D)', color: '#000', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14, boxShadow: '0 0 20px rgba(0,200,83,0.25)' }}>
          <Icon.Home size={16} /> Back to ReviewKE
        </Link>
      </div>
    </>
  );
}
