import { createContext, useContext } from 'react';
import { useUser as useUserState } from './useUser';

const UserContext = createContext(null);

// Wraps the existing useUser() hook in a single shared instance so every
// page reads/writes the same in-memory state, not five independent copies
// that only stay in sync via localStorage + a full reload. This is also
// what makes the strict registration gate in _app.js possible: the gate
// needs one source of truth for "is someone signed in" that updates
// immediately when login()/logout() are called from anywhere in the tree.
export function UserProvider({ children }) {
  const userState = useUserState();
  return <UserContext.Provider value={userState}>{children}</UserContext.Provider>;
}

// Drop-in replacement for the old `import { useUser } from '../lib/useUser'`.
// Pages don't need to change anything except the import path.
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser() must be called within a <UserProvider> — check _app.js');
  }
  return ctx;
}
