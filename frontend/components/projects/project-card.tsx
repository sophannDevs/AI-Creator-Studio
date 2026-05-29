import Link from 'next/link';
import { Project } from '@/lib/api/projects';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold tracking-tight">{project.name}</h3>
            <p className="text-sm text-muted-foreground">
              {project.niche} · {project.language}
            </p>
            <p className="text-sm text-muted-foreground">Audience: {project.targetAudience}</p>
            <p className="text-sm text-muted-foreground">
              {project.description?.trim() || 'No description yet.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/projects/${project.id}`}
              className={buttonVariants({ variant: 'outline' })}
            >
              View
            </Link>
            <Link
              href={`/projects/${project.id}/ideas`}
              className={buttonVariants()}
            >
              Ideas
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
