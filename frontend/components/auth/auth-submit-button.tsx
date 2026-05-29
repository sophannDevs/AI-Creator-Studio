import { Button } from '@/components/ui/button';

type AuthSubmitButtonProps = {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
};

export function AuthSubmitButton({ label, loadingLabel, isLoading }: AuthSubmitButtonProps) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading ? loadingLabel : label}
    </Button>
  );
}
