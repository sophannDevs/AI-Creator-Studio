import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="auth-shell flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-3xl overflow-hidden p-0 shadow-xl">
        <div className="border-b border-border p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="brand-mark">AI</span>
            <span className="text-sm font-semibold text-muted-foreground">
              Creator planning suite
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            AI Creator Studio
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Plan channels, generate ideas, draft scripts, shape SEO, and prepare
            thumbnail prompts from one focused workspace.
          </p>
        </div>

        <div className="grid gap-0 sm:grid-cols-[1fr_280px]">
          <div className="p-8 sm:p-10">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Projects', 'Video Ideas', 'AI Assets'].map((item) => (
                <Card key={item}>
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {item}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">Ready</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={buttonVariants()}>
                Create account
              </Link>
              <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
                Login
              </Link>
              <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
                Go to dashboard
              </Link>
            </div>
          </div>

          <div className="border-t border-border p-8 sm:border-l sm:border-t-0">
            <p className="text-sm font-semibold text-muted-foreground">Workflow</p>
            <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
              <li>Create a project profile</li>
              <li>Generate video ideas</li>
              <li>Produce script, SEO, and thumbnail prompts</li>
            </ol>
          </div>
        </div>
      </Card>
    </main>
  );
}
