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
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';

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
    const timer = window.setTimeout(() => void loadProjects(), 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isAuthLoading, loadProjects]);

  const latestProject = useMemo(() => projects[0], [projects]);

  const workflowSteps = useMemo(() => [
    {
      step: 1,
      title: 'Create a Project',
      description: 'Set your channel niche, language, and target audience to give AI the right context.',
      action: { label: 'New Project', href: '/projects/new' },
    },
    {
      step: 2,
      title: 'Generate Video Ideas',
      description: 'AI generates video ideas tailored to your project. Pick the best ones to develop further.',
      action: latestProject
        ? { label: 'Generate Ideas', href: `/projects/${latestProject.id}/ideas` }
        : { label: 'Create a project first', href: '/projects/new' },
    },
    {
      step: 3,
      title: 'Generate a Script',
      description: 'Open a video idea and generate a full script — hook, intro, main content, and CTA.',
      action: { label: 'Go to Projects', href: '/projects' },
    },
    {
      step: 4,
      title: 'Generate SEO & Thumbnail',
      description: 'Get an SEO title, description, hashtags, and a thumbnail prompt ready for publishing.',
      action: { label: 'Go to Projects', href: '/projects' },
    },
  ], [latestProject]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-6">

          <PageBreadcrumb items={[{ label: 'Dashboard' }]} />

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user?.email}</span>
              </p>
            </div>
            <Link href="/projects/new" className={buttonVariants()}>
              New Project
            </Link>
          </div>

          {error ? <AuthMessage variant="error" message={error} /> : null}
          {projectsError ? <AuthMessage variant="error" message={projectsError} /> : null}

          {/* Stat cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Projects
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {isLoadingProjects ? '...' : projects.length}
                </p>
                {!isLoadingProjects && projects.length === 0 && (
                  <Link
                    href="/projects/new"
                    className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
                  >
                    Create your first project →
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  AI Provider
                </p>
                <p className="mt-2 text-sm font-semibold">Mock Mode</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Generates sample content instantly. No API key required. Switch to OpenAI in
                  backend <code className="rounded bg-muted px-1 py-0.5 font-mono">.env</code> for
                  real AI output.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow steps */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                How it works
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow these 4 steps to create AI-powered video content.
              </p>

              <div className="mt-4">
                {workflowSteps.map((item, i) => (
                  <div
                    key={item.step}
                    className={`flex items-start gap-4 py-4 ${i < workflowSteps.length - 1 ? 'border-b' : ''}`}
                  >
                    {/* Step number */}
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-blue-300 text-xs font-bold text-blue-600">
                      {item.step}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>

                    {/* Action */}
                    <Link
                      href={item.action.href}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      {item.action.label}
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
