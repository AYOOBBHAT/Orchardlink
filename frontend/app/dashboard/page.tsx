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
  adoptedBy?: string | { _id: string; name?: string; email?: string };
  images?: string[];
  farmer: FarmerRef | null;
};

type TimelineUpdate = {
  _id: string;
  message: string;
  image?: string;
  date: string;
};

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80';

const STATUS_UI: Record<
  string,
  { label: string; className: string; progress: number }
> = {
  growing: {
    label: '🌱 Growing',
    className: 'bg-emerald-100 text-emerald-900 ring-emerald-600/20',
    progress: 25,
  },
  fruiting: {
    label: '🍏 Fruit Forming',
    className: 'bg-lime-100 text-lime-900 ring-lime-600/20',
    progress: 50,
  },
  ready: {
    label: '🍎 Ready to Harvest',
    className: 'bg-rose-100 text-rose-900 ring-rose-600/20',
    progress: 75,
  },
  delivered: {
    label: '📦 Delivered',
    className: 'bg-sky-100 text-sky-900 ring-sky-600/20',
    progress: 100,
  },
};

function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase() ?? '';
  const known = STATUS_UI[key];
  if (known) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${known.className}`}
      >
        {known.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-800 ring-1 ring-inset ring-stone-500/20">
      {status}
    </span>
  );
}

function ProgressBar({ status }: { status: string }) {
  const key = status?.toLowerCase() ?? '';
  const pct = STATUS_UI[key]?.progress ?? 0;
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs text-stone-600">
        <span>Progress</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UpdatesTimeline({
  updates,
  loading,
}: {
  updates: TimelineUpdate[];
  loading: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-stone-600">Loading updates…</p>;
  }
  if (updates.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50/80 px-4 py-6 text-center text-sm text-stone-600">
        No updates yet for this tree.
      </p>
    );
  }
  return (
    <ul className="relative border-l-2 border-emerald-200 pl-8">
      {updates.map((u) => {
        const d = new Date(u.date);
        const dateStr = d.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        return (
          <li key={u._id} className="relative mb-8 last:mb-0">
            <span
              className="absolute -left-[calc(0.5rem+2px)] top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-200"
              aria-hidden
            />
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
              {u.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.image}
                  alt=""
                  className="mb-3 aspect-video w-full max-w-md rounded-md object-cover"
                />
              ) : null}
              <p className="text-stone-800">{u.message}</p>
              <p className="mt-2 text-xs text-stone-500">{dateStr}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [gate, setGate] = useState<'checking' | 'denied' | 'ready'>('checking');
  const [loading, setLoading] = useState(true);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [updatesMap, setUpdatesMap] = useState<Record<string, TimelineUpdate[]>>({});
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u?.id) {
      router.replace('/login');
      setGate('denied');
      return;
    }
    if (u.role !== 'adopter') {
      router.replace('/');
      setGate('denied');
      return;
    }
    setGate('ready');
  }, [router]);

  const loadDashboard = useCallback(async () => {
    setError(null);
    setLoading(true);
    setUpdatesMap({});
    try {
      const uid = getStoredUser()?.id;
      if (!uid) {
        setTrees([]);
        return;
      }

      const { data } = await api.get<Tree[]>(`/trees/my/${uid}`);
      setTrees(data);

      setUpdatesLoading(true);
      const pairs = await Promise.all(
        data.map(async (t) => {
          try {
            const { data: list } = await api.get<TimelineUpdate[]>(`/updates/${t._id}`);
            return [t._id, list] as const;
          } catch {
            return [t._id, [] as TimelineUpdate[]] as const;
          }
        })
      );
      const map: Record<string, TimelineUpdate[]> = {};
      pairs.forEach(([id, list]) => {
        map[id] = list;
      });
      setUpdatesMap(map);
    } catch {
      setError('Could not load your dashboard. Is the API running?');
      setTrees([]);
      setUpdatesMap({});
    } finally {
      setLoading(false);
      setUpdatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gate !== 'ready') return;
    loadDashboard();
  }, [gate, loadDashboard]);

  if (gate === 'checking' || gate === 'denied') {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-stone-50 px-6 py-24">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-stone-50 px-6 py-24">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-stone-50 px-6 py-24">
        <p className="text-center text-red-800">{error}</p>
        <Link
          href="/trees"
          className="mt-6 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Go to Marketplace
        </Link>
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="min-h-full bg-stone-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <WelcomeFlash />
          <div className="flex flex-col items-center justify-center py-16">
            <p className="max-w-sm text-center text-lg text-stone-700">
              No trees adopted yet 🌿
            </p>
            <Link
              href="/trees"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
            >
              Go to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-stone-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-stone-900">My Trees 🍎</h1>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/trees" className="text-emerald-700 hover:text-emerald-800">
              Marketplace
            </Link>
            <Link href="/" className="text-stone-600 hover:text-stone-800">
              Home
            </Link>
          </div>
        </header>

        <WelcomeFlash />

        <div className="flex flex-col gap-12">
          {trees.map((tree) => {
            const img = tree.images?.[0] ?? PLACEHOLDER;
            const farmerName = tree.farmer?.name ?? '—';
            const farmerLoc = tree.farmer?.location ?? '—';
            const updates = updatesMap[tree._id] ?? [];

            return (
              <article key={tree._id} className="scroll-mt-8">
                <section className="overflow-hidden rounded-lg bg-white p-6 shadow-md">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-stone-200 sm:w-64">
                      <Image
                        src={img}
                        alt={tree.treeCode}
                        fill
                        className="object-cover"
                        sizes="256px"
                        unoptimized
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <p className="text-xl font-bold text-stone-900">{tree.treeCode}</p>
                      <p className="text-sm text-stone-600">
                        <span className="font-medium text-stone-800">{farmerName}</span>
                        <span className="text-stone-400"> · </span>
                        {farmerLoc}
                      </p>
                      <p className="text-sm text-stone-600">
                        <span className="font-medium text-stone-800">Expected yield:</span>{' '}
                        {tree.expectedYield ?? '—'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-stone-700">Status</span>
                        <StatusBadge status={tree.status} />
                      </div>
                      <ProgressBar status={tree.status} />
                    </div>
                  </div>
                </section>

                <section className="mt-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Updates</h2>
                  <UpdatesTimeline updates={updates} loading={updatesLoading} />
                </section>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
