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

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#00C853', textTransform: 'uppercase', marginBottom: 8 }}>
            Directory
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, fontFamily: "'Syne', sans-serif", letterSpacing: '-1px', marginBottom: 8 }}>
            Kenyan businesses
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
            {filtered.length} of {BUSINESSES.length} businesses — write a review to earn
          </p>
        </div>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 220,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0 14px',
          }}>
            <Icon.Search size={16} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search businesses..."
              style={{ border: 'none', background: 'transparent', padding: '11px 0', flex: 1 }}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '11px 14px',
            fontSize: 14, color: 'rgba(255,255,255,0.7)',
            minWidth: 160,
          }}>
            <option value="featured">Featured first</option>
            <option value="name">A–Z</option>
          </select>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? BUSINESSES.length : (catCounts[cat] || 0);
            const active = category === cat;
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: '1px solid',
                borderColor: active ? 'rgba(0,200,83,0.5)' : 'rgba(255,255,255,0.08)',
                background: active ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.03)',
                color: active ? '#00C853' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer', transition: 'all 0.15s',
                backdropFilter: 'blur(8px)',
              }}>
                {cat}
                {count > 0 && <span style={{ opacity: 0.6, marginLeft: 4 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Icon.Search size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>No results found</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Try a different search or category</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
          </div>
        )}
      </main>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={u => { login(u); toast(`Welcome, ${u.name.split(' ')[0]}!`, 'success'); }} />}
      <Toast />
    </>
  );
}
