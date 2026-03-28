'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { WelcomeFlash } from '@/components/WelcomeFlash';

type FarmerRef = {
  _id: string;
  name: string;
  location: string;
};

type Tree = {
  _id: string;
  treeCode: string;
  price: number;
  expectedYield?: string;
  status: string;
  isAvailable: boolean;
  createdBy?: string | { _id: string };
  images?: string[];
  farmer: FarmerRef | null;
};

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80';

function createdByUserId(tree: Tree): string | null {
  const c = tree.createdBy;
  if (!c) return null;
  if (typeof c === 'string') return c;
  return c._id;
}

export default function FarmerPage() {
  const router = useRouter();
  const [gate, setGate] = useState<'checking' | 'denied' | 'ready'>('checking');
  const [loading, setLoading] = useState(false);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u?.id) {
      router.replace('/login');
      setGate('denied');
      return;
    }
    if (u.role !== 'farmer') {
      router.replace('/');
      setGate('denied');
      return;
    }
    setGate('ready');
  }, [router]);

  const loadTrees = useCallback(async () => {
    const uid = getStoredUser()?.id;
    if (!uid) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.get<Tree[]>('/trees');
      const mine = data.filter((t) => createdByUserId(t) === uid);
      setTrees(mine);
    } catch {
      setError('Could not load trees. Is the API running?');
      setTrees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gate !== 'ready') return;
    loadTrees();
  }, [gate, loadTrees]);

  if (gate === 'checking' || gate === 'denied') {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-stone-50 px-6 py-24">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-stone-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <WelcomeFlash />
        <h1 className="text-3xl font-bold text-stone-900">Welcome Farmer 👨‍🌾</h1>
        <p className="mt-2 text-stone-600">Trees you have listed on the marketplace</p>

        <Link
          href="/add-tree"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
        >
          Add Tree
        </Link>

        {error ? (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <section className="mt-10">
          {loading ? (
            <p className="text-stone-600">Loading your trees…</p>
          ) : trees.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-300 bg-white px-6 py-10 text-center text-stone-600">
              You haven&apos;t added any trees yet. Use <strong>Add Tree</strong> to create a listing.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {trees.map((tree) => {
                const img = tree.images?.[0] ?? PLACEHOLDER;
                return (
                  <li
                    key={tree._id}
                    className="overflow-hidden rounded-lg bg-white p-4 shadow-md ring-1 ring-stone-200"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-stone-200">
                      <Image
                        src={img}
                        alt={tree.treeCode}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                      />
                    </div>
                    <p className="mt-3 text-lg font-semibold text-stone-900">{tree.treeCode}</p>
                    <p className="text-sm text-stone-600">
                      {tree.farmer?.name ?? '—'} · ₹{tree.price}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-emerald-700">{tree.status}</p>
                    <p className="text-xs text-stone-500">
                      {tree.isAvailable ? 'Available' : 'Adopted'}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
