import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#080c14" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2300C853'/><text y='.85em' font-size='68' x='50%' text-anchor='middle' fill='%23000'>R</text></svg>" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
