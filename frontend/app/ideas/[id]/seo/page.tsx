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
import { generateSeo, getSeoByIdeaId, type SeoResponse } from '@/lib/api/seo';
import { toApiError } from '@/lib/api/client';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function IdeaSeoPage() {
  const params = useParams<{ id: string }>();
  const ideaId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [targetKeyword, setTargetKeyword] = useState('');
  const [result, setResult] = useState<SeoResponse | null>(null);
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
      const data = await getSeoByIdeaId(token, ideaId);
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

    if (!targetKeyword.trim()) {
      setError('Target keyword is required.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      const data = await generateSeo(token, {
        videoIdeaId: ideaId,
        targetKeyword: targetKeyword.trim(),
      });
      setResult(data);
      setSuccess('SEO generated and saved.');
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
        <div className="space-y-5">
          <PageBreadcrumb items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Projects', href: '/projects' },
            { label: 'Ideas', href: `/ideas/${ideaId}` },
            { label: 'SEO' },
          ]} />
        <GenerationPanel
          title="SEO Generator"
          description="Generate SEO metadata for this idea."
          isLoading={isLoading}
          isGenerating={isGenerating}
          error={error}
          success={success}
          hasResult={Boolean(result)}
          form={
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label>Target Keyword</Label>
                <Input
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="Docker for Java developers"
                  disabled={isGenerating}
                />
              </div>

              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? 'Generating SEO...' : 'Generate SEO'}
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
                  <h2 className="text-lg font-semibold">Saved SEO</h2>
                  <dl className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <div>
                      <dt className="font-medium text-foreground">Title</dt>
                      <dd>{result.title}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Description</dt>
                      <dd>{result.description}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Tags</dt>
                      <dd>{result.tags.join(', ') || 'No tags'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Hashtags</dt>
                      <dd>{result.hashtags.join(' ') || 'No hashtags'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">SEO Score</dt>
                      <dd>{result.seoScore}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ) : null
          }
          emptyState={
            <EmptyStateCard
              title="No SEO yet"
              description="Generate SEO metadata to see the saved result here."
            />
          }
        />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
