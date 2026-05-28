import Link from 'next/link';

export function ProjectEmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">No projects yet</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Create your first project to start generating ideas and scripts.
      </p>
      <Link
        href="/projects/new"
        className="button-primary mt-5"
      >
        Create Project
      </Link>
    </section>
  );
}
