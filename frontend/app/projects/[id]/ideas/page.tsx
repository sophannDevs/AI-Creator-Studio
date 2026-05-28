'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmptyStateCard } from '@/components/ideas/empty-state-card';
import {
  IdeaGenerationForm,
  type IdeaGenerationValues,
} from '@/components/ideas/idea-generation-form';
import { IdeasList } from '@/components/ideas/ideas-list';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import {
  generateVideoIdeas,
  listVideoIdeasByProject,
  type VideoIdea,
} from '@/lib/api/ideas';
import { getProject, type Project } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';

export default function ProjectIdeasPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [projectData, ideasData] = await Promise.all([
        getProject(token, projectId),
        listVideoIdeasByProject(token, projectId),
      ]);

      setProject(projectData);
      setIdeas(ideasData);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      if (apiError.status === 404) {
        setError('Project not found. It may not belong to your account.');
      } else {
        setError(apiError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, isAuthLoading, loadData]);

  const handleGenerate = async (values: IdeaGenerationValues) => {
    if (!token) {
      setError('Your session has expired. Please login again.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      await generateVideoIdeas(token, {
        projectId,
        tone: values.tone.trim(),
        count: values.count,
      });

      setSuccess('Ideas generated and saved.');
      const refreshed = await listVideoIdeasByProject(token, projectId);
      setIdeas(refreshed);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const sortedIdeas = useMemo(
    () => [...ideas].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ideas],
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-5">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Project Ideas
            </h1>
            <p className="text-sm text-zinc-600">
              Generate and manage video ideas for{' '}
              <span className="font-medium text-zinc-900">
                {project?.name ?? 'this project'}
              </span>
              .
            </p>
            <p className="text-xs text-zinc-500">
              <Link href={`/projects/${projectId}`} className="underline">
                Back to project
              </Link>
            </p>
          </header>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
            <IdeaGenerationForm
              isSubmitting={isGenerating}
              error={error}
              success={success}
              onSubmit={handleGenerate}
            />
          </div>

          {isLoading ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Loading ideas...
            </p>
          ) : null}

          {!isLoading && error && !ideas.length ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {!isLoading && !error && sortedIdeas.length === 0 ? (
            <EmptyStateCard
              title="No ideas yet"
              description="Generate your first set of ideas to continue the workflow."
            />
          ) : null}

          {!isLoading && sortedIdeas.length > 0 ? (
            <IdeasList ideas={sortedIdeas} />
          ) : null}
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
