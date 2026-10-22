"use client";

import React from "react";
import {
  SproutIcon,
  BeeIcon,
  OwlIcon,
  FoxIcon,
  PandaIcon,
  BunnyIcon,
  LionIcon,
  SunflowerIcon,
  TeacherIcon,
  StarIcon,
} from "./GardenIcons";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; icon: string; text: string }> = {
  xs: { container: "w-6 h-6", icon: "w-3.5 h-3.5", text: "text-[10px]" },
  sm: { container: "w-8 h-8", icon: "w-4.5 h-4.5", text: "text-xs font-bold" },
  md: { container: "w-10 h-10", icon: "w-6 h-6", text: "text-sm font-bold" },
  lg: { container: "w-12 h-12", icon: "w-7 h-7", text: "text-base font-bold" },
  xl: { container: "w-16 h-16", icon: "w-9 h-9", text: "text-xl font-bold" },
  "2xl": { container: "w-24 h-24", icon: "w-14 h-14", text: "text-3xl font-bold" },
};

export const AVATAR_PRESETS = [
  { id: "sprout", name: "Little Sprout", emoji: "🌱", description: "Young Learner", bg: "bg-emerald-100 border-emerald-300" },
  { id: "bee", name: "Busy Bee", emoji: "🐝", description: "Hard Worker", bg: "bg-amber-100 border-amber-300" },
  { id: "owl", name: "Wise Owl", emoji: "🦉", description: "Curious Scholar", bg: "bg-orange-100 border-orange-300" },
  { id: "fox", name: "Clever Fox", emoji: "🦊", description: "Bright Thinker", bg: "bg-amber-100 border-amber-400" },
  { id: "panda", name: "Gentle Panda", emoji: "🐼", description: "Calm Reader", bg: "bg-teal-100 border-teal-300" },
  { id: "bunny", name: "Quick Bunny", emoji: "🐰", description: "Energetic Writer", bg: "bg-rose-100 border-rose-300" },
  { id: "lion", name: "Brave Lion", emoji: "🦁", description: "Confident Speaker", bg: "bg-yellow-100 border-yellow-400" },
  { id: "sunflower", name: "Sunny Sunflower", emoji: "🌻", description: "Cheerful Friend", bg: "bg-amber-100 border-amber-300" },
  { id: "teacher", name: "Teacher Desk", emoji: "👩‍🏫", description: "Guiding Mentor", bg: "bg-indigo-100 border-indigo-300" },
  { id: "star", name: "Super Star", emoji: "⭐", description: "Bright Achiever", bg: "bg-yellow-100 border-yellow-300" },
];

export function UserAvatar({
  avatar,
  name = "User",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const { container, icon, text } = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // Custom uploaded image or URL
  if (avatar && (avatar.startsWith("/") || avatar.startsWith("http") || avatar.startsWith("data:"))) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-stone-100 flex items-center justify-center ${container} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback if custom avatar failed to load
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  // Mascot SVG presets
  const renderMascot = () => {
    switch (avatar) {
      case "sprout":
        return (
          <div className={`rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 ${container}`}>
            <SproutIcon className={icon} />
          </div>
        );
      case "bee":
        return (
          <div className={`rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 ${container}`}>
            <BeeIcon className={icon} />
          </div>
        );
      case "owl":
        return (
          <div className={`rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 ${container}`}>
            <OwlIcon className={icon} />
          </div>
        );
      case "fox":
        return (
          <div className={`rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center shrink-0 ${container}`}>
            <FoxIcon className={icon} />
          </div>
        );
      case "panda":
        return (
          <div className={`rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center shrink-0 ${container}`}>
            <PandaIcon className={icon} />
          </div>
        );
      case "bunny":
        return (
          <div className={`rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 ${container}`}>
            <BunnyIcon className={icon} />
          </div>
        );
      case "lion":
        return (
          <div className={`rounded-full bg-yellow-100 border border-yellow-400 flex items-center justify-center shrink-0 ${container}`}>
            <LionIcon className={icon} />
          </div>
        );
      case "sunflower":
        return (
          <div className={`rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 ${container}`}>
            <SunflowerIcon className={icon} />
          </div>
        );
      case "teacher":
        return (
          <div className={`rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center shrink-0 ${container}`}>
            <TeacherIcon className={icon} />
          </div>
        );
      case "star":
        return (
          <div className={`rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center shrink-0 ${container}`}>
            <StarIcon className={icon} />
          </div>
        );
      default:
        // Default avatar if unknown
        const initial = (name ? name.charAt(0) : "U").toUpperCase();
        return (
          <div
            className={`rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xs shrink-0 ${container} ${text}`}
          >
            {initial}
          </div>
        );
    }
  };

  return (
    <div className={`shrink-0 rounded-full inline-flex items-center justify-center ${className}`}>
      {renderMascot()}
    </div>
  );
}
