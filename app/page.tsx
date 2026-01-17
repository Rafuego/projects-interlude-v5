'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F6F3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>
      <p style={{ color: '#888' }}>Redirecting to dashboard...</p>
    </div>
  );
}
