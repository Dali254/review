import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import AuthModal from '../../components/AuthModal';
import { useUser } from '../../lib/useUser';
import { useToast } from '../../lib/useToast';
import Icon from '../../lib/icons';
import { getBizById, EARN_RATES, TAX_RATE } from '../../data/businesses';

function StarPicker({ value, onChange, size = 28 }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: i <= (hov || value) ? '#FFB800' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.1s, transform 0.1s',
            transform: i <= (hov || value) ? 'scale(1.1)' : 'scale(1)',
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
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: c,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{init}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              {[1,2,3,4,5].map(i => (
                <Icon.Star key={i} size={11} filled={i <= r.rating}
                  style={{ color: i <= r.rating ? '#FFB800' : 'rgba(255,255,255,0.15)' }}
                />
              ))}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{r.date}</span>
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)',
          borderRadius: 20, padding: '4px 12px',
          fontSize: 12, fontWeight: 700, color: '#00C853',
        }}>
          <Icon.TrendingUp size={11} />
          +KES {r.earned}
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{r.text}</p>
      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,200,83,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <Icon.ThumbsUp size={12} />
          Helpful ({r.helpful})
        </button>
      </div>
    </div>
  );
}

function generateReviews(bizId) {
  const names = ['Wanjiru M.', 'Otieno K.', 'Achieng N.', 'Kamau J.', 'Njeri P.', 'Mwangi T.'];
  const texts = [
    'Service is generally reliable but customer support can be slow to respond during peak hours.',
    'Great experience overall. The digital services have improved significantly this year.',
    'Prices are competitive but consistency needs work. Some branches are better than others.',
    'The mobile app is excellent. Saves me so much time compared to visiting in person.',
    'Staff at the main branch are very professional and resolved my issue within minutes.',
    'Good value for money. The loyalty program is genuinely worth using regularly.',
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

export default function BusinessPage() {
  const router = useRouter();
  const { id } = router.query;
  const biz = id ? getBizById(id) : null;

  const { user, balance, login, addEarning } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [googleData, setGoogleData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [payStep, setPayStep] = useState(null);
  const [payPhone, setPayPhone] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!biz) return;
    setReviews(generateReviews(biz.id));
    if (user) setPayPhone(user.phone.replace(/^0/, ''));
    fetch(`/api/place-photo?placeId=${biz.placeId}`)
      .then(r => r.json())
      .then(d => { setPhoto(d.photoUrl); setGoogleData(d); })
      .catch(() => {});
  }, [biz?.id, user]);

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
  const tax = Math.round(earn * TAX_RATE);
  const seed = biz.id.charCodeAt(0);
  const reviewCount = 200 + (seed * 37) % 4600;
  const baseRating = (2.8 + ((seed * 13) % 22) / 10).toFixed(1);
  const displayRating = parseFloat(googleData?.rating || baseRating).toFixed(1);

  async function handlePublish() {
    if (!user) { setAuthOpen(true); return; }
    if (!rating) { toast('Select a star rating first', 'error'); return; }
    if (reviewText.trim().length < 20) { toast('Write at least 20 characters', 'error'); return; }
    setPayPhone(user.phone.replace(/^0/, ''));
    setPayStep('confirm');
  }

  async function handlePay() {
    if (payPhone.length < 9) { toast('Enter your Safaricom number', 'error'); return; }
    setPayStep('pending');
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '0' + payPhone, amount: tax, name: user.name, reference: `RKE-${Date.now()}` }),
      });
      await res.json();
    } catch {}
    setTimeout(() => completeReview(), 3000);
  }

  function completeReview() {
    addEarning(earn, tax, `Review: ${biz.name}`);
    setReviews(prev => [{
      id: Date.now(), name: user.name, rating,
      text: reviewText, date: 'Just now', earned: earn, helpful: 0,
    }, ...prev]);
    setPayStep('success');
    setRating(0); setReviewText('');
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  return (
    <>
      <Head>
        <title>{biz.name} Reviews — ReviewKE</title>
        <meta name="description" content={`Read and write reviews for ${biz.name}. Earn via M-Pesa.`} />
      </Head>

      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 100px' }}>
        <button onClick={() => router.back()} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#00C853'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          <Icon.ArrowLeft size={15} /> Back
        </button>

        {/* Cover + Header */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, overflow: 'hidden', marginBottom: 28,
        }}>
          <div style={{ height: 'clamp(160px, 25vw, 260px)', position: 'relative', overflow: 'hidden' }}>
            {photo ? (
              <img src={photo} alt={biz.name} onLoad={() => setImgLoaded(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${biz.color}50, ${biz.color}15)`,
              }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,20,0.9) 0%, transparent 50%)' }} />
          </div>

          <div style={{ padding: '0 28px 28px', marginTop: -40, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 18, flexShrink: 0,
                background: `linear-gradient(135deg, ${biz.color}, ${biz.color}90)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, fontWeight: 900, color: '#fff',
                border: '3px solid rgba(8,12,20,0.8)',
                boxShadow: `0 8px 24px ${biz.color}50`,
              }}>{biz.initial}</div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 900, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}>{biz.name}</h1>
                  {biz.verified && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', color: '#00C853', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      <Icon.Check size={11} /> Verified
                    </span>
                  )}
                  <span style={{ background: `${biz.color}20`, color: biz.color, border: `1px solid ${biz.color}40`, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {biz.category}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>{biz.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => <Icon.Star key={i} size={16} filled={i <= Math.round(displayRating)} style={{ color: i <= Math.round(displayRating) ? '#FFB800' : 'rgba(255,255,255,0.15)' }} />)}
                  </div>
                  <strong style={{ fontSize: 16, color: '#FFB800' }}>{displayRating}</strong>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>({reviewCount.toLocaleString()} reviews)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 4 }}>
                    <Icon.MapPin size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{biz.address}</span>
                  </div>
                </div>
              </div>
              <button onClick={fetchAiInsights} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(124,58,237,0.3)',
                background: 'rgba(124,58,237,0.1)', color: '#a78bfa',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(8px)', transition: 'all 0.2s',
              }}>
                {aiLoading ? <Icon.Loader size={15} /> : <Icon.Sparkles size={15} />}
                {aiLoading ? 'Analyzing...' : 'AI Insights'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Panel */}
        {aiInsights && (
          <div style={{
            background: 'rgba(124,58,237,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 20, padding: '24px 28px', marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon.Sparkles size={16} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Analysis</span>
              <span style={{
                marginLeft: 'auto', fontSize: 12, fontWeight: 700,
                color: aiInsights.score > 70 ? '#00C853' : aiInsights.score > 50 ? '#FFB800' : '#FF3B3B',
                background: aiInsights.score > 70 ? 'rgba(0,200,83,0.1)' : 'rgba(255,184,0,0.1)',
                padding: '3px 10px', borderRadius: 20,
              }}>
                Score: {aiInsights.score}/100
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 20 }}>{aiInsights.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ background: 'rgba(0,200,83,0.06)', border: '1px solid rgba(0,200,83,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00C853', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon.CheckCircle size={12} /> What customers love
                </div>
                {(aiInsights.highlights || []).map((h, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '4px 0', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#00C853', flexShrink: 0 }}>—</span>{h}
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#FF3B3B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon.Info size={12} /> Needs improvement
                </div>
                {(aiInsights.improvements || []).map((h, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '4px 0', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#FF3B3B', flexShrink: 0 }}>—</span>{h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews + write panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr clamp(300px,35%,380px)', gap: 24 }} className="review-layout">
          <style>{`@media(max-width:768px){ .review-layout{ grid-template-columns: 1fr !important; } }`}</style>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Customer reviews</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map(r => <ReviewCard key={r.id} r={r} />)}
            </div>
          </div>

          {/* Write panel */}
          <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20, padding: 24,
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.Star size={17} style={{ color: '#FFB800' }} />
                Write a review
              </h3>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Your rating</div>
                <StarPicker value={rating} onChange={setRating} size={26} />
                {rating > 0 && (
                  <div style={{ fontSize: 12, color: '#FFB800', marginTop: 6, fontWeight: 600 }}>
                    {ratingLabels[rating]}
                  </div>
                )}
              </div>

              {rating > 0 && (
                <div style={{
                  background: 'rgba(0,200,83,0.08)',
                  border: '1px solid rgba(0,200,83,0.2)',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 18,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#00C853', textTransform: 'uppercase', letterSpacing: '0.5px' }}>You earn</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>after KES {tax} fee</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#00C853' }}>KES {earn}</div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Your review</div>
                <textarea
                  value={reviewText} onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your honest experience with other Kenyans..."
                  rows={4} style={{ resize: 'none' }}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginTop: 4 }}>
                  {reviewText.length} / min 20 characters
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 18 }}>
                <Icon.Info size={13} style={{ color: 'rgba(255,255,255,0.25)', marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  A 10% platform fee (KES {tax}) is collected via M-Pesa STK Push when you publish.
                </span>
              </div>

              <button onClick={handlePublish} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: rating && reviewText.length >= 20
                  ? 'linear-gradient(135deg, #00C853, #007A3D)'
                  : 'rgba(255,255,255,0.07)',
                color: rating && reviewText.length >= 20 ? '#000' : 'rgba(255,255,255,0.35)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: rating && reviewText.length >= 20 ? '0 0 24px rgba(0,200,83,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                <Icon.Send size={15} />
                {rating ? `Publish & Earn KES ${earn}` : 'Select a rating to continue'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Payment modal */}
      {payStep && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'rgba(13,18,32,0.97)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: 32,
            width: '100%', maxWidth: 420,
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            animation: 'fadeUp 0.3s ease',
          }}>
            {payStep === 'confirm' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon.Smartphone size={28} style={{ color: '#00C853' }} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Pay platform fee</h3>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                    KES {tax} fee via M-Pesa STK Push. You'll earn KES {earn}.
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>M-Pesa number</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
                    <span style={{ padding: '0 14px', fontSize: 14, fontWeight: 700, color: '#00C853', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>+254</span>
                    <input value={payPhone} onChange={e => setPayPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="712345678" type="tel" style={{ border: 'none', background: 'transparent', borderRadius: 0, flex: 1 }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(0,200,83,0.06)', border: '1px solid rgba(0,200,83,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Platform fee (10%)</span>
                  <strong style={{ fontSize: 16, color: '#00C853' }}>KES {tax}</strong>
                </div>
                <button onClick={handlePay} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#00C853,#007A3D)', color: '#000', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 24px rgba(0,200,83,0.3)', marginBottom: 10 }}>
                  <Icon.Smartphone size={17} />
                  Pay KES {tax} via M-Pesa
                </button>
                <button onClick={() => setPayStep(null)} style={{ width: '100%', padding: 11, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Cancel</button>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>Powered by PayHero · Secure M-Pesa STK Push</p>
              </>
            )}
            {payStep === 'pending' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Waiting for M-Pesa...</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                  Check your phone +254 {payPhone}<br />
                  Enter your PIN to confirm
                </p>
              </div>
            )}
            {payStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(0,200,83,0.12)', border: '1px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Icon.CheckCircle size={36} style={{ color: '#00C853' }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#00C853', marginBottom: 8 }}>Review published!</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24 }}>
                  KES {tax} fee collected.<br />
                  <strong style={{ color: '#00C853' }}>KES {earn} added to your wallet.</strong>
                </p>
                <button onClick={() => setPayStep(null)} style={{ padding: '11px 32px', background: 'rgba(0,200,83,0.12)', border: '1px solid rgba(0,200,83,0.25)', color: '#00C853', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={u => { login(u); toast(`Welcome, ${u.name.split(' ')[0]}!`, 'success'); }} />}
      <Toast />
    </>
  );
}
