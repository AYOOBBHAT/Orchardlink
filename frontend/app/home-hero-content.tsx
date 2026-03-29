'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function HomeHeroContent() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center space-y-6">
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          Kashmir · Apple trees
        </motion.p>

        <motion.h1
          className="flex flex-wrap items-center justify-center gap-x-2 text-5xl font-bold tracking-tight text-white [text-shadow:0_2px_32px_rgba(0,0,0,0.4)] sm:text-6xl md:text-7xl md:leading-[1.05]"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>OrchardLink</span>
          <span className="apple-spin-wrap ml-1 sm:ml-2">
            <span className="apple-spin text-5xl sm:text-6xl md:text-7xl" aria-hidden="true">
              🍎
            </span>
          </span>
        </motion.h1>

        <motion.p
          className="max-w-xl text-lg leading-relaxed text-gray-200 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        >
          Adopt a real apple tree in Kashmir and get fresh harvest delivered to your home
        </motion.p>

        <motion.p
          className="max-w-xl text-sm font-medium tracking-wide text-white/75 sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
        >
          Direct from farmers • No middlemen • Fully traceable
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="pt-2"
        >
          <Link
            href="/trees"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-green-700"
          >
            Explore Trees
          </Link>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
        >
          <Link
            href="/login"
            className="inline-flex min-w-[7.5rem] items-center justify-center rounded-xl border-2 border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition hover:border-white/50 hover:bg-white/20"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex min-w-[7.5rem] items-center justify-center rounded-xl border-2 border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition hover:border-white/50 hover:bg-white/20"
          >
            Register
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
