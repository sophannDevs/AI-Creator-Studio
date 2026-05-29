'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProjectForm, type ProjectFormValues } from '@/components/projects/project-form';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { createProject } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';

export default function NewProjectPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (values: ProjectFormValues) => {
    if (!token) {
      setError('Your session has expired. Please login again.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const created = await createProject(token, {
        name: values.name.trim(),
        niche: values.niche.trim(),
        language: values.language.trim(),
        targetAudience: values.targetAudience.trim(),
        description: values.description.trim() || undefined,
      });

      setSuccess('Project created. Redirecting...');
      router.push(`/projects/${created.id}`);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-5">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Create Project</h1>
            <p className="text-sm text-muted-foreground">
              Set your project context to generate better ideas and scripts.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              Back to projects
            </Link>
          </header>

          <ProjectForm
            submitLabel="Create Project"
            loadingLabel="Creating..."
            isSubmitting={isSubmitting}
            error={error}
            success={success}
            onSubmit={handleCreate}
          />
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
