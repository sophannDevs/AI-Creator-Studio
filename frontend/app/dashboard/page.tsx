'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthMessage } from '@/components/auth/auth-message';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { listProjects, type Project } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, token, isAuthenticated, isLoading: isAuthLoading, error } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    if (!token) {
      setProjects([]);
      setIsLoadingProjects(false);
      return;
    }

    try {
      setIsLoadingProjects(true);
      setProjectsError(null);
      const data = await listProjects(token);
      setProjects(data);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setProjectsError(apiError.message);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const timer = window.setTimeout(() => {
      void loadProjects();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, isAuthLoading, loadProjects]);

  const latestProject = useMemo(() => projects[0], [projects]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as{' '}
                <span className="font-medium text-foreground">{user?.email}</span>.
              </p>
            </div>
            <Link href="/projects/new" className={buttonVariants()}>
              New Project
            </Link>
          </div>

          {error ? <AuthMessage variant="error" message={error} /> : null}
          {projectsError ? <AuthMessage variant="error" message={projectsError} /> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Projects
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {isLoadingProjects ? '...' : projects.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  AI Provider
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Ready for ideas, scripts, SEO, and thumbnails
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Workflow
                </p>
                <p className="mt-2 text-sm font-semibold">Project first, AI assets next</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Continue your creator workflow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a project, generate video ideas, then open an idea to generate
                script, SEO, and thumbnail prompt assets.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/projects" className={buttonVariants({ variant: 'outline' })}>
                  View Projects
                </Link>
                <Link href="/projects/new" className={buttonVariants()}>
                  New Project
                </Link>
                {latestProject ? (
                  <Link
                    href={`/projects/${latestProject.id}/ideas`}
                    className={buttonVariants({ variant: 'outline' })}
                  >
                    Generate Ideas
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
