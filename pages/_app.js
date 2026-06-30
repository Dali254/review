import '../styles/globals.css';
import Head from 'next/head';
import { CurrencyProvider } from '../lib/CurrencyContext';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0118" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23C0185F'/><text y='.85em' font-size='68' x='50%' text-anchor='middle' fill='white'>R</text></svg>" />
      </Head>
      <CurrencyProvider>
        <Component {...pageProps} />
      </CurrencyProvider>
    </>
  );
}
