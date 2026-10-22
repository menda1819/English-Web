import React from "react";
import { SproutIcon, FlowerIcon } from "./GardenIcons";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-white/60 py-8 px-4 text-center">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <SproutIcon className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-stone-800" style={{ fontFamily: "var(--font-fredoka)" }}>
            Bright English Garden
          </span>
          <span>• Primary Classroom Portal</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span>Cultivating bright minds with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for young learners in Grades 1–5</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <FlowerIcon className="w-4 h-4 text-amber-500" />
          <span>Teacher & Student Dedicated Secure Hub</span>
        </div>
      </div>
    </footer>
  );
}
