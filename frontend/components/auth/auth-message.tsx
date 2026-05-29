import { Alert, AlertDescription } from '@/components/ui/alert';

type AuthMessageProps = {
  message: string;
  variant: 'error' | 'success';
};

export function AuthMessage({ message, variant }: AuthMessageProps) {
  if (variant === 'error') {
    return (
      <Alert variant="destructive">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
