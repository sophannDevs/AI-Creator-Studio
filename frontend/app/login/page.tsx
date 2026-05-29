'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthField } from '@/components/auth/auth-field';
import { AuthMessage } from '@/components/auth/auth-message';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import { useAuth } from '@/components/providers/auth-provider';

export default function LoginPage() {
  const router = useRouter();

  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const value = new URLSearchParams(window.location.search).get('email');
    return value ?? '';
  });
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
      router.push('/dashboard');
    } catch {
      // Error state is already handled by auth context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell flex items-center justify-center px-6 py-12">
      <AuthCard
        title="Login"
        subtitle="Sign in with your creator account"
        footerText="Need an account?"
        footerLinkText="Register"
        footerLinkHref="/register"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthField
            id="email"
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            required
          />

          <AuthField
            id="password"
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isSubmitting}
            required
          />

          {formError ? <AuthMessage variant="error" message={formError} /> : null}
          {error ? <AuthMessage variant="error" message={error} /> : null}

          <AuthSubmitButton
            label="Login"
            loadingLabel="Signing in..."
            isLoading={isSubmitting}
          />
        </form>

        <p className="mt-4 text-xs text-zinc-500">
          By continuing, you agree to manage your content responsibly.
        </p>

        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to home
        </Link>
      </AuthCard>
    </main>
  );
}
