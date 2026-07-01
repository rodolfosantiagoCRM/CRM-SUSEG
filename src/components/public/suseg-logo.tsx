'use client';

import React from 'react';

interface SusegLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export default function SusegLogo({ className = 'h-10', showText = true, textColor = 'text-chombo' }: SusegLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Shield & Camera Icon */}
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto text-suseg-green"
        fill="currentColor"
      >
        {/* Shield shape */}
        <path d="M50 8C35.5 22.3 12.5 24.3 10 51.3c-2.3 24.7 19.3 40.7 40 46.7 20.7-6 42.3-22 40-46.7-2.5-27-25.5-29-40-43.3z" />
        
        {/* Shield Inner Border (White line) */}
        <path
          d="M50 14C38.2 26 18.2 27.7 16 50.7c-2 21 16 34.3 34 39.3 18-5 36-18.3 34-39.3-2.2-23-22.2-24.7-34-36.7z"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
        />

        {/* Security Camera Silhouette inside the shield */}
        {/* Camera main body */}
        <rect x="35" y="42" width="34" height="15" rx="3" fill="white" />
        {/* Camera hood / visor */}
        <path d="M32 40 L69 40 L69 44 L32 44 Z" fill="white" />
        {/* Camera lens attachment */}
        <path d="M69 43 L76 46 L76 53 L69 56 Z" fill="white" />
        {/* Camera bracket / arm */}
        <path d="M42 57 L42 66 L34 66 L34 68 L48 68 L48 66 L45 66 L45 57 Z" fill="white" />
        {/* Camera status LED (red dot inside the white body) */}
        <circle cx="62" cy="50" r="1.5" fill="#EF4444" />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`text-xl sm:text-2xl font-black tracking-wider leading-none ${textColor}`}>
            SUSEG
          </span>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-0.5">
            Segurança Eletrônica
          </span>
        </div>
      )}
    </div>
  );
}
