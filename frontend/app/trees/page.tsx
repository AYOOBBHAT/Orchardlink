'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

type FarmerRef = {
  _id: string;
  name: string;
  location: string;
};

export type Tree = {
  _id: string;
  treeCode: string;
  price: number;
  expectedYield?: string;
  status: string;
  isAvailable: boolean;
  images?: string[];
  farmer: FarmerRef | null;
  adoptedBy?: string | { _id: string; name?: string; email?: string };
};

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80';

export default function TreesPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<ReturnType<typeof getStoredUser>>(null);

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, []);

  const loadTrees = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<Tree[]>('/trees');
      setTrees(data);
    } catch (err: unknown) {
      const isProd =
        typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
      const apiBase = api.defaults.baseURL || '(missing)';
      let detail = '';
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          detail =
            'Browser could not reach the server (wrong URL, API offline, or CORS blocked). ';
        } else if (err.response) {
          detail = `Server returned ${err.response.status}. `;
        } else {
          detail = `${String(err.message)}. `;
        }
      }
      setError(
        isProd
          ? `${detail}Active API base (from last build): ${apiBase}. If this is still http://localhost:5000/api, go to Vercel → Environment Variables → confirm NEXT_PUBLIC_API_URL, then Deployments → ⋮ → Redeploy (include rebuild).`
          : `${detail}Start the API locally or set NEXT_PUBLIC_API_URL in frontend/.env.local.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrees();
  }, [loadTrees]);

  async function handleAdopt(treeId: string) {
    const user = getStoredUser();
    if (!user?.id) {
      setError('Log in to adopt a tree.');
      return;
    }
    setAdoptingId(treeId);
    try {
      const { data } = await api.post<Tree>(`/trees/${treeId}/adopt`, { userId: user.id });
      setTrees((prev) =>
        prev.map((t) => (t._id === treeId ? { ...t, ...data, isAvailable: false } : t))
      );
    } catch {
      setError('Adopt failed. The tree may already be adopted.');
    } finally {
      setAdoptingId(null);
    }
  }

  return (
    <div className="min-h-full bg-stone-100 px-3 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Tree marketplace
            </h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Browse and adopt apple trees from Kashmir
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-10 shrink-0 touch-manipulation items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 sm:pt-1"
          >
            ← Home
          </Link>
        </header>

        {error && (
          <p
            className="mb-6 max-w-full break-words rounded-lg bg-red-50 px-3 py-3 text-xs leading-relaxed text-red-800 sm:px-4 sm:text-sm"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-stone-600">Loading trees…</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {trees.map((tree) => {
              const img = tree.images?.[0] ?? PLACEHOLDER;
              const farmerName = tree.farmer?.name ?? '—';
              const farmerLoc = tree.farmer?.location ?? '—';
              const busy = adoptingId === tree._id;

              return (
                <li
                  key={tree._id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-white p-3 shadow-md ring-1 ring-stone-200/80 sm:p-4"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-stone-200">
                    <Image
                      src={img}
                      alt={tree.treeCode}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col gap-2">
                    <p className="text-lg font-semibold text-stone-900">{tree.treeCode}</p>
                    <p className="text-sm text-stone-600">
                      <span className="font-medium text-stone-800">{farmerName}</span>
                      <span className="text-stone-400"> · </span>
                      {farmerLoc}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-stone-800">₹{tree.price}</span>
                      <span className="mx-2 text-stone-300">|</span>
                      <span className="text-stone-600">Yield: {tree.expectedYield ?? '—'}</span>
                    </p>
                    <p className="text-xs uppercase tracking-wide text-emerald-700">
                      {tree.status}
                    </p>
                    <div className="mt-auto pt-4">
                      {tree.isAvailable ? (
                        sessionUser?.id ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleAdopt(tree._id)}
                            className="min-h-11 w-full touch-manipulation rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 sm:py-2.5"
                          >
                            {busy ? 'Adopting…' : 'Adopt Tree'}
                          </button>
                        ) : (
                          <Link
                            href="/login"
                            className="flex min-h-11 w-full touch-manipulation items-center justify-center rounded-lg border-2 border-emerald-600 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition active:bg-emerald-100 hover:bg-emerald-50 sm:py-2.5"
                          >
                            Log in to adopt
                          </Link>
                        )
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="min-h-11 w-full cursor-not-allowed rounded-lg bg-stone-300 px-4 py-3 text-sm font-semibold text-stone-600 sm:py-2.5"
                        >
                          Adopted
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && trees.length === 0 && !error && (
          <p className="text-stone-600">No trees yet. Run the API seeder.</p>
        )}
      </div>
    </div>
  );
}
