import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';

const TX_STYLES = {
  earn: { bg: 'rgba(0,200,83,0.08)', icon: 'rgba(0,200,83,0.12)', iconColor: '#00C853', amountColor: '#00C853', IconComp: 'TrendingUp', sign: '+' },
  tax: { bg: 'transparent', icon: 'rgba(255,59,59,0.1)', iconColor: '#FF3B3B', amountColor: '#FF3B3B', IconComp: 'ArrowUpRight', sign: '-' },
  withdraw: { bg: 'transparent', icon: 'rgba(99,102,241,0.1)', iconColor: '#818cf8', amountColor: '#818cf8', IconComp: 'Send', sign: '-' },
};

export default function Wallet() {
  const { user, balance, totalEarned, totalTax, transactions, login, withdraw } = useUser();
  const { toast, Toast } = useToast();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [wdOpen, setWdOpen] = useState(false);
  const [wdAmt, setWdAmt] = useState('');
  const [wdPhone, setWdPhone] = useState('');
  const [wdStep, setWdStep] = useState('form');

  function handleWithdraw() {
    const amt = parseInt(wdAmt);
    if (!amt || amt < 100) { toast('Minimum withdrawal is KES 100', 'error'); return; }
    if (amt > balance) { toast('Insufficient balance', 'error'); return; }
    if (wdPhone.length < 9) { toast('Enter your Safaricom number', 'error'); return; }
    setWdStep('pending');
    setTimeout(() => { withdraw(amt); setWdStep('success'); }, 2500);
  }

  const reviewCount = transactions.filter(t => t.type === 'earn').length;

  return (
    <>
      <Head><title>My Wallet — ReviewKE</title></Head>
      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 100px' }}>
        {!user ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Icon.Wallet size={36} style={{ color: '#00C853' }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Your wallet</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Sign in to see your earnings and withdraw via M-Pesa.</p>
            <button onClick={() => setAuthOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'linear-gradient(135deg,#00C853,#007A3D)', color: '#000', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(0,200,83,0.3)' }}>
              <Icon.User size={17} /> Sign in to continue
            </button>
          </div>
        ) : (
          <>
            {/* Balance hero */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(0,200,83,0.15) 0%, rgba(0,122,61,0.08) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,200,83,0.2)',
              borderRadius: 24, padding: 'clamp(24px,4vw,36px)',
              marginBottom: 24, overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,200,83,0.15), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Available balance</div>
              <div style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 900, fontFamily: "'Syne', sans-serif", color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
                KES {balance.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
                Total earned: KES {totalEarned.toLocaleString()} · Fees paid: KES {totalTax.toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => {
                  if (balance < 100) { toast('Minimum balance KES 100 to withdraw', 'error'); return; }
                  setWdAmt(String(balance));
                  setWdPhone((user.phone || '').replace(/^0/, ''));
                  setWdStep('form'); setWdOpen(true);
                }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Icon.CreditCard size={15} /> Withdraw to M-Pesa
                </button>
                <button onClick={() => router.push('/businesses')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <Icon.Star size={15} /> Write a review
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
              {[
                { lbl: 'Total earned', val: `KES ${totalEarned.toLocaleString()}`, color: '#00C853', icon: 'TrendingUp' },
                { lbl: 'Reviews written', val: reviewCount, color: '#a78bfa', icon: 'Star' },
                { lbl: 'Fees paid', val: `KES ${totalTax.toLocaleString()}`, color: 'rgba(255,255,255,0.5)', icon: 'ArrowUpRight' },
              ].map(s => {
                const IconComp = Icon[s.icon];
                return (
                  <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <IconComp size={13} style={{ color: s.color }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.lbl}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  </div>
                );
              })}
            </div>

            {/* Transactions */}
            <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.Clock size={15} style={{ color: 'rgba(255,255,255,0.35)' }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Transaction history</span>
              </div>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px' }}>
                  <Icon.BarChart size={40} style={{ color: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>No transactions yet</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>Write your first review to earn!</div>
                  <button onClick={() => router.push('/businesses')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', color: '#00C853', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Icon.Grid size={14} /> Browse businesses
                  </button>
                </div>
              ) : (
                transactions.map((tx, i) => {
                  const ts = TX_STYLES[tx.type] || TX_STYLES.earn;
                  const IconComp = Icon[ts.IconComp];
                  return (
                    <div key={tx.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 24px',
                      borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: ts.bg,
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: ts.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconComp size={17} style={{ color: ts.iconColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{tx.desc}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{tx.date}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: ts.amountColor, flexShrink: 0 }}>
                        {ts.sign} KES {Math.abs(tx.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* Withdraw modal */}
      {wdOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'rgba(13,18,32,0.97)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 40px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s ease' }}>
            {wdStep === 'form' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800 }}>Withdraw to M-Pesa</h3>
                  <button onClick={() => setWdOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                    <Icon.X size={15} />
                  </button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Amount (KES)</div>
                  <input value={wdAmt} onChange={e => setWdAmt(e.target.value)} type="number" min="100" max={balance} placeholder="Min KES 100" />
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>Available: KES {balance.toLocaleString()}</div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>M-Pesa number</div>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
                    <span style={{ padding: '0 14px', fontWeight: 700, color: '#00C853', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', fontSize: 14 }}>+254</span>
                    <input value={wdPhone} onChange={e => setWdPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="712345678" type="tel" style={{ border: 'none', background: 'transparent', borderRadius: 0, flex: 1 }} />
                  </div>
                </div>
                <button onClick={handleWithdraw} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#FFB800,#FF8800)', color: '#000', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 24px rgba(255,184,0,0.25)' }}>
                  <Icon.Send size={16} /> Withdraw KES {parseInt(wdAmt) || 0}
                </button>
              </>
            )}
            {wdStep === 'pending' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Processing...</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Sending KES {wdAmt} to +254 {wdPhone}</p>
              </div>
            )}
            {wdStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Icon.CheckCircle size={36} style={{ color: '#00C853' }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#00C853', marginBottom: 8 }}>Sent!</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24 }}>KES {wdAmt} sent to your M-Pesa +254 {wdPhone}</p>
                <button onClick={() => setWdOpen(false)} style={{ padding: '11px 32px', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', color: '#00C853', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={u => { login(u); toast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success'); }} />}
      <Toast />
    </>
  );
}
