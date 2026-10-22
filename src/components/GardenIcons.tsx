"use client";

import React from "react";

export function SproutIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" fill="#4ADE80" stroke="#16A34A" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.4 1.7-4.6-2.7.2-4.2 1-4.9 2z" fill="#86EFAC" stroke="#16A34A" />
    </svg>
  );
}

export function FlowerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="3" fill="#FBBF24" stroke="#D97706" />
      <path d="M12 5a3.5 3.5 0 0 0 0-4 3.5 3.5 0 0 0 0 4z" fill="#F472B6" />
      <path d="M12 19a3.5 3.5 0 0 0 0 4 3.5 3.5 0 0 0 0-4z" fill="#F472B6" />
      <path d="M5 12a3.5 3.5 0 0 0-4 0 3.5 3.5 0 0 0 4 0z" fill="#FB7185" />
      <path d="M19 12a3.5 3.5 0 0 0 4 0 3.5 3.5 0 0 0-4 0z" fill="#FB7185" />
      <path d="M7.05 7.05a3.5 3.5 0 0 0-2.83-2.83 3.5 3.5 0 0 0 2.83 2.83z" fill="#F43F5E" />
      <path d="M16.95 16.95a3.5 3.5 0 0 0 2.83 2.83 3.5 3.5 0 0 0-2.83-2.83z" fill="#F43F5E" />
      <path d="M7.05 16.95a3.5 3.5 0 0 0-2.83 2.83 3.5 3.5 0 0 0 2.83-2.83z" fill="#EC4899" />
      <path d="M16.95 7.05a3.5 3.5 0 0 0 2.83-2.83 3.5 3.5 0 0 0-2.83 2.83z" fill="#EC4899" />
    </svg>
  );
}

export function BeeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <ellipse cx="12" cy="14" rx="5" ry="6" fill="#FBBF24" stroke="#B45309" transform="rotate(-30 12 14)" />
      <path d="M9 11l6-3M10 14l6-3M11 17l6-3" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="8" cy="8" rx="3.5" ry="5" fill="#E0F2FE" stroke="#0284C7" transform="rotate(-20 8 8)" fillOpacity="0.8" />
      <ellipse cx="14" cy="7" rx="3.5" ry="5" fill="#E0F2FE" stroke="#0284C7" transform="rotate(30 14 7)" fillOpacity="0.8" />
      <circle cx="8" cy="18" r="1" fill="#1C1917" />
    </svg>
  );
}

export function OwlIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 2C8 2 6 5 6 9v6c0 4 3 7 6 7s6-3 6-7V9c0-4-2-7-6-7z" fill="#FEF3C7" stroke="#D97706" />
      <circle cx="9" cy="9" r="2.5" fill="#FFFFFF" stroke="#D97706" />
      <circle cx="15" cy="9" r="2.5" fill="#FFFFFF" stroke="#D97706" />
      <circle cx="9.5" cy="9" r="1.2" fill="#1E293B" />
      <circle cx="14.5" cy="9" r="1.2" fill="#1E293B" />
      <polygon points="12,12 10.5,14 13.5,14" fill="#F59E0B" />
      <path d="M7 16c1.5 1 3 1.5 5 1.5s3.5-.5 5-1.5" stroke="#D97706" strokeLinecap="round" />
    </svg>
  );
}

export function WateringCanIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="9" width="10" height="11" rx="2" fill="#BAE6FD" stroke="#0284C7" />
      <path d="M10 9V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" stroke="#0284C7" />
      <path d="M16 11l5-4" stroke="#0284C7" />
      <path d="M21 7l-1 3" stroke="#0284C7" />
      <path d="M6 12H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3" stroke="#0284C7" />
      <circle cx="21" cy="7" r="0.8" fill="#38BDF8" />
    </svg>
  );
}

export function FoxIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <polygon points="4,4 7,13 3,11" fill="#EA580C" stroke="#C2410C" />
      <polygon points="20,4 17,13 21,11" fill="#EA580C" stroke="#C2410C" />
      <path d="M5 9c0 6 3 11 7 11s7-5 7-11c0-4-3-6-7-6S5 5 5 9z" fill="#FB923C" stroke="#C2410C" />
      <path d="M9 14c1 2 2 3 3 3s2-1 3-3" fill="#FFF" stroke="#C2410C" strokeWidth="1.2" />
      <circle cx="9" cy="11" r="1.2" fill="#1C1917" />
      <circle cx="15" cy="11" r="1.2" fill="#1C1917" />
      <polygon points="12,14 11,15.5 13,15.5" fill="#1C1917" />
    </svg>
  );
}

export function PandaIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="6" cy="6" r="3" fill="#1F2937" stroke="#111827" />
      <circle cx="18" cy="6" r="3" fill="#1F2937" stroke="#111827" />
      <circle cx="12" cy="13" r="8" fill="#F9FAFB" stroke="#374151" />
      <ellipse cx="9" cy="11.5" rx="2" ry="2.5" fill="#1F2937" transform="rotate(-15 9 11.5)" />
      <ellipse cx="15" cy="11.5" rx="2" ry="2.5" fill="#1F2937" transform="rotate(15 15 11.5)" />
      <circle cx="9" cy="11.5" r="0.8" fill="#FFFFFF" />
      <circle cx="15" cy="11.5" r="0.8" fill="#FFFFFF" />
      <ellipse cx="12" cy="15" rx="1.5" ry="1" fill="#1F2937" />
    </svg>
  );
}

export function BunnyIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <ellipse cx="8" cy="7" rx="2" ry="5" fill="#FDA4AF" stroke="#E11D48" />
      <ellipse cx="16" cy="7" rx="2" ry="5" fill="#FDA4AF" stroke="#E11D48" />
      <circle cx="12" cy="14" r="7" fill="#FFF1F2" stroke="#E11D48" />
      <circle cx="9.5" cy="13" r="1" fill="#1C1917" />
      <circle cx="14.5" cy="13" r="1" fill="#1C1917" />
      <polygon points="12,15 11,16 13,16" fill="#FB7185" />
      <path d="M10 18q2 1 4 0" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LionIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" fill="#FDE047" stroke="#CA8A04" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="6" fill="#FEF08A" stroke="#CA8A04" />
      <circle cx="10" cy="10.5" r="1" fill="#1C1917" />
      <circle cx="14" cy="10.5" r="1" fill="#1C1917" />
      <polygon points="12,12.5 11,14 13,14" fill="#B45309" />
      <path d="M10 15.5q2 1 4 0" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function SunflowerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="2" strokeDasharray="2 3" />
      <circle cx="12" cy="12" r="4.5" fill="#78350F" stroke="#451A03" />
      <circle cx="10.5" cy="11" r="0.7" fill="#B45309" />
      <circle cx="13.5" cy="11" r="0.7" fill="#B45309" />
      <circle cx="12" cy="13" r="0.7" fill="#B45309" />
    </svg>
  );
}

export function TeacherIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12,3 2,8 12,13 22,8" fill="#EEF2FF" stroke="#4F46E5" />
      <path d="M6 10v6c0 2 3 4 6 4s6-2 6-4v-6" fill="#E0E7FF" stroke="#4F46E5" />
      <circle cx="12" cy="14" r="2" fill="#818CF8" />
      <line x1="22" y1="8" x2="22" y2="15" stroke="#4F46E5" strokeWidth="2" />
    </svg>
  );
}

export function StarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" fill="#FDE047" stroke="#CA8A04" />
    </svg>
  );
}
