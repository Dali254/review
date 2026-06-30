import { useState, useEffect } from 'react';
import { DAILY_FREE_LIMIT, WITHDRAWAL_TAX_RATE, PRO_PRICE_KES } from './config';

export { DAILY_FREE_LIMIT, PRO_PRICE_KES };
export const TAX_RATE_WITHDRAW = WITHDRAWAL_TAX_RATE;

const STORAGE_KEY = 'reviewke_user';
const WALLET_KEY  = 'reviewke_wallet';
const TX_KEY      = 'reviewke_transactions';
const TASKS_KEY   = 'reviewke_tasks';

export function useUser() {
  const [user, setUser]               = useState(null);
  const [balance, setBalance]         = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalTax, setTotalTax]       = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [tasksToday, setTasksToday]   = useState(0);
  const [taskDate, setTaskDate]       = useState('');
  const [loaded, setLoaded]           = useState(false);

  useEffect(() => {
    try {
      const u  = localStorage.getItem(STORAGE_KEY);
      const w  = localStorage.getItem(WALLET_KEY);
      const t  = localStorage.getItem(TX_KEY);
      const td = localStorage.getItem(TASKS_KEY);
      if (u) setUser(JSON.parse(u));
      if (w) {
        const wallet = JSON.parse(w);
        setBalance(wallet.balance || 0);
        setTotalEarned(wallet.totalEarned || 0);
        setTotalTax(wallet.totalTax || 0);
      }
      if (t) setTransactions(JSON.parse(t));
      if (td) {
        const tasks = JSON.parse(td);
        const today = new Date().toDateString();
        if (tasks.date === today) { setTasksToday(tasks.count || 0); setTaskDate(tasks.date); }
        else { setTasksToday(0); setTaskDate(today); }
      }
    } catch {}
    setLoaded(true);
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function getRemainingTasks() {
    const today = new Date().toDateString();
    if (taskDate !== today) return DAILY_FREE_LIMIT;
    if (user?.plan === 'pro') return Infinity;
    return Math.max(0, DAILY_FREE_LIMIT - tasksToday);
  }

  function consumeTask() {
    const today = new Date().toDateString();
    let count = tasksToday;
    if (taskDate !== today) { count = 0; setTaskDate(today); }
    if (user?.plan !== 'pro' && count >= DAILY_FREE_LIMIT) return false;
    const newCount = count + 1;
    setTasksToday(newCount);
    localStorage.setItem(TASKS_KEY, JSON.stringify({ date: today, count: newCount }));
    return true;
  }

  function addEarning(amount, description) {
    const newBalance = balance + amount;
    const newTotalEarned = totalEarned + amount;
    setBalance(newBalance); setTotalEarned(newTotalEarned);
    localStorage.setItem(WALLET_KEY, JSON.stringify({ balance:newBalance, totalEarned:newTotalEarned, totalTax }));
    const newTxs = [{ id:Date.now(), type:'earn', desc:description, amount, date:new Date().toLocaleDateString('en-KE') }, ...transactions];
    setTransactions(newTxs);
    localStorage.setItem(TX_KEY, JSON.stringify(newTxs));
  }

  function withdraw(grossAmount) {
    const tax = Math.round(grossAmount * TAX_RATE_WITHDRAW);
    const net = grossAmount - tax;
    const newBalance = balance - grossAmount;
    const newTotalTax = totalTax + tax;
    setBalance(newBalance); setTotalTax(newTotalTax);
    localStorage.setItem(WALLET_KEY, JSON.stringify({ balance:newBalance, totalEarned, totalTax:newTotalTax }));
    const newTxs = [
      { id:Date.now()+1, type:'tax', desc:'Withdrawal tax (16%)', amount:-tax, date:new Date().toLocaleDateString('en-KE') },
      { id:Date.now(), type:'withdraw', desc:'Withdrawal to M-Pesa', amount:-net, date:new Date().toLocaleDateString('en-KE'), pending:true,
        releaseDate: (() => { const d = new Date(); d.setHours(d.getHours()+72); return d.toISOString(); })() },
      ...transactions,
    ];
    setTransactions(newTxs);
    localStorage.setItem(TX_KEY, JSON.stringify(newTxs));
    return { net, tax };
  }

  // Pro upgrade is only granted after successful M-Pesa payment confirmation
  function upgradePro() {
    const updated = { ...user, plan: 'pro', proSince: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const newTxs = [{ id:Date.now(), type:'upgrade', desc:'Pro plan subscription', amount:-PRO_PRICE_KES, date:new Date().toLocaleDateString('en-KE') }, ...transactions];
    setTransactions(newTxs);
    localStorage.setItem(TX_KEY, JSON.stringify(newTxs));
  }

  return {
    user, balance, totalEarned, totalTax, transactions,
    tasksToday, loaded,
    login, logout, addEarning, withdraw, upgradePro,
    getRemainingTasks, consumeTask,
    DAILY_FREE_LIMIT, PRO_PRICE_KES,
  };
}
