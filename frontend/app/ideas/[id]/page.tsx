'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmptyStateCard } from '@/components/ideas/empty-state-card';
import { IdeaDetailCard } from '@/components/ideas/idea-detail-card';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { findVideoIdeaAcrossProjects, type VideoIdea } from '@/lib/api/ideas';
import { listProjects, type Project } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';

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
        projects.map((p) => p.id),
        ideaId,
      );

      if (!ideaMatch) {
        setError('Video idea not found. It may not belong to your account.');
        setIdea(null);
        setProject(null);
        return;
      }

      const matchedProject = projects.find((p) => p.id === ideaMatch.projectId) ?? null;

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
          <PageBreadcrumb items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Projects', href: '/projects' },
            ...(project ? [{ label: project.name, href: `/projects/${project.id}/ideas` }] : []),
            { label: idea?.title ?? 'Idea' },
          ]} />
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Idea Detail</h1>
            <p className="text-sm text-muted-foreground">
              Review this idea and generate script, SEO, and thumbnail outputs.
            </p>
            {project ? (
              <Link
                href={`/projects/${project.id}/ideas`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
                Back to {project.name} ideas
              </Link>
            ) : null}
          </header>

          {isLoading ? (
            <Alert>
              <AlertDescription>Loading idea...</AlertDescription>
            </Alert>
          ) : null}

          {!isLoading && error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
                className={buttonVariants({ variant: 'outline', className: 'w-full justify-center' })}
              >
                Generate Script
              </Link>
              <Link
                href={`/ideas/${idea.id}/seo`}
                className={buttonVariants({ variant: 'outline', className: 'w-full justify-center' })}
              >
                Generate SEO
              </Link>
              <Link
                href={`/ideas/${idea.id}/thumbnail`}
                className={buttonVariants({ variant: 'outline', className: 'w-full justify-center' })}
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
