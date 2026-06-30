import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import UpgradeModal from '../components/UpgradeModal';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';
import { BUSINESSES, INTERNATIONAL_BUSINESSES, CATEGORIES, EARN_RATES, logoUrl, photoUrl, earnRateForBiz } from '../data/businesses';
import { useCurrency } from '../lib/CurrencyContext';

const MIN_EARN = Math.min(...Object.values(EARN_RATES));
const MAX_EARN = Math.max(...Object.values(EARN_RATES));

const RECENT_PAYOUTS = [
  { name:'Wanjiru M.', amount:36865, initials:'WM', color:'#C0185F' },
  { name:'Otieno K.',  amount:28420, initials:'OK', color:'#7C3AED' },
  { name:'Achieng N.', amount:22100, initials:'AN', color:'#059669' },
  { name:'Kamau J.',   amount:19750, initials:'KJ', color:'#D97706' },
  { name:'Njeri P.',   amount:15300, initials:'NP', color:'#1D4ED8' },
];

function timeAgo(seed) {
  const hours = [1,2,3,4,5,6,8,10,12,14][seed % 10];
  return `Added ${hours} hr${hours>1?'s':''} ago`;
}

function BusinessCard({ biz, onWriteReview, isLocked }) {
  const [logoOk, setLogoOk] = useState(true);
  const [photoOk, setPhotoOk] = useState(true);
  const { format } = useCurrency();
  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length-1);
  const reviewCount = 200 + (seed*37) % 4600;
  const displayRating = (2.8 + ((seed*13)%22)/10).toFixed(1);
  const cardMinEarn = earnRateForBiz(biz, Object.keys(EARN_RATES).map(Number).reduce((a,b)=>Math.min(a,b)));
  const cardMaxEarn = earnRateForBiz(biz, 5);

  const catColors = {
    Banking:{bg:'#EFF6FF',fg:'#1D4ED8'}, Telecom:{bg:'#F0FDF4',fg:'#059669'},
    Supermarket:{bg:'#FAF5FF',fg:'#7C3AED'}, Insurance:{bg:'#FFF7ED',fg:'#D97706'},
    Healthcare:{bg:'#F0FDF4',fg:'#059669'}, Hospitality:{bg:'#FDF4FF',fg:'#9333EA'},
    Fuel:{bg:'#FFF7ED',fg:'#D97706'}, Transport:{bg:'#EFF6FF',fg:'#1D4ED8'},
    'E-Commerce':{bg:'#FFF7ED',fg:'#D97706'}, Government:{bg:'#FEF2F2',fg:'#DC2626'},
    Education:{bg:'#EFF6FF',fg:'#1D4ED8'}, 'Real Estate':{bg:'#F0FDF4',fg:'#059669'},
    Tech:{bg:'#F5F0FE',fg:'#7C3AED'},
  };
  const cc = catColors[biz.category] || {bg:'#F8FAFC',fg:'#475569'};

  return (
    <div style={{ background:'#fff', borderRadius:18, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow)', transition:'box-shadow .2s, transform .2s', display:'flex', flexDirection:'column', position:'relative' }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow='var(--shadow-lg)'; e.currentTarget.style.transform='translateY(-3px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      {isLocked && (
        <div onClick={() => onWriteReview(biz)} style={{ position:'absolute', inset:0, zIndex:5, background:'rgba(20,20,31,0.55)', backdropFilter:'blur(2px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', borderRadius:18, padding:20, textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'var(--brand-gradient)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, boxShadow:'var(--shadow-glow-purple)' }}>
            <Icon.Shield size={22} style={{ color:'#fff' }}/>
          </div>
          <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:4 }}>Pro members only</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:14, maxWidth:200 }}>Upgrade to unlock international review jobs</div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', color:'var(--purple)', fontSize:12, fontWeight:700, padding:'7px 16px', borderRadius:20 }}>
            <Icon.Zap size={12}/>Upgrade to Pro
          </span>
        </div>
      )}

      <Link href={`/business/${biz.id}`} style={{ display:'block', textDecoration:'none', pointerEvents: isLocked ? 'none' : 'auto' }}>
        <div style={{ height:170, position:'relative', overflow:'hidden', background: photoOk ? '#f1f5f9' : `linear-gradient(135deg, ${biz.color}20 0%, ${biz.color}06 100%)` }}>
          {photoOk && (
            <img
              src={photoUrl(biz, 600)}
              alt=""
              onError={() => setPhotoOk(false)}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
            />
          )}
          {!photoOk && <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${biz.color}18 1.5px, transparent 1.5px)`, backgroundSize:'22px 22px' }}/>}

          {/* Logo: centered hero badge when no real photo, small corner badge when there is one */}
          {photoOk ? (
            logoOk && (
              <div style={{ position:'absolute', bottom:10, left:10, width:40, height:40, borderRadius:10, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-md)', padding:6, zIndex:1 }}>
                <img src={logoUrl(biz,80)} alt={biz.name} onError={()=>setLogoOk(false)} style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
              </div>
            )
          ) : (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {logoOk ? (
                <img src={logoUrl(biz,128)} alt={biz.name} onError={()=>setLogoOk(false)}
                  style={{ width:84, height:84, objectFit:'contain', position:'relative', zIndex:1, background:'#fff', borderRadius:18, padding:14, boxShadow:'var(--shadow)' }}/>
              ) : (
                <div style={{ width:84, height:84, borderRadius:18, background:`linear-gradient(135deg,${biz.color},${biz.color}90)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:'#fff', position:'relative', zIndex:1, boxShadow:'var(--shadow)' }}>
                  {biz.initial}
                </div>
              )}
            </div>
          )}

          <div style={{ position:'absolute', top:12, right:12, fontSize:11, color: photoOk ? '#fff' : 'var(--text-muted)', fontWeight:500, background: photoOk ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', padding:'3px 9px', borderRadius:20, zIndex:1 }}>{timeAgo(seed)}</div>
          {biz.featured && (
            <div style={{ position:'absolute', top:12, left:12, background:'var(--pink)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:3, zIndex:1 }}>
              <Icon.Award size={10}/>FEATURED
            </div>
          )}
          {biz.region === 'international' && !biz.featured && (
            <div style={{ position:'absolute', top:12, left:12, background:'var(--brand-gradient)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:3, zIndex:1 }}>
              <Icon.Globe size={10}/>GLOBAL
            </div>
          )}
        </div>
      </Link>

      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
        <Link href={`/business/${biz.id}`} style={{ textDecoration:'none', pointerEvents: isLocked ? 'none' : 'auto' }}>
          <div style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:5 }}>{biz.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <Icon.MapPin size={12} style={{ color:'var(--pink)', flexShrink:0 }}/>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{biz.address.split(',').slice(-2).join(',').trim()}</span>
          </div>
          <span style={{ display:'inline-block', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:cc.bg, color:cc.fg }}>{biz.category}</span>
        </Link>

        <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:2 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Icon.Star size={13} filled style={{ color:'#F59E0B', flexShrink:0 }}/>
            <span style={{ fontSize:13 }}>Rating: <strong>{displayRating}</strong> ({reviewCount.toLocaleString()})</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Icon.DollarSign size={13} style={{ color:'var(--green)', flexShrink:0 }}/>
            <span style={{ fontSize:13 }}>Earn: <strong style={{ color:'var(--green)' }}>{format(cardMinEarn)} – {format(cardMaxEarn)}</strong></span>
          </div>
        </div>

        <button onClick={() => onWriteReview(biz)} style={{ marginTop:'auto', width:'100%', padding:'12px', borderRadius:11, border:'none', background:'var(--brand-gradient)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'var(--shadow-glow-pink)', transition:'all .15s' }}>
          <Icon.Send size={14}/>Write Review & Earn {format(cardMaxEarn)}
        </button>
      </div>
    </div>
  );
}

export default function Businesses() {
  const { user, balance, transactions, login, getRemainingTasks, DAILY_FREE_LIMIT, upgradePro, setReviewPreference } = useUser();
  const { toast, Toast } = useToast();
  const { format } = useCurrency();
  const [authOpen, setAuthOpen]     = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');

  // Which region's businesses to show. Defaults to the signed-in user's
  // saved preference from signup; falls back to "local" for guests.
  const [regionView, setRegionView] = useState(user?.reviewPreference || 'local');

  const isPro = user?.plan === 'pro';

  // Build the working set of businesses based on the region toggle.
  const sourceBusinesses =
    regionView === 'international' ? INTERNATIONAL_BUSINESSES :
    regionView === 'both' ? [...BUSINESSES, ...INTERNATIONAL_BUSINESSES] :
    BUSINESSES;

  const catCounts = {};
  sourceBusinesses.forEach(b => { catCounts[b.category] = (catCounts[b.category]||0)+1; });

  const filtered = sourceBusinesses.filter(b =>
    (category==='All' || b.category===category) &&
    (b.name.toLowerCase().includes(search.toLowerCase()) ||
     b.category.toLowerCase().includes(search.toLowerCase()) ||
     b.description.toLowerCase().includes(search.toLowerCase()))
  );

  const reviewCount = transactions.filter(t=>t.type==='earn').length;
  const remaining   = getRemainingTasks();

  function handleWriteReview(biz) {
    if (!user) { setAuthOpen(true); return; }
    if (biz.region === 'international' && !isPro) { setUpgradeOpen(true); return; }
    if (remaining <= 0 && !isPro) { setUpgradeOpen(true); return; }
    window.location.href = `/business/${biz.id}`;
  }

  function changeRegionView(view) {
    if (view === 'international' && !isPro) { setUpgradeOpen(true); return; }
    setRegionView(view);
    if (user) setReviewPreference(view);
  }

  return (
    <>
      <Head>
        <title>Browse Businesses — ReviewKE</title>
        <meta name="description" content="Browse and review 50+ Kenyan businesses. Earn KES per review."/>
      </Head>
      <Navbar user={user} onAuthClick={()=>setAuthOpen(true)} balance={balance}/>

      <style>{`
        .page-layout { display:grid; grid-template-columns:264px 1fr; gap:24px; max-width:1280px; margin:0 auto; padding:28px 24px 80px; background:#fff; }
        .biz-grid    { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        @media(max-width:900px) { .page-layout { grid-template-columns:1fr !important; } .sidebar { display:none !important; } }
        @media(max-width:640px) { .biz-grid { grid-template-columns:1fr !important; } .page-layout { padding:16px 16px 80px !important; } }
        @media(min-width:901px) and (max-width:1100px) { .biz-grid { grid-template-columns:repeat(2,1fr) !important; } }
        .mobile-cats { display:none !important; } @media(max-width:900px){ .mobile-cats{ display:flex !important; } }
      `}</style>

      <div className="page-layout">
        <aside className="sidebar">
          {/* Region toggle: local / international / both */}
          <div className="glass-card" style={{ borderRadius:18, padding:20, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Review Jobs</div>
            {[
              { id:'local', label:'Local businesses', icon:'MapPin', count: BUSINESSES.length },
              { id:'international', label:'International', icon:'Globe', count: INTERNATIONAL_BUSINESSES.length, pro:true },
              { id:'both', label:'Both', icon:'Grid', count: BUSINESSES.length + INTERNATIONAL_BUSINESSES.length },
            ].map(r => {
              const RC = Icon[r.icon];
              const active = regionView === r.id;
              const locked = r.pro && !isPro;
              return (
                <button key={r.id} onClick={()=>changeRegionView(r.id)} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:10, border:'none', marginBottom:4,
                  background: active ? 'var(--brand-gradient-soft)' : 'transparent',
                  cursor:'pointer', textAlign:'left',
                }}>
                  <RC size={15} style={{ color: active ? 'var(--purple)' : 'var(--text-muted)', flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:13, fontWeight: active?700:500, color: active ? 'var(--text)' : 'var(--text-secondary)' }}>{r.label}</span>
                  {locked && <Icon.Shield size={12} style={{ color:'#D97706' }}/>}
                  <span style={{ fontSize:11, fontWeight:700, color: active ? 'var(--purple)' : 'var(--text-muted)' }}>{r.count}</span>
                </button>
              );
            })}
            {!isPro && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text-muted)' }}>
                <Icon.Info size={11} style={{ flexShrink:0 }}/>International jobs need Pro
              </div>
            )}
          </div>

          <div className="glass-card" style={{ borderRadius:18, padding:20, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:16 }}>Filter by Type</div>
            {['All',...Object.keys(catCounts)].map(cat => {
              const count = cat==='All' ? sourceBusinesses.length : catCounts[cat];
              const active = category===cat;
              return (
                <button key={cat} onClick={()=>setCategory(cat)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:10, border:'none', marginBottom:4, background: active?'var(--pink-light)':'transparent', color: active?'var(--pink)':'var(--text)', fontSize:14, fontWeight: active?700:500, cursor:'pointer' }}>
                  <span>{cat}</span><span style={{ fontSize:13, fontWeight:700, color: active?'var(--pink)':'var(--text-muted)' }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="glass-card" style={{ borderRadius:18, padding:20, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:16 }}>Your Status</div>
            {[
              { icon:'Send', label:'Reviews Submitted', value:`${reviewCount}/${user?.plan==='pro'?'∞':DAILY_FREE_LIMIT}`, color:'var(--pink)' },
              { icon:'DollarSign', label:'Per review', value:`${format(MIN_EARN)}–${format(MAX_EARN)}`, color:'var(--green)' },
              { icon:'Wallet', label:'Balance', value:format(balance), color:'#7C3AED' },
            ].map(s => {
              const IC = Icon[s.icon];
              return (
                <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-secondary)' }}><IC size={14} style={{ color:s.color }}/>{s.label}</div>
                  <span style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</span>
                </div>
              );
            })}
            {user?.plan !== 'pro' ? (
              <>
                <div style={{ marginTop:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>Daily reviews used</span>
                    <span style={{ fontSize:11, fontWeight:700, color: remaining<=5?'#D97706':'var(--green)' }}>{DAILY_FREE_LIMIT-remaining}/{DAILY_FREE_LIMIT}</span>
                  </div>
                  <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${((DAILY_FREE_LIMIT-remaining)/DAILY_FREE_LIMIT)*100}%`, height:'100%', background: remaining<=5?'#F59E0B':'var(--pink)', borderRadius:3, transition:'width .3s' }}/>
                  </div>
                </div>
                <button onClick={()=>setUpgradeOpen(true)} style={{ width:'100%', marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px', background:'linear-gradient(135deg,#fff7ed,#fffbeb)', border:'1.5px solid #fed7aa', color:'#D97706', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  <Icon.Zap size={13}/>Upgrade to Pro
                </button>
              </>
            ) : (
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'#fff7ed', borderRadius:8 }}>
                <Icon.Award size={14} style={{ color:'#D97706' }}/><span style={{ fontSize:12, fontWeight:700, color:'#D97706' }}>Pro — Unlimited reviews</span>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ borderRadius:18, padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px' }}>Recent Payouts</div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite' }}/>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--green)' }}>Live</span>
              </div>
            </div>
            {RECENT_PAYOUTS.map((p,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<RECENT_PAYOUTS.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>{p.initials}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Via M-Pesa</div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:'var(--pink)', flexShrink:0 }}>{format(p.amount)}</div>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div style={{ marginBottom:22 }}>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>
              {regionView === 'international' ? 'International Businesses' : regionView === 'both' ? 'All Review Jobs' : 'Kenyan Businesses'}
            </h1>
            <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:16 }}>Showing <strong>{filtered.length}</strong> businesses — earn {format(MIN_EARN)}–{format(MAX_EARN)} per review</p>
            <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid var(--border-strong)', borderRadius:10, overflow:'hidden', boxShadow:'var(--shadow)' }}>
              <Icon.Search size={16} style={{ color:'var(--text-muted)', flexShrink:0, marginLeft:14 }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${category==='All'?'all businesses':category.toLowerCase()}...`} style={{ border:'none', borderRadius:0, padding:'12px 14px', fontSize:14, flex:1 }}/>
            </div>
          </div>

          <div className="mobile-cats" style={{ gap:7, flexWrap:'wrap', marginBottom:20 }}>
            {['All',...Object.keys(catCounts)].map(cat => (
              <button key={cat} onClick={()=>setCategory(cat)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, border:'1.5px solid', borderColor: category===cat?'var(--pink)':'var(--border)', background: category===cat?'var(--pink-light)':'#fff', color: category===cat?'var(--pink)':'var(--text-secondary)', cursor:'pointer', whiteSpace:'nowrap' }}>
                {cat} {cat==='All'?sourceBusinesses.length:catCounts[cat]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff', borderRadius:18, border:'1px solid var(--border)' }}>
              <Icon.Search size={44} style={{ color:'var(--border-strong)', marginBottom:14 }}/>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>No results</div>
              <div style={{ fontSize:14, color:'var(--text-secondary)' }}>Try a different search or category</div>
            </div>
          ) : (
            <div className="biz-grid">
              {filtered.map(biz => <BusinessCard key={biz.id} biz={biz} onWriteReview={handleWriteReview} isLocked={biz.region === 'international' && !isPro}/>)}
            </div>
          )}
        </div>
      </div>

      {upgradeOpen && <UpgradeModal user={user} onClose={()=>setUpgradeOpen(false)} onSuccess={()=>{upgradePro();setUpgradeOpen(false);toast('Pro plan activated!','success');}}/>}
      {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuth={u=>{login(u);toast(`Welcome, ${u.name.split(' ')[0]}!`,'success');}}/>}
      <Toast/>
    </>
  );
}
