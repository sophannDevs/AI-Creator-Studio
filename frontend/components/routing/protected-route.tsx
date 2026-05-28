'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-600">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-600">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
