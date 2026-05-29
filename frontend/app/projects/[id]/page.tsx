'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProjectForm, type ProjectFormValues } from '@/components/projects/project-form';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { deleteProject, getProject, type Project, updateProject } from '@/lib/api/projects';
import { toApiError } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      setError(
        apiError.status === 404
          ? 'Project not found. It may not belong to your account.'
          : apiError.message,
      );
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

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
      setDeleteDialogOpen(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="space-y-5">
          <PageBreadcrumb items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Projects', href: '/projects' },
            { label: project?.name ?? 'Project' },
          ]} />
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Project Detail</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View and update your project configuration.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              Back to projects
            </Link>
          </header>

          {isLoading ? (
            <Alert>
              <AlertDescription>Loading project...</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}

          {!isLoading && !error && project && !isEditing ? (
            <>
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <dl className="space-y-3">
                    {detailRows.map((row) => (
                      <div
                        key={row.label}
                        className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-3"
                      >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {row.label}
                        </dt>
                        <dd className="text-sm">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-3">
                <Link href={`/projects/${project.id}/ideas`} className={buttonVariants()}>
                  Generate Ideas
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(true);
                    setSuccess(null);
                    setError(null);
                  }}
                >
                  Edit
                </Button>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button variant="destructive" />
                    }
                  >
                    Delete
                  </DialogTrigger>
                  <DialogContent showCloseButton={false}>
                    <DialogHeader>
                      <DialogTitle>Delete project?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete <strong>{project.name}</strong> and all
                        associated ideas, scripts, SEO, and thumbnail data. This action cannot
                        be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline" disabled={isDeleting} />}
                      >
                        Cancel
                      </DialogClose>
                      <Button
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => void handleDelete()}
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
