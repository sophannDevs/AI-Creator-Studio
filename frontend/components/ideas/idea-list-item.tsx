import Link from 'next/link';
import type { VideoIdea } from '@/lib/api/ideas';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

type IdeaListItemProps = {
  idea: VideoIdea;
};

export function IdeaListItem({ idea }: IdeaListItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-base font-semibold">{idea.title}</h3>
            <p className="text-sm text-muted-foreground">{idea.hook ?? 'No hook provided.'}</p>
            <Badge variant="secondary">{idea.status}</Badge>
          </div>
          <Link
            href={`/ideas/${idea.id}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            Open
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
