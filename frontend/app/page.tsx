import Link from 'next/link';

export default function Home() {
  return (
    <main className="auth-shell flex items-center justify-center px-6 py-12">
      <section className="studio-panel w-full max-w-3xl overflow-hidden p-0">
        <div className="border-b border-zinc-200 bg-white/70 p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="brand-mark">AI</span>
            <span className="text-sm font-semibold text-zinc-700">
              Creator planning suite
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          AI Creator Studio
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
            Plan channels, generate ideas, draft scripts, shape SEO, and prepare
            thumbnail prompts from one focused workspace.
          </p>
        </div>
        <div className="grid gap-0 sm:grid-cols-[1fr_280px]">
          <div className="p-8 sm:p-10">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Projects', 'Video Ideas', 'AI Assets'].map((item) => (
                <div key={item} className="studio-card-soft p-4">
                  <p className="studio-label">{item}</p>
                  <p className="mt-2 text-sm text-zinc-600">Ready</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="button-primary"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="button-secondary"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="button-secondary"
          >
            Go to dashboard
          </Link>
            </div>
          </div>
          <div className="border-t border-zinc-200 bg-slate-950 p-8 text-white sm:border-l sm:border-t-0">
            <p className="text-sm font-semibold text-teal-200">Workflow</p>
            <ol className="mt-4 space-y-4 text-sm text-slate-200">
              <li>Create a project profile</li>
              <li>Generate video ideas</li>
              <li>Produce script, SEO, and thumbnail prompts</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
