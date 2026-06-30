import { createContext, useContext, useState, useEffect } from 'react';
import { USD_RATE } from './config';

const CurrencyContext = createContext(null);
const STORAGE_KEY = 'reviewke_currency';

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('KES');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'USD' || saved === 'KES') setCurrency(saved);
    } catch {}
  }, []);

  function toggleCurrency() {
    setCurrency(prev => {
      const next = prev === 'KES' ? 'USD' : 'KES';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }

  // Convert a KES amount (the real, underlying currency for all M-Pesa
  // transactions) into the currently-selected display currency.
  function convert(kesAmount) {
    if (currency === 'USD') return kesAmount / USD_RATE;
    return kesAmount;
  }

  // Format a KES amount for display in the selected currency, with the
  // correct symbol/code and sensible decimal places.
  function format(kesAmount, opts = {}) {
    const { decimals } = opts;
    if (currency === 'USD') {
      const usd = kesAmount / USD_RATE;
      const d = decimals ?? (usd < 10 ? 2 : 2);
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
    }
    const d = decimals ?? 0;
    return `KES ${kesAmount.toLocaleString('en-KE', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convert, format, rate: USD_RATE }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Sensible fallback if a component renders outside the provider —
    // always shows KES rather than crashing.
    return {
      currency: 'KES',
      toggleCurrency: () => {},
      convert: (k) => k,
      format: (k) => `KES ${k.toLocaleString()}`,
      rate: USD_RATE,
    };
  }
  return ctx;
}
