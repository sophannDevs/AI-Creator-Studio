import type { VideoIdea } from '@/lib/api/ideas';
import { IdeaListItem } from './idea-list-item';

type IdeasListProps = {
  ideas: VideoIdea[];
};

export function IdeasList({ ideas }: IdeasListProps) {
  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <IdeaListItem key={idea.id} idea={idea} />
      ))}
    </div>
  );
}
