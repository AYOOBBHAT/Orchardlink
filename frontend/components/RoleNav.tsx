'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

const USER_KEY = 'user';
const LEGACY_USER_KEY = 'orchardlink_user';

type NavUser = {
  id?: string;
  name: string;
  email: string;
  role: string;
};

function parseUserFromStorage(): NavUser | null {
  if (typeof window === 'undefined') return null;
  try {
    let raw = localStorage.getItem(USER_KEY);
    if (!raw) raw = localStorage.getItem(LEGACY_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NavUser & { _id?: string };
    if (parsed && !parsed.id && parsed._id) {
      parsed.id = parsed._id;
    }
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function RoleNav() {
  const pathname = usePathname();
  /** Auth snapshot from localStorage — only updated in useEffect (triggers re-renders). */
  const [user, setUser] = useState<NavUser | null>(null);
  /** Avoid wrong bar flash before first client read */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function syncUserFromStorage() {
      setUser(parseUserFromStorage());
      setHydrated(true);
    }

    syncUserFromStorage();

    window.addEventListener('storage', syncUserFromStorage);
    return () => window.removeEventListener('storage', syncUserFromStorage);
  }, [pathname]);

  function logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    clearAuth();
    setUser(null);
    window.location.href = '/login';
  }

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  if (!hydrated) {
    return (
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-6xl items-center px-4" />
      </header>
    );
  }

  const isLoggedIn = Boolean(user);
  const showGuestLinks = !isLoggedIn;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 text-sm font-medium">
        <Link
          href="/"
          className="orchardlink-brand inline-flex items-center gap-1.5 text-2xl font-extrabold tracking-tight text-green-800 transition-colors duration-300 ease-out hover:text-green-600"
        >
          <span>OrchardLink</span>
          <span className="orchardlink-apple select-none" aria-hidden="true">
            🍎
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          {showGuestLinks ? (
            <>
              <Link href="/trees" className="text-stone-600 hover:text-stone-900">
                Marketplace
              </Link>
              <Link href="/login" className="text-emerald-700 hover:text-emerald-800">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          ) : user?.role === 'farmer' ? (
            <>
              <Link href="/farmer" className="text-stone-600 hover:text-stone-900">
                My Trees
              </Link>
              <Link href="/add-tree" className="text-emerald-700 hover:text-emerald-800">
                Add Tree
              </Link>
              <Link href="/trees" className="text-stone-600 hover:text-stone-900">
                Marketplace
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-stone-500 hover:text-stone-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/trees" className="text-stone-600 hover:text-stone-900">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-emerald-700 hover:text-emerald-800">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-stone-500 hover:text-stone-800"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
