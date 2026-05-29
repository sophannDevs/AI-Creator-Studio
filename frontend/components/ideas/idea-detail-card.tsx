import type { VideoIdea } from '@/lib/api/ideas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type IdeaDetailCardProps = {
  idea: VideoIdea;
};

export function IdeaDetailCard({ idea }: IdeaDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{idea.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{idea.hook ?? 'No hook provided.'}</p>
        <Badge variant="secondary">{idea.status}</Badge>
      </CardContent>
    </Card>
  );
}
