"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  imageSize?: number;
}

export function Logo({ className = "", imageSize = 64 }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={`inline-flex flex-col items-center gap-3 transition-opacity hover:opacity-90 ${className}`}
    >
      <img
        src="/sowoldamlogo.png"
        alt="JYL UNIVERSE"
        width={imageSize}
        height={imageSize}
        className="object-contain"
      />
      <span className="text-[10px] font-mono tracking-[0.25em] text-foreground/70 uppercase">
        JYL UNIVERSE
      </span>
    </Link>
  );
}
