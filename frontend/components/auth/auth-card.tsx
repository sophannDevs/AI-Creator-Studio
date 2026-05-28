import Link from 'next/link';

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <section className="studio-panel w-full max-w-md p-8">
      <header className="mb-6 space-y-2">
        <div className="mb-5 flex items-center gap-3">
          <span className="brand-mark">AI</span>
          <span className="studio-label">AI Creator Studio</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        <p className="text-sm text-zinc-600">{subtitle}</p>
      </header>

      {children}

      <p className="mt-6 text-sm text-zinc-600">
        {footerText}{' '}
        <Link href={footerLinkHref} className="font-medium text-zinc-900 underline">
          {footerLinkText}
        </Link>
      </p>
    </section>
  );
}
