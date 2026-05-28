import Link from 'next/link';
import { Project } from '@/lib/api/projects';

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="studio-card p-4 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
            {project.name}
          </h3>
          <p className="text-sm text-zinc-600">
            {project.niche} · {project.language}
          </p>
          <p className="text-sm text-zinc-600">Audience: {project.targetAudience}</p>
          <p className="text-sm text-zinc-500">
            {project.description?.trim() || 'No description yet.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="button-secondary"
          >
            View
          </Link>
          <Link
            href={`/projects/${project.id}/ideas`}
            className="button-primary"
          >
            Ideas
          </Link>
        </div>
      </div>
    </article>
  );
}
