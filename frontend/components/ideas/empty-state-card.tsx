type EmptyStateCardProps = {
  title: string;
  description: string;
};

export function EmptyStateCard({ title, description }: EmptyStateCardProps) {
  return (
    <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </section>
  );
}
