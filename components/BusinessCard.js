import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '../lib/icons';

function StarRating({ rating, size = 12 }) {
  const full = Math.round(parseFloat(rating));
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Icon.Star key={i} size={size} filled={i <= full}
          style={{ color: i <= full ? '#FFB800' : 'rgba(255,255,255,0.15)' }} />
      ))}
    </span>
  );
}

const CAT_ICONS = {
  Telecom: 'Smartphone', Banking: 'Building', Supermarket: 'Globe',
  Insurance: 'Shield', Fuel: 'Zap', Healthcare: 'Award',
  Hospitality: 'Globe', Transport: 'ArrowRight', 'E-Commerce': 'Globe',
  Government: 'Building', Education: 'Award', 'Real Estate': 'Building',
};

export default function BusinessCard({ biz }) {
  const [logoOk, setLogoOk]           = useState(true);
  const [googleRating, setGoogleRating] = useState(null);

  useEffect(() => {
    if (!biz.placeId) return;
    fetch(`/api/place-photo?placeId=${biz.placeId}`)
      .then(r => r.json())
      .then(d => { if (d.rating) setGoogleRating(d.rating); })
      .catch(() => {});
  }, [biz.placeId]);

  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length - 1);
  const reviewCount   = 200 + (seed * 37) % 4600;
  const baseRating    = (2.8 + ((seed * 13) % 22) / 10).toFixed(1);
  const displayRating = googleRating || baseRating;
  const CatIcon       = Icon[CAT_ICONS[biz.category] || 'Globe'];

  return (
    <Link href={`/business/${biz.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, overflow: 'hidden',
          height: '100%', display: 'flex', flexDirection: 'column',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = 'rgba(0,200,83,0.3)';
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Logo panel — brand colour bg with centred logo */}
        <div style={{
          height: 130,
          position: 'relative',
          flexShrink: 0,
          background: `linear-gradient(135deg, ${biz.color}30 0%, ${biz.logoBg || biz.color}18 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px',
        }}>
          {biz.imageUrl && logoOk ? (
            <img
              src={biz.imageUrl}
              alt={`${biz.name} logo`}
              onError={() => setLogoOk(false)}
              style={{
                maxWidth: '70%',
                maxHeight: 72,
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',   /* make any logo white */
                opacity: 0.92,
              }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: `linear-gradient(135deg, ${biz.color}, ${biz.color}90)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${biz.color}50`,
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>{biz.initial}</span>
            </div>
          )}

          {/* Top badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.10)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            <CatIcon size={11} />{biz.category}
          </div>
          {biz.featured && (
            <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 9px', borderRadius: 20, background: 'linear-gradient(135deg,#FFB800,#FF8800)', fontSize: 10, fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon.Award size={10} />FEATURED
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{biz.name}</div>
            {biz.verified && <Icon.CheckCircle size={15} style={{ color: '#00C853', flexShrink: 0, marginTop: 1 }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <StarRating rating={displayRating} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFB800' }}>{parseFloat(displayRating).toFixed(1)}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>({reviewCount.toLocaleString()})</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1, margin: 0 }}>{biz.description}</p>
          <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon.TrendingUp size={13} style={{ color: '#00C853' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00C853' }}>Earn up to KES 35</span>
            </div>
            <Icon.ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
