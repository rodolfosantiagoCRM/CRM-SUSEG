'use client';

import React from 'react';

interface SusegLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export default function SusegLogo({ className = 'h-24 md:h-28 translate-y-1.5' }: SusegLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/suseg-logo.png"
        alt="SUSEG Soluções Integradas"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
