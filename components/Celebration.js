import { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '../lib/icons';
import { useCurrency } from '../lib/CurrencyContext';

// A set of warm, varied congratulation messages so it doesn't feel
// robotic on the 50th review of the day.
const PRAISE = [
  'Nice one!', 'You\'re on fire!', 'Great work!', 'Boom — earned!',
  'Keep it up!', 'Cha-ching!', 'Well done!', 'You\'re crushing it!',
  'Money in the bank!', 'Excellent!',
];

const CONFETTI_COLORS = ['#C0185F', '#E91E8C', '#7C3AED', '#A855F7', '#F59E0B'];

function Confetti() {
  // 14 small pieces, randomized fall paths, purely decorative
  const pieces = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 0.25,
      duration: 0.9 + Math.random() * 0.6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 4,
      rotate: Math.random() * 360,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * useCelebration() — call celebrate(amountKes, message?) anywhere after a
 * successful earning event (review published, etc.) to show a glassy,
 * gradient, confetti notification congratulating the user.
 *
 * Usage:
 *   const { celebrate, Celebration } = useCelebration();
 *   ...
 *   celebrate(earn, `Review for ${biz.name} published`);
 *   ...
 *   return <>{...page}<Celebration/></>;
 */
export function useCelebration() {
  const [active, setActive] = useState(null); // { amount, message, id }
  const [closing, setClosing] = useState(false);
  const timerRef = useRef(null);
  const { format } = useCurrency();

  const celebrate = useCallback((amountKes, message) => {
    clearTimeout(timerRef.current);
    setClosing(false);
    setActive({
      amount: amountKes,
      message: message || 'Review published',
      praise: PRAISE[Math.floor(Math.random() * PRAISE.length)],
      id: Date.now(),
    });
    timerRef.current = setTimeout(() => {
      setClosing(true);
      setTimeout(() => setActive(null), 280);
    }, 4200);
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setClosing(true);
    setTimeout(() => setActive(null), 280);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function Celebration() {
    if (!active) return null;
    return (
      <div
        key={active.id}
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 10000,
          maxWidth: 360,
          animation: `${closing ? 'celebrate-out' : 'celebrate-in'} .35s cubic-bezier(.34,1.56,.64,1) forwards`,
        }}
        className="celebration-toast"
      >
        <style>{`
          @media (max-width: 640px) {
            .celebration-toast { left: 16px !important; right: 16px !important; bottom: 84px !important; max-width: none !important; }
          }
        `}</style>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 18,
          background: 'var(--brand-gradient)',
          padding: '18px 20px',
          boxShadow: '0 16px 40px rgba(124,58,237,0.35), 0 4px 12px rgba(192,24,95,0.25)',
          border: '1px solid rgba(255,255,255,0.25)',
        }}>
          {/* Glass sheen overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
            pointerEvents: 'none',
          }} />
          <Confetti />

          <button
            onClick={dismiss}
            aria-label="Dismiss"
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 24, height: 24, borderRadius: 8,
              background: 'rgba(255,255,255,0.18)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', zIndex: 2,
            }}
          >
            <Icon.X size={12} />
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'badge-pop .4s ease .1s backwards',
              border: '1px solid rgba(255,255,255,0.35)',
            }}>
              <Icon.Award size={22} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                {active.praise}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 8, lineHeight: 1.4 }}>
                {active.message}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                borderRadius: 20, padding: '4px 12px',
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                <Icon.TrendingUp size={13} style={{ color: '#fff' }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                  +{format(active.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return { celebrate, dismiss, Celebration };
}
