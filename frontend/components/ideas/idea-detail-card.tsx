import type { VideoIdea } from '@/lib/api/ideas';

type IdeaDetailCardProps = {
  idea: VideoIdea;
};

export function IdeaDetailCard({ idea }: IdeaDetailCardProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
      <h2 className="text-xl font-semibold text-zinc-900">{idea.title}</h2>
      <p className="mt-3 text-sm text-zinc-700">{idea.hook ?? 'No hook provided.'}</p>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Status: {idea.status}
      </p>
    </section>
  );
}
