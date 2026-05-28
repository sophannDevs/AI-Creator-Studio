'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  ProjectForm,
  type ProjectFormValues,
} from '@/components/projects/project-form';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import {
  deleteProject,
  getProject,
  type Project,
  updateProject,
} from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProject = useCallback(async () => {
    if (!token) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getProject(token, projectId);
      setProject(data);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      if (apiError.status === 404) {
        setError('Project not found. It may not belong to your account.');
      } else {
        setError(apiError.message);
      }
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadProject();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, isAuthLoading, loadProject]);

  const detailRows = useMemo(() => {
    if (!project) return [];

    return [
      { label: 'Name', value: project.name },
      { label: 'Niche', value: project.niche },
      { label: 'Language', value: project.language },
      { label: 'Target Audience', value: project.targetAudience },
      { label: 'Description', value: project.description?.trim() || 'No description' },
    ];
  }, [project]);

  const handleUpdate = async (values: ProjectFormValues) => {
    if (!token || !project) {
      setError('Your session has expired. Please login again.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateProject(token, project.id, {
        name: values.name.trim(),
        niche: values.niche.trim(),
        language: values.language.trim(),
        targetAudience: values.targetAudience.trim(),
        description: values.description.trim() ? values.description.trim() : null,
      });

      setProject(updated);
      setIsEditing(false);
      setSuccess('Project updated successfully.');
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !project) {
      setError('Your session has expired. Please login again.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProject(token, project.id);
      router.push('/projects');
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Project Detail
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                View and update your project configuration.
              </p>
            </div>
            <Link
              href="/projects"
              className="button-secondary"
            >
              Back
            </Link>
          </header>

          {isLoading ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Loading project...
            </p>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {!isLoading && !error && project && !isEditing ? (
            <>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
                <dl className="space-y-3">
                  {detailRows.map((row) => (
                    <div key={row.label} className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {row.label}
                      </dt>
                      <dd className="text-sm text-zinc-800">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/projects/${project.id}/ideas`}
                  className="button-primary"
                >
                  Generate Ideas
                </Link>

                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSuccess(null);
                    setError(null);
                  }}
                  className="button-secondary"
                >
                  Edit
                </button>

                <button
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="button-danger"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          ) : null}

          {!isLoading && !error && project && isEditing ? (
            <ProjectForm
              key={project.id}
              initialValues={{
                name: project.name,
                niche: project.niche,
                language: project.language,
                targetAudience: project.targetAudience,
                description: project.description ?? '',
              }}
              submitLabel="Save Changes"
              loadingLabel="Saving..."
              isSubmitting={isSaving}
              error={error}
              success={success}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditing(false);
                setError(null);
                setSuccess(null);
              }}
            />
          ) : null}
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
