'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/projects',
      label: 'Projects',
      active: pathname.startsWith('/projects') || pathname.startsWith('/ideas'),
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="studio-shell text-zinc-900">
      <header className="studio-topbar sticky top-0 z-20">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="brand-mark">AI</span>
            <span>
              <span className="block text-base font-semibold tracking-tight text-zinc-950">
                AI Creator Studio
              </span>
              <span className="hidden text-xs text-zinc-500 sm:block">
                Creator workflow command center
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-zinc-600 sm:block">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="button-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 md:grid-cols-[240px_1fr]">
        <aside className="studio-sidebar p-4">
          <p className="studio-label mb-3">
            Workspace
          </p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  item.active
                    ? 'border-blue-200 bg-blue-50 text-blue-800 shadow-sm'
                    : 'border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-white'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="studio-panel p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
