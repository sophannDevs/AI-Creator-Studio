'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectEmptyState } from '@/components/projects/project-empty-state';
import { Project, listProjects } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';

export default function ProjectsPage() {
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await listProjects(token);
      setProjects(data);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchProjects();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, isAuthLoading, fetchProjects]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Projects
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Manage your creator channel projects.
              </p>
            </div>
            <Link
              href="/projects/new"
              className="button-primary"
            >
              New Project
            </Link>
          </header>

          {isLoading ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Loading projects...
            </p>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              <button
                onClick={() => void fetchProjects()}
                className="mt-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !error && projects.length === 0 ? (
            <ProjectEmptyState />
          ) : null}

          {!isLoading && !error && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
