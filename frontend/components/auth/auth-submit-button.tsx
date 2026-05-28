type AuthSubmitButtonProps = {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
};

export function AuthSubmitButton({
  label,
  loadingLabel,
  isLoading,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="button-primary w-full"
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
