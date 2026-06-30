import { useState } from 'react';
import Icon from '../lib/icons';

export default function AuthModal({ onClose, onAuth }) {
  const [tab, setTab] = useState('signup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    setError('');
    if (tab === 'signup') {
      if (!name.trim()) return setError('Enter your full name');
      if (phone.length < 9) return setError('Enter a valid phone number (9 digits after 0)');
      onAuth({ name: name.trim(), phone: '0' + phone, email });
    } else {
      if (phone.length < 9) return setError('Enter your phone number');
      onAuth({ name: 'Reviewer', phone: '0' + phone, email });
    }
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <style>{`
        .auth-sheet { border-radius: 20px 20px 0 0 !important; }
        @media (min-width: 520px) {
          .auth-sheet { border-radius: 20px !important; margin-bottom: 0 !important; max-width: 420px !important; }
        }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="auth-sheet" style={{
        background: 'rgba(13,18,32,0.98)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.10)',
        padding: '12px 24px env(safe-area-inset-bottom, 32px)',
        width: '100%',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.3s ease',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00C853,#007A3D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.User size={15} style={{ color: '#000' }} />
              </div>
              <span style={{ fontSize: 19, fontWeight: 800 }}>
                {tab === 'signup' ? 'Create account' : 'Welcome back'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 39 }}>
              {tab === 'signup' ? 'Start earning from your reviews' : 'Sign in to ReviewKE'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
            <Icon.X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: 3, marginBottom: 22, gap: 3 }}>
          {['signup', 'login'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
              flex: 1, padding: '9px', borderRadius: 7, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === t ? 'rgba(0,200,83,0.14)' : 'transparent',
              color: tab === t ? '#00C853' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
            }}>
              {t === 'signup' ? 'Sign up' : 'Log in'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'signup' && (
            <div>
              <label style={lbl}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Kamau" autoComplete="name" />
            </div>
          )}

          <div>
            <label style={lbl}>Safaricom number</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '0 12px', fontSize: 14, fontWeight: 700, color: '#00C853', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>+254</span>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="712 345 678" type="tel" inputMode="numeric" autoComplete="tel"
                style={{ border: 'none', background: 'transparent', borderRadius: 0, flex: 1 }} />
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label style={lbl}>Email <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: 0 }}>optional</span></label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" autoComplete="email" />
            </div>
          )}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.18)', borderRadius: 8, padding: '10px 13px', marginTop: 14, fontSize: 13, color: '#FF3B3B' }}>
            <Icon.Info size={13} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <button onClick={handleSubmit} style={{
          width: '100%', padding: '14px', marginTop: 18,
          borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #00C853, #007A3D)',
          color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 0 20px rgba(0,200,83,0.25)',
          touchAction: 'manipulation',
        }}>
          <Icon.ArrowRight size={15} />
          {tab === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 14 }}>
          By continuing you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' };
