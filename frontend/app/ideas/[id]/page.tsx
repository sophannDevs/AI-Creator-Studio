'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmptyStateCard } from '@/components/ideas/empty-state-card';
import { IdeaDetailCard } from '@/components/ideas/idea-detail-card';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { findVideoIdeaAcrossProjects, type VideoIdea } from '@/lib/api/ideas';
import { listProjects, type Project } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';

export default function IdeaDetailPage() {
  const params = useParams<{ id: string }>();
  const ideaId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [idea, setIdea] = useState<VideoIdea | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdea = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const projects = await listProjects(token);

      const ideaMatch = await findVideoIdeaAcrossProjects(
        token,
        projects.map((projectItem) => projectItem.id),
        ideaId,
      );

      if (!ideaMatch) {
        setError('Video idea not found. It may not belong to your account.');
        setIdea(null);
        setProject(null);
        return;
      }

      const matchedProject =
        projects.find((candidate) => candidate.id === ideaMatch.projectId) ?? null;

      if (!matchedProject) {
        setError('Video idea not found. It may not belong to your account.');
        setIdea(null);
        setProject(null);
        return;
      }

      setIdea(ideaMatch.idea);
      setProject(matchedProject);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, ideaId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const timer = window.setTimeout(() => {
      void loadIdea();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, isAuthLoading, loadIdea]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-5">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Idea Detail
            </h1>
            <p className="text-sm text-zinc-600">
              Review this idea and generate script, SEO, and thumbnail outputs.
            </p>
            {project ? (
              <p className="text-xs text-zinc-500">
                <Link href={`/projects/${project.id}/ideas`} className="underline">
                  Back to {project.name} ideas
                </Link>
              </p>
            ) : null}
          </header>

          {isLoading ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Loading idea...
            </p>
          ) : null}

          {!isLoading && error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {!isLoading && !error && idea ? <IdeaDetailCard idea={idea} /> : null}

          {!isLoading && !error && !idea ? (
            <EmptyStateCard
              title="Idea not found"
              description="This idea may have been removed or is not accessible."
            />
          ) : null}

          {!isLoading && !error && idea ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href={`/ideas/${idea.id}/script`}
                className="button-secondary w-full"
              >
                Generate Script
              </Link>
              <Link
                href={`/ideas/${idea.id}/seo`}
                className="button-secondary w-full"
              >
                Generate SEO
              </Link>
              <Link
                href={`/ideas/${idea.id}/thumbnail`}
                className="button-secondary w-full"
              >
                Generate Thumbnail
              </Link>
            </div>
          ) : null}
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
