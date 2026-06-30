import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';
import { BUSINESSES, CATEGORIES, EARN_RATES } from '../data/businesses';

const RECENT_PAYOUTS = [
  { name:'Wanjiru M.', amount:36865, initials:'WM', color:'#E91E8C' },
  { name:'Otieno K.',  amount:28420, initials:'OK', color:'#7C3AED' },
  { name:'Achieng N.', amount:22100, initials:'AN', color:'#059669' },
  { name:'Kamau J.',   amount:19750, initials:'KJ', color:'#D97706' },
  { name:'Njeri P.',   amount:15300, initials:'NP', color:'#1D4ED8' },
];

function timeAgo(i) {
  const hours = [1,2,3,4,5,6,8,10,12,14][i % 10];
  return `Added ${hours} hr${hours>1?'s':''} ago`;
}

function BusinessCard({ biz, index, onWriteReview }) {
  const [logoOk, setLogoOk] = useState(true);
  const [googleRating, setGoogleRating] = useState(null);

  useEffect(() => {
    if (!biz.placeId) return;
    fetch(`/api/place-photo?placeId=${biz.placeId}`)
      .then(r => r.json())
      .then(d => { if (d.rating) setGoogleRating(d.rating); })
      .catch(() => {});
  }, [biz.placeId]);

  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length - 1);
  const reviewCount = 200 + (seed * 37) % 4600;
  const baseRating  = (2.8 + ((seed * 13) % 22) / 10).toFixed(1);
  const displayRating = parseFloat(googleRating || baseRating).toFixed(1);
  const earnRate = EARN_RATES[5]; // show max earn rate

  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow)', transition:'box-shadow .2s, transform .2s', display:'flex', flexDirection:'column' }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow='var(--shadow-lg)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      {/* Logo/image area */}
      <Link href={`/business/${biz.id}`} style={{ display:'block', textDecoration:'none' }}>
        <div style={{ height:180, background:`linear-gradient(135deg, ${biz.color}22 0%, ${biz.color}10 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
          {/* Dot pattern bg */}
          <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${biz.color}20 1px, transparent 1px)`, backgroundSize:'20px 20px' }} />
          {biz.imageUrl && logoOk ? (
            <img src={biz.imageUrl} alt={biz.name} onError={()=>setLogoOk(false)}
              style={{ maxWidth:'60%', maxHeight:90, objectFit:'contain', filter:'brightness(0) saturate(100%)', opacity:0.85, position:'relative', zIndex:1 }}
            />
          ) : (
            <div style={{ width:80, height:80, borderRadius:20, background:`linear-gradient(135deg,${biz.color},${biz.color}90)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:'#fff', position:'relative', zIndex:1 }}>
              {biz.initial}
            </div>
          )}
          {/* Time badge */}
          <div style={{ position:'absolute', top:12, right:12, fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>{timeAgo(seed)}</div>
          {biz.featured && (
            <div style={{ position:'absolute', top:12, left:12, background:'var(--pink)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, display:'flex', alignItems:'center', gap:3 }}>
              <Icon.Award size={10}/>FEATURED
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
        <Link href={`/business/${biz.id}`} style={{ textDecoration:'none' }}>
          <div style={{ fontSize:17, fontWeight:800, color:'var(--text)', marginBottom:2, lineHeight:1.3 }}>{biz.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
            <Icon.MapPin size={12} style={{ color:'var(--pink)', flexShrink:0 }}/>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{biz.address.split(',').slice(-2).join(',').trim()}</span>
          </div>
          {/* Category badge */}
          <span style={{ display:'inline-block', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background: biz.category==='Banking'?'#EFF6FF': biz.category==='Telecom'?'#F0FDF4': biz.category==='Supermarket'?'#FAF5FF': biz.category==='Insurance'?'#FFF7ED': biz.category==='Healthcare'?'#F0FDF4': biz.category==='Hospitality'?'#FDF4FF':'#F8FAFC', color: biz.category==='Banking'?'#1D4ED8': biz.category==='Telecom'?'#059669': biz.category==='Supermarket'?'#7C3AED': biz.category==='Insurance'?'#D97706': biz.category==='Healthcare'?'#059669': biz.category==='Hospitality'?'#9333EA':'#475569', marginBottom:10 }}>
            {biz.category}
          </span>
        </Link>

        {/* Stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Icon.Star size={14} style={{ color:'#F59E0B', flexShrink:0 }} filled />
            <span style={{ fontSize:13, color:'var(--text)' }}>Rating: <strong>{displayRating}</strong> ({reviewCount.toLocaleString()} reviews)</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Icon.DollarSign size={14} style={{ color:'var(--green)', flexShrink:0 }}/>
            <span style={{ fontSize:13, color:'var(--text)' }}>Earn: <strong style={{ color:'var(--green)' }}>KES 15 – KES 35</strong> per review</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Icon.MapPin size={14} style={{ color:'var(--pink)', flexShrink:0 }}/>
            <span style={{ fontSize:13, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{biz.address}</span>
          </div>
        </div>

        {/* CTA button */}
        <button onClick={() => onWriteReview(biz)} style={{ marginTop:'auto', width:'100%', padding:'12px', borderRadius:10, border:'none', background:'var(--pink)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 3px 10px rgba(233,30,140,0.3)', transition:'all .15s', touchAction:'manipulation' }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--pink-dark)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--pink)'}
        >
          <Icon.Send size={15}/>
          Write Review & Earn KES {earnRate}.00
        </button>
      </div>
    </div>
  );
}

export default function Businesses() {
  const { user, balance, totalEarned, transactions, login, getRemainingTasks, DAILY_FREE_LIMIT } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [category, setCategory]   = useState('All');
  const [search, setSearch]       = useState('');
  const [reviewTarget, setReviewTarget] = useState(null); // biz to review

  const catCounts = {};
  BUSINESSES.forEach(b => { catCounts[b.category] = (catCounts[b.category]||0)+1; });

  const filtered = BUSINESSES.filter(b =>
    (category==='All' || b.category===category) &&
    (b.name.toLowerCase().includes(search.toLowerCase()) ||
     b.category.toLowerCase().includes(search.toLowerCase()) ||
     b.description.toLowerCase().includes(search.toLowerCase()))
  );

  const reviewCount = transactions.filter(t=>t.type==='earn').length;
  const remaining   = getRemainingTasks();

  function handleWriteReview(biz) {
    if (!user) { setAuthOpen(true); return; }
    window.location.href = `/business/${biz.id}`;
  }

  return (
    <>
      <Head>
        <title>Browse Businesses — ReviewKE</title>
        <meta name="description" content="Browse and review 50+ Kenyan businesses. Earn KES per review."/>
      </Head>
      <Navbar user={user} onAuthClick={()=>setAuthOpen(true)} balance={balance}/>

      <style>{`
        .page-layout { display:grid; grid-template-columns:260px 1fr; gap:24px; max-width:1280px; margin:0 auto; padding:28px 24px 80px; }
        .biz-grid    { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        @media(max-width:900px) { .page-layout { grid-template-columns:1fr !important; } .sidebar { display:none !important; } }
        @media(max-width:640px) { .biz-grid { grid-template-columns:1fr !important; } .page-layout { padding:16px 16px 80px !important; } }
        @media(min-width:901px) and (max-width:1100px) { .biz-grid { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>

      <div className="page-layout">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          {/* Filter by category */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'20px', marginBottom:16, boxShadow:'var(--shadow)' }}>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:16 }}>Filter by Type</div>
            {['All',...Object.keys(catCounts)].map(cat => {
              const count = cat==='All' ? BUSINESSES.length : catCounts[cat];
              const active = category===cat;
              return (
                <button key={cat} onClick={()=>setCategory(cat)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:10, border:'none', marginBottom:4, background: active ? 'var(--pink-light)' : 'transparent', color: active ? 'var(--pink)' : 'var(--text)', fontSize:14, fontWeight: active ? 700 : 500, cursor:'pointer', transition:'all .15s' }}>
                  <span>{cat}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: active ? 'var(--pink)' : 'var(--text-muted)' }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Your Status */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'20px', marginBottom:16, boxShadow:'var(--shadow)' }}>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:16 }}>Your Status</div>
            {[
              { icon:'Send', label:'Reviews Submitted', value: `${reviewCount}/${user?.plan==='pro'?'∞':DAILY_FREE_LIMIT}`, color:'var(--pink)' },
              { icon:'DollarSign', label:'Per review', value:'KES 15 – 35', color:'var(--green)' },
              { icon:'Wallet', label:'Wallet balance', value:`KES ${balance.toLocaleString()}`, color:'#7C3AED' },
            ].map(s => {
              const IC = Icon[s.icon];
              return (
                <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-secondary)' }}>
                    <IC size={14} style={{ color:s.color }}/>{s.label}
                  </div>
                  <span style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</span>
                </div>
              );
            })}
            {/* Daily limit bar */}
            {user?.plan !== 'pro' && (
              <div style={{ marginTop:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>Daily reviews used</span>
                  <span style={{ fontSize:11, fontWeight:700, color: remaining<=5?'#D97706':'var(--green)' }}>{DAILY_FREE_LIMIT - remaining}/{DAILY_FREE_LIMIT}</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ width:`${((DAILY_FREE_LIMIT-remaining)/DAILY_FREE_LIMIT)*100}%`, height:'100%', background: remaining<=5?'#F59E0B':'var(--pink)', borderRadius:3, transition:'width .3s' }}/>
                </div>
              </div>
            )}
            {user?.plan === 'pro' && (
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'#fff7ed', borderRadius:8 }}>
                <Icon.Award size={14} style={{ color:'#D97706' }}/><span style={{ fontSize:12, fontWeight:700, color:'#D97706' }}>Pro — Unlimited reviews</span>
              </div>
            )}
          </div>

          {/* Recent Payouts */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'20px', boxShadow:'var(--shadow)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px' }}>Recent Payouts</div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite' }}/>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--green)' }}>Live</span>
              </div>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
            {RECENT_PAYOUTS.map((p,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<RECENT_PAYOUTS.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>{p.initials}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Via M-Pesa</div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:'var(--pink)', flexShrink:0 }}>KSH {p.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div>
          {/* Header + search */}
          <div style={{ marginBottom:22 }}>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Kenyan Businesses</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:16 }}>
              Showing <strong>{filtered.length}</strong> businesses — earn KES 15–35 per review
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:0, background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden', boxShadow:'var(--shadow)' }}>
              <Icon.Search size={16} style={{ color:'var(--text-muted)', flexShrink:0, marginLeft:14 }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${category==='All'?'all businesses':category.toLowerCase()}...`}
                style={{ border:'none', borderRadius:0, padding:'12px 14px', fontSize:14, flex:1, boxShadow:'none' }}/>
            </div>
          </div>

          {/* Mobile category pills */}
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:20 }} className="mobile-cats">
            <style>{`.mobile-cats{display:none!important}@media(max-width:900px){.mobile-cats{display:flex!important}}`}</style>
            {['All',...Object.keys(catCounts)].map(cat => (
              <button key={cat} onClick={()=>setCategory(cat)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, border:'1.5px solid', borderColor: category===cat?'var(--pink)':'var(--border)', background: category===cat?'var(--pink-light)':'#fff', color: category===cat?'var(--pink)':'var(--text-secondary)', cursor:'pointer', whiteSpace:'nowrap' }}>
                {cat} {cat==='All'?BUSINESSES.length:catCounts[cat]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
              <Icon.Search size={44} style={{ color:'var(--border-strong)', marginBottom:14 }}/>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>No results</div>
              <div style={{ fontSize:14, color:'var(--text-secondary)' }}>Try a different search or category</div>
            </div>
          ) : (
            <div className="biz-grid">
              {filtered.map((biz,i) => (
                <BusinessCard key={biz.id} biz={biz} index={i} onWriteReview={handleWriteReview}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuth={u=>{login(u);toast(`Welcome, ${u.name.split(' ')[0]}!`,'success');}}/>}
      <Toast/>
    </>
  );
}
