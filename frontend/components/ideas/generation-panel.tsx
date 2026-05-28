type GenerationPanelProps = {
  title: string;
  description: string;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  success: string | null;
  form: React.ReactNode;
  result: React.ReactNode;
  emptyState: React.ReactNode;
  hasResult: boolean;
};

export function GenerationPanel({
  title,
  description,
  isLoading,
  isGenerating,
  error,
  success,
  form,
  result,
  emptyState,
  hasResult,
}: GenerationPanelProps) {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-600">{description}</p>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">{form}</div>

      {isLoading ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Loading saved result...
        </p>
      ) : null}

      {isGenerating ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Generating...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {!isLoading && hasResult ? result : null}
      {!isLoading && !hasResult ? emptyState : null}
    </section>
  );
}
