'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmptyStateCard } from '@/components/ideas/empty-state-card';
import { GenerationPanel } from '@/components/ideas/generation-panel';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import {
  generateThumbnail,
  getThumbnailByIdeaId,
  type ThumbnailResponse,
} from '@/lib/api/thumbnail';
import { toApiError } from '@/lib/api/client';

export default function IdeaThumbnailPage() {
  const params = useParams<{ id: string }>();
  const ideaId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [style, setStyle] = useState('modern tech YouTube thumbnail');
  const [result, setResult] = useState<ThumbnailResponse | null>(null);
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
      const data = await getThumbnailByIdeaId(token, ideaId);
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

    if (!style.trim()) {
      setError('Style is required.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      const data = await generateThumbnail(token, {
        videoIdeaId: ideaId,
        style: style.trim(),
      });
      setResult(data);
      setSuccess('Thumbnail prompt generated and saved.');
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
          title="Thumbnail Prompt Generator"
          description="Generate thumbnail prompt details for this idea."
          isLoading={isLoading}
          isGenerating={isGenerating}
          error={error}
          success={success}
          hasResult={Boolean(result)}
          form={
            <form onSubmit={handleGenerate} className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700">Style</span>
                <input
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                  placeholder="modern tech YouTube thumbnail"
                  disabled={isGenerating}
                  className="input-control"
                />
              </label>

              <button
                type="submit"
                disabled={isGenerating}
                className="button-primary"
              >
                {isGenerating ? 'Generating thumbnail prompt...' : 'Generate Thumbnail Prompt'}
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
                <h2 className="text-lg font-semibold text-zinc-900">Saved Thumbnail Prompt</h2>
                <dl className="mt-3 space-y-3 text-sm text-zinc-700">
                  <div>
                    <dt className="font-medium text-zinc-900">Text</dt>
                    <dd>{result.text}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Background Idea</dt>
                    <dd>{result.backgroundIdea}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Main Object</dt>
                    <dd>{result.mainObject}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Style</dt>
                    <dd>{result.style}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Prompt</dt>
                    <dd>{result.prompt}</dd>
                  </div>
                </dl>
              </section>
            ) : null
          }
          emptyState={
            <EmptyStateCard
              title="No thumbnail prompt yet"
              description="Generate a thumbnail prompt to see the saved result here."
            />
          }
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
