import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

export function ProjectEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <h2 className="text-lg font-semibold">No projects yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first project to start generating ideas and scripts.
        </p>
        <Link href="/projects/new" className={buttonVariants({ className: 'mt-5' })}>
          Create Project
        </Link>
      </CardContent>
    </Card>
  );
}
