import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '../lib/icons';

function StarRating({ rating, size = 12 }) {
  const full = Math.round(parseFloat(rating));
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Icon.Star key={i} size={size} filled={i <= full}
          style={{ color: i <= full ? '#FFB800' : 'rgba(255,255,255,0.15)' }}
        />
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
  const [photo, setPhoto] = useState(null);
  const [googleRating, setGoogleRating] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!biz.placeId) { setLoading(false); return; }
    fetch(`/api/place-photo?placeId=${biz.placeId}`)
      .then(r => r.json())
      .then(d => { setPhoto(d.photoUrl); setGoogleRating(d.rating); setLoading(false); })
      .catch(() => setLoading(false));
  }, [biz.placeId]);

  const seed = biz.id.charCodeAt(0) + biz.id.charCodeAt(biz.id.length - 1);
  const reviewCount = 200 + (seed * 37) % 4600;
  const baseRating = (2.8 + ((seed * 13) % 22) / 10).toFixed(1);
  const displayRating = googleRating || baseRating;
  const CatIcon = Icon[CAT_ICONS[biz.category] || 'Globe'];

  return (
    <Link href={`/business/${biz.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
        position: 'relative',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.borderColor = 'rgba(0,200,83,0.3)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,200,83,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image */}
        <div style={{ height: 148, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {loading && <div className="skeleton" style={{ width: '100%', height: '100%' }} />}
          {photo && (
            <img src={photo} alt={biz.name}
              onLoad={() => setImgLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s' }}
            />
          )}
          {!loading && !photo && (
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(135deg, ${biz.color}40 0%, ${biz.color}15 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: `linear-gradient(135deg, ${biz.color}, ${biz.color}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${biz.color}50`,
              }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{biz.initial}</span>
              </div>
            </div>
          )}
          {/* Overlays */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
          }} />
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          }}>
            <CatIcon size={11} />
            {biz.category}
          </div>
          {biz.featured && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              padding: '4px 10px', borderRadius: 20,
              background: 'linear-gradient(135deg, #FFB800, #FF8800)',
              fontSize: 10, fontWeight: 700, color: '#000',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon.Award size={10} />
              FEATURED
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{biz.name}</div>
            {biz.verified && (
              <div style={{ flexShrink: 0, color: '#00C853' }}>
                <Icon.CheckCircle size={15} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating rating={displayRating} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFB800' }}>{parseFloat(displayRating).toFixed(1)}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>({reviewCount.toLocaleString()})</span>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1, margin: 0 }}>
            {biz.description}
          </p>

          <div style={{
            marginTop: 4, paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon.TrendingUp size={13} style={{ color: '#00C853' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00C853' }}>Earn up to KES 35</span>
            </div>
            <Icon.ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
