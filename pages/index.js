import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// The marketing homepage has been removed per product decision: /businesses
// (the review-job browser) is now the default landing experience. This
// page exists only so old bookmarks/links to "/" don't 404 — it
// immediately redirects to /businesses. The strict registration gate in
// _app.js still runs first for signed-out visitors, exactly as it does
// for every other route.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/businesses');
  }, [router]);

  return (
    <>
      <Head><title>ReviewKE</title></Head>
      <div style={{ position:'fixed', inset:0, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    </>
  );
}
