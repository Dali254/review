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
      if (phone.length < 9) return setError('Enter a valid Safaricom number (9 digits after 0)');
      onAuth({ name: name.trim(), phone: '0' + phone, email });
    } else {
      if (phone.length < 9) return setError('Enter your phone number');
      onAuth({ name: 'Reviewer', phone: '0' + phone, email });
    }
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(13,18,32,0.95)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 420,
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,200,83,0.1)',
        animation: 'fadeUp 0.3s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#00C853,#007A3D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.User size={16} style={{ color: '#000' }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800 }}>
                {tab === 'signup' ? 'Create account' : 'Welcome back'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginLeft: 42 }}>
              {tab === 'signup' ? 'Start earning from your reviews' : 'Sign in to your ReviewKE account'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          }}>
            <Icon.X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: 3, marginBottom: 24, gap: 3,
        }}>
          {['signup', 'login'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === t ? 'rgba(0,200,83,0.15)' : 'transparent',
              color: tab === t ? '#00C853' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}>
              {t === 'signup' ? 'Sign up' : 'Log in'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'signup' && (
            <div>
              <label style={lbl}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Kamau" />
            </div>
          )}

          <div>
            <label style={lbl}>Safaricom number</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '0 12px', fontSize: 14, fontWeight: 700, color: '#00C853', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                +254
              </span>
              <input
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0,9))}
                placeholder="712 345 678" type="tel"
                style={{ border: 'none', background: 'transparent', flex: 1, borderRadius: 0 }}
              />
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label style={lbl}>
                Email <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>optional</span>
              </label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" />
            </div>
          )}
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)',
            borderRadius: 8, padding: '10px 14px', marginTop: 16,
            fontSize: 13, color: '#FF3B3B',
          }}>
            <Icon.Info size={14} />
            {error}
          </div>
        )}

        <button onClick={handleSubmit} style={{
          width: '100%', padding: 14, marginTop: 20,
          borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #00C853, #007A3D)',
          color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 0 24px rgba(0,200,83,0.35)',
          transition: 'all 0.2s',
        }}>
          <Icon.ArrowRight size={16} />
          {tab === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
          By continuing you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' };
