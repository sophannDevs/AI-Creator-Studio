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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';

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
    if (isAuthLoading || !isAuthenticated) return;

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
              <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your creator channel projects.
              </p>
            </div>
            <Link href="/projects/new" className={buttonVariants()}>
              New Project
            </Link>
          </header>

          {isLoading ? (
            <Alert>
              <AlertDescription>Loading projects...</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-3">
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchProjects()}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {!isLoading && !error && projects.length === 0 ? <ProjectEmptyState /> : null}

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
