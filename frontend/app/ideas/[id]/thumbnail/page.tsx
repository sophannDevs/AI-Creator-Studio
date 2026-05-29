'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmptyStateCard } from '@/components/ideas/empty-state-card';
import { GenerationPanel } from '@/components/ideas/generation-panel';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { generateThumbnail, getThumbnailByIdeaId, type ThumbnailResponse } from '@/lib/api/thumbnail';
import { toApiError } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      if (apiError.status !== 404) setError(apiError.message);
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
              <div className="space-y-2">
                <Label>Style</Label>
                <Input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="modern tech YouTube thumbnail"
                  disabled={isGenerating}
                />
              </div>

              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? 'Generating thumbnail prompt...' : 'Generate Thumbnail Prompt'}
              </Button>

              <Link
                href={`/ideas/${ideaId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
                Back to idea detail
              </Link>
            </form>
          }
          result={
            result ? (
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <h2 className="text-lg font-semibold">Saved Thumbnail Prompt</h2>
                  <dl className="mt-3 space-y-3 text-sm text-muted-foreground">
                    {[
                      { label: 'Text', value: result.text },
                      { label: 'Background Idea', value: result.backgroundIdea },
                      { label: 'Main Object', value: result.mainObject },
                      { label: 'Style', value: result.style },
                      { label: 'Prompt', value: result.prompt },
                    ].map((row) => (
                      <div key={row.label}>
                        <dt className="font-medium text-foreground">{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
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
