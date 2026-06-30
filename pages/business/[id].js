import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import AuthModal from '../../components/AuthModal';
import UpgradeModal from '../../components/UpgradeModal';
import { useUser } from '../../lib/useUser';
import { useToast } from '../../lib/useToast';
import Icon from '../../lib/icons';
import { getBizById, logoUrl, EARN_RATES } from '../../data/businesses';
import { PUBLISH_FEE_KES } from '../../lib/config';
import { recordFee, FEE_TYPES } from '../../lib/feeLedger';

const RATING_CATEGORIES = {
  Telecom:      [['Network Coverage','Smartphone'],['Customer Service','User'],['Pricing','DollarSign'],['App Experience','Star']],
  Banking:      [['Service Speed','Clock'],['Staff Friendliness','User'],['App & Online Banking','Smartphone'],['Fees & Charges','DollarSign']],
  Supermarket:  [['Product Variety','Grid'],['Pricing','DollarSign'],['Store Cleanliness','Sparkles'],['Checkout Speed','Clock']],
  Insurance:    [['Claims Process','Send'],['Customer Support','User'],['Pricing','DollarSign'],['Coverage Options','Shield']],
  Fuel:         [['Fuel Quality','Zap'],['Staff Service','User'],['Pricing','DollarSign'],['Cleanliness','Sparkles']],
  Healthcare:   [['Care Quality','Award'],['Wait Times','Clock'],['Staff Friendliness','User'],['Pricing','DollarSign']],
  Hospitality:  [['Food Quality','Star'],['Service','User'],['Ambience','Sparkles'],['Value for Money','DollarSign']],
  Transport:    [['Reliability','Clock'],['Driver Behaviour','User'],['Pricing','DollarSign'],['Safety','Shield']],
  'E-Commerce': [['Delivery Speed','Send'],['Product Quality','Star'],['Customer Support','User'],['Pricing','DollarSign']],
  Government:   [['Service Speed','Clock'],['Staff Helpfulness','User'],['Digital Experience','Smartphone'],['Transparency','Eye']],
  Education:    [['Teaching Quality','Award'],['Facilities','Building'],['Value for Money','DollarSign'],['Support Services','User']],
  'Real Estate':[['Professionalism','User'],['Market Knowledge','Eye'],['Communication','Send'],['Fees','DollarSign']],
};

function StarRow({ value, onChange, size = 20 }) {
  const [hov, setHov] = useState(0);
  const active = hov || value;
  return (
    <div style={{ display:'flex', gap:5 }}>
      {[1,2,3,4,5].map(i => {
        const lit = i <= active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(0)}
            aria-label={`Rate ${i} star${i>1?'s':''}`}
            style={{
              width: size + 16,
              height: size + 16,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius: 10,
              border: lit ? '1.5px solid #fde68a' : '1.5px solid var(--border-strong)',
              background: lit ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8f9fc',
              cursor:'pointer',
              transition:'all .15s cubic-bezier(.4,0,.2,1)',
              transform: lit ? 'scale(1.06)' : 'scale(1)',
              boxShadow: lit ? '0 2px 8px rgba(245,158,11,0.25)' : 'none',
              padding: 0,
            }}>
            <Icon.Star size={size} filled={lit} style={{ color: lit ? '#F59E0B' : '#c4c4d0' }}/>
          </button>
        );
      })}
    </div>
  );
}

function generateReviews(bizId, category) {
  const names = ['Wanjiru M.','Otieno K.','Achieng N.','Kamau J.','Njeri P.','Mwangi T.'];
  const texts = [
    'Service is generally reliable but customer support can be slow to respond during peak hours.',
    'Great experience overall. The digital services have improved significantly this year.',
    'Prices are competitive but consistency needs work across different branches.',
    'The mobile app is excellent. Saves me so much time compared to visiting in person.',
    'Staff are very professional and resolved my issue quickly. Would recommend.',
    'Good value for money. The service quality has been consistent with no major complaints.',
  ];
  const seed = bizId.charCodeAt(0);
  return names.map((name,i) => ({
    id:i, name, rating: 1+((seed+i*7)%5),
    text: texts[(seed+i*3)%texts.length],
    date: ['2 hours ago','1 day ago','3 days ago','1 week ago','2 weeks ago','1 month ago'][i],
    earned: EARN_RATES[1+((seed+i*7)%5)],
    helpful: (seed+i*13)%40,
  }));
}

export default function BusinessPage() {
  const router = useRouter();
  const { id } = router.query;
  const biz = id ? getBizById(id) : null;

  const { user, balance, login, addEarning, getRemainingTasks, consumeTask, upgradePro } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen]     = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [stage, setStage]           = useState('detail'); // detail | rating | submitted
  const [catRatings, setCatRatings] = useState({});
  const [reviewText, setReviewText] = useState('');
  const [logoOk, setLogoOk]         = useState(true);
  const [coverImg, setCoverImg]     = useState(true);
  const [reviews, setReviews]       = useState([]);
  const [payStep, setPayStep]       = useState(null); // null | confirm | pending | success
  const [payPhone, setPayPhone]     = useState('');

  useEffect(() => {
    if (!biz) return;
    setReviews(generateReviews(biz.id, biz.category));
    if (user) setPayPhone((user.phone||'').replace(/^0/,''));
  }, [biz?.id, user]);

  if (!biz) return null;

  const categories = RATING_CATEGORIES[biz.category] || RATING_CATEGORIES.Banking;
  const catKeys = categories.map(c => c[0]);
  const allRated = catKeys.every(k => catRatings[k] > 0);
  const avgRating = catKeys.length ? Math.round(catKeys.reduce((s,k) => s + (catRatings[k]||0), 0) / catKeys.length) : 0;
  const earn = EARN_RATES[avgRating || 3] || 25;

  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length-1);
  const reviewCount = 200 + (seed*37) % 4600;
  const baseRating = (2.8 + ((seed*13)%22)/10).toFixed(1);

  function startReview() {
    if (!user) { setAuthOpen(true); return; }
    setStage('rating');
  }

  function setCatRating(key, val) {
    setCatRatings(prev => ({ ...prev, [key]: val }));
  }

  function handleContinue() {
    if (!allRated) { toast('Please rate every category', 'error'); return; }
    if (PUBLISH_FEE_KES <= 0) {
      // Free to publish — credit immediately, no STK push needed
      addEarning(earn, `Review: ${biz.name}`);
      setReviews(prev => [{ id:Date.now(), name:user.name, rating:avgRating, text:reviewText, date:'Just now', earned:earn, helpful:0 }, ...prev]);
      setStage('submitted');
      return;
    }
    // Open payment confirmation — written review optional, payment is required to publish
    setPayPhone((user.phone||'').replace(/^0/,''));
    setPayStep('confirm');
  }

  async function handlePay() {
    if (payPhone.length < 9) { toast('Enter your Safaricom number','error'); return; }
    const ok = consumeTask();
    if (!ok) { setPayStep(null); setUpgradeOpen(true); return; }
    setPayStep('pending');

    const reference = `RKE-VERIFY-${Date.now()}`;
    try {
      const res = await fetch('/api/pay', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone:'0'+payPhone, amount:PUBLISH_FEE_KES, name:user.name, reference }),
      });
      const data = await res.json();

      if (!data.success) {
        // STK push was rejected or failed outright — stop here, do not pay out
        setPayStep('failed');
        return;
      }

      // STK push was accepted by PayHero and is now pending on the user's phone.
      // Poll for the actual payment confirmation instead of assuming success.
      pollPaymentStatus(data.reference);
    } catch (err) {
      setPayStep('failed');
    }
  }

  async function pollPaymentStatus(reference, attempt = 0) {
    const MAX_ATTEMPTS = 15; // ~45s of polling at 3s intervals
    if (attempt >= MAX_ATTEMPTS) {
      setPayStep('failed');
      toast('Payment timed out. Please try again.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/pay-status?reference=${reference}`);
      const data = await res.json();

      if (data.status === 'SUCCESS') {
        addEarning(earn, `Review: ${biz.name}`);
        if (PUBLISH_FEE_KES > 0) {
          recordFee({
            type: FEE_TYPES.PUBLISH,
            amount: PUBLISH_FEE_KES,
            userName: user.name,
            userPhone: user.phone,
            businessName: biz.name,
            reference,
          });
        }
        setReviews(prev => [{ id:Date.now(), name:user.name, rating:avgRating, text:reviewText, date:'Just now', earned:earn, helpful:0 }, ...prev]);
        setPayStep('success');
        return;
      }
      if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        setPayStep('failed');
        toast('M-Pesa payment was not completed.', 'error');
        return;
      }
      // Still QUEUED/PENDING — check again shortly
      setTimeout(() => pollPaymentStatus(reference, attempt + 1), 3000);
    } catch {
      setTimeout(() => pollPaymentStatus(reference, attempt + 1), 3000);
    }
  }

  function finishFlow() {
    setPayStep(null);
    setStage('submitted');
  }

  function resetForAnother() {
    setStage('detail');
    setCatRatings({});
    setReviewText('');
  }

  return (
    <>
      <Head><title>{biz.name} — ReviewKE</title></Head>
      <Navbar user={user} onAuthClick={()=>setAuthOpen(true)} balance={balance}/>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .biz-page-wrap { max-width:680px; margin:0 auto; padding:24px 20px 100px; }
        @media(max-width:480px){ .biz-page-wrap{ padding:16px 14px 90px !important; } }
      `}</style>

      {/* Top bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={() => stage==='detail' ? router.back() : setStage('detail')} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer' }}>
          <Icon.ArrowLeft size={18} style={{ color:'var(--text-secondary)' }}/>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{biz.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)' }}>
              <Icon.MapPin size={11} style={{ color:'var(--pink)' }}/>{biz.address.split(',').slice(-2).join(',').trim()}
            </div>
          </div>
        </button>
        {avgRating > 0 && stage !== 'detail' && (
          <div style={{ background:'var(--pink-light)', color:'var(--pink)', fontWeight:800, fontSize:14, padding:'6px 14px', borderRadius:20 }}>
            +KES {earn}.00
          </div>
        )}
      </div>

      <div className="biz-page-wrap">
        {/* ── STAGE 1: DETAIL ── */}
        {stage === 'detail' && (
          <div className="fade-up" style={{ background:'#fff', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ height:260, position:'relative', overflow:'hidden', background:`linear-gradient(135deg, ${biz.color}25, ${biz.color}08)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${biz.color}20 1.5px, transparent 1.5px)`, backgroundSize:'24px 24px' }}/>
              {logoOk ? (
                <img src={logoUrl(biz, 256)} alt={biz.name} onError={()=>setLogoOk(false)}
                  style={{ width:120, height:120, objectFit:'contain', position:'relative', zIndex:1, borderRadius:24, background:'#fff', padding:20, boxShadow:'var(--shadow-md)' }}/>
              ) : (
                <div style={{ width:120, height:120, borderRadius:24, background:`linear-gradient(135deg,${biz.color},${biz.color}90)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:46, fontWeight:900, color:'#fff', position:'relative', zIndex:1, boxShadow:'var(--shadow-md)' }}>
                  {biz.initial}
                </div>
              )}
              {biz.verified && (
                <div style={{ position:'absolute', top:16, right:16, display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, color:'var(--green)', zIndex:1 }}>
                  <Icon.CheckCircle size={12}/>Verified
                </div>
              )}
            </div>

            <div style={{ padding:'28px 28px 32px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6, gap:12 }}>
                <h1 style={{ fontSize:24, fontWeight:800 }}>{biz.name} <span style={{ fontSize:14, fontWeight:500, color:'var(--text-muted)' }}>KE</span></h1>
                <span style={{ background:'var(--pink-light)', color:'var(--pink)', fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:20, whiteSpace:'nowrap' }}>{biz.category}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:18 }}>
                <Icon.MapPin size={13} style={{ color:'var(--pink)' }}/>
                <span style={{ fontSize:14, color:'var(--text-secondary)' }}>{biz.address}</span>
              </div>
              <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:24 }}>{biz.description}</p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                <div style={{ background:'#f8f9fc', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>Avg. rating</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Icon.Star size={16} filled style={{ color:'#F59E0B' }}/>
                    <span style={{ fontSize:17, fontWeight:800 }}>{baseRating} <span style={{ fontWeight:500, fontSize:13, color:'var(--text-muted)' }}>({reviewCount.toLocaleString()})</span></span>
                  </div>
                </div>
                <div style={{ background:'#f8f9fc', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>Earn per review</div>
                  <div style={{ fontSize:17, fontWeight:800, color:'var(--green)' }}>KES 15–35</div>
                </div>
              </div>

              {/* Earn-by-stars strip */}
              <div style={{ display:'flex', gap:6, marginBottom:20 }}>
                {[1,2,3,4,5].map(s => (
                  <div key={s} style={{ flex:1, textAlign:'center', background: s===5 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8f9fc', border: s===5 ? '1.5px solid #fde68a' : '1px solid var(--border)', borderRadius:10, padding:'8px 4px' }}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>{s}★</div>
                    <div style={{ fontSize:12, fontWeight:800, color: s===5 ? '#D97706' : 'var(--text-secondary)' }}>{EARN_RATES[s]}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, marginBottom:22 }}>
                You'll rate {biz.name} on {categories.length} categories, then write an optional review. Submitting earns you up to KES {EARN_RATES[5]}.00.
              </p>

              <button onClick={startReview} style={{ width:'100%', padding:16, background:'linear-gradient(135deg,var(--pink),var(--pink-bright))', color:'#fff', border:'none', borderRadius:14, fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 24px rgba(192,24,95,0.32)', transition:'transform .15s' }}>
                Start Review <Icon.ArrowRight size={17}/>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: RATING ── */}
        {stage === 'rating' && (
          <div className="fade-up" style={{ background:'#fff', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
            {/* Header band */}
            <div style={{ padding:'26px 28px 22px', background:'linear-gradient(135deg, var(--pink-light) 0%, #fff 100%)', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <h2 style={{ fontSize:21, fontWeight:800, marginBottom:4 }}>Rate Your Experience</h2>
                  <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Rate {biz.name} on each category below</p>
                </div>
                {avgRating > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid var(--pink-mid)', borderRadius:14, padding:'8px 16px', boxShadow:'var(--shadow)' }}>
                    <Icon.TrendingUp size={15} style={{ color:'var(--pink)' }}/>
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>You'll earn</span>
                    <span style={{ fontSize:18, fontWeight:800, color:'var(--pink)' }}>KES {earn}</span>
                  </div>
                )}
              </div>
              {/* Progress dots */}
              <div style={{ display:'flex', gap:6, marginTop:18 }}>
                {catKeys.map(k => (
                  <div key={k} style={{ flex:1, height:5, borderRadius:3, background: catRatings[k] ? 'var(--pink)' : 'var(--border-strong)', transition:'background .2s' }}/>
                ))}
              </div>
            </div>

            <div style={{ padding:'8px 28px 28px' }}>
              {categories.map(([label, iconName], i) => {
                const IC = Icon[iconName] || Icon.Star;
                const rated = catRatings[label] > 0;
                return (
                  <div key={label} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'18px 4px', borderBottom: i<categories.length-1 ? '1px solid var(--border)' : 'none',
                    flexWrap:'wrap', gap:14,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                      <div style={{
                        width:42, height:42, borderRadius:12, flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background: rated ? 'linear-gradient(135deg,var(--pink),var(--pink-bright))' : 'var(--pink-light)',
                        transition:'all .2s',
                        boxShadow: rated ? '0 3px 10px rgba(192,24,95,0.3)' : 'none',
                      }}>
                        <IC size={18} style={{ color: rated ? '#fff' : 'var(--pink)' }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{label}</div>
                        {rated && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{['','Poor','Fair','Good','Very good','Excellent'][catRatings[label]]}</div>}
                      </div>
                    </div>
                    <StarRow value={catRatings[label]||0} onChange={v => setCatRating(label,v)}/>
                  </div>
                );
              })}

              {/* Optional review text */}
              <div style={{ marginTop:24, marginBottom:22 }}>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.4px' }}>
                  <Icon.Sparkles size={13} style={{ color:'var(--pink)' }}/>
                  Written review <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  value={reviewText}
                  onChange={e=>setReviewText(e.target.value)}
                  rows={3}
                  placeholder="Share more about your experience..."
                  style={{
                    background:'#f8f9fc',
                    border:'1.5px solid var(--border-strong)',
                    color:'var(--text)',
                    resize:'none',
                  }}
                />
              </div>

              <button onClick={handleContinue} disabled={!allRated} style={{
                width:'100%', padding:16,
                background: allRated ? 'linear-gradient(135deg,var(--pink),var(--pink-bright))' : '#eceef3',
                color: allRated ? '#fff' : 'var(--text-muted)',
                border:'none', borderRadius:14, fontSize:16, fontWeight:700,
                cursor: allRated?'pointer':'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow: allRated ? '0 8px 24px rgba(192,24,95,0.32)' : 'none',
                transition:'all .2s',
              }}>
                {allRated ? `Continue — Earn KES ${earn}` : `Rate all ${categories.length} categories to continue`}
                <Icon.ArrowRight size={17}/>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: SUBMITTED ── */}
        {stage === 'submitted' && (
          <div className="fade-up" style={{ background:'#fff', borderRadius:24, border:'1px solid var(--border)', padding:'44px 32px', boxShadow:'var(--shadow-lg)', textAlign:'center' }}>
            <div style={{ width:76, height:76, borderRadius:20, background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px', boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>
              <Icon.Check size={36} style={{ color:'#fff' }}/>
            </div>
            <h3 style={{ fontSize:23, fontWeight:800, marginBottom:10 }}>Review Submitted!</h3>
            <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:6 }}>
              <strong style={{ color:'var(--pink)' }}>+KES {earn}.00</strong> has been added to your balance.
            </p>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:32 }}>
              {(reviews.filter(r=>r.name===user?.name).length)} reviews · KES {balance.toLocaleString()} available to withdraw
            </p>
            <button onClick={resetForAnother} style={{ width:'100%', padding:15, background:'var(--pink)', color:'#fff', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10, boxShadow:'0 6px 20px rgba(192,24,95,0.3)' }}>
              Continue to Next Review <Icon.ArrowRight size={16}/>
            </button>
            <button onClick={() => router.push('/wallet')} style={{ width:'100%', padding:15, background:'#fff', color:'var(--pink)', border:'1.5px solid var(--pink-mid)', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:14 }}>
              Withdraw Earnings
            </button>
            <button onClick={() => router.push('/businesses')} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, fontWeight:500, cursor:'pointer' }}>
              Browse Businesses
            </button>
          </div>
        )}

        {/* ── REVIEWS LIST (always visible at detail stage) ── */}
        {stage === 'detail' && (
          <div style={{ marginTop:32 }}>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>Recent reviews</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {reviews.slice(0,4).map(r => {
                const colors = ['#C0185F','#7C3AED','#059669','#D97706','#1D4ED8','#DC2626'];
                const c = colors[r.id % colors.length];
                const init = r.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
                return (
                  <div key={r.id} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:18, boxShadow:'var(--shadow-sm)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>{init}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{r.name}</div>
                          <div style={{ display:'flex', gap:2, marginTop:2 }}>
                            {[1,2,3,4,5].map(i => <Icon.Star key={i} size={10} filled={i<=r.rating} style={{ color: i<=r.rating?'#F59E0B':'#e2e8f0' }}/>)}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{r.date}</span>
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{r.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── PAYMENT CONFIRMATION MODAL ── */}
      {payStep && (
        <div style={{ position:'fixed', inset:0, zIndex:700, background:'rgba(20,20,31,0.5)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, padding:'12px 24px env(safe-area-inset-bottom,32px)', width:'100%', maxWidth:460, boxShadow:'var(--shadow-lg)', animation:'fadeUp .3s ease' }}>
            <div style={{ width:36, height:4, background:'var(--border-strong)', borderRadius:2, margin:'0 auto 20px' }}/>

            {payStep === 'confirm' && (
              <>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ width:60, height:60, borderRadius:16, background:'var(--pink-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <Icon.Shield size={26} style={{ color:'var(--pink)' }}/>
                  </div>
                  <h3 style={{ fontSize:19, fontWeight:800, marginBottom:8 }}>Verify your phone number</h3>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, maxWidth:320, margin:'0 auto' }}>
                    To prevent fake reviews, we confirm a small KES {PUBLISH_FEE_KES} charge via M-Pesa before publishing. You'll then earn <strong style={{ color:'var(--pink)' }}>KES {earn}.00</strong>.
                  </p>
                </div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:8 }}>M-Pesa number</label>
                <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden', marginBottom:20 }}>
                  <span style={{ padding:'0 14px', fontWeight:700, color:'var(--pink)', borderRight:'1.5px solid var(--border)', whiteSpace:'nowrap', fontSize:14, display:'flex', alignItems:'center' }}>+254</span>
                  <input value={payPhone} onChange={e=>setPayPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="712345678" type="tel" inputMode="numeric" style={{ border:'none', borderRadius:0, flex:1 }}/>
                </div>
                <button onClick={handlePay} style={{ width:'100%', padding:14, background:'var(--pink)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(192,24,95,0.3)', marginBottom:10 }}>
                  <Icon.Smartphone size={16}/>Pay KES {PUBLISH_FEE_KES} & Publish
                </button>
                <button onClick={() => setPayStep(null)} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>Cancel</button>
              </>
            )}

            {payStep === 'pending' && (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div className="spinner" style={{ margin:'0 auto 22px' }}/>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Waiting for M-Pesa...</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Enter your PIN on +254 {payPhone}</p>
              </div>
            )}

            {payStep === 'success' && (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ width:64, height:64, borderRadius:18, background:'#f0fdf4', border:'1.5px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Icon.CheckCircle size={32} style={{ color:'var(--green)' }}/>
                </div>
                <h3 style={{ fontSize:19, fontWeight:800, color:'var(--green)', marginBottom:8 }}>Verified!</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:22 }}>Publishing your review now...</p>
                <button onClick={finishFlow} style={{ padding:'11px 30px', background:'var(--pink)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>Continue</button>
              </div>
            )}

            {payStep === 'failed' && (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ width:64, height:64, borderRadius:18, background:'#fff5f5', border:'1.5px solid #fed7d7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Icon.XCircle size={32} style={{ color:'#e53e3e' }}/>
                </div>
                <h3 style={{ fontSize:19, fontWeight:800, color:'#e53e3e', marginBottom:8 }}>Payment not completed</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:22, lineHeight:1.6 }}>
                  We didn't receive your M-Pesa confirmation. Your review was not published and no earnings were added.
                </p>
                <button onClick={() => setPayStep('confirm')} style={{ width:'100%', padding:13, background:'var(--pink)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:10 }}>Try again</button>
                <button onClick={() => setPayStep(null)} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeOpen && <UpgradeModal user={user} onClose={()=>setUpgradeOpen(false)} onSuccess={() => { upgradePro(); setUpgradeOpen(false); toast('Pro plan activated!','success'); }}/>}
      {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuth={u=>{login(u);toast(`Welcome, ${u.name.split(' ')[0]}!`,'success');setStage('rating');}}/>}
      <Toast/>
    </>
  );
}
