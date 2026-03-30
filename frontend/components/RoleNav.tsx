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
        <div className="mx-auto min-h-14 max-w-6xl px-3 py-2 sm:px-4" />
      </header>
    );
  }

  const isLoggedIn = Boolean(user);
  const showGuestLinks = !isLoggedIn;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2 sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-0">
        <Link
          href="/"
          className="orchardlink-brand inline-flex shrink-0 items-center gap-1 text-lg font-extrabold tracking-tight text-green-800 transition-colors duration-300 ease-out hover:text-green-600 sm:gap-1.5 sm:text-xl md:text-2xl"
        >
          <span>OrchardLink</span>
          <span className="orchardlink-apple select-none text-[1.1em] sm:text-[1em]" aria-hidden="true">
            🍎
          </span>
        </Link>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-x-1 gap-y-1 sm:gap-3 md:gap-4">
          {showGuestLinks ? (
            <>
              <Link
                href="/trees"
                className="min-h-10 min-w-0 touch-manipulation rounded-md px-2 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 sm:px-3 sm:py-2"
              >
                Marketplace
              </Link>
              <Link
                href="/login"
                className="min-h-10 min-w-0 touch-manipulation rounded-md px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:px-3 sm:py-2"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="min-h-10 touch-manipulation rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 sm:px-4"
              >
                Register
              </Link>
            </>
          ) : user?.role === 'farmer' ? (
            <>
              <Link
                href="/farmer"
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-stone-600 hover:bg-stone-50 sm:px-2.5"
              >
                My Trees
              </Link>
              <Link
                href="/add-tree"
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50 sm:px-2.5"
              >
                Add Tree
              </Link>
              <Link
                href="/trees"
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-stone-600 hover:bg-stone-50 sm:px-2.5"
              >
                Marketplace
              </Link>
              <button
                type="button"
                onClick={logout}
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 sm:px-2.5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/trees"
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-stone-600 hover:bg-stone-50 sm:px-2.5"
              >
                Marketplace
              </Link>
              <Link
                href="/dashboard"
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50 sm:px-2.5"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="min-h-10 touch-manipulation rounded-md px-2 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 sm:px-2.5"
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
