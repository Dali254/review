import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';
import { BUSINESSES, logoUrl } from '../data/businesses';

const FEATURED = BUSINESSES.filter(b => b.featured).slice(0, 4);

const STEPS = [
  { icon:'Grid', title:'Browse businesses', desc:'50+ real Kenyan companies across 13 categories.' },
  { icon:'Star', title:'Rate with stars', desc:'Give a 1–5 star rating. Written review is optional.' },
  { icon:'Smartphone', title:'Earn via M-Pesa', desc:'KES 15–35 credited instantly. 16% tax on withdrawal.' },
];

const STATS = [
  { val:'50+', lbl:'Businesses', icon:'Building' },
  { val:'12K+', lbl:'Reviews', icon:'Star' },
  { val:'KES 2M+', lbl:'Paid out', icon:'TrendingUp' },
  { val:'16%', lbl:'Tax on withdrawal', icon:'Shield' },
];

function FeaturedCard({ biz }) {
  const [logoOk, setLogoOk] = useState(true);
  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length-1);
  const reviewCount = 200 + (seed * 37) % 4600;
  const displayRating = (2.8 + ((seed * 13) % 22) / 10).toFixed(1);

  return (
    <Link href={`/business/${biz.id}`} style={{ textDecoration:'none', color:'inherit' }}>
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow)', transition:'all .2s' }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-lg)';e.currentTarget.style.transform='translateY(-2px)';}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow='var(--shadow)';e.currentTarget.style.transform='translateY(0)';}}>
        <div style={{ height:120, background:`linear-gradient(135deg,${biz.color}1a,${biz.color}06)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:'16px' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${biz.color}18 1px,transparent 1px)`, backgroundSize:'18px 18px' }}/>
          {logoOk ? (
            <img src={logoUrl(biz,128)} alt={biz.name} onError={()=>setLogoOk(false)}
              style={{ width:56, height:56, objectFit:'contain', position:'relative', zIndex:1, background:'#fff', borderRadius:12, padding:8, boxShadow:'var(--shadow)' }}/>
          ) : (
            <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${biz.color},${biz.color}80)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#fff', position:'relative', zIndex:1 }}>{biz.initial}</div>
          )}
        </div>
        <div style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>{biz.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Icon.Star size={12} filled style={{ color:'#F59E0B' }}/>
            <span style={{ fontSize:12, fontWeight:700 }}>{displayRating}</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>({reviewCount.toLocaleString()})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user, balance, login } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Head>
        <title>ReviewKE — Rate Kenyan Businesses & Earn via M-Pesa</title>
        <meta name="description" content="Write honest reviews of Safaricom, Equity Bank, Naivas and more. Earn KES 15–35 per review."/>
      </Head>
      <Navbar user={user} onAuthClick={()=>setAuthOpen(true)} balance={balance}/>

      <style>{`
        .hero-title{font-size:46px}
        .stats-grid{grid-template-columns:repeat(4,1fr)}
        .steps-grid{grid-template-columns:repeat(3,1fr)}
        .feat-grid{grid-template-columns:repeat(4,1fr)}
        @media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}.steps-grid{grid-template-columns:repeat(2,1fr)!important}.feat-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:600px){.hero-title{font-size:28px!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}.steps-grid{grid-template-columns:1fr!important}.feat-grid{grid-template-columns:1fr!important}}
      `}</style>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 80px' }}>
        {/* HERO */}
        <div style={{ textAlign:'center', padding:'64px 16px 56px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:700, height:300, background:'radial-gradient(ellipse,rgba(233,30,140,0.08) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', background:'var(--pink-light)', border:'1.5px solid var(--pink-mid)', borderRadius:20, marginBottom:20, fontSize:12, fontWeight:700, color:'var(--pink)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            <Icon.Zap size={12}/>Kenya's #1 Review Platform
          </div>
          <h1 className="hero-title" style={{ fontWeight:900, lineHeight:1.1, marginBottom:18, letterSpacing:'-1px', color:'var(--text)' }}>
            Review Kenyan Businesses.<br/>
            <span style={{ color:'var(--pink)' }}>Get Paid via M-Pesa.</span>
          </h1>
          <p style={{ fontSize:17, color:'var(--text-secondary)', maxWidth:480, margin:'0 auto 36px', lineHeight:1.65 }}>
            Share your honest opinion on Safaricom, Equity Bank, Naivas and 47 more companies. Earn KES 15–35 instantly. No upfront fees.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/businesses" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:12, background:'var(--pink)', color:'#fff', fontSize:15, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 16px rgba(233,30,140,0.35)' }}>
              <Icon.Grid size={17}/>Browse businesses
            </Link>
            <button onClick={()=>setAuthOpen(true)} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:12, background:'#fff', color:'var(--text)', fontSize:15, fontWeight:600, border:'1.5px solid var(--border-strong)', cursor:'pointer', boxShadow:'var(--shadow)' }}>
              <Icon.User size={17}/>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign up free'}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid" style={{ display:'grid', gap:14, marginBottom:56 }}>
          {STATS.map(s => {
            const IC = Icon[s.icon];
            return (
              <div key={s.val} style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:'20px 22px', display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow)' }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'var(--pink-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <IC size={20} style={{ color:'var(--pink)' }}/>
                </div>
                <div>
                  <div style={{ fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1.1 }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.lbl}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginBottom:56 }}>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--pink)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>How it works</div>
            <h2 style={{ fontSize:26, fontWeight:800 }}>Earn in three steps</h2>
          </div>
          <div className="steps-grid" style={{ display:'grid', gap:16 }}>
            {STEPS.map((s,i) => {
              const IC = Icon[s.icon];
              return (
                <div key={i} style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'26px 24px', boxShadow:'var(--shadow)' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'var(--pink-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <IC size={22} style={{ color:'var(--pink)' }}/>
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</div>
                  <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FEATURED */}
        <div style={{ marginBottom:56 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--pink)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:6 }}>Top picks</div>
              <h2 style={{ fontSize:24, fontWeight:800 }}>Featured businesses</h2>
            </div>
            <Link href="/businesses" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'var(--pink)', textDecoration:'none', padding:'8px 16px', background:'var(--pink-light)', borderRadius:10 }}>
              View all <Icon.ArrowRight size={13}/>
            </Link>
          </div>
          <div className="feat-grid" style={{ display:'grid', gap:16 }}>
            {FEATURED.map(biz => <FeaturedCard key={biz.id} biz={biz} />)}
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div style={{ background:'var(--pink)', borderRadius:20, padding:'48px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, background:'rgba(255,255,255,0.08)', borderRadius:'50%' }}/>
            <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }}/>
            <Icon.Award size={40} style={{ color:'rgba(255,255,255,0.9)', marginBottom:14 }}/>
            <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', marginBottom:10 }}>Ready to start earning?</h2>
            <p style={{ color:'rgba(255,255,255,0.8)', marginBottom:28, fontSize:15, lineHeight:1.6 }}>
              Join thousands of Kenyans earning from honest reviews. Free to join, paid via M-Pesa.
            </p>
            <button onClick={()=>setAuthOpen(true)} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px', borderRadius:12, border:'none', background:'#fff', color:'var(--pink)', fontSize:15, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
              <Icon.ArrowRight size={16}/>Create free account
            </button>
          </div>
        )}
      </main>

      {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuth={u=>{login(u);toast(`Welcome, ${u.name.split(' ')[0]}!`,'success');}}/>}
      <Toast/>
    </>
  );
}
