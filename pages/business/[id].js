import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import AuthModal from '../../components/AuthModal';
import { useUser } from '../../lib/useUser';
import { useToast } from '../../lib/useToast';
import Icon from '../../lib/icons';
import { getBizById, EARN_RATES } from '../../data/businesses';

function StarPicker({ value, onChange, size = 26 }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: i <= (hov || value) ? '#FFB800' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.1s, transform 0.1s',
            transform: i <= (hov || value) ? 'scale(1.1)' : 'scale(1)',
            touchAction: 'manipulation',
          }}>
          <Icon.Star size={size} filled={i <= (hov || value)} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  const colors = ['#00C853','#CE1126','#1D4ED8','#7C3AED','#D97706','#0891B2'];
  const c = colors[r.id % colors.length];
  const init = r.name.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{init}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              {[1,2,3,4,5].map(i => <Icon.Star key={i} size={10} filled={i <= r.rating} style={{ color: i <= r.rating ? '#FFB800' : 'rgba(255,255,255,0.15)' }} />)}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{r.date}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#00C853', flexShrink: 0 }}>
          <Icon.TrendingUp size={10} />+KES {r.earned}
        </div>
      </div>
      {r.text ? (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{r.text}</p>
      ) : (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0, fontStyle: 'italic' }}>No written review</p>
      )}
      <div style={{ marginTop: 12 }}>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '5px 11px', cursor: 'pointer' }}>
          <Icon.ThumbsUp size={11} /> Helpful ({r.helpful})
        </button>
      </div>
    </div>
  );
}

function generateReviews(bizId) {
  const names = ['Wanjiru M.','Otieno K.','Achieng N.','Kamau J.','Njeri P.','Mwangi T.'];
  const texts = [
    'Service is generally reliable but customer support can be slow to respond during peak hours. The app works well though.',
    'Great experience overall. The digital services have improved significantly this year compared to before.',
    'Prices are competitive but consistency needs work. Some branches are better than others in terms of service quality.',
    'The mobile app is excellent. Saves me so much time compared to visiting the physical location in person.',
    'Staff are very professional and resolved my issue quickly. Would definitely recommend to friends and family.',
    'Good value for money. The service quality has been consistent and I have no major complaints about it.',
  ];
  const seed = bizId.charCodeAt(0);
  return names.map((name, i) => ({
    id: i, name,
    rating: 1 + ((seed + i * 7) % 5),
    text: texts[(seed + i * 3) % texts.length],
    date: ['2 hours ago','1 day ago','3 days ago','1 week ago','2 weeks ago','1 month ago'][i],
    earned: EARN_RATES[1 + ((seed + i * 7) % 5)],
    helpful: (seed + i * 13) % 40,
  }));
}

/* ── Daily limit upgrade modal ── */
function LimitModal({ onClose, onUpgrade }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: 'rgba(13,18,32,0.98)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px 20px 0 0', padding: '12px 24px env(safe-area-inset-bottom,32px)', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon.Zap size={28} style={{ color: '#FFB800' }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Daily limit reached</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
            You've used all 20 free reviews for today. Upgrade to Pro for unlimited daily reviews and priority payouts.
          </p>
        </div>

        {/* Plan comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Free</div>
            {['20 reviews/day','KES 15–35 each','Standard payout'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 7 }}>
                <Icon.Check size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />{f}
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 12, padding: '16px 14px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, right: 10, background: '#FFB800', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>POPULAR</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FFB800', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pro · KES 299/mo</div>
            {['Unlimited reviews/day','KES 15–35 each','Faster payouts','Priority support'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 7 }}>
                <Icon.Check size={13} style={{ color: '#FFB800', flexShrink: 0 }} />{f}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onUpgrade} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#FFB800,#FF8800)', color: '#000', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <Icon.Zap size={16} /> Upgrade to Pro — KES 299/mo
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, fontSize: 14, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          Maybe later — reset at midnight
        </button>
      </div>
    </div>
  );
}

export default function BusinessPage() {
  const router = useRouter();
  const { id } = router.query;
  const biz = id ? getBizById(id) : null;

  const { user, balance, login, addEarning, getRemainingTasks, consumeTask, upgradePro } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [googleData, setGoogleData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [submitted, setSubmitted] = useState(false); // success state after publish
  const [showWritePanel, setShowWritePanel] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!biz) return;
    setReviews(generateReviews(biz.id));
    // Start with the Unsplash fallback so the hero is never blank
    setPhoto(biz.imageUrl || null);
    // Then try to upgrade to the real Google Places photo
    if (biz.placeId) {
      fetch(`/api/place-photo?placeId=${biz.placeId}`)
        .then(r => r.json())
        .then(d => {
          if (d.photoUrl) setPhoto(d.photoUrl);
          if (d.rating || d.totalRatings) setGoogleData(d);
        })
        .catch(() => {});
    }
  }, [biz?.id]);

  async function fetchAiInsights() {
    if (aiInsights || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: biz.name, reviews: reviews.slice(0,5) }),
      });
      setAiInsights(await res.json());
    } catch {}
    setAiLoading(false);
  }

  if (!biz) return null;

  const earn = EARN_RATES[rating] || 0;
  const seed = biz.id.charCodeAt(0);
  const reviewCount = 200 + (seed * 37) % 4600;
  const baseRating  = (2.8 + ((seed * 13) % 22) / 10).toFixed(1);
  const displayRating = parseFloat(googleData?.rating || baseRating).toFixed(1);
  const ratingLabels = ['','Poor','Fair','Good','Very good','Excellent'];
  const canPublish   = rating > 0; // Only stars required
  const remaining    = getRemainingTasks();

  function handlePublish() {
    if (!user) { setAuthOpen(true); return; }
    if (!rating) { toast('Select a star rating first', 'error'); return; }
    // Check daily limit
    const ok = consumeTask();
    if (!ok) { setLimitOpen(true); return; }

    // Publish immediately — no payment step
    addEarning(earn, `Review: ${biz.name}`);
    setReviews(prev => [{
      id: Date.now(), name: user.name, rating,
      text: reviewText, date: 'Just now', earned: earn, helpful: 0,
    }, ...prev]);
    setSubmitted(true);
    setRating(0); setReviewText('');
    setShowWritePanel(false);
    toast(`Review published! KES ${earn} earned.`, 'success');
  }

  function handleUpgrade() {
    upgradePro();
    setLimitOpen(false);
    toast('Upgraded to Pro! Unlimited reviews unlocked.', 'success');
  }

  // ── Write panel content (shared desktop/mobile) ──
  const WritePanel = () => {
    if (submitted) return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(0,200,83,0.12)', border: '1px solid rgba(0,200,83,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Icon.CheckCircle size={26} style={{ color: '#00C853' }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#00C853', marginBottom: 6 }}>Review submitted!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 18, lineHeight: 1.5 }}>
          Your earnings have been added to your wallet. Tax is only deducted when you withdraw.
        </div>
        <button onClick={() => setSubmitted(false)} style={{ fontSize: 13, fontWeight: 600, color: '#00C853', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>
          Write another review
        </button>
      </div>
    );

    return (
      <div style={{ padding: '24px' }}>
        {/* Daily task counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, margin: 0 }}>
            <Icon.Star size={15} style={{ color: '#FFB800' }} /> Write a review
          </h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: remaining <= 5 ? 'rgba(255,184,0,0.1)' : 'rgba(0,200,83,0.08)',
            border: `1px solid ${remaining <= 5 ? 'rgba(255,184,0,0.25)' : 'rgba(0,200,83,0.18)'}`,
            color: remaining <= 5 ? '#FFB800' : '#00C853',
          }}>
            <Icon.Zap size={10} />
            {user?.plan === 'pro' ? 'Unlimited' : `${remaining} left today`}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={lbl}>Your rating</div>
          <StarPicker value={rating} onChange={setRating} size={28} />
          {rating > 0 && <div style={{ fontSize: 12, color: '#FFB800', marginTop: 6, fontWeight: 600 }}>{ratingLabels[rating]}</div>}
        </div>

        {rating > 0 && (
          <div style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.18)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#00C853', textTransform: 'uppercase', letterSpacing: '0.5px' }}>You earn</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>credited instantly · no text required</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#00C853' }}>KES {earn}</div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={lbl}>Your review</div>
          <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Optional — share more about your experience..."
              rows={4}
              style={{
                resize: 'none',
                fontSize: 16,
                background: '#1a2236',
                color: '#f1f5f9',
                WebkitTextFillColor: '#f1f5f9',
                minHeight: 100,
              }}
            />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginTop: 4 }}>
            {reviewText.length > 0 ? `${reviewText.length} characters` : 'Optional'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px' }}>
          <Icon.Info size={13} style={{ color: 'rgba(255,255,255,0.25)', marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            No fee to publish. A 16% tax is deducted only when you withdraw to M-Pesa.
          </span>
        </div>

        <button onClick={handlePublish} style={{
          width: '100%', padding: '13px', borderRadius: 10, border: 'none',
          background: canPublish ? 'linear-gradient(135deg,#00C853,#007A3D)' : 'rgba(255,255,255,0.07)',
          color: canPublish ? '#000' : 'rgba(255,255,255,0.3)',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: canPublish ? '0 0 20px rgba(0,200,83,0.25)' : 'none',
          transition: 'all 0.2s', touchAction: 'manipulation',
        }}>
          <Icon.Send size={14} />
          {rating ? `Publish & Earn KES ${earn}` : 'Select a star rating'}
        </button>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{biz.name} Reviews — ReviewKE</title>
        <meta name="description" content={`Read and write reviews for ${biz.name}. Earn via M-Pesa.`} />
      </Head>

      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <style>{`
        .review-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
        .sidebar-panel { display: block !important; }
        .mobile-write-btn { display: none !important; }
        @media (max-width: 768px) {
          .review-layout { grid-template-columns: 1fr !important; }
          .sidebar-panel { display: none !important; }
          .mobile-write-btn { display: flex !important; }
        }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }}>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
          <Icon.ArrowLeft size={14} /> Back
        </button>

        {/* Business header */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ height: 'clamp(120px,20vw,200px)', position: 'relative', overflow: 'hidden' }}>
            {photo ? (
              <img src={photo} alt={biz.name} onLoad={() => setImgLoaded(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${biz.color}45,${biz.color}15)` }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(8,12,20,0.85) 0%,transparent 55%)' }} />
          </div>
          <div style={{ padding: '0 20px 22px', marginTop: -36, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, flexShrink: 0, background: `linear-gradient(135deg,${biz.color},${biz.color}90)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: '#fff', border: '3px solid rgba(8,12,20,0.8)', boxShadow: `0 6px 20px ${biz.color}40` }}>{biz.initial}</div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ fontSize: 'clamp(17px,3vw,24px)', fontWeight: 800, margin: 0 }}>{biz.name}</h1>
                  {biz.verified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', color: '#00C853', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}><Icon.Check size={10} /> Verified</span>}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>{biz.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => <Icon.Star key={i} size={13} filled={i <= Math.round(displayRating)} style={{ color: i <= Math.round(displayRating) ? '#FFB800' : 'rgba(255,255,255,0.15)' }} />)}
                  </div>
                  <strong style={{ fontSize: 14, color: '#FFB800' }}>{displayRating}</strong>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>({reviewCount.toLocaleString()})</span>
                  <span style={{ background: `${biz.color}20`, color: biz.color, border: `1px solid ${biz.color}35`, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{biz.category}</span>
                </div>
              </div>
              <button onClick={fetchAiInsights} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1px solid rgba(124,58,237,0.28)', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                {aiLoading ? <Icon.Loader size={13} /> : <Icon.Sparkles size={13} />}
                {aiLoading ? 'Analyzing...' : 'AI Insights'}
              </button>
            </div>
          </div>
        </div>

        {/* AI panel */}
        {aiInsights && (
          <div style={{ background: 'rgba(124,58,237,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Icon.Sparkles size={14} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Analysis</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: aiInsights.score > 70 ? '#00C853' : '#FFB800', background: 'rgba(255,255,255,0.06)', padding: '2px 9px', borderRadius: 20 }}>{aiInsights.score}/100</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 16 }}>{aiInsights.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(0,200,83,0.06)', border: '1px solid rgba(0,200,83,0.12)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#00C853', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Icon.CheckCircle size={11} /> What customers love</div>
                {(aiInsights.highlights||[]).map((h,i) => <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', padding: '3px 0' }}>— {h}</div>)}
              </div>
              <div style={{ background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.12)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#FF3B3B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Info size={11} /> Needs improvement</div>
                {(aiInsights.improvements||[]).map((h,i) => <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', padding: '3px 0' }}>— {h}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* Reviews + sidebar */}
        <div className="review-layout">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Customer reviews</h2>
              <button className="mobile-write-btn" onClick={() => setShowWritePanel(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#00C853,#007A3D)', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Icon.Star size={13} /> Write a review
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(r => <ReviewCard key={r.id} r={r} />)}
            </div>
          </div>

          {/* Desktop sidebar */}
          <div className="sidebar-panel" style={{ position: 'sticky', top: 72, height: 'fit-content' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
              <WritePanel />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile write bottom sheet */}
      {showWritePanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowWritePanel(false)}>
          <div style={{ background: 'rgba(13,18,32,0.98)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px 20px 0 0', padding: '0 0 env(safe-area-inset-bottom,20px)', width: '100%', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '12px 20px 0' }}>
              <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Write a review — {biz.name}</span>
                <button onClick={() => setShowWritePanel(false)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                  <Icon.X size={14} />
                </button>
              </div>
            </div>
            <WritePanel />
          </div>
        </div>
      )}

      {limitOpen && <LimitModal onClose={() => setLimitOpen(false)} onUpgrade={handleUpgrade} />}
      {authOpen  && <AuthModal  onClose={() => setAuthOpen(false)}  onAuth={u => { login(u); toast(`Welcome, ${u.name.split(' ')[0]}!`, 'success'); }} />}
      <Toast />
    </>
  );
}

const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 };
