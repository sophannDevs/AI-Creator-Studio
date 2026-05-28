import Link from 'next/link';
import type { VideoIdea } from '@/lib/api/ideas';

type IdeaListItemProps = {
  idea: VideoIdea;
};

export function IdeaListItem({ idea }: IdeaListItemProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-zinc-900">{idea.title}</h3>
          <p className="text-sm text-zinc-600">{idea.hook ?? 'No hook provided.'}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Status: {idea.status}
          </p>
        </div>

        <Link
          href={`/ideas/${idea.id}`}
          className="button-secondary"
        >
          Open
        </Link>
      </div>
    </article>
  );
}
