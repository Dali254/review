import { useState } from 'react';
import Icon from '../lib/icons';

export default function AuthModal({ onClose, onAuth }) {
  const [tab, setTab]     = useState('signup');
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function submit() {
    setError('');
    if (tab === 'signup') {
      if (!name.trim()) return setError('Enter your full name');
      if (phone.length < 9) return setError('Enter a valid phone number');
      onAuth({ name: name.trim(), phone: '0'+phone, email });
    } else {
      if (phone.length < 9) return setError('Enter your phone number');
      onAuth({ name: 'Reviewer', phone: '0'+phone, email });
    }
    onClose();
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:420, boxShadow:'0 24px 60px rgba(0,0,0,0.15)', animation:'fadeUp 0.3s ease' }} onClick={e=>e.stopPropagation()}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--pink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
            <label style={lbl}>Safaricom number</label>
            <div style={{ display:'flex', background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden' }}>
              <span style={{ padding:'0 14px', fontWeight:700, color:'var(--pink)', borderRight:'1.5px solid var(--border)', whiteSpace:'nowrap', display:'flex', alignItems:'center', fontSize:14 }}>+254</span>
              <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="712 345 678" type="tel" inputMode="numeric" style={{ border:'none', borderRadius:0, flex:1, fontSize:16 }}/>
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

        <button onClick={submit} style={{ width:'100%', padding:'14px', marginTop:18, borderRadius:10, border:'none', background:'var(--pink)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(233,30,140,0.3)', touchAction:'manipulation' }}>
          <Icon.ArrowRight size={15}/>
          {tab==='signup' ? 'Create account' : 'Sign in'}
        </button>
        <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:14 }}>By continuing you agree to our Terms of Service</p>
      </div>
    </div>
  );
}
const lbl = { display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 };
