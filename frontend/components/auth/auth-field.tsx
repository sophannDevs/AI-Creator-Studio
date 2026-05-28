type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled = false,
}: AuthFieldProps) {
  return (
    <label htmlFor={id} className="space-y-2">
      <span className="block text-sm font-medium text-zinc-700">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="input-control"
      />
    </label>
  );
}
