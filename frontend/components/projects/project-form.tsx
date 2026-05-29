'use client';

import { FormEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type ProjectFormValues = {
  name: string;
  niche: string;
  language: string;
  targetAudience: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof ProjectFormValues, string>>;

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

function validate(values: ProjectFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.niche.trim()) errors.niche = 'Niche is required.';
  if (!values.language.trim()) errors.language = 'Language is required.';
  if (!values.targetAudience.trim()) errors.targetAudience = 'Target audience is required.';
  return errors;
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
  const [targetAudience, setTargetAudience] = useState(initialValues?.targetAudience ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const fieldsDisabled = isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values: ProjectFormValues = { name, niche, language, targetAudience, description };
    const errors = validate(values);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
            placeholder="Backend Developer Channel"
            disabled={fieldsDisabled}
            aria-invalid={!!fieldErrors.name}
            required
          />
          {fieldErrors.name && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{fieldErrors.name}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">
            Niche <span className="text-red-500">*</span>
          </Label>
          <Input
            id="niche"
            value={niche}
            onChange={(e) => { setNiche(e.target.value); setFieldErrors((p) => ({ ...p, niche: undefined })); }}
            placeholder="Programming"
            disabled={fieldsDisabled}
            aria-invalid={!!fieldErrors.niche}
            required
          />
          {fieldErrors.niche && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{fieldErrors.niche}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">
            Language <span className="text-red-500">*</span>
          </Label>
          <Input
            id="language"
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setFieldErrors((p) => ({ ...p, language: undefined })); }}
            placeholder="English"
            disabled={fieldsDisabled}
            aria-invalid={!!fieldErrors.language}
            required
          />
          {fieldErrors.language && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{fieldErrors.language}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">
            Target Audience <span className="text-red-500">*</span>
          </Label>
          <Input
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => { setTargetAudience(e.target.value); setFieldErrors((p) => ({ ...p, targetAudience: undefined })); }}
            placeholder="Junior developers"
            disabled={fieldsDisabled}
            aria-invalid={!!fieldErrors.targetAudience}
            required
          />
          {fieldErrors.targetAudience && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{fieldErrors.targetAudience}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Teaching backend development"
          disabled={fieldsDisabled}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={fieldsDisabled}>
          {isSubmitting ? loadingLabel : submitLabel}
        </Button>

        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={fieldsDisabled}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
