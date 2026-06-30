import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import BusinessCard from '../components/BusinessCard';
import AuthModal from '../components/AuthModal';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';
import { BUSINESSES } from '../data/businesses';

const FEATURED = BUSINESSES.filter(b => b.featured);

const STEPS = [
  { icon: 'Search', num: '01', title: 'Find a business', desc: 'Browse 50+ Kenyan companies across 13 categories — from Safaricom to Naivas to Equity Bank.' },
  { icon: 'Star', num: '02', title: 'Write your review', desc: 'Share an honest 1–5 star review. Your experience helps thousands of Kenyans make better choices.' },
  { icon: 'Send', num: '03', title: 'Earn via M-Pesa', desc: 'Pay a 10% fee via STK Push, then receive KES 15–35 directly into your wallet. Withdraw anytime.' },
];

const EARN_TABLE = [
  { stars: 1, earn: 15, fee: 2 },
  { stars: 2, earn: 20, fee: 2 },
  { stars: 3, earn: 25, fee: 3 },
  { stars: 4, earn: 30, fee: 3 },
  { stars: 5, earn: 35, fee: 4 },
];

const STATS = [
  { val: '50+', lbl: 'Businesses listed', icon: 'Building' },
  { val: '12K+', lbl: 'Reviews published', icon: 'Star' },
  { val: 'KES 2M+', lbl: 'Paid to reviewers', icon: 'TrendingUp' },
  { val: '10%', lbl: 'Platform fee only', icon: 'Shield' },
];

export default function Home() {
  const { user, balance, login } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Head>
        <title>ReviewKE — Rate Kenyan Businesses & Earn via M-Pesa</title>
        <meta name="description" content="Write honest reviews of Safaricom, Equity Bank, Naivas and 47 more Kenyan businesses. Earn KES 15–35 per review paid via M-Pesa." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <main>
        {/* ── HERO ── */}
        <section style={{ padding: 'clamp(64px,10vw,120px) 24px clamp(48px,8vw,96px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 20, marginBottom: 28 }}>
            <Icon.Zap size={13} style={{ color: '#00C853' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00C853', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Kenya's #1 Review Platform
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 72px)',
            fontWeight: 900,
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: 24,
            maxWidth: 800,
            margin: '0 auto 24px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Review Kenyan</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #00C853 0%, #00FF87 50%, #00C853 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmerText 3s linear infinite',
            }}>
              Businesses.
            </span>
            {' '}
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Get Paid.</span>
          </h1>

          <style>{`
            @keyframes shimmerText { 0%{background-position:0% center} 100%{background-position:200% center} }
          `}</style>

          <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Share honest opinions on Safaricom, Equity Bank, Naivas and 47 more companies.
            Earn KES 15–35 per review — paid instantly via M-Pesa.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/businesses" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00C853, #007A3D)',
              color: '#000', fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 0 32px rgba(0,200,83,0.35)',
              transition: 'all 0.2s',
            }}>
              <Icon.Grid size={17} />
              Browse businesses
            </Link>
            <button onClick={() => setAuthOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <Icon.User size={17} />
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign up free'}
            </button>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {STATS.map(s => {
              const IconComp = Icon[s.icon];
              return (
                <div key={s.val} style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '22px 24px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(0,200,83,0.1)',
                    border: '1px solid rgba(0,200,83,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <IconComp size={20} style={{ color: '#00C853' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.lbl}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#00C853', textTransform: 'uppercase', marginBottom: 12 }}>
              How it works
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: '-1px' }}>
              Earn in three steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {STEPS.map((step, i) => {
              const IconComp = Icon[step.icon];
              return (
                <div key={i} style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '28px 26px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 20, right: 20,
                    fontSize: 48, fontWeight: 900,
                    fontFamily: "'Syne', sans-serif",
                    color: 'rgba(255,255,255,0.04)',
                    lineHeight: 1,
                  }}>{step.num}</div>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(0,200,83,0.2), rgba(0,200,83,0.05))',
                    border: '1px solid rgba(0,200,83,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18,
                  }}>
                    <IconComp size={22} style={{ color: '#00C853' }} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{step.title}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FEATURED ── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#00C853', textTransform: 'uppercase', marginBottom: 8 }}>Top picks</div>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}>Featured businesses</h2>
            </div>
            <Link href="/businesses" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#00C853',
              textDecoration: 'none', padding: '8px 16px',
              background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)',
              borderRadius: 10, transition: 'all 0.2s',
            }}>
              View all
              <Icon.ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURED.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
          </div>
        </section>

        {/* ── EARN TABLE ── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#00C853', textTransform: 'uppercase', marginBottom: 12 }}>Earnings</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px', marginBottom: 12 }}>What you earn</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 400, margin: '0 auto' }}>
              A 10% platform fee is collected via M-Pesa STK Push when you publish. Net earnings are credited instantly.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            {EARN_TABLE.map((row, i) => (
              <div key={row.stars} style={{
                display: 'flex', alignItems: 'center', padding: '18px 24px',
                borderBottom: i < EARN_TABLE.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: row.stars === 5 ? 'rgba(0,200,83,0.06)' : 'transparent',
              }}>
                <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                  {[...Array(5)].map((_, si) => (
                    <Icon.Star key={si} size={15} filled={si < row.stars}
                      style={{ color: si < row.stars ? '#FFB800' : 'rgba(255,255,255,0.12)' }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Platform fee</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,59,59,0.8)' }}>KES {row.fee}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>You earn</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: row.stars === 5 ? '#00C853' : '#fff' }}>
                      KES {row.earn}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        {!user && (
          <section style={{ padding: '0 24px 100px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(0,200,83,0.06)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,200,83,0.15)',
              borderRadius: 24, padding: 'clamp(32px, 5vw, 56px)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,200,83,0.15), transparent 70%)', pointerEvents: 'none' }} />
              <Icon.Award size={40} style={{ color: '#00C853', marginBottom: 16 }} />
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 12, letterSpacing: '-0.5px' }}>
                Ready to start earning?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.6 }}>
                Join thousands of Kenyans earning from their honest opinions. Free to join. Paid via M-Pesa.
              </p>
              <button onClick={() => setAuthOpen(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #00C853, #007A3D)',
                color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 0 32px rgba(0,200,83,0.35)',
              }}>
                <Icon.ArrowRight size={17} />
                Create free account
              </button>
            </div>
          </section>
        )}
      </main>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={u => { login(u); toast(`Welcome, ${u.name.split(' ')[0]}!`, 'success'); }} />}
      <Toast />
    </>
  );
}
