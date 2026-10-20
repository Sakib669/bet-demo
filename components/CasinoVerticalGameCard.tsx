"use client";

import { Play } from "lucide-react";

interface CasinoVerticalGameCardProps {
  title: string;
  category: string;
  multiplier: string;
  provider: string;
  badge?: string;
  imageBg: string;
  imageSrc?: string;
  isActive: boolean;
  onSelect: () => void;
  playText?: string;
  demoText?: string;
}

export function CasinoVerticalGameCard({
  title,
  category,
  multiplier,
  provider,
  badge = "TOP",
  imageBg,
  imageSrc,
  isActive,
  onSelect,
  playText = "PLAY NOW",
  demoText = "DEMO RUN",
}: CasinoVerticalGameCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
        isActive
          ? "border-2 border-[#FFC700] shadow-[0_0_25px_rgba(255,199,0,0.4)] scale-[1.02]"
          : "border border-white/10 hover:border-[#FFC700]/70 hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] hover:-translate-y-1"
      } bg-[#051738]`}
    >
      {/* Background Graphic / Banner with Content Image */}
      <div className={`relative h-52 sm:h-64 w-full overflow-hidden ${imageBg}`}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051738] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span className="rounded-md bg-[#FF6B00] px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-md">
            {badge}
          </span>
          <span className="rounded-md bg-[#FFC700] px-2 py-0.5 text-[10px] font-mono font-bold text-[#040F26]">
            {multiplier}
          </span>
        </div>

        {/* Center Hover Play Icon Overlay (Mostbet UX) */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[#051738]/85 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 p-4">
          {/* Circular Play Button */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFC700] text-white shadow-[0_0_20px_rgba(255,107,0,0.6)] transition-transform duration-200 group-hover:scale-110">
            <Play className="h-6 w-6 fill-white ml-0.5" />
          </div>

          <span className="btn-action-orange w-full rounded-xl py-2 text-center text-xs font-black shadow-md">
            {playText}
          </span>

          <span className="w-full rounded-xl border border-white/20 bg-white/10 py-1.5 text-center text-[10px] font-bold text-white hover:bg-white/20">
            {demoText}
          </span>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3.5 flex items-center justify-between border-t border-[#08478E]/40 bg-[#051738]">
        <div>
          <h4 className="font-bold text-white text-sm tracking-tight truncate max-w-[130px] sm:max-w-[160px]">
            {title}
          </h4>
          <span className="text-[10px] text-[#8EA8C7] font-medium block">
            {category}
          </span>
        </div>

        <div className="text-right">
          <span className="rounded bg-[#08478E] px-2 py-0.5 text-[9px] font-mono font-bold text-[#FFC700] border border-white/10">
            {provider}
          </span>
        </div>
      </div>
    </div>
  );
}
