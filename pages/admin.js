import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useUser } from '../lib/UserContext';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';
import { getFees, summarizeFees, clearFees, FEE_TYPES } from '../lib/feeLedger';
import { EARN_RATES, PUBLISH_FEE_KES, WITHDRAWAL_TAX_RATE, PRO_PRICE_KES, DAILY_FREE_LIMIT, MIN_WITHDRAWAL_KES } from '../lib/config';

const FEE_LABELS = {
  [FEE_TYPES.PUBLISH]: { label: 'Publish verification', color: '#C0185F', bg: 'var(--pink-light)', icon: 'Send' },
  [FEE_TYPES.WITHDRAWAL_TAX]: { label: 'Withdrawal tax', color: '#e53e3e', bg: '#fff5f5', icon: 'ArrowUpRight' },
  [FEE_TYPES.PRO_SUBSCRIPTION]: { label: 'Pro subscription', color: '#D97706', bg: '#fff7ed', icon: 'Zap' },
};

// Simple password gate — not real auth, just keeps casual visitors out.
// Set NEXT_PUBLIC_ADMIN_PASSWORD in your Vercel environment variables to
// override the default. Replace with real authentication before relying
// on this for anything sensitive.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'reviewke-admin';

function ConfigCard({ icon, label, value, sub, color = 'var(--pink)' }) {
  const IC = Icon[icon];
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:'16px 18px', boxShadow:'var(--shadow)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <IC size={14} style={{ color }}/>
        <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, balance } = useUser();
  const { toast, Toast } = useToast();
  const router = useRouter();
  const [notifTitle, setNotifTitle] = useState('New review job available!');
  const [notifBody, setNotifBody] = useState('A new business just opened for review on ReviewKE — tap to earn.');
  const [notifUrl, setNotifUrl] = useState('/businesses');
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(null);

  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [fees, setFees] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = sessionStorage.getItem('reviewke_admin_unlocked');
    if (saved === 'true') setUnlocked(true);
  }, []);

  useEffect(() => {
    if (unlocked) {
      refreshFees();
      fetch('/api/push/stats').then(r => r.json()).then(d => setSubscriberCount(d.subscribers)).catch(() => {});
    }
  }, [unlocked]);

  function refreshFees() {
    setFees(getFees());
  }

  async function handleSendBroadcast() {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast('Title and message are required', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcast: true, title: notifTitle.trim(), body: notifBody.trim(), url: notifUrl || '/businesses' }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Sent to ${data.sent} of ${data.total} subscriber${data.total === 1 ? '' : 's'}`, 'success');
      } else {
        toast(data.reason || 'Failed to send notifications', 'error');
      }
    } catch {
      toast('Failed to send notifications', 'error');
    }
    setSending(false);
  }

  function handleUnlock() {
    if (pwInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      sessionStorage.setItem('reviewke_admin_unlocked', 'true');
    } else {
      toast('Incorrect password', 'error');
    }
  }

  function handleClearLedger() {
    if (!confirm('Clear all recorded fee history on this device? This cannot be undone.')) return;
    clearFees();
    refreshFees();
    toast('Fee ledger cleared', 'success');
  }

  const filtered = fees.filter(f => {
    const matchesType = filterType === 'all' || f.type === filterType;
    const q = search.toLowerCase();
    const matchesSearch = !q || (f.userName || '').toLowerCase().includes(q) || (f.businessName || '').toLowerCase().includes(q) || (f.reference || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const summary = summarizeFees(fees);

  // Today / this week breakdown
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  const todayFees = fees.filter(f => new Date(f.timestamp) >= todayStart);
  const weekFees = fees.filter(f => new Date(f.timestamp) >= weekStart);

  if (!unlocked) {
    return (
      <>
        <Head><title>Admin — ReviewKE</title></Head>
        <Navbar user={user} onAuthClick={()=>{}} balance={balance}/>
        <div style={{ maxWidth:400, margin:'48px auto', padding:'0 20px' }}>
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:32, boxShadow:'var(--shadow-lg)', textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'var(--pink-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <Icon.Shield size={26} style={{ color:'var(--pink)' }}/>
            </div>
            <h1 style={{ fontSize:19, fontWeight:800, marginBottom:8 }}>Admin access</h1>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:20 }}>Enter the admin password to view the fee dashboard.</p>
            <input
              type="password"
              value={pwInput}
              onChange={e=>setPwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Admin password"
              style={{ marginBottom:14 }}
              autoFocus
            />
            <button onClick={handleUnlock} style={{ width:'100%', padding:13, background:'var(--pink)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Unlock dashboard
            </button>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:16, lineHeight:1.5 }}>
              This is a simple device-level gate, not real authentication.
              Replace with proper auth before deploying publicly.
            </p>
          </div>
        </div>
        <Toast/>
      </>
    );
  }

  return (
    <>
      <Head><title>Admin Dashboard — ReviewKE</title></Head>
      <Navbar user={user} onAuthClick={()=>{}} balance={balance}/>

      <style>{`
        .admin-summary { grid-template-columns: repeat(4, 1fr); }
        .admin-config  { grid-template-columns: repeat(3, 1fr); }
        @media(max-width:900px) { .admin-summary { grid-template-columns: repeat(2,1fr) !important; } .admin-config { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:560px) { .admin-summary { grid-template-columns: 1fr !important; } .admin-config { grid-template-columns: 1fr !important; } }
      `}</style>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px 80px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--pink)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:6 }}>Admin only</div>
            <h1 style={{ fontSize:24, fontWeight:800 }}>Fee dashboard</h1>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>All platform fees collected via M-Pesa, recorded on this device</p>
          </div>
          <button onClick={handleClearLedger} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', background:'#fff5f5', border:'1.5px solid #fed7d7', color:'#e53e3e', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Icon.X size={14}/>Clear ledger
          </button>
        </div>

        {/* Data-scope warning */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#fff7ed', border:'1.5px solid #fed7aa', borderRadius:12, padding:'12px 16px', marginBottom:24 }}>
          <Icon.Info size={15} style={{ color:'#D97706', flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:12.5, color:'#92400e', lineHeight:1.6, margin:0 }}>
            This dashboard reads from a local, browser-based ledger — it only shows fees collected in <strong>this browser</strong>, not platform-wide across all users. For a real multi-device admin view, fees need to be written to a shared backend (database or persistent store) instead of localStorage. See the comment at the top of <code>lib/feeLedger.js</code> for the swap-in points.
          </p>
        </div>

        {/* Summary cards */}
        <div className="admin-summary" style={{ display:'grid', gap:14, marginBottom:28 }}>
          <div style={{ background:'linear-gradient(135deg,var(--pink),var(--pink-bright))', borderRadius:16, padding:'20px 22px', color:'#fff', boxShadow:'0 8px 24px rgba(192,24,95,0.25)' }}>
            <div style={{ fontSize:11, fontWeight:700, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Total fees collected</div>
            <div style={{ fontSize:28, fontWeight:900 }}>KES {summary.total.toLocaleString()}</div>
            <div style={{ fontSize:12, opacity:0.8, marginTop:4 }}>{summary.count} transactions</div>
          </div>
          <ConfigCard icon="Clock" label="Today" value={`KES ${todayFees.reduce((s,f)=>s+f.amount,0).toLocaleString()}`} sub={`${todayFees.length} fees`} color="#D97706"/>
          <ConfigCard icon="TrendingUp" label="Last 7 days" value={`KES ${weekFees.reduce((s,f)=>s+f.amount,0).toLocaleString()}`} sub={`${weekFees.length} fees`} color="#059669"/>
          <ConfigCard icon="DollarSign" label="Avg fee size" value={`KES ${summary.count ? Math.round(summary.total/summary.count) : 0}`} sub="per transaction" color="#7C3AED"/>
        </div>

        {/* Breakdown by fee type */}
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Breakdown by fee type</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14 }}>
            {Object.entries(FEE_LABELS).map(([type, cfg]) => {
              const IC = Icon[cfg.icon];
              const amt = summary.byType[type] || 0;
              const count = fees.filter(f => f.type === type).length;
              const pct = summary.total > 0 ? Math.round((amt / summary.total) * 100) : 0;
              return (
                <div key={type} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:'16px 18px', boxShadow:'var(--shadow)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <IC size={15} style={{ color:cfg.color }}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{cfg.label}</div>
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:cfg.color, marginBottom:6 }}>KES {amt.toLocaleString()}</div>
                  <div style={{ height:5, background:'#f1f5f9', borderRadius:3, overflow:'hidden', marginBottom:6 }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:cfg.color, borderRadius:3 }}/>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{count} transactions · {pct}% of total</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Push notifications — alert reviewers about new jobs even when the app is closed */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Send notification</h2>
            <span style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:5 }}>
              <Icon.Zap size={12} style={{ color:'var(--purple)' }}/>
              {subscriberCount === null ? 'Loading...' : `${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`}
            </span>
          </div>
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20, boxShadow:'var(--shadow)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:'var(--purple-light)', border:'1px solid var(--purple-mid)', borderRadius:10, padding:'10px 12px', marginBottom:16 }}>
              <Icon.Info size={13} style={{ color:'var(--purple)', marginTop:1, flexShrink:0 }}/>
              <span style={{ fontSize:11.5, color:'var(--text-secondary)', lineHeight:1.5 }}>
                This sends a real push notification to every reviewer who has enabled notifications — it reaches their device even if ReviewKE isn't open. Use it to announce new review jobs.
              </span>
            </div>
            <div style={{ display:'grid', gap:12, marginBottom:16 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Title</label>
                <input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="New review job available!" maxLength={60}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Message</label>
                <input value={notifBody} onChange={e=>setNotifBody(e.target.value)} placeholder="A new business just opened for review — tap to earn." maxLength={140}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Link <span style={{ fontWeight:400, textTransform:'none' }}>(opens when tapped)</span></label>
                <input value={notifUrl} onChange={e=>setNotifUrl(e.target.value)} placeholder="/businesses or /business/safaricom"/>
              </div>
            </div>
            <button onClick={handleSendBroadcast} disabled={sending || !subscriberCount} style={{
              display:'flex', alignItems:'center', gap:8, padding:'11px 20px',
              background: (sending || !subscriberCount) ? '#eceef3' : 'var(--brand-gradient)',
              color: (sending || !subscriberCount) ? 'var(--text-muted)' : '#fff',
              border:'none', borderRadius:10, fontSize:13.5, fontWeight:700,
              cursor: (sending || !subscriberCount) ? 'not-allowed' : 'pointer',
              boxShadow: (sending || !subscriberCount) ? 'none' : 'var(--shadow-glow-purple)',
            }}>
              <Icon.Send size={14}/>
              {sending ? 'Sending...' : subscriberCount === 0 ? 'No subscribers yet' : `Send to ${subscriberCount ?? '...'} subscriber${subscriberCount === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>

        {/* Current config — read-only display of lib/config.js values */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Current pricing config</h2>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>Edit in <code style={{ background:'#f1f5f9', padding:'2px 6px', borderRadius:4 }}>lib/config.js</code></span>
          </div>
          <div className="admin-config" style={{ display:'grid', gap:12 }}>
            <ConfigCard icon="Star" label="Earn rates (1–5★)" value={Object.values(EARN_RATES).map(v=>`KES ${v}`).join(' / ')} color="var(--green)"/>
            <ConfigCard icon="Send" label="Publish fee" value={PUBLISH_FEE_KES > 0 ? `KES ${PUBLISH_FEE_KES}` : 'Free'} color="var(--pink)"/>
            <ConfigCard icon="ArrowUpRight" label="Withdrawal tax" value={`${Math.round(WITHDRAWAL_TAX_RATE*100)}%`} color="#e53e3e"/>
            <ConfigCard icon="Zap" label="Pro subscription" value={`KES ${PRO_PRICE_KES}/mo`} color="#D97706"/>
            <ConfigCard icon="Grid" label="Free daily limit" value={`${DAILY_FREE_LIMIT} reviews`} color="#7C3AED"/>
            <ConfigCard icon="CreditCard" label="Min withdrawal" value={`KES ${MIN_WITHDRAWAL_KES}`} color="#1D4ED8"/>
          </div>
        </div>

        {/* Transaction log */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Fee transaction log</h2>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ width:'auto', padding:'8px 12px', fontSize:13 }}>
                <option value="all">All types</option>
                {Object.entries(FEE_LABELS).map(([type,cfg]) => <option key={type} value={type}>{cfg.label}</option>)}
              </select>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, business, ref..." style={{ width:220, padding:'8px 12px', fontSize:13 }}/>
            </div>
          </div>

          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', boxShadow:'var(--shadow)' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'56px 20px' }}>
                <Icon.BarChart size={36} style={{ color:'#e2e8f0', marginBottom:12 }}/>
                <div style={{ fontWeight:700, marginBottom:4 }}>No fees recorded yet</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Fees will appear here as users publish reviews, withdraw, or upgrade to Pro</div>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', minWidth:720, borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'#f8f9fc', borderBottom:'1px solid var(--border)' }}>
                      {['Type','User','Phone','Business','Amount','Reference','Date'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f, i) => {
                      const cfg = FEE_LABELS[f.type] || { label: f.type, color:'var(--text)', bg:'#f1f5f9' };
                      return (
                        <tr key={f.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none' }}>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>{cfg.label}</span>
                          </td>
                          <td style={{ padding:'12px 16px', fontWeight:600 }}>{f.userName}</td>
                          <td style={{ padding:'12px 16px', color:'var(--text-secondary)' }}>{f.userPhone || '—'}</td>
                          <td style={{ padding:'12px 16px', color:'var(--text-secondary)' }}>{f.businessName || '—'}</td>
                          <td style={{ padding:'12px 16px', fontWeight:800, color:'var(--green)' }}>KES {f.amount.toLocaleString()}</td>
                          <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontSize:11, fontFamily:'monospace' }}>{f.reference || '—'}</td>
                          <td style={{ padding:'12px 16px', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{new Date(f.timestamp).toLocaleString('en-KE', { dateStyle:'medium', timeStyle:'short' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Toast/>
    </>
  );
}
