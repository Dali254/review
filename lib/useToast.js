import { useState, useCallback, useRef } from 'react';
import Icon from './icons';

export function useToast() {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('info');
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const toast = useCallback((message, variant = 'info', duration = 3500) => {
    setMsg(message); setType(variant); setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), duration);
  }, []);

  const colors = {
    success: { bg: 'rgba(0,200,83,0.15)', border: 'rgba(0,200,83,0.3)', color: '#00C853', icon: 'CheckCircle' },
    error: { bg: 'rgba(255,59,59,0.15)', border: 'rgba(255,59,59,0.3)', color: '#FF3B3B', icon: 'XCircle' },
    info: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', icon: 'Info' },
  };
  const c = colors[type] || colors.info;
  const IconComp = Icon[c.icon];

  const Toast = () => (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      background: `rgba(8,12,20,0.92)`,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${c.border}`,
      color: 'rgba(255,255,255,0.9)',
      padding: '13px 18px', borderRadius: 14,
      fontSize: 14, fontWeight: 500,
      zIndex: 9999, maxWidth: 340,
      transform: show ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.95)',
      opacity: show ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 10,
      pointerEvents: 'none',
    }}>
      <IconComp size={16} style={{ color: c.color, flexShrink: 0 }} />
      {msg}
    </div>
  );

  return { toast, Toast };
}
