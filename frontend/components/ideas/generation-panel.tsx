import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <Card>
        <CardContent className="p-4 sm:p-5">{form}</CardContent>
      </Card>

      {isLoading ? (
        <Alert>
          <AlertDescription>Loading saved result...</AlertDescription>
        </Alert>
      ) : null}

      {isGenerating ? (
        <Alert>
          <AlertDescription>Generating...</AlertDescription>
        </Alert>
      ) : null}

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

      {!isLoading && hasResult ? result : null}
      {!isLoading && !hasResult ? emptyState : null}
    </section>
  );
}
