'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        '/auth/login',
        { email: email.trim().toLowerCase(), password }
      );
      saveAuth(data.token, data.user);
      const welcome =
        data.user.role === 'farmer'
          ? 'Welcome back, Farmer 👨‍🌾'
          : `Welcome back, ${data.user.name} 🍎`;
      sessionStorage.setItem('orchardlink_welcome', welcome);
      const path = data.user.role === 'farmer' ? '/farmer' : '/dashboard';
      router.push(path);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-emerald-50/80 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md ring-1 ring-stone-200">
        <h1 className="text-2xl font-bold text-stone-900">Log in</h1>
        <p className="mt-1 text-sm text-stone-600">Welcome back to OrchardLink</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {error ? (
            <div className="space-y-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              <p>{error}</p>
              <p className="text-xs text-red-700/90">
                New here? Register first — accounts are stored in this app&apos;s database only.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          No account?{' '}
          <Link href="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
