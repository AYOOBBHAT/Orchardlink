'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const MAX_IMAGES = 3;

export default function AddTreePage() {
  const router = useRouter();
  const [gate, setGate] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [price, setPrice] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
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
    setGate('ok');
  }, [router]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    setFiles(picked.slice(0, MAX_IMAGES));
    e.target.value = '';
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('farmerId', user.id);
      formData.append('price', price);
      const yieldVal = expectedYield.trim();
      if (yieldVal) {
        formData.append('expectedYield', yieldVal);
      }
      for (let i = 0; i < files.length; i += 1) {
        formData.append('images', files[i]);
      }

      await api.post('/trees', formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/farmer');
      }, 1200);
    } catch (err: unknown) {
      let msg: string | null = null;
      if (err && typeof err === 'object' && 'response' in err) {
        const data = (err as { response?: { data?: unknown } }).response?.data;
        if (data && typeof data === 'object' && data !== null && 'message' in data) {
          const m = (data as { message: unknown }).message;
          if (typeof m === 'string') msg = m;
        } else if (typeof data === 'string') {
          msg = data;
        }
      }
      setError(msg ?? 'Could not add tree');
    } finally {
      setLoading(false);
    }
  }

  if (gate === 'checking' || gate === 'denied') {
    return (
      <div className="flex min-h-full items-center justify-center bg-stone-50 px-4 py-12">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-stone-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">Add a tree</h1>
          <Link href="/farmer" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            My Trees
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-white p-6 shadow-md ring-1 ring-stone-200"
        >
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-stone-700">
              Price (₹)
            </label>
            <input
              id="price"
              type="number"
              required
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="yield" className="block text-sm font-medium text-stone-700">
              Expected yield
            </label>
            <input
              id="yield"
              type="text"
              placeholder="e.g. 15-20kg"
              value={expectedYield}
              onChange={(e) => setExpectedYield(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="photos" className="block text-sm font-medium text-stone-700">
              Orchard photos
            </label>
            <p className="mt-0.5 text-xs text-stone-500">
              Up to {MAX_IMAGES} images (JPEG, PNG, WebP). Uploaded securely via the server.
            </p>
            <input
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFilesChange}
              className="mt-2 block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-800 hover:file:bg-emerald-100"
            />
          </div>

          {previews.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Preview</p>
              <ul className="grid grid-cols-3 gap-2">
                {previews.map((src, index) => (
                  <li
                    key={`${src}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URLs */}
                    <img
                      src={src}
                      alt={`Selected ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 rounded bg-stone-900/75 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-stone-900"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-emerald-700" role="status">
              Tree added successfully. Redirecting…
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Adding…' : 'Add Tree'}
          </button>
        </form>
      </div>
    </div>
  );
}
