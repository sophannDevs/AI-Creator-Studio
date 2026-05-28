'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmptyStateCard } from '@/components/ideas/empty-state-card';
import { GenerationPanel } from '@/components/ideas/generation-panel';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { generateScript, getScriptByIdeaId, type ScriptResponse } from '@/lib/api/script';
import { toApiError } from '@/lib/api/client';

export default function IdeaScriptPage() {
  const params = useParams<{ id: string }>();
  const ideaId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [duration, setDuration] = useState('5 minutes');
  const [tone, setTone] = useState('Beginner friendly');
  const [language, setLanguage] = useState('English');

  const [result, setResult] = useState<ScriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadExisting = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getScriptByIdeaId(token, ideaId);
      setResult(data);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      if (apiError.status !== 404) {
        setError(apiError.message);
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, ideaId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const timer = window.setTimeout(() => {
      void loadExisting();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isAuthLoading, loadExisting]);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('Your session has expired. Please login again.');
      return;
    }

    if (!duration.trim() || !tone.trim() || !language.trim()) {
      setError('Duration, tone, and language are required.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      const data = await generateScript(token, {
        videoIdeaId: ideaId,
        duration: duration.trim(),
        tone: tone.trim(),
        language: language.trim(),
      });
      setResult(data);
      setSuccess('Script generated and saved.');
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <GenerationPanel
          title="Script Generator"
          description="Generate a full script for this idea."
          isLoading={isLoading}
          isGenerating={isGenerating}
          error={error}
          success={success}
          hasResult={Boolean(result)}
          form={
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Duration</span>
                  <input
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    disabled={isGenerating}
                    className="input-control"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Tone</span>
                  <input
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    disabled={isGenerating}
                    className="input-control"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Language</span>
                  <input
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    disabled={isGenerating}
                    className="input-control"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="button-primary"
              >
                {isGenerating ? 'Generating script...' : 'Generate Script'}
              </button>

              <p className="text-xs text-zinc-500">
                <Link href={`/ideas/${ideaId}`} className="underline">
                  Back to idea detail
                </Link>
              </p>
            </form>
          }
          result={
            result ? (
              <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-zinc-900">Saved Script</h2>
                <dl className="mt-3 space-y-3 text-sm text-zinc-700">
                  <div>
                    <dt className="font-medium text-zinc-900">Hook</dt>
                    <dd>{result.hook}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Intro</dt>
                    <dd>{result.intro}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Main Content</dt>
                    <dd>{result.mainContent}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Conclusion</dt>
                    <dd>{result.conclusion}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">CTA</dt>
                    <dd>{result.cta}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Duration</dt>
                    <dd>{result.duration ?? 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Tone</dt>
                    <dd>{result.tone ?? 'Not set'}</dd>
                  </div>
                </dl>
              </section>
            ) : null
          }
          emptyState={
            <EmptyStateCard
              title="No script yet"
              description="Generate a script to see the saved result here."
            />
          }
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
