'use client';

import React from 'react';

export default function CasanLogo({ className = 'h-10' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="h-4/5 w-auto" fill="currentColor">
        {/* Blue rounded triangle (main body) */}
        <path
          d="M50 12 L88 72 A 6 6 0 0 1 83 80 L17 80 A 6 6 0 0 1 12 72 Z"
          fill="#1d4ed8"
        />
        {/* Inner white drop/negative space */}
        <path
          d="M50 25 L75 66 A 3 3 0 0 1 72 70 L28 70 A 3 3 0 0 1 25 66 Z"
          fill="white"
        />
        {/* Inner blue core shape matching the drop */}
        <path
          d="M50 32 L68 62 A 2 2 0 0 1 66 65 L34 65 A 2 2 0 0 1 32 62 Z"
          fill="#1d4ed8"
        />
        {/* Green inner 'C' / circular shape in center */}
        <circle cx="50" cy="55" r="14" fill="#00b19f" />
        <circle cx="50" cy="55" r="7" fill="white" />
        {/* Cut out to make it a 'C' */}
        <rect x="58" y="50" width="10" height="10" fill="white" />
      </svg>
      {/* Text "casan" underneath */}
      <span className="text-[10px] font-black text-blue-800 tracking-wide mt-0.5 leading-none">casan</span>
    </div>
  );
}
