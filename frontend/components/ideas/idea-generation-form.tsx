'use client';

import { FormEvent, useMemo, useState } from 'react';

export type IdeaGenerationValues = {
  tone: string;
  count: number;
};

type IdeaGenerationFormProps = {
  isSubmitting: boolean;
  error: string | null;
  success?: string | null;
  onSubmit: (values: IdeaGenerationValues) => Promise<void>;
};

function validate(values: IdeaGenerationValues): string | null {
  if (!values.tone.trim()) return 'Tone is required.';
  if (!Number.isFinite(values.count) || values.count < 1 || values.count > 10) {
    return 'Count must be between 1 and 10.';
  }
  return null;
}

export function IdeaGenerationForm({
  isSubmitting,
  error,
  success = null,
  onSubmit,
}: IdeaGenerationFormProps) {
  const [tone, setTone] = useState('Beginner friendly');
  const [count, setCount] = useState(5);
  const [validationError, setValidationError] = useState<string | null>(null);

  const effectiveError = useMemo(
    () => validationError ?? error,
    [validationError, error],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values: IdeaGenerationValues = {
      tone,
      count,
    };

    const formError = validate(values);
    if (formError) {
      setValidationError(formError);
      return;
    }

    setValidationError(null);
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Tone</span>
          <input
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            placeholder="Beginner friendly"
            disabled={isSubmitting}
            className="input-control"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Count (1-10)</span>
          <input
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            disabled={isSubmitting}
            className="input-control"
          />
        </label>
      </div>

      {effectiveError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {effectiveError}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary"
      >
        {isSubmitting ? 'Generating ideas...' : 'Generate Ideas'}
      </button>
    </form>
  );
}
