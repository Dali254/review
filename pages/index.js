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
  { icon: 'Search', title: 'Find a business', desc: 'Browse 50+ Kenyan companies across 13 categories.' },
  { icon: 'Star', title: 'Write your review', desc: 'Share an honest 1–5 star review. Min 20 characters.' },
  { icon: 'Send', title: 'Earn via M-Pesa', desc: 'Pay a small 10% fee, then earn KES 15–35 per review.' },
];

const EARN_TABLE = [
  { stars: 1, earn: 15, fee: 2 },
  { stars: 2, earn: 20, fee: 2 },
  { stars: 3, earn: 25, fee: 3 },
  { stars: 4, earn: 30, fee: 3 },
  { stars: 5, earn: 35, fee: 4 },
];

const STATS = [
  { val: '50+', lbl: 'Businesses', icon: 'Building' },
  { val: '12K+', lbl: 'Reviews', icon: 'Star' },
  { val: 'KES 2M+', lbl: 'Paid out', icon: 'TrendingUp' },
  { val: '10%', lbl: 'Fee only', icon: 'Shield' },
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
      </Head>

      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <style>{`
        .hero-title { font-size: 40px; }
        .hero-sub { font-size: 16px; }
        .hero-btns { flex-direction: row; }
        .stats-grid { grid-template-columns: repeat(4, 1fr); }
        .steps-grid { grid-template-columns: repeat(3, 1fr); }
        .featured-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        .earn-row { flex-direction: row; }
        @media (max-width: 640px) {
          .hero-title { font-size: 26px !important; }
          .hero-sub { font-size: 14px !important; }
          .hero-btns { flex-direction: column !important; gap: 10px !important; }
          .hero-btns a, .hero-btns button { width: 100% !important; justify-content: center; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .featured-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .hero-title { font-size: 32px !important; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .featured-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <main>
        {/* HERO */}
        <section style={{ padding: '56px 16px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, height: 300, background: 'radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 20, marginBottom: 20 }}>
            <Icon.Zap size={12} style={{ color: '#00C853' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00C853', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Kenya's Review Platform
            </span>
          </div>

          <h1 className="hero-title" style={{ fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: '#fff', letterSpacing: '-0.5px', maxWidth: 640, margin: '0 auto 16px' }}>
            Review Kenyan Businesses.{' '}
            <span style={{ color: '#00C853' }}>Get Paid via M-Pesa.</span>
          </h1>

          <p className="hero-sub" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Write honest reviews of Safaricom, Equity Bank, Naivas and 47 more companies. Earn KES 15–35 per review.
          </p>

          <div className="hero-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
            <Link href="/businesses" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #00C853, #007A3D)',
              color: '#000', fontSize: 15, fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 0 24px rgba(0,200,83,0.3)',
            }}>
              <Icon.Grid size={16} />
              Browse businesses
            </Link>
            <button onClick={() => setAuthOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 10,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <Icon.User size={16} />
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign up free'}
            </button>
          </div>
        </section>

        {/* STATS */}
        <section style={{ padding: '0 16px 56px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="stats-grid" style={{ display: 'grid', gap: 12 }}>
            {STATS.map(s => {
              const IconComp = Icon[s.icon];
              return (
                <div key={s.val} style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(0,200,83,0.1)',
                    border: '1px solid rgba(0,200,83,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconComp size={18} style={{ color: '#00C853' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.lbl}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: '0 16px 56px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#00C853', textTransform: 'uppercase', marginBottom: 8 }}>How it works</div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Earn in three steps</h2>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gap: 16 }}>
            {STEPS.map((step, i) => {
              const IconComp = Icon[step.icon];
              return (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '24px 22px',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(0,200,83,0.1)',
                    border: '1px solid rgba(0,200,83,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <IconComp size={20} style={{ color: '#00C853' }} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED */}
        <section style={{ padding: '0 16px 56px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#00C853', textTransform: 'uppercase', marginBottom: 6 }}>Top picks</div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Featured businesses</h2>
            </div>
            <Link href="/businesses" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#00C853',
              textDecoration: 'none', padding: '8px 14px',
              background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.18)',
              borderRadius: 9,
            }}>
              View all <Icon.ArrowRight size={13} />
            </Link>
          </div>
          <div className="featured-grid" style={{ display: 'grid', gap: 16 }}>
            {FEATURED.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
          </div>
        </section>

        {/* EARN TABLE */}
        <section style={{ padding: '0 16px 56px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#00C853', textTransform: 'uppercase', marginBottom: 8 }}>Earnings</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>What you earn per review</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>10% platform fee collected via M-Pesa STK Push on publish.</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {EARN_TABLE.map((row, i) => (
              <div key={row.stars} style={{
                display: 'flex', alignItems: 'center', padding: '16px 20px',
                borderBottom: i < EARN_TABLE.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: row.stars === 5 ? 'rgba(0,200,83,0.05)' : 'transparent',
                gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'nowrap' }}>
                  {[...Array(5)].map((_, si) => (
                    <Icon.Star key={si} size={14} filled={si < row.stars}
                      style={{ color: si < row.stars ? '#FFB800' : 'rgba(255,255,255,0.12)', flexShrink: 0 }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>Fee</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,80,80,0.8)' }}>KES {row.fee}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 72 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>You earn</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: row.stars === 5 ? '#00C853' : '#fff' }}>KES {row.earn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section style={{ padding: '0 16px 80px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(0,200,83,0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,200,83,0.14)',
              borderRadius: 20, padding: '40px 24px',
            }}>
              <Icon.Award size={36} style={{ color: '#00C853', marginBottom: 14 }} />
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Ready to start earning?</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
                Join thousands of Kenyans earning from their honest opinions. Free to join, paid via M-Pesa.
              </p>
              <button onClick={() => setAuthOpen(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #00C853, #007A3D)',
                color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 0 24px rgba(0,200,83,0.3)',
              }}>
                <Icon.ArrowRight size={16} />
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
