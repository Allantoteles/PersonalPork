'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0e1416] text-[#dde4e6] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-[#ff6b00] italic uppercase tracking-tighter font-['Lexend']">
            IRON_FOCUS
          </h1>
          <p className="text-sm font-bold text-[#e2bfb0] uppercase tracking-widest mt-2 font-['Lexend']">
            Forge Your Reality
          </p>
        </div>

        <div className="w-full relative h-64 mb-10 overflow-hidden rounded-xl border border-[#2f3638]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b00]/20 to-[#1a2123]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#1a2123]/50"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1416] via-transparent to-transparent"></div>
        </div>

        <Link
          href="/login"
          className="w-full h-[56px] bg-[#ff6b00] text-[#351000] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform font-['Lexend']"
        >
          COMENZAR
          <ArrowRight size={20} />
        </Link>
      </div>
    </main>
  );
}