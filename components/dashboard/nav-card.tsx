"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ChevronRight, Folder, Calendar, CalendarDays, Lightbulb } from "lucide-react";

interface NavCardProps {
  title: string;
  icon: "project" | "yearly" | "monthly" | "thoughts";
  description: string;
  href: string;
  count?: number;
}

const iconMap = {
  project: Folder,
  yearly: Calendar,
  monthly: CalendarDays,
  thoughts: Lightbulb,
};

export function NavCard({ title, icon, description, href, count }: NavCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[icon];

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Link
      ref={cardRef}
      href={href}
      className="group relative block overflow-hidden rounded-2xl transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.015)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)`,
          opacity: isHovered ? 1 : 0.5,
        }}
      />

      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            width: 180,
            height: 180,
            left: mousePosition.x - 90,
            top: mousePosition.y - 90,
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            opacity: 0.8,
          }}
        />
      )}

      <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[160px]">
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04] flex items-center justify-center group-hover:bg-foreground/[0.04] group-hover:border-foreground/[0.08] transition-all duration-300">
            <Icon className="w-5 h-5 text-foreground/40 group-hover:text-foreground/70 transition-colors duration-300" strokeWidth={1.5} />
          </div>
          {count !== undefined && (
            <span className="text-xs font-mono text-foreground/25 group-hover:text-foreground/40 transition-colors">{count}</span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-light tracking-[0.15em] text-foreground/70 group-hover:text-foreground/95 transition-colors duration-300 mb-1.5">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground/35 group-hover:text-muted-foreground/50 transition-colors line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-foreground/15 group-hover:text-foreground/50 transition-colors duration-300">
          <span className="text-[10px] font-mono tracking-[0.2em]">ENTER</span>
          <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
