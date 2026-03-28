'use client';

import { useEffect, useState } from 'react';

const WELCOME_KEY = 'orchardlink_welcome';

export function WelcomeFlash() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(WELCOME_KEY);
    if (stored) {
      setMsg(stored);
      sessionStorage.removeItem(WELCOME_KEY);
    }
  }, []);

  if (!msg) return null;

  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-sm"
      role="status"
    >
      <p className="text-sm font-semibold sm:text-base">{msg}</p>
      <button
        type="button"
        onClick={() => setMsg(null)}
        className="shrink-0 text-xs font-medium text-emerald-800 underline decoration-emerald-600/50 underline-offset-2 hover:text-emerald-950"
      >
        Dismiss
      </button>
    </div>
  );
}
