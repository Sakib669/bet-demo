import Link from "next/link";
import { ArrowLeft, Compass, Star } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mst-card relative overflow-hidden rounded-2xl p-8 sm:p-12 max-w-md w-full shadow-2xl">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-[#c4e77d]/20 blur-3xl pointer-events-none" />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#345441] text-[#e2f4c6] border border-[#e2f4c6]/30 shadow-[0_0_20px_rgba(255,199,0,0.25)]">
          <Compass className="h-7 w-7 animate-pulse text-[#e2f4c6]" />
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Star className="h-4 w-4 text-[#e2f4c6] fill-[#e2f4c6]" />
          <h1 className="font-mono text-4xl font-black text-white tracking-tight">404</h1>
          <Star className="h-4 w-4 text-[#e2f4c6] fill-[#e2f4c6]" />
        </div>
        <h2 className="text-base font-bold text-gray-200 uppercase tracking-wide">সেক্টর বা পেজ পাওয়া যায়নি</h2>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed font-medium">
          The requested coordinate or game engine module does not exist in this deployment.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="btn-action-orange inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.35)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>গেমিং এরিনায় ফিরুন (Return Home)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
