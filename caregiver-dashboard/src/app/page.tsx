'use client';

// Root page - Redirects to appropriate page based on auth status

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated()) {
      router.push('/care-circle');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-textSecondary">Loading...</p>
      </div>
    </div>
  );
}
