'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthField } from '@/components/auth/auth-field';
import { AuthMessage } from '@/components/auth/auth-message';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import { useAuth } from '@/components/providers/auth-provider';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });

      setSuccessMessage('Account created. Redirecting to login...');
      router.push(`/login?email=${encodeURIComponent(email.trim())}`);
    } catch {
      // Error state is already handled by auth context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell flex items-center justify-center px-6 py-12">
      <AuthCard
        title="Register"
        subtitle="Create your account to access the dashboard"
        footerText="Already have an account?"
        footerLinkText="Login"
        footerLinkHref="/login"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthField
            id="name"
            name="name"
            type="text"
            label="Name (optional)"
            value={name}
            onChange={setName}
            placeholder="Your name"
            autoComplete="name"
            disabled={isSubmitting}
          />

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
          />

          <AuthField
            id="password"
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          {formError ? <AuthMessage variant="error" message={formError} /> : null}
          {error ? <AuthMessage variant="error" message={error} /> : null}
          {successMessage ? (
            <AuthMessage variant="success" message={successMessage} />
          ) : null}

          <AuthSubmitButton
            label="Create account"
            loadingLabel="Creating account..."
            isLoading={isSubmitting}
          />
        </form>

        <p className="mt-2 text-xs text-zinc-500">
          <Link href="/" className="underline">
            Back to home
          </Link>
        </p>
      </AuthCard>
    </main>
  );
}
