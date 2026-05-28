'use client';

import { FormEvent, useMemo, useState } from 'react';

export type ProjectFormValues = {
  name: string;
  niche: string;
  language: string;
  targetAudience: string;
  description: string;
};

type ProjectFormProps = {
  initialValues?: Partial<ProjectFormValues>;
  submitLabel: string;
  loadingLabel: string;
  isSubmitting: boolean;
  error: string | null;
  success?: string | null;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel?: () => void;
};

function validate(values: ProjectFormValues): string | null {
  if (!values.name.trim()) return 'Name is required.';
  if (!values.niche.trim()) return 'Niche is required.';
  if (!values.language.trim()) return 'Language is required.';
  if (!values.targetAudience.trim()) return 'Target audience is required.';

  return null;
}

export function ProjectForm({
  initialValues,
  submitLabel,
  loadingLabel,
  isSubmitting,
  error,
  success = null,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [niche, setNiche] = useState(initialValues?.niche ?? '');
  const [language, setLanguage] = useState(initialValues?.language ?? '');
  const [targetAudience, setTargetAudience] = useState(
    initialValues?.targetAudience ?? '',
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const fieldsDisabled = isSubmitting;

  const effectiveError = useMemo(
    () => validationError ?? error,
    [validationError, error],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values: ProjectFormValues = {
      name,
      niche,
      language,
      targetAudience,
      description,
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
          <span className="text-sm font-medium text-zinc-700">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Backend Developer Channel"
            disabled={fieldsDisabled}
            className="input-control"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Niche</span>
          <input
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            placeholder="Programming"
            disabled={fieldsDisabled}
            className="input-control"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Language</span>
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="English"
            disabled={fieldsDisabled}
            className="input-control"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Target Audience</span>
          <input
            value={targetAudience}
            onChange={(event) => setTargetAudience(event.target.value)}
            placeholder="Junior developers"
            disabled={fieldsDisabled}
            className="input-control"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-700">Description (optional)</span>
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Teaching backend development"
          disabled={fieldsDisabled}
          className="input-control"
        />
      </label>

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

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={fieldsDisabled}
          className="button-primary"
        >
          {isSubmitting ? loadingLabel : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={fieldsDisabled}
            className="button-secondary"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
