'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthMessage } from '@/components/auth/auth-message';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { listProjects, type Project } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';

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
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

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
              <p className="studio-label">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Signed in as{' '}
                <span className="font-medium text-zinc-900">{user?.email}</span>.
              </p>
            </div>
            <Link href="/projects/new" className="button-primary">
              New Project
            </Link>
          </div>

          {error ? <AuthMessage variant="error" message={error} /> : null}
          {projectsError ? (
            <AuthMessage variant="error" message={projectsError} />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="studio-card-soft p-4">
              <p className="studio-label">Projects</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">
                {isLoadingProjects ? '...' : projects.length}
              </p>
            </div>
            <div className="studio-card-soft p-4">
              <p className="studio-label">AI Provider</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                Ready for ideas, scripts, SEO, and thumbnails
              </p>
            </div>
            <div className="studio-card-soft p-4">
              <p className="studio-label">Workflow</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                Project first, AI assets next
              </p>
            </div>
          </div>

          <div className="studio-card p-5">
            <h2 className="text-lg font-semibold text-zinc-950">
              Continue your creator workflow
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Create a project, generate video ideas, then open an idea to generate
              script, SEO, and thumbnail prompt assets.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="button-secondary"
              >
                View Projects
              </Link>
              <Link
                href="/projects/new"
                className="button-primary"
              >
                New Project
              </Link>
              {latestProject ? (
                <Link
                  href={`/projects/${latestProject.id}/ideas`}
                  className="button-secondary"
                >
                  Generate Ideas
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
