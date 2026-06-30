import React from 'react';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import UpgradeModal from '../components/UpgradeModal';
import { useUser, TAX_RATE_WITHDRAW } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import { useCurrency } from '../lib/CurrencyContext';
import { useCelebration } from '../components/Celebration';
import Icon from '../lib/icons';
import { recordFee, FEE_TYPES } from '../lib/feeLedger';
import { MIN_WITHDRAWAL_KES } from '../lib/config';

const TX_STYLES = {
  earn:     { iconBg: 'var(--pink-light)',   iconColor: 'var(--pink)',   amountColor: 'var(--pink)',   IconName: 'TrendingUp',  sign: '+' },
  tax:      { iconBg: '#fff5f5',             iconColor: '#e53e3e',       amountColor: '#e53e3e',       IconName: 'ArrowUpRight',sign: '-' },
  withdraw: { iconBg: 'var(--purple-light)', iconColor: 'var(--purple)', amountColor: 'var(--purple)', IconName: 'Send',        sign: '-' },
  upgrade:  { iconBg: '#fff7ed',             iconColor: '#D97706',       amountColor: '#D97706',       IconName: 'Zap',         sign: '-' },
};

function PendingTimer({ releaseDate }) {
  const release = new Date(releaseDate);
  const now     = new Date();
  const diffMs  = release - now;
  if (diffMs <= 0) return <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12 }}>Processing</span>;
  const hrs  = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#D97706', fontWeight: 700, fontSize: 12 }}>
      <Icon.Clock size={12} />
      {hrs}h {mins}m remaining
    </span>
  );
}

export default function Wallet() {
  const { user, balance, totalEarned, totalTax, transactions, login, withdraw, upgradePro, getRemainingTasks, DAILY_FREE_LIMIT } = useUser();
  const { toast, Toast } = useToast();
  const { format } = useCurrency();
  const { celebrate, Celebration } = useCelebration();
  const router = useRouter();
  const [authOpen, setAuthOpen]   = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [wdOpen, setWdOpen]       = useState(false);
  const [wdAmt, setWdAmt]         = useState('');
  const [wdPhone, setWdPhone]     = useState('');
  const [wdStep, setWdStep]       = useState('form'); // form | confirm | paying | failed | pending_72
  const [wdResult, setWdResult]   = useState({ net: 0, tax: 0 });
  const [wdRef, setWdRef]         = useState('');

  const reviewCount = transactions.filter(t => t.type === 'earn').length;
  const remaining   = getRemainingTasks();
  const TAX_PCT     = Math.round(TAX_RATE_WITHDRAW * 100);

  function openWithdraw() {
    if (balance < MIN_WITHDRAWAL_KES) { toast(`Minimum balance is ${format(MIN_WITHDRAWAL_KES)} to withdraw`, 'error'); return; }
    setWdAmt(String(balance));
    setWdPhone((user?.phone || '').replace(/^0/, ''));
    setWdStep('form');
    setWdOpen(true);
  }

  function goToConfirm() {
    const amt = parseInt(wdAmt);
    if (!amt || amt < MIN_WITHDRAWAL_KES) { toast(`Minimum withdrawal is ${format(MIN_WITHDRAWAL_KES)}`, 'error'); return; }
    if (amt > balance)      { toast('Insufficient balance', 'error'); return; }
    if (wdPhone.length < 9) { toast('Enter your Safaricom number', 'error'); return; }
    setWdStep('confirm');
  }

  async function handlePay() {
    const amt = parseInt(wdAmt);
    const tax = Math.round(amt * TAX_RATE_WITHDRAW);
    const net = amt - tax;
    const ref = `RKE-WD-${Date.now()}`;
    setWdRef(ref);
    setWdStep('paying');

    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '0' + wdPhone, amount: tax, name: user?.name || 'Reviewer', reference: ref }),
      });
      const data = await res.json();
      if (!data.success) { setWdStep('failed'); return; }
      pollWithdrawStatus(ref, amt);
    } catch {
      setWdStep('failed');
    }
  }

  async function pollWithdrawStatus(ref, amt, attempt = 0) {
    const MAX_ATTEMPTS = 15;
    if (attempt >= MAX_ATTEMPTS) {
      setWdStep('failed');
      toast('Tax payment timed out. Please try again.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/pay-status?reference=${ref}`);
      const data = await res.json();

      if (data.status === 'SUCCESS') {
        const result = withdraw(amt);
        recordFee({ type: FEE_TYPES.WITHDRAWAL_TAX, amount: result.tax, userName: user?.name, userPhone: user?.phone, reference: ref });
        celebrate(result.net, 'Withdrawal confirmed — on its way to M-Pesa');
        setWdResult(result);
        setWdStep('pending_72');
        return;
      }
      if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        setWdStep('failed');
        toast('M-Pesa tax payment was not completed.', 'error');
        return;
      }
      setTimeout(() => pollWithdrawStatus(ref, amt, attempt + 1), 3000);
    } catch {
      setTimeout(() => pollWithdrawStatus(ref, amt, attempt + 1), 3000);
    }
  }

  return (
    <>
      <Head><title>My Wallet — ReviewKE</title></Head>
      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <style>{`
        .wallet-stats { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 480px) {
          .wallet-stats { grid-template-columns: 1fr !important; }
          .wallet-hero-actions { flex-direction: column !important; }
          .wallet-hero-actions button { width: 100% !important; justify-content: center !important; }
        }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 100px' }}>
        {!user ? (
          <div style={{ textAlign: 'center', padding: '80px 16px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--brand-gradient-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon.Wallet size={32} style={{ color: 'var(--pink)' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Your wallet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Sign in to see your earnings and withdraw via M-Pesa.</p>
            <button onClick={() => setAuthOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: 'var(--brand-gradient)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-glow-pink)' }}>
              <Icon.User size={16} /> Sign in to continue
            </button>
          </div>
        ) : (
          <>
            {/* Balance hero — gradient glass */}
            <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', background: 'var(--brand-gradient)', borderRadius: 22, padding: '28px 24px', marginBottom: 20, border: 'none' }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -30, width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)', pointerEvents: 'none' }} />
              <div className="text-on-color" style={{ position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Available balance</div>
                <div style={{ fontSize: 'clamp(32px,8vw,48px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 4 }}>{format(balance)}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>Total earned: {format(totalEarned)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 12 }}>
                  <Icon.Info size={13} style={{ flexShrink: 0 }} />
                  A {TAX_PCT}% withholding tax is deducted when you withdraw. No charge to publish reviews.
                </div>
                <div className="wallet-hero-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={openWithdraw} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#fff', border: 'none', color: 'var(--pink)', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <Icon.CreditCard size={14} /> Withdraw to M-Pesa
                  </button>
                  <button onClick={() => router.push('/businesses')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    <Icon.Star size={14} /> Write a review
                  </button>
                </div>
              </div>
            </div>

            {/* Daily tasks banner */}
            <div className="glass-card" style={{ borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, border: `1.5px solid ${remaining <= 5 ? '#fed7aa' : 'var(--border)'}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, color: 'var(--text)' }}>Daily reviews</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {user?.plan === 'pro' ? 'Pro plan — unlimited reviews' : `${remaining} of ${DAILY_FREE_LIMIT} remaining today`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user?.plan !== 'pro' && (
                  <div style={{ width: 120, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${((DAILY_FREE_LIMIT - remaining) / DAILY_FREE_LIMIT) * 100}%`, height: '100%', background: remaining <= 5 ? '#F59E0B' : 'var(--brand-gradient)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                )}
                {user?.plan !== 'pro' && (
                  <button onClick={() => setUpgradeOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#D97706', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    <Icon.Zap size={12} /> Upgrade
                  </button>
                )}
                {user?.plan === 'pro' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#D97706', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}><Icon.Award size={12} /> Pro</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="wallet-stats" style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {[
                { lbl: 'Total earned', val: format(totalEarned), color: 'var(--pink)',   icon: 'TrendingUp' },
                { lbl: 'Reviews written', val: String(reviewCount), color: 'var(--purple)', icon: 'Star' },
                { lbl: 'Tax paid', val: format(totalTax), color: 'var(--text-secondary)', icon: 'ArrowUpRight' },
              ].map(s => {
                const IconComp = Icon[s.icon];
                return (
                  <div key={s.lbl} className="glass-card" style={{ borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                      <IconComp size={12} style={{ color: s.color }} />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.lbl}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                  </div>
                );
              })}
            </div>

            {/* Transaction list */}
            <div className="glass-card" style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.Clock size={14} style={{ color: 'var(--purple)' }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Transaction history</span>
              </div>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <Icon.BarChart size={36} style={{ color: '#e2e8f0', marginBottom: 12 }} />
                  <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>No transactions yet</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Write your first review to earn — no upfront fees</div>
                  <button onClick={() => router.push('/businesses')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'var(--pink-light)', border: '1.5px solid var(--pink-mid)', color: 'var(--pink)', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Icon.Grid size={13} /> Browse businesses
                  </button>
                </div>
              ) : (
                transactions.map((tx, i) => {
                  const ts = TX_STYLES[tx.type] || TX_STYLES.earn;
                  const IconComp = Icon[ts.IconName];
                  return (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: ts.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconComp size={16} style={{ color: ts.iconColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{tx.desc}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span>{tx.date}</span>
                          {tx.pending && tx.releaseDate && <PendingTimer releaseDate={tx.releaseDate} />}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: ts.amountColor, flexShrink: 0 }}>
                        {ts.sign} {format(Math.abs(tx.amount))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* Withdraw bottom sheet */}
      {wdOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(20,20,31,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => wdStep !== 'paying' && setWdOpen(false)}>
          <div className="glass-card" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottom: 'none', borderLeft: 'none', borderRight: 'none', padding: '12px 24px env(safe-area-inset-bottom,32px)', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s ease', background: '#fff' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 20px' }} />

            {wdStep === 'form' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Withdraw to M-Pesa</h3>
                  <button onClick={() => setWdOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}><Icon.X size={13} /></button>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={lbl}>Amount (KES)</div>
                  <input value={wdAmt} onChange={e => setWdAmt(e.target.value)} type="number" min={MIN_WITHDRAWAL_KES} max={balance} placeholder={`Min KES ${MIN_WITHDRAWAL_KES}`} inputMode="numeric" />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Available: {format(balance)}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={lbl}>M-Pesa number</div>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--border-strong)', borderRadius: 10, overflow: 'hidden' }}>
                    <span style={{ padding: '0 14px', fontWeight: 700, color: 'var(--pink)', borderRight: '1.5px solid var(--border)', whiteSpace: 'nowrap', fontSize: 14, display: 'flex', alignItems: 'center' }}>+254</span>
                    <input value={wdPhone} onChange={e => setWdPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="712345678" type="tel" inputMode="numeric" style={{ border: 'none', background: 'transparent', borderRadius: 0, flex: 1, color: 'var(--text)', WebkitTextFillColor: 'var(--text)', fontSize: 16 }} />
                  </div>
                </div>
                {parseInt(wdAmt) >= MIN_WITHDRAWAL_KES && (
                  <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Gross withdrawal</span>
                      <span style={{ color: 'var(--text)' }}>{format(parseInt(wdAmt))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: '#e53e3e' }}>Withholding tax ({TAX_PCT}%)</span>
                      <span style={{ color: '#e53e3e' }}>- {format(Math.round(parseInt(wdAmt) * TAX_RATE_WITHDRAW))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 15, fontWeight: 700 }}>
                      <span style={{ color: 'var(--text)' }}>You receive</span>
                      <span style={{ color: 'var(--green)' }}>{format(parseInt(wdAmt) - Math.round(parseInt(wdAmt) * TAX_RATE_WITHDRAW))}</span>
                    </div>
                  </div>
                )}
                <button onClick={goToConfirm} style={{ width: '100%', padding: 14, background: 'var(--brand-gradient)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-glow-purple)' }}>
                  <Icon.ArrowRight size={15} /> Review withdrawal
                </button>
              </>
            )}

            {wdStep === 'confirm' && (() => {
              const amt = parseInt(wdAmt);
              const tax = Math.round(amt * TAX_RATE_WITHDRAW);
              const net = amt - tax;
              const rows = [
                { label: 'Gross amount', value: format(amt), color: 'var(--text)' },
                { label: `Tax (${TAX_PCT}%)`, value: `- ${format(tax)}`, color: '#e53e3e' },
                { label: 'You receive', value: format(net), color: 'var(--green)', bold: true },
                { label: 'M-Pesa number', value: `+254 ${wdPhone}`, color: 'var(--text-secondary)' },
              ];
              return (
                <>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>Confirm withdrawal</h3>
                  <div style={{ background: '#f8f9fc', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    {rows.map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: row.label !== 'M-Pesa number' ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span style={{ fontSize: row.bold ? 16 : 14, fontWeight: row.bold ? 800 : 600, color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                    <Icon.Smartphone size={14} style={{ color: '#D97706', marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5, margin: 0 }}>
                      You will receive an M-Pesa STK Push to pay the {format(tax)} tax. After confirming, your {format(net)} withdrawal will be processed within <strong>72 hours</strong>.
                    </p>
                  </div>
                  <button onClick={handlePay} style={{ width: '100%', padding: 14, background: 'var(--brand-gradient)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-glow-purple)', marginBottom: 10 }}>
                    <Icon.Smartphone size={16} /> Pay tax & withdraw {format(net)}
                  </button>
                  <button onClick={() => setWdStep('form')} style={{ width: '100%', padding: 11, background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}>Go back</button>
                </>
              );
            })()}

            {wdStep === 'paying' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 22px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>M-Pesa STK Push sent</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  Check your phone <strong style={{ color: 'var(--text)' }}>+254 {wdPhone}</strong><br />
                  Enter your PIN to pay the tax and confirm withdrawal.
                </p>
              </div>
            )}

            {wdStep === 'failed' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff5f5', border: '1.5px solid #fed7d7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon.XCircle size={32} style={{ color: '#e53e3e' }} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#e53e3e', marginBottom: 8 }}>Tax payment not completed</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>
                  We didn't receive your M-Pesa confirmation. Your balance was not deducted and no withdrawal was queued.
                </p>
                <button onClick={() => setWdStep('confirm')} style={{ width: '100%', padding: 13, background: 'var(--brand-gradient)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
                  Try again
                </button>
                <button onClick={() => setWdOpen(false)} style={{ width: '100%', padding: 11, background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            )}

            {wdStep === 'pending_72' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff7ed', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon.Clock size={32} style={{ color: '#D97706' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: 'var(--text)' }}>Payment received!</h3>
                <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--pink)', marginBottom: 6 }}>{format(wdResult.net)}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 20px' }}>
                  Your withdrawal is now <strong style={{ color: '#D97706' }}>under review</strong>. We verify all payouts to ensure platform integrity.<br /><br />
                  You will receive <strong style={{ color: 'var(--text)' }}>{format(wdResult.net)}</strong> on your M-Pesa within <strong style={{ color: '#D97706' }}>72 hours</strong>.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 12, padding: '10px 20px', marginBottom: 24 }}>
                  <Icon.Clock size={16} style={{ color: '#D97706' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>Estimated: 72 hours from now</span>
                </div>
                <div style={{ background: '#f8f9fc', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>What happens next</div>
                  {[
                    { icon: 'CheckCircle', label: 'Tax paid', done: true },
                    { icon: 'Eye', label: 'Payout under review (up to 72 hrs)', done: false },
                    { icon: 'Smartphone', label: `${format(wdResult.net)} sent to +254 ${wdPhone}`, done: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: s.done ? '#f0fdf4' : '#f8f9fc', border: `1.5px solid ${s.done ? '#bbf7d0' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon.CheckCircle size={14} style={{ color: s.done ? 'var(--green)' : 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: 13, color: s.done ? 'var(--text)' : 'var(--text-muted)' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setWdOpen(false); }} style={{ padding: '11px 32px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: 'var(--green)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Got it, I'll wait
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeOpen && <UpgradeModal user={user} onClose={() => setUpgradeOpen(false)} onSuccess={() => { upgradePro(); setUpgradeOpen(false); toast('Pro plan activated!', 'success'); }} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={u => { login(u); toast(`Welcome back!`, 'success'); }} />}
      <Toast />
      <Celebration />
    </>
  );
}

const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 };
