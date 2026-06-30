import { useState, useCallback, useRef } from 'react';
import Icon from './icons';

export function useToast() {
  const [msg, setMsg]   = useState('');
  const [type, setType] = useState('info');
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const toast = useCallback((message, variant='info', duration=3500) => {
    setMsg(message); setType(variant); setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), duration);
  }, []);

  const cfg = {
    success:{ bg:'#f0fdf4', border:'#bbf7d0', color:'#15803d', icon:'CheckCircle' },
    error:  { bg:'#fff5f5', border:'#fed7d7', color:'#e53e3e', icon:'XCircle' },
    info:   { bg:'#f8f9fc', border:'#e8ecf0', color:'#475569', icon:'Info' },
  };
  const c = cfg[type] || cfg.info;
  const IC = Icon[c.icon];

  const Toast = () => (
    <div style={{ position:'fixed', bottom:28, right:28, background:c.bg, border:`1.5px solid ${c.border}`, color:c.color, padding:'13px 18px', borderRadius:12, fontSize:14, fontWeight:600, zIndex:9999, maxWidth:340, transform:show?'translateY(0) scale(1)':'translateY(80px) scale(0.95)', opacity:show?1:0, transition:'all .3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'var(--shadow-lg)', display:'flex', alignItems:'center', gap:10, pointerEvents:'none' }}>
      <IC size={16} style={{ flexShrink:0 }}/>{msg}
    </div>
  );

  return { toast, Toast };
}
