import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CurrencyProvider } from '../lib/CurrencyContext';
import { UserProvider, useUser } from '../lib/UserContext';
import RegistrationGate from '../components/RegistrationGate';

// Routes that bypass the strict reviewer-registration gate. /admin has its
// own separate password gate (see pages/admin.js) — it's an internal
// operator tool, not part of the reviewer-facing product, so it shouldn't
// require a reviewer account to even view.
const GATE_EXEMPT_ROUTES = ['/admin'];

// Renders the actual app once a user is signed in, or the strict
// registration gate if not. This sits inside UserProvider so it can read
// shared auth state, and inside CurrencyProvider so the gate's price
// displays (if any) stay consistent with the rest of the app.
function Gate({ Component, pageProps }) {
  const router = useRouter();
  const { user, loaded, login } = useUser();
  const exempt = GATE_EXEMPT_ROUTES.includes(router.pathname);

  // Wait for the localStorage check to finish before deciding — avoids a
  // flash of the registration screen for users who are already signed in.
  if (!loaded) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} />
      </div>
    );
  }

  if (!user && !exempt) {
    return <RegistrationGate onAuth={login} />;
  }

  return <Component {...pageProps} />;
}

export default function App(props) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0118" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23C0185F'/><text y='.85em' font-size='68' x='50%' text-anchor='middle' fill='white'>R</text></svg>" />
      </Head>
      <CurrencyProvider>
        <UserProvider>
          <Gate {...props} />
        </UserProvider>
      </CurrencyProvider>
    </>
  );
}
