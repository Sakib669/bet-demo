import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="glass-surface relative overflow-hidden rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl backdrop-blur-2xl">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-[#0000F2]/25 blur-3xl pointer-events-none" />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/40 shadow-[0_0_20px_rgba(0,210,255,0.3)]">
          <Compass className="h-7 w-7 animate-pulse" />
        </div>

        <h1 className="font-mono text-4xl font-black text-white tracking-tight">404</h1>
        <h2 className="mt-2 text-base font-bold text-gray-200">Sector Not Found</h2>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed font-medium">
          The requested coordinate or game engine module does not exist in this deployment.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="btn-tactile inline-flex items-center gap-2 rounded-2xl border border-[#0000F2] bg-[#0000F2] px-5 py-3 text-xs font-black text-white tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Gaming Arena</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
