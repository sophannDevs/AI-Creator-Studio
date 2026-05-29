'use client';

import { FormEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type IdeaGenerationValues = {
  tone: string;
  count: number;
};

type FieldErrors = { tone?: string; count?: string };

type IdeaGenerationFormProps = {
  isSubmitting: boolean;
  error: string | null;
  success?: string | null;
  onSubmit: (values: IdeaGenerationValues) => Promise<void>;
};

function validate(values: IdeaGenerationValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.tone.trim()) errors.tone = 'Tone is required.';
  if (!Number.isFinite(values.count) || values.count < 1 || values.count > 10) {
    errors.count = 'Count must be between 1 and 10.';
  }
  return errors;
}

export function IdeaGenerationForm({
  isSubmitting,
  error,
  success = null,
  onSubmit,
}: IdeaGenerationFormProps) {
  const [tone, setTone] = useState('Beginner friendly');
  const [count, setCount] = useState(5);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values: IdeaGenerationValues = { tone, count };
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
          <Label htmlFor="tone">
            Tone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tone"
            value={tone}
            onChange={(e) => { setTone(e.target.value); setFieldErrors((p) => ({ ...p, tone: undefined })); }}
            placeholder="Beginner friendly"
            disabled={isSubmitting}
            aria-invalid={!!fieldErrors.tone}
            required
          />
          {fieldErrors.tone && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{fieldErrors.tone}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="count">
            Count (1–10) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => { setCount(Number(e.target.value)); setFieldErrors((p) => ({ ...p, count: undefined })); }}
            disabled={isSubmitting}
            aria-invalid={!!fieldErrors.count}
            required
          />
          {fieldErrors.count && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{fieldErrors.count}</AlertDescription>
            </Alert>
          )}
        </div>
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Generating ideas...' : 'Generate Ideas'}
      </Button>
    </form>
  );
}
