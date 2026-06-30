import { useState } from 'react';
import Icon from '../lib/icons';
import { normalizePhone, isValidPhone } from '../lib/useUser';

const REVIEW_PREFERENCES = [
  {
    id: 'local',
    title: 'Local businesses',
    desc: 'Safaricom, Equity Bank, Naivas and 47+ Kenyan companies',
    icon: 'MapPin',
    color: 'var(--pink)',
    bg: 'var(--pink-light)',
    border: 'var(--pink-mid)',
  },
  {
    id: 'international',
    title: 'International brands',
    desc: 'Google, Meta, Amazon, Apple and global companies — Pro plan only',
    icon: 'Globe',
    color: 'var(--purple)',
    bg: 'var(--purple-light)',
    border: 'var(--purple-mid)',
    proOnly: true,
  },
  {
    id: 'both',
    title: 'Both',
    desc: 'See local and international review jobs in one feed',
    icon: 'Grid',
    color: '#D97706',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
];

export default function AuthModal({ onClose, onAuth }) {
  const [tab, setTab]     = useState('signup');
  const [step, setStep]   = useState('form'); // form | preference | scanning (signup only)
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('local');
  const [error, setError] = useState('');
  const [scanPhase, setScanPhase] = useState(0);

  const SCAN_STEPS = [
    'Connecting to global review network...',
    'Scanning Google, Meta, Amazon, Apple...',
    'Matching jobs to your profile...',
    'Found international review jobs!',
  ];

  function validateForm() {
    setError('');
    if (tab === 'signup') {
      if (!name.trim()) { setError('Enter your full name'); return false; }
      if (!isValidPhone(phone)) { setError('Enter a valid M-Pesa number'); return false; }
      return true;
    }
    if (!isValidPhone(phone)) { setError('Enter your M-Pesa number'); return false; }
    return true;
  }

  function handlePrimaryAction() {
    if (!validateForm()) return;
    if (tab === 'signup') {
      // Move to the local/international preference step before finishing
      setStep('preference');
      return;
    }
    // Login skips preference selection — it's only asked once, at signup
    onAuth({ name: 'Reviewer', phone: normalizePhone(phone), email });
    onClose();
  }

  function finishSignup() {
    // International (or both) gets a brief "AI scanning for jobs" moment
    // before landing — purely cosmetic, but it sets the right expectation
    // that international jobs are a distinct, curated set.
    if (preference === 'international' || preference === 'both') {
      setStep('scanning');
      setScanPhase(0);
      let phase = 0;
      const interval = setInterval(() => {
        phase += 1;
        setScanPhase(phase);
        if (phase >= SCAN_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onAuth({ name: name.trim(), phone: normalizePhone(phone), email, reviewPreference: preference });
            onClose();
          }, 900);
        }
      }, 750);
      return;
    }
    onAuth({ name: name.trim(), phone: normalizePhone(phone), email, reviewPreference: preference });
    onClose();
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div className="auth-modal-card" style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:440, boxShadow:'0 24px 60px rgba(0,0,0,0.15)', animation:'fadeUp 0.3s ease', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <style>{`
          @media (max-width: 420px) {
            .auth-modal-card { padding: 20px !important; border-radius: 16px !important; }
          }
        `}</style>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* ── STEP: form (name/phone/email) ── */}
        {step === 'form' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon.User size={18} style={{ color:'#fff' }} />
                </div>
                <span style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>{tab==='signup' ? 'Create account' : 'Welcome back'}</span>
              </div>
              <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}><Icon.X size={15}/></button>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', background:'#f8f9fc', border:'1.5px solid var(--border)', borderRadius:10, padding:3, marginBottom:22, gap:3 }}>
              {['signup','login'].map(t=>(
                <button key={t} onClick={()=>{setTab(t);setError('');}} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', background: tab===t ? '#fff' : 'transparent', color: tab===t ? 'var(--pink)' : 'var(--text-muted)', boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition:'all .15s' }}>
                  {t==='signup' ? 'Sign up' : 'Log in'}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {tab==='signup' && (
                <div>
                  <label style={lbl}>Full name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="John Kamau" autoComplete="name"/>
                </div>
              )}
              <div>
                <label style={lbl}>M-Pesa number</label>
                <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden', padding:'0 4px 0 14px' }}>
                  <Icon.Smartphone size={15} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
                  <input value={phone} onChange={e=>setPhone(e.target.value.replace(/[^\d+]/g,'').slice(0,13))} placeholder="0712345678" type="tel" inputMode="numeric" style={{ border:'none', borderRadius:0, flex:1, fontSize:16, padding:'11px 10px' }}/>
                </div>
              </div>
              {tab==='signup' && (
                <div>
                  <label style={lbl}>Email <span style={{ fontSize:11, fontWeight:400, color:'var(--text-muted)' }}>optional</span></label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="john@example.com" type="email"/>
                </div>
              )}
            </div>

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:7, background:'#fff5f5', border:'1.5px solid #fed7d7', borderRadius:8, padding:'10px 13px', marginTop:14, fontSize:13, color:'#e53e3e' }}>
                <Icon.Info size={13} style={{flexShrink:0}}/>{error}
              </div>
            )}

            <button onClick={handlePrimaryAction} style={{ width:'100%', padding:'14px', marginTop:18, borderRadius:10, border:'none', background:'var(--brand-gradient)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'var(--shadow-glow-purple)', touchAction:'manipulation' }}>
              <Icon.ArrowRight size={15}/>
              {tab==='signup' ? 'Continue' : 'Sign in'}
            </button>
            <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:14 }}>By continuing you agree to our Terms of Service</p>
          </>
        )}

        {/* ── STEP: preference (signup only) ── */}
        {step === 'preference' && (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <button onClick={() => setStep('form')} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}><Icon.ArrowLeft size={15}/></button>
              <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}><Icon.X size={15}/></button>
            </div>

            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'var(--shadow-glow-purple)' }}>
                <Icon.Globe size={24} style={{ color:'#fff' }} />
              </div>
              <h3 style={{ fontSize:19, fontWeight:800, color:'var(--text)', marginBottom:6 }}>What do you want to review?</h3>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>Pick what kind of review jobs you'll see. You can change this anytime in settings.</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:22 }}>
              {REVIEW_PREFERENCES.map(p => {
                const IC = Icon[p.icon];
                const active = preference === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreference(p.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:13, textAlign:'left',
                      padding:'14px 16px', borderRadius:14, cursor:'pointer',
                      background: active ? p.bg : '#fff',
                      border: `1.5px solid ${active ? p.border : 'var(--border)'}`,
                      transition:'all .15s',
                    }}
                  >
                    <div style={{ width:40, height:40, borderRadius:11, background: active ? '#fff' : p.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: active ? '0 2px 6px rgba(0,0,0,0.08)' : 'none' }}>
                      <IC size={18} style={{ color:p.color }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{p.title}</span>
                        {p.proOnly && (
                          <span style={{ fontSize:9, fontWeight:800, color:'#D97706', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:20, padding:'2px 7px' }}>PRO</span>
                        )}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2, lineHeight:1.4 }}>{p.desc}</div>
                    </div>
                    <div style={{
                      width:20, height:20, borderRadius:'50%', flexShrink:0,
                      border: `2px solid ${active ? p.color : 'var(--border-strong)'}`,
                      background: active ? p.color : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {active && <Icon.Check size={12} style={{ color:'#fff' }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {(preference === 'international' || preference === 'both') && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:'#fff7ed', border:'1.5px solid #fed7aa', borderRadius:10, padding:'10px 13px', marginBottom:18 }}>
                <Icon.Zap size={13} style={{ color:'#D97706', marginTop:1, flexShrink:0 }}/>
                <span style={{ fontSize:11.5, color:'#92400e', lineHeight:1.5 }}>
                  International review jobs are reserved for Pro subscribers. You'll be prompted to upgrade the first time you try to open one.
                </span>
              </div>
            )}

            <button onClick={finishSignup} style={{ width:'100%', padding:'14px', borderRadius:10, border:'none', background:'var(--brand-gradient)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'var(--shadow-glow-pink)' }}>
              <Icon.CheckCircle size={16}/>
              Create account
            </button>
          </>
        )}

        {/* ── STEP: scanning (AI search animation for international/both) ── */}
        {step === 'scanning' && (
          <div style={{ textAlign:'center', padding:'28px 8px' }}>
            <style>{`
              @keyframes scan-pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.08); opacity:.85; } }
              @keyframes scan-ring { 0% { transform:scale(0.8); opacity:.6; } 100% { transform:scale(1.6); opacity:0; } }
              @keyframes scan-dot-bounce { 0%,80%,100% { transform:scale(0.6); opacity:.4; } 40% { transform:scale(1); opacity:1; } }
            `}</style>

            <div style={{ position:'relative', width:88, height:88, margin:'0 auto 26px' }}>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid var(--purple)', animation:'scan-ring 1.6s ease-out infinite' }}/>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid var(--pink)', animation:'scan-ring 1.6s ease-out infinite .5s' }}/>
              <div style={{
                position:'relative', width:88, height:88, borderRadius:'50%',
                background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'var(--shadow-glow-purple)', animation:'scan-pulse 1.4s ease-in-out infinite',
              }}>
                <Icon.Sparkles size={36} style={{ color:'#fff' }}/>
              </div>
            </div>

            <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:18 }}>
              {scanPhase >= SCAN_STEPS.length - 1 ? 'Jobs found!' : 'AI is finding your jobs'}
            </h3>

            <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:300, margin:'0 auto' }}>
              {SCAN_STEPS.map((label, i) => {
                const isDone = i < scanPhase;
                const isActive = i === scanPhase;
                const isPending = i > scanPhase;
                if (isPending) return null;
                return (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:10, textAlign:'left',
                    padding:'9px 12px', borderRadius:10,
                    background: isActive ? 'var(--purple-light)' : '#f0fdf4',
                    opacity: isPending ? 0.3 : 1,
                    transition:'all .3s ease',
                  }}>
                    {isDone ? (
                      <Icon.CheckCircle size={15} style={{ color:'var(--green)', flexShrink:0 }}/>
                    ) : (
                      <div style={{ display:'flex', gap:3, flexShrink:0, width:15, justifyContent:'center' }}>
                        {[0,1,2].map(d => (
                          <span key={d} style={{ width:4, height:4, borderRadius:'50%', background:'var(--purple)', display:'inline-block', animation:`scan-dot-bounce 1.2s ease-in-out infinite ${d*0.15}s` }}/>
                        ))}
                      </div>
                    )}
                    <span style={{ fontSize:12.5, fontWeight: isActive ? 700 : 500, color: isDone ? 'var(--text)' : 'var(--text-secondary)' }}>{label}</span>
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
const lbl = { display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 };
