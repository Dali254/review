import { useState } from 'react';
import Icon from '../lib/icons';
import { PRO_PRICE_KES, DAILY_FREE_LIMIT } from '../lib/useUser';
import { EARN_RATES } from '../data/businesses';
import { recordFee, FEE_TYPES } from '../lib/feeLedger';
import { useCurrency } from '../lib/CurrencyContext';

const MIN_EARN = Math.min(...Object.values(EARN_RATES));
const MAX_EARN = Math.max(...Object.values(EARN_RATES));

export default function UpgradeModal({ user, onClose, onSuccess }) {
  const [step, setStep] = useState('plans'); // plans | phone | paying | success | failed
  const [phone, setPhone] = useState((user?.phone || '').replace(/^0/, ''));
  const { format } = useCurrency();

  async function startPayment() {
    if (phone.length < 9) return;
    setStep('paying');
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '0' + phone,
          amount: PRO_PRICE_KES,
          name: user?.name || 'Reviewer',
          reference: `RKE-PRO-${Date.now()}`,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setStep('failed');
        return;
      }
      pollPaymentStatus(data.reference);
    } catch {
      setStep('failed');
    }
  }

  async function pollPaymentStatus(reference, attempt = 0) {
    const MAX_ATTEMPTS = 15;
    if (attempt >= MAX_ATTEMPTS) { setStep('failed'); return; }
    try {
      const res = await fetch(`/api/pay-status?reference=${reference}`);
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        recordFee({
          type: FEE_TYPES.PRO_SUBSCRIPTION,
          amount: PRO_PRICE_KES,
          userName: user?.name,
          userPhone: user?.phone,
          reference,
        });
        setStep('success');
        return;
      }
      if (data.status === 'FAILED' || data.status === 'CANCELLED') { setStep('failed'); return; }
      setTimeout(() => pollPaymentStatus(reference, attempt + 1), 3000);
    } catch {
      setTimeout(() => pollPaymentStatus(reference, attempt + 1), 3000);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, background:'rgba(20,20,31,0.5)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => step!=='paying' && onClose()}>
      <div className="glass-card upgrade-modal-card" style={{ background:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, padding:'12px 28px env(safe-area-inset-bottom,32px)', width:'100%', maxWidth:460, animation:'fadeUp .3s ease', maxHeight:'92vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <style>{`
          @media (max-width: 420px) {
            .upgrade-modal-card { padding: 10px 18px env(safe-area-inset-bottom,28px) !important; }
            .upgrade-plan-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div style={{ width:36, height:4, background:'var(--border-strong)', borderRadius:2, margin:'0 auto 22px' }} />

        {step === 'plans' && (
          <>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:64, height:64, borderRadius:18, background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'var(--shadow-glow-purple)' }}>
                <Icon.Zap size={28} style={{ color:'#fff' }}/>
              </div>
              <h3 style={{ fontSize:21, fontWeight:800, marginBottom:8, color:'var(--text)' }}>Upgrade to Pro</h3>
              <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, maxWidth:340, margin:'0 auto' }}>
                You've reached your daily limit. Go Pro for unlimited reviews and faster payouts.
              </p>
            </div>

            <div className="upgrade-plan-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
              <div style={{ background:'#f8f9fc', border:'1.5px solid var(--border)', borderRadius:14, padding:'18px 14px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Free</div>
                {[`${DAILY_FREE_LIMIT} reviews / day`, `${format(MIN_EARN)}–${format(MAX_EARN)} each`, 'Standard payout'].map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>
                    <Icon.Check size={13} style={{ color:'var(--text-muted)', flexShrink:0 }}/>{f}
                  </div>
                ))}
              </div>
              <div style={{ background:'var(--brand-gradient-soft)', border:'1.5px solid var(--purple-mid)', borderRadius:14, padding:'18px 14px', position:'relative' }}>
                <div style={{ position:'absolute', top:-10, right:10, background:'var(--brand-gradient)', color:'#fff', fontSize:9, fontWeight:800, padding:'3px 9px', borderRadius:20 }}>POPULAR</div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--purple)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Pro · {format(PRO_PRICE_KES)}/mo</div>
                {['Unlimited reviews', 'International brands (Google, Meta, Apple...)', `${format(MIN_EARN)}–${format(MAX_EARN)} each`, 'Priority payout'].map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:'var(--text)', marginBottom:8 }}>
                    <Icon.Check size={13} style={{ color:'var(--purple)', flexShrink:0 }}/>{f}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep('phone')} style={{ width:'100%', padding:14, background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'var(--shadow-glow-purple)', marginBottom:10 }}>
              <Icon.Zap size={16}/>Continue — Pay {format(PRO_PRICE_KES)}
            </button>
            <button onClick={onClose} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>Maybe later</button>
          </>
        )}

        {step === 'phone' && (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h3 style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>Confirm M-Pesa payment</h3>
              <button onClick={() => setStep('plans')} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}><Icon.ArrowLeft size={14}/></button>
            </div>
            <div style={{ background:'var(--purple-light)', border:'1.5px solid var(--purple-mid)', borderRadius:12, padding:'14px 16px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, color:'var(--text-secondary)' }}>Pro subscription (monthly)</span>
              <strong style={{ fontSize:18, color:'var(--purple)' }}>{format(PRO_PRICE_KES)}</strong>
            </div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>M-Pesa number</label>
            <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden', marginBottom:22 }}>
              <span style={{ padding:'0 14px', fontWeight:700, color:'var(--pink)', borderRight:'1.5px solid var(--border)', whiteSpace:'nowrap', fontSize:14, display:'flex', alignItems:'center' }}>+254</span>
              <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="712345678" type="tel" inputMode="numeric" style={{ border:'none', borderRadius:0, flex:1, color:'var(--text)' }}/>
            </div>
            <button onClick={startPayment} disabled={phone.length<9} style={{ width:'100%', padding:14, background: phone.length>=9 ? 'var(--brand-gradient)' : '#e2e8f0', color: phone.length>=9 ? '#fff' : 'var(--text-muted)', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor: phone.length>=9?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow: phone.length>=9 ? 'var(--shadow-glow-purple)' : 'none' }}>
              <Icon.Smartphone size={16}/>Send STK Push — {format(PRO_PRICE_KES)}
            </button>
            <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:12 }}>Powered by PayHero · Secure M-Pesa STK Push</p>
          </>
        )}

        {step === 'paying' && (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div className="spinner" style={{ margin:'0 auto 22px' }}/>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'var(--text)' }}>Check your phone</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>
              An M-Pesa prompt was sent to <strong style={{ color:'var(--text)' }}>+254 {phone}</strong><br/>
              Enter your PIN to complete the upgrade.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ width:68, height:68, borderRadius:20, background:'#f0fdf4', border:'1.5px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <Icon.CheckCircle size={34} style={{ color:'var(--green)' }}/>
            </div>
            <h3 style={{ fontSize:21, fontWeight:800, color:'var(--green)', marginBottom:8 }}>You're now Pro!</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:24, lineHeight:1.6 }}>
              {format(PRO_PRICE_KES)} received. Unlimited daily reviews unlocked.
            </p>
            <button onClick={() => { onSuccess(); }} style={{ padding:'12px 32px', background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow-glow-pink)' }}>
              Continue reviewing
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ width:68, height:68, borderRadius:20, background:'#fff5f5', border:'1.5px solid #fed7d7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <Icon.XCircle size={34} style={{ color:'#e53e3e' }}/>
            </div>
            <h3 style={{ fontSize:21, fontWeight:800, color:'#e53e3e', marginBottom:8 }}>Payment not completed</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:24, lineHeight:1.6 }}>
              We didn't receive your M-Pesa payment. You have not been charged and your account remains on the Free plan.
            </p>
            <button onClick={() => setStep('phone')} style={{ width:'100%', padding:13, background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
              Try again
            </button>
            <button onClick={onClose} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
