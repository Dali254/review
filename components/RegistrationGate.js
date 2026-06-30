import { useState } from 'react';
import Icon from '../lib/icons';

const REVIEW_PREFERENCES = [
  {
    id: 'local',
    title: 'Local businesses',
    desc: 'Safaricom, Equity Bank, Naivas and 50+ Kenyan companies',
    icon: 'MapPin',
    color: 'var(--pink)',
    bg: 'var(--pink-light)',
    border: 'var(--pink-mid)',
  },
  {
    id: 'international',
    title: 'International brands',
    desc: 'Google, Meta, Amazon, Apple and global companies',
    icon: 'Globe',
    color: 'var(--purple)',
    bg: 'var(--purple-light)',
    border: 'var(--purple-mid)',
  },
];

const SCAN_STEPS = [
  'Connecting to global review network...',
  'Scanning Google, Meta, Amazon, Apple...',
  'Matching jobs to your profile...',
  'Found international review jobs!',
];

// Strict, non-dismissible registration screen. This is rendered by
// _app.js in place of EVERY route when no user is signed in — there is
// no homepage, no marketing page, and no way to click past it without
// completing signup or logging in. See _app.js for the gate logic.
export default function RegistrationGate({ onAuth }) {
  const [tab, setTab] = useState('signup');
  const [step, setStep] = useState('form'); // form | preference | scanning
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('local');
  const [error, setError] = useState('');
  const [scanPhase, setScanPhase] = useState(0);

  function validateForm() {
    setError('');
    if (tab === 'signup') {
      if (!name.trim()) { setError('Enter your full name'); return false; }
      if (phone.length < 9) { setError('Enter a valid phone number'); return false; }
      return true;
    }
    if (phone.length < 9) { setError('Enter your phone number'); return false; }
    return true;
  }

  function handlePrimaryAction() {
    if (!validateForm()) return;
    if (tab === 'signup') {
      setStep('preference');
      return;
    }
    onAuth({ name: 'Reviewer', phone: '0' + phone, email });
  }

  function finishSignup() {
    if (preference === 'international') {
      setStep('scanning');
      setScanPhase(0);
      let phase = 0;
      const interval = setInterval(() => {
        phase += 1;
        setScanPhase(phase);
        if (phase >= SCAN_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onAuth({ name: name.trim(), phone: '0' + phone, email, reviewPreference: preference });
          }, 900);
        }
      }, 750);
      return;
    }
    onAuth({ name: name.trim(), phone: '0' + phone, email, reviewPreference: preference });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--brand-gradient)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, overflowY: 'auto',
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scan-pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.08); opacity:.85; } }
        @keyframes scan-ring { 0% { transform:scale(0.8); opacity:.6; } 100% { transform:scale(1.6); opacity:0; } }
        @keyframes scan-dot-bounce { 0%,80%,100% { transform:scale(0.6); opacity:.4; } 40% { transform:scale(1); opacity:1; } }
        .gate-card { width: 100%; max-width: 440px; max-height: 92vh; overflow-y: auto; padding: 32px; }
        @media (max-width: 420px) {
          .gate-card { padding: 22px !important; border-radius: 18px !important; }
        }
      `}</style>

      <div className="gate-card fade-up" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.35)', animation: 'fadeUp 0.35s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: 'var(--shadow-glow-purple)' }}>
            <Icon.BarChart size={24} style={{ color: '#fff' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ReviewKE</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Earn money reviewing real businesses</div>
        </div>

        {step === 'form' && (
          <>
            <div style={{ display: 'flex', background: '#f8f9fc', border: '1.5px solid var(--border)', borderRadius: 10, padding: 3, marginBottom: 20, gap: 3 }}>
              {['signup', 'login'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--pink)' : 'var(--text-muted)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
                  {t === 'signup' ? 'Create account' : 'Log in'}
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
                <div style={{ display: 'flex', background: '#fff', border: '1.5px solid var(--border-strong)', borderRadius: 10, overflow: 'hidden' }}>
                  <span style={{ padding: '0 14px', fontWeight: 700, color: 'var(--pink)', borderRight: '1.5px solid var(--border)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', fontSize: 14 }}>+254</span>
                  <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="712 345 678" type="tel" inputMode="numeric" style={{ border: 'none', borderRadius: 0, flex: 1, fontSize: 16 }} />
                </div>
              </div>
              {tab === 'signup' && (
                <div>
                  <label style={lbl}>Email <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>optional</span></label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" />
                </div>
              )}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: 8, padding: '10px 13px', marginTop: 14, fontSize: 13, color: '#e53e3e' }}>
                <Icon.Info size={13} style={{ flexShrink: 0 }} />{error}
              </div>
            )}

            <button onClick={handlePrimaryAction} style={{ width: '100%', padding: '14px', marginTop: 18, borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-glow-purple)', touchAction: 'manipulation' }}>
              <Icon.ArrowRight size={15} />
              {tab === 'signup' ? 'Continue' : 'Log in'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.5 }}>
              Registration is required to use ReviewKE.<br />By continuing you agree to our Terms of Service.
            </p>
          </>
        )}

        {step === 'preference' && (
          <>
            <button onClick={() => setStep('form')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: 16 }}><Icon.ArrowLeft size={15} /></button>

            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>What do you want to review?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This choice is permanent at signup — local and international are separate review feeds and cannot be mixed.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              {REVIEW_PREFERENCES.map(p => {
                const IC = Icon[p.icon];
                const active = preference === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreference(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
                      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                      background: active ? p.bg : '#fff',
                      border: `1.5px solid ${active ? p.border : 'var(--border)'}`,
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: active ? '#fff' : p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? '0 2px 6px rgba(0,0,0,0.08)' : 'none' }}>
                      <IC size={18} style={{ color: p.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{p.desc}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? p.color : 'var(--border-strong)'}`,
                      background: active ? p.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <Icon.Check size={12} style={{ color: '#fff' }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {preference === 'international' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 10, padding: '10px 13px', marginBottom: 18 }}>
                <Icon.Zap size={13} style={{ color: '#D97706', marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: '#92400e', lineHeight: 1.5 }}>
                  You'll only see international jobs — no local Kenyan businesses. These jobs are unlocked for you immediately; no separate upgrade needed for the brands you chose.
                </span>
              </div>
            )}
            {preference === 'local' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--pink-light)', border: '1.5px solid var(--pink-mid)', borderRadius: 10, padding: '10px 13px', marginBottom: 18 }}>
                <Icon.Info size={13} style={{ color: 'var(--pink)', marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  You'll only see local Kenyan businesses. Want international brands instead? Go back and choose that option — it can't be combined with local.
                </span>
              </div>
            )}

            <button onClick={finishSignup} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-glow-pink)' }}>
              <Icon.CheckCircle size={16} />
              Create account
            </button>
          </>
        )}

        {step === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '20px 4px' }}>
            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 26px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--purple)', animation: 'scan-ring 1.6s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--pink)', animation: 'scan-ring 1.6s ease-out infinite .5s' }} />
              <div style={{
                position: 'relative', width: 88, height: 88, borderRadius: '50%',
                background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-purple)', animation: 'scan-pulse 1.4s ease-in-out infinite',
              }}>
                <Icon.Sparkles size={36} style={{ color: '#fff' }} />
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 18 }}>
              {scanPhase >= SCAN_STEPS.length - 1 ? 'Jobs found!' : 'AI is finding your jobs'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
              {SCAN_STEPS.map((label, i) => {
                const isDone = i < scanPhase;
                const isActive = i === scanPhase;
                const isPending = i > scanPhase;
                if (isPending) return null;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    padding: '9px 12px', borderRadius: 10,
                    background: isActive ? 'var(--purple-light)' : '#f0fdf4',
                    transition: 'all .3s ease',
                  }}>
                    {isDone ? (
                      <Icon.CheckCircle size={15} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0, width: 15, justifyContent: 'center' }}>
                        {[0, 1, 2].map(d => (
                          <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block', animation: `scan-dot-bounce 1.2s ease-in-out infinite ${d * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                    <span style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isDone ? 'var(--text)' : 'var(--text-secondary)' }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };
