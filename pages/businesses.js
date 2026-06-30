import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import BusinessCard from '../components/BusinessCard';
import AuthModal from '../components/AuthModal';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/useToast';
import Icon from '../lib/icons';
import { BUSINESSES, CATEGORIES } from '../data/businesses';

export default function Businesses() {
  const { user, balance, login } = useUser();
  const { toast, Toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  const catCounts = {};
  BUSINESSES.forEach(b => { catCounts[b.category] = (catCounts[b.category] || 0) + 1; });

  const filtered = BUSINESSES
    .filter(b =>
      (category === 'All' || b.category === category) &&
      (b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <Head>
        <title>Browse Businesses — ReviewKE</title>
        <meta name="description" content="Browse and review 50+ Kenyan businesses. Earn KES via M-Pesa." />
      </Head>

      <Navbar user={user} onAuthClick={() => setAuthOpen(true)} balance={balance} />

      <style>{`
        .biz-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        @media (max-width: 640px) {
          .biz-grid { grid-template-columns: 1fr !important; }
          .search-row { flex-direction: column !important; }
          .search-row select { width: 100% !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .biz-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 100px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#00C853', textTransform: 'uppercase', marginBottom: 8 }}>Directory</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Kenyan businesses</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            {filtered.length} of {BUSINESSES.length} businesses — write a review to earn
          </p>
        </div>

        {/* Search + sort */}
        <div className="search-row" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 10, padding: '0 14px',
          }}>
            <Icon.Search size={15} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search businesses..."
              style={{ border: 'none', background: 'transparent', padding: '12px 0', flex: 1, fontSize: 14 }}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 10, padding: '12px 14px',
            fontSize: 14, color: 'rgba(255,255,255,0.7)',
            minWidth: 150,
          }}>
            <option value="featured">Featured first</option>
            <option value="name">A–Z</option>
          </select>
        </div>

        {/* Category chips — scrollable on mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 28, WebkitOverflowScrolling: 'touch' }}>
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? BUSINESSES.length : (catCounts[cat] || 0);
            const active = category === cat;
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: '1px solid',
                borderColor: active ? 'rgba(0,200,83,0.45)' : 'rgba(255,255,255,0.08)',
                background: active ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.03)',
                color: active ? '#00C853' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer', transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}>
                {cat}
                {count > 0 && <span style={{ opacity: 0.6, marginLeft: 4 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0' }}>
            <Icon.Search size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 14 }} />
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>No results found</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Try a different search or category</div>
          </div>
        ) : (
          <div className="biz-grid" style={{ display: 'grid', gap: 16 }}>
            {filtered.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
          </div>
        )}
      </main>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={u => { login(u); toast(`Welcome, ${u.name.split(' ')[0]}!`, 'success'); }} />}
      <Toast />
    </>
  );
}
