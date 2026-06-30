import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import AuthModal from '../../components/AuthModal';
import UpgradeModal from '../../components/UpgradeModal';
import { useUser } from '../../lib/UserContext';
import { normalizePhone, isValidPhone } from '../../lib/useUser';
import { useToast } from '../../lib/useToast';
import { useCelebration } from '../../components/Celebration';
import Icon from '../../lib/icons';
import { getBizById, logoUrl, photoUrl, EARN_RATES } from '../../data/businesses';
import { useCurrency } from '../../lib/CurrencyContext';

const MIN_EARN = Math.min(...Object.values(EARN_RATES));
const MAX_EARN = Math.max(...Object.values(EARN_RATES));
import { PUBLISH_FEE_KES, SHARE_TARGET_COUNT } from '../../lib/config';
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

// Large, thumb-friendly single star picker — the one required action on
// the rating screen. Bigger tap targets than StarRow since this is meant
// to be the fast, obvious, can't-miss-it control.
function BigStarRow({ value, onChange }) {
  const [hov, setHov] = useState(0);
  const active = hov || value;
  return (
    <div style={{ display:'flex', gap:8 }}>
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
              width:52, height:52,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:14,
              border: lit ? '2px solid #fde68a' : '2px solid var(--border-strong)',
              background: lit ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8f9fc',
              cursor:'pointer',
              transition:'all .15s cubic-bezier(.4,0,.2,1)',
              transform: lit ? 'scale(1.08)' : 'scale(1)',
              boxShadow: lit ? '0 4px 14px rgba(245,158,11,0.3)' : 'none',
              padding:0,
            }}>
            <Icon.Star size={26} filled={lit} style={{ color: lit ? '#F59E0B' : '#c4c4d0' }}/>
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

  const { user, balance, login, addEarning, getRemainingTasks, consumeTask, upgradePro, hasReviewed, markReviewed } = useUser();
  const { toast, Toast } = useToast();
  const { celebrate, Celebration } = useCelebration();
  const { format } = useCurrency();
  const [authOpen, setAuthOpen]     = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [stage, setStage]           = useState('detail'); // detail | rating | submitted
  const [overallRating, setOverallRating] = useState(0); // the one rating that's actually required
  const [catRatings, setCatRatings] = useState({}); // optional per-category detail, shown in a collapsible section
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [logoOk, setLogoOk]         = useState(true);
  const [photoOk, setPhotoOk]       = useState(true);
  const [coverImg, setCoverImg]     = useState(true);
  const [reviews, setReviews]       = useState([]);
  const [payStep, setPayStep]       = useState(null); // null | confirm | pending | success | share
  const [payPhone, setPayPhone]     = useState('');
  const [sharedCount, setSharedCount] = useState(0);
  // Per-slot status: 'idle' | 'waiting' | 'done'. A slot only becomes
  // 'done' after the user has actually left the tab (gone to WhatsApp)
  // AND been away for a minimum dwell time AND returned — not on click
  // alone. This stops the old behaviour where people tapped all 10 tiles
  // and bounced straight back without sharing anything.
  const [shareSlots, setShareSlots] = useState({});
  const activeSlotRef = useRef(null);
  const leftAtRef = useRef(null);

  const isPro = user?.plan === 'pro';
  // A user's chosen region at signup is always free for them — no Pro
  // gate, regardless of which region that is. Only the OTHER region (the
  // one they didn't pick) requires Pro to access.
  const homeRegion = user?.reviewPreference || 'local';
  const isGated = biz && biz.region !== homeRegion && !isPro;

  useEffect(() => {
    if (!biz) return;
    setReviews(generateReviews(biz.id, biz.category));
    if (user) setPayPhone(user.phone || '');
  }, [biz?.id, user]);

  // ── Share-to-unlock: free alternative to the M-Pesa verification fee ──
  // The user shares their review link to SHARE_TARGET_COUNT WhatsApp
  // groups/contacts instead of paying. We can't detect whether a message
  // was actually sent inside WhatsApp (no API access to that), so each
  // tile click opens the real WhatsApp share sheet for that slot and
  // marks it complete once the user returns to the tab — this is an
  // honest "I opened share #N" tracker, not a guarantee the message sent.
  const reviewShareUrl = biz ? `${typeof window !== 'undefined' ? window.location.origin : ''}/business/${biz.id}` : '';
  const shareMessage = biz ? `I just reviewed ${biz.name} on ReviewKE! Check it out and earn KES for your own reviews: ${reviewShareUrl}` : '';

  const MIN_AWAY_MS = 8000; // must be away from the tab for at least 8s — long enough to actually pick a chat and send, short enough not to be annoying

  // Detect the user coming back to this tab after we sent them to WhatsApp.
  // Only counts the share complete if they were away long enough.
  // IMPORTANT: this hook (and every hook above/below it) must run on every
  // render regardless of whether `biz` exists or the business is Pro-gated.
  // The two early returns that used to sit between hooks have been moved
  // below this point — conditionally skipping hooks between renders is
  // what throws React error #310 ("rendered fewer hooks than expected").
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState !== 'visible') return; // only care about returning
      const slot = activeSlotRef.current;
      const leftAt = leftAtRef.current;
      if (slot === null || leftAt === null) return;

      const awayMs = Date.now() - leftAt;
      activeSlotRef.current = null;
      leftAtRef.current = null;

      if (awayMs < MIN_AWAY_MS) {
        // Came back too fast — almost certainly didn't actually share.
        setShareSlots(prev => ({ ...prev, [slot]: 'idle' }));
        toast("That was quick — make sure you actually send the message in WhatsApp before coming back.", 'error');
        return;
      }

      setShareSlots(prev => {
        const updated = { ...prev, [slot]: 'done' };
        const doneCount = Object.values(updated).filter(s => s === 'done').length;
        setSharedCount(doneCount);
        if (doneCount === SHARE_TARGET_COUNT) {
          toast('All shares verified — you can publish for free!', 'success');
        }
        return updated;
      });
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ── All hooks have now run. Early returns are safe from this point on. ──

  if (!biz) return null;

  // International businesses are Pro-only. A non-Pro user who lands here
  // via a direct link sees an upgrade prompt instead of the review flow.
  if (isGated) {
    return (
      <>
        <Head><title>{biz.name} — Pro members only — ReviewKE</title></Head>
        <Navbar user={user} onAuthClick={()=>setAuthOpen(true)} balance={balance}/>
        <main style={{ maxWidth:480, margin:'60px auto', padding:'0 20px 80px', textAlign:'center' }}>
          <div className="glass-card" style={{ borderRadius:24, padding:'40px 28px' }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:'var(--shadow-glow-purple)' }}>
              <Icon.Globe size={28} style={{ color:'#fff' }}/>
            </div>
            <h1 style={{ fontSize:21, fontWeight:800, marginBottom:8, color:'var(--text)' }}>{biz.name} is a Pro review job</h1>
            <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24 }}>
              {biz.region === 'international' ? 'International' : 'Local Kenyan'} brands like {biz.name} are outside your chosen review category. Upgrade to Pro to unlock both local and international jobs, plus unlimited daily reviews.
            </p>
            <button onClick={() => { if (!user) { setAuthOpen(true); return; } setUpgradeOpen(true); }} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow-glow-purple)', marginBottom:12 }}>
              <Icon.Zap size={16}/>{user ? 'Upgrade to Pro' : 'Sign in to continue'}
            </button>
            <div>
              <button onClick={() => router.push('/businesses')} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer' }}>Back to local businesses</button>
            </div>
          </div>
        </main>
        {upgradeOpen && user && <UpgradeModal user={user} onClose={()=>setUpgradeOpen(false)} onSuccess={() => { upgradePro(); setUpgradeOpen(false); toast('Pro plan activated! Reloading...','success'); setTimeout(()=>router.reload(), 800); }}/>}
        {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuth={u=>{login(u);toast(`Welcome, ${u.name.split(' ')[0]}!`,'success');}}/>}
        <Toast/>
      </>
    );
  }

  const categories = RATING_CATEGORIES[biz.category] || RATING_CATEGORIES.Banking;
  const catKeys = categories.map(c => c[0]);
  // Only the overall star rating is required to submit — this is the
  // single biggest change for reducing scroll and friction. The 4
  // per-category ratings are optional extra detail in a collapsible
  // section; if the user fills any in, they nudge the average slightly,
  // but the overall rating alone is enough to publish and get paid.
  const allRated = overallRating > 0;
  const ratedCatKeys = catKeys.filter(k => catRatings[k] > 0);
  const avgRating = ratedCatKeys.length
    ? Math.round((overallRating + ratedCatKeys.reduce((s,k) => s + catRatings[k], 0)) / (1 + ratedCatKeys.length))
    : overallRating;
  const earn = EARN_RATES[avgRating || 3] || 25;

  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length-1);
  const reviewCount = 200 + (seed*37) % 4600;
  const baseRating = (2.8 + ((seed*13)%22)/10).toFixed(1);

  function startReview() {
    if (!user) { setAuthOpen(true); return; }
    if (hasReviewed(biz.id)) { toast('You already reviewed this business', 'error'); return; }
    if (getRemainingTasks() <= 0) { setUpgradeOpen(true); return; }
    setStage('rating');
  }

  function setCatRating(key, val) {
    setCatRatings(prev => ({ ...prev, [key]: val }));
  }

  function handleContinue() {
    if (hasReviewed(biz.id)) { toast('You already reviewed this business', 'error'); return; }
    if (!allRated) { toast('Please rate every category', 'error'); return; }
    if (PUBLISH_FEE_KES <= 0) {
      // Free to publish — credit immediately, no STK push needed.
      // Still counts toward the daily limit, same as every other path.
      if (getRemainingTasks() <= 0) { setUpgradeOpen(true); return; }
      consumeTask();
      addEarning(earn, `Review: ${biz.name}`);
      markReviewed(biz.id);
      celebrate(earn, `Your review for ${biz.name} is live`);
      setReviews(prev => [{ id:Date.now(), name:user.name, rating:avgRating, text:reviewText, date:'Just now', earned:earn, helpful:0 }, ...prev]);
      setStage('submitted');
      return;
    }
    // Open payment confirmation — written review optional, payment is required to publish
    setPayPhone(user.phone || '');
    setPayStep('confirm');
  }

  function openWhatsAppShare(slotIndex) {
    if (shareSlots[slotIndex] === 'done' || shareSlots[slotIndex] === 'waiting') return; // already used or in progress
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    activeSlotRef.current = slotIndex;
    leftAtRef.current = Date.now();
    setShareSlots(prev => ({ ...prev, [slotIndex]: 'waiting' }));
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function handlePublishViaShare() {
    if (sharedCount < SHARE_TARGET_COUNT) return;
    if (getRemainingTasks() <= 0) { setUpgradeOpen(true); return; }
    consumeTask();
    addEarning(earn, `Review: ${biz.name}`);
    markReviewed(biz.id);
    celebrate(earn, `Your review for ${biz.name} is live`);
    setReviews(prev => [{ id:Date.now(), name:user.name, rating:avgRating, text:reviewText, date:'Just now', earned:earn, helpful:0 }, ...prev]);
    setPayStep(null);
    setStage('submitted');
    setSharedCount(0);
    setShareSlots({});
  }

  async function handlePay() {
    if (!isValidPhone(payPhone)) { toast('Enter a valid M-Pesa number','error'); return; }
    if (getRemainingTasks() <= 0) { setPayStep(null); setUpgradeOpen(true); return; }
    setPayStep('pending');

    const reference = `RKE-VERIFY-${Date.now()}`;
    try {
      const res = await fetch('/api/pay', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone:normalizePhone(payPhone), amount:PUBLISH_FEE_KES, name:user.name, reference }),
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
        consumeTask();
        addEarning(earn, `Review: ${biz.name}`);
        markReviewed(biz.id);
        celebrate(earn, `Your review for ${biz.name} is live`);
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
    setOverallRating(0);
    setCatRatings({});
    setDetailsOpen(false);
    setReviewText('');
  }

  return (
    <>
      <Head><title>{biz.name} — ReviewKE</title></Head>
      <Navbar user={user} onAuthClick={()=>setAuthOpen(true)} balance={balance}/>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .biz-page-wrap { max-width:680px; margin:0 auto; padding:24px 20px 100px; }
        .rating-header-band { }
        .rating-body-pad { }
        .biz-detail-card-pad { padding: 28px 28px 32px; }
        .biz-stats-grid { }
        .share-tile-grid { grid-template-columns: repeat(5, 1fr); }
        @media(max-width:480px){
          .biz-page-wrap{ padding:16px 14px 90px !important; }
          .rating-header-band { padding: 20px 18px 16px !important; }
          .rating-body-pad { padding: 6px 18px 22px !important; }
          .biz-detail-card-pad { padding: 20px 18px 24px !important; }
        }
        @media(max-width:360px){
          .share-tile-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 6px !important; }
        }
        @media(max-width:600px){
          .top-bar-row { padding: 12px 14px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="top-bar-row" style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
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
            +{format(earn)}
          </div>
        )}
      </div>

      <div className="biz-page-wrap">
        {/* ── STAGE 1: DETAIL ── */}
        {stage === 'detail' && (
          <div className="fade-up" style={{ background:'#fff', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ height:200, position:'relative', overflow:'hidden', background: photoOk ? '#f1f5f9' : `linear-gradient(135deg, ${biz.color}25, ${biz.color}08)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {photoOk && (
                <img
                  src={photoUrl(biz, 1000)}
                  alt=""
                  onError={() => setPhotoOk(false)}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                />
              )}
              {!photoOk && <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${biz.color}20 1.5px, transparent 1.5px)`, backgroundSize:'24px 24px' }}/>}

              {photoOk ? (
                logoOk && (
                  <div style={{ position:'absolute', bottom:14, left:14, width:52, height:52, borderRadius:14, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-lg)', padding:8, zIndex:1 }}>
                    <img src={logoUrl(biz,128)} alt={biz.name} onError={()=>setLogoOk(false)} style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
                  </div>
                )
              ) : (
                logoOk ? (
                  <img src={logoUrl(biz, 256)} alt={biz.name} onError={()=>setLogoOk(false)}
                    style={{ width:96, height:96, objectFit:'contain', position:'relative', zIndex:1, borderRadius:22, background:'#fff', padding:16, boxShadow:'var(--shadow-md)' }}/>
                ) : (
                  <div style={{ width:96, height:96, borderRadius:22, background:`linear-gradient(135deg,${biz.color},${biz.color}90)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, fontWeight:900, color:'#fff', position:'relative', zIndex:1, boxShadow:'var(--shadow-md)' }}>
                    {biz.initial}
                  </div>
                )
              )}
              {biz.verified && (
                <div style={{ position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, color:'var(--green)', zIndex:1 }}>
                  <Icon.CheckCircle size={12}/>Verified
                </div>
              )}
            </div>

            <div className="biz-detail-card-pad" style={{ padding:'22px 24px 26px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6, gap:12 }}>
                <h1 style={{ fontSize:22, fontWeight:800 }}>{biz.name}</h1>
                <span style={{ background:'var(--pink-light)', color:'var(--pink)', fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:20, whiteSpace:'nowrap' }}>{biz.category}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
                <Icon.Star size={13} filled style={{ color:'#F59E0B' }}/>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{baseRating}</span>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>({reviewCount.toLocaleString()}) · {biz.address.split(',').slice(-1)[0].trim()}</span>
              </div>

              {/* Compact earn-by-stars strip — the only "how much" info needed before starting */}
              <div style={{ display:'flex', gap:6, marginBottom:20 }}>
                {[1,2,3,4,5].map(s => (
                  <div key={s} style={{ flex:1, textAlign:'center', background: s===5 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8f9fc', border: s===5 ? '1.5px solid #fde68a' : '1px solid var(--border)', borderRadius:10, padding:'7px 4px' }}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>{s}★</div>
                    <div style={{ fontSize:12, fontWeight:800, color: s===5 ? '#D97706' : 'var(--text-secondary)' }}>{EARN_RATES[s]}</div>
                  </div>
                ))}
              </div>

              {hasReviewed(biz.id) ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon.Check size={18} style={{ color:'#fff' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>You already reviewed {biz.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:1 }}>Each business can only be reviewed once per account</div>
                    </div>
                  </div>
                  <button disabled style={{ width:'100%', padding:16, background:'#eceef3', color:'var(--text-muted)', border:'none', borderRadius:14, fontSize:16, fontWeight:700, cursor:'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <Icon.Shield size={17}/> Review locked
                  </button>
                </>
              ) : (
                <button onClick={startReview} style={{ width:'100%', padding:16, background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:14, fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'var(--shadow-glow-purple)', transition:'transform .15s' }}>
                  Start Review <Icon.ArrowRight size={17}/>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STAGE 2: RATING ── */}
        {stage === 'rating' && (
          <div className="fade-up" style={{ background:'#fff', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
            {/* Header band */}
            <div className="rating-header-band" style={{ padding:'24px 28px 20px', background:'var(--brand-gradient-soft)', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
              <h2 style={{ fontSize:19, fontWeight:800, marginBottom:4 }}>Rate {biz.name}</h2>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Tap a star — that's it, you're done</p>
            </div>

            <div className="rating-body-pad" style={{ padding:'24px 28px 28px' }}>
              {/* The one required action: big overall star rating */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:22 }}>
                <BigStarRow value={overallRating} onChange={setOverallRating} />
                <div style={{ minHeight:22, marginTop:10 }}>
                  {overallRating > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid var(--pink-mid)', borderRadius:14, padding:'7px 16px', boxShadow:'var(--shadow)' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{['','Poor','Fair','Good','Very good','Excellent'][overallRating]}</span>
                      <span style={{ width:1, height:14, background:'var(--border)' }}/>
                      <Icon.TrendingUp size={14} style={{ color:'var(--pink)' }}/>
                      <span style={{ fontSize:15, fontWeight:800, color:'var(--pink)' }}>{format(earn)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary action — visible immediately, no scrolling needed */}
              <button onClick={handleContinue} disabled={!allRated} style={{
                width:'100%', padding:16,
                background: allRated ? 'var(--brand-gradient)' : '#eceef3',
                color: allRated ? '#fff' : 'var(--text-muted)',
                border:'none', borderRadius:14, fontSize:16, fontWeight:700,
                cursor: allRated?'pointer':'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow: allRated ? 'var(--shadow-glow-pink)' : 'none',
                transition:'all .2s', marginBottom:14,
              }}>
                {allRated ? `Submit — Earn ${format(earn)}` : 'Tap a star to continue'}
                <Icon.ArrowRight size={17}/>
              </button>

              {/* Optional detail — collapsed by default, never blocks submission */}
              <button
                onClick={() => setDetailsOpen(v => !v)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 14px', background:'#f8f9fc', border:'1px solid var(--border)',
                  borderRadius:12, cursor:'pointer', marginBottom: detailsOpen ? 14 : 0,
                }}
              >
                <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>
                  <Icon.Sparkles size={14} style={{ color:'var(--pink)' }}/>
                  Add detail <span style={{ fontWeight:400, color:'var(--text-muted)' }}>(optional, boosts payout)</span>
                </span>
                <Icon.ChevronDown size={16} style={{ color:'var(--text-muted)', transform: detailsOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}/>
              </button>

              {detailsOpen && (
                <div className="fade-up">
                  {categories.map(([label, iconName], i) => {
                    const IC = Icon[iconName] || Icon.Star;
                    const rated = catRatings[label] > 0;
                    return (
                      <div key={label} style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'14px 4px', borderBottom: i<categories.length-1 ? '1px solid var(--border)' : 'none',
                        flexWrap:'wrap', gap:10,
                      }}>
                        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                          <div style={{
                            width:34, height:34, borderRadius:10, flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background: rated ? 'linear-gradient(135deg,var(--pink),var(--pink-bright))' : 'var(--pink-light)',
                            transition:'all .2s',
                          }}>
                            <IC size={15} style={{ color: rated ? '#fff' : 'var(--pink)' }}/>
                          </div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text)' }}>{label}</div>
                        </div>
                        <StarRow value={catRatings[label]||0} onChange={v => setCatRating(label,v)} size={16}/>
                      </div>
                    );
                  })}

                  {/* Optional review text */}
                  <div style={{ marginTop:18 }}>
                    <textarea
                      value={reviewText}
                      onChange={e=>setReviewText(e.target.value)}
                      rows={2}
                      placeholder="Add a written review (optional)..."
                      style={{
                        background:'#f8f9fc',
                        border:'1.5px solid var(--border-strong)',
                        color:'var(--text)',
                        resize:'none',
                        fontSize:14,
                      }}
                    />
                  </div>
                </div>
              )}
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
              <strong style={{ color:'var(--pink)' }}>+{format(earn)}</strong> has been added to your balance.
            </p>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:32 }}>
              {(reviews.filter(r=>r.name===user?.name).length)} reviews · {format(balance)} available to withdraw
            </p>
            <button onClick={resetForAnother} style={{ width:'100%', padding:15, background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10, boxShadow:'var(--shadow-glow-pink)' }}>
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
                    To prevent fake reviews, we confirm a small {format(PUBLISH_FEE_KES)} charge via M-Pesa before publishing. You'll then earn <strong style={{ color:'var(--pink)' }}>{format(earn)}</strong>.
                  </p>
                </div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:8 }}>M-Pesa number</label>
                <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden', marginBottom:20, padding:'0 4px 0 14px' }}>
                  <Icon.Smartphone size={15} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
                  <input value={payPhone} onChange={e=>setPayPhone(e.target.value.replace(/[^\d+]/g,'').slice(0,13))} placeholder="0712345678" type="tel" inputMode="numeric" style={{ border:'none', borderRadius:0, flex:1, padding:'12px 10px' }}/>
                </div>
                <button onClick={handlePay} style={{ width:'100%', padding:14, background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'var(--shadow-glow-purple)', marginBottom:10 }}>
                  <Icon.Smartphone size={16}/>Pay {format(PUBLISH_FEE_KES)} & Publish
                </button>
                <button onClick={() => setPayStep('share')} style={{ width:'100%', padding:13, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:12, fontSize:14, fontWeight:700, color:'var(--green)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
                  <Icon.WhatsApp size={16}/>Don't want to pay? Share to {SHARE_TARGET_COUNT} WhatsApp groups instead
                </button>
                <button onClick={() => setPayStep(null)} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>Cancel</button>
              </>
            )}

            {payStep === 'share' && (() => {
              const pct = Math.round((sharedCount / SHARE_TARGET_COUNT) * 100);
              const complete = sharedCount >= SHARE_TARGET_COUNT;
              const waitingCount = Object.values(shareSlots).filter(s => s === 'waiting').length;
              return (
                <>
                  <div style={{ textAlign:'center', marginBottom:20 }}>
                    <div style={{ width:60, height:60, borderRadius:16, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                      <Icon.WhatsApp size={30}/>
                    </div>
                    <h3 style={{ fontSize:19, fontWeight:800, marginBottom:8 }}>Share to unlock — free publish</h3>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, maxWidth:340, margin:'0 auto' }}>
                      Tap a tile to open WhatsApp, send your review link, then come back. Each share only counts after you've actually been in WhatsApp for a few seconds — quick taps won't count.
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)' }}>{sharedCount} of {SHARE_TARGET_COUNT} verified</span>
                      <span style={{ fontSize:13, fontWeight:800, color: complete ? 'var(--green)' : 'var(--purple)' }}>{pct}%</span>
                    </div>
                    <div style={{ height:10, background:'#f1f5f9', borderRadius:6, overflow:'hidden' }}>
                      <div style={{
                        width:`${pct}%`, height:'100%', borderRadius:6,
                        background: complete ? 'linear-gradient(90deg, #16A34A, #22c55e)' : 'var(--brand-gradient)',
                        transition:'width .3s ease',
                      }}/>
                    </div>
                  </div>

                  {waitingCount > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff7ed', border:'1.5px solid #fed7aa', borderRadius:10, padding:'10px 13px', marginBottom:14 }}>
                      <Icon.Clock size={14} style={{ color:'#D97706', flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:'#92400e', lineHeight:1.4 }}>
                        Waiting for you to return from WhatsApp... send the message, then switch back to this tab.
                      </span>
                    </div>
                  )}

                  {/* Share tile grid */}
                  <div className="share-tile-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginBottom:20 }}>
                    {Array.from({ length: SHARE_TARGET_COUNT }, (_, i) => {
                      const status = shareSlots[i] || 'idle';
                      const done = status === 'done';
                      const waiting = status === 'waiting';
                      return (
                        <button
                          key={i}
                          onClick={() => openWhatsAppShare(i)}
                          disabled={done || waiting}
                          title={done ? `Group ${i+1} verified` : waiting ? `Waiting on group ${i+1}...` : `Share to group ${i+1}`}
                          style={{
                            aspectRatio:'1', borderRadius:10, border:'none',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background: done ? '#22c55e' : waiting ? '#fff7ed' : '#f0fdf4',
                            cursor: (done || waiting) ? 'default' : 'pointer',
                            transition:'all .2s',
                            boxShadow: done ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
                            position:'relative',
                          }}
                        >
                          {done ? (
                            <Icon.Check size={18} style={{ color:'#fff' }}/>
                          ) : waiting ? (
                            <Icon.Loader size={16} style={{ color:'#D97706' }}/>
                          ) : (
                            <Icon.WhatsApp size={20}/>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display:'flex', alignItems:'flex-start', gap:7, background:'#f8f9fc', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:18 }}>
                    <Icon.Shield size={13} style={{ color:'var(--text-muted)', marginTop:1, flexShrink:0 }}/>
                    <span style={{ fontSize:11.5, color:'var(--text-muted)', lineHeight:1.5 }}>
                      We verify you actually left for WhatsApp and stayed there a few seconds before counting a share. Pick a different group or contact each time.
                    </span>
                  </div>

                  <button
                    onClick={handlePublishViaShare}
                    disabled={!complete}
                    style={{
                      width:'100%', padding:14, borderRadius:12, border:'none',
                      background: complete ? 'linear-gradient(135deg,#16A34A,#22c55e)' : '#eceef3',
                      color: complete ? '#fff' : 'var(--text-muted)',
                      fontSize:15, fontWeight:700,
                      cursor: complete ? 'pointer' : 'not-allowed',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      boxShadow: complete ? '0 8px 24px rgba(34,197,94,0.32)' : 'none',
                      marginBottom:10, transition:'all .2s',
                    }}
                  >
                    <Icon.CheckCircle size={16}/>
                    {complete ? `Publish for free — Earn ${format(earn)}` : `Share to all ${SHARE_TARGET_COUNT} to unlock`}
                  </button>
                  <button onClick={() => setPayStep('confirm')} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>
                    Back to payment option
                  </button>
                </>
              );
            })()}

            {payStep === 'pending' && (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div className="spinner" style={{ margin:'0 auto 22px' }}/>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Waiting for M-Pesa...</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Enter your PIN on +254 {normalizePhone(payPhone).slice(1)}</p>
              </div>
            )}

            {payStep === 'success' && (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ width:64, height:64, borderRadius:18, background:'#f0fdf4', border:'1.5px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Icon.CheckCircle size={32} style={{ color:'var(--green)' }}/>
                </div>
                <h3 style={{ fontSize:19, fontWeight:800, color:'var(--green)', marginBottom:8 }}>Verified!</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:22 }}>Publishing your review now...</p>
                <button onClick={finishFlow} style={{ padding:'11px 30px', background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow-glow-pink)' }}>Continue</button>
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
                <button onClick={() => setPayStep('confirm')} style={{ width:'100%', padding:13, background:'var(--brand-gradient)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:10 }}>Try again</button>
                <button onClick={() => setPayStep(null)} style={{ width:'100%', padding:11, background:'transparent', border:'1.5px solid var(--border)', borderRadius:12, fontSize:14, color:'var(--text-muted)', cursor:'pointer' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeOpen && <UpgradeModal user={user} onClose={()=>setUpgradeOpen(false)} onSuccess={() => { upgradePro(); setUpgradeOpen(false); toast('Pro plan activated!','success'); }}/>}
      {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuth={u=>{login(u);toast(`Welcome, ${u.name.split(' ')[0]}!`,'success');setStage('rating');}}/>}
      <Toast/>
      <Celebration/>
    </>
  );
}
