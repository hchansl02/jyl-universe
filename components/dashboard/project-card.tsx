"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";

interface ProjectCardProps {
  href: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function ProjectCard({ href, title, subtitle, children }: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

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
      className="group relative block overflow-hidden rounded-2xl transition-all duration-300"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.018)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Sheen: sharp diagonal light sweep on hover - follows mouse */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
        style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.25s ease" }}
      >
        <div
          className="absolute w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 transition-none"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            background: `radial-gradient(
              ellipse 120% 80% at 50% 50%,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.06) 25%,
              transparent 55%
            )`,
          }}
        />
        {/* Sharp diagonal streak */}
        <div
          className="absolute w-[80%] h-[1px] rotate-[-25deg] transition-all duration-150"
          style={{
            left: mousePosition.x - 80,
            top: mousePosition.y,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            boxShadow: "0 0 20px rgba(255,255,255,0.15)",
          }}
        />
      </div>

      {/* Rim light - top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, ${isHovered ? 0.2 : 0.06}) 20%,
            rgba(255, 255, 255, ${isHovered ? 0.35 : 0.12}) 50%,
            rgba(255, 255, 255, ${isHovered ? 0.2 : 0.06}) 80%,
            transparent 100%
          )`,
        }}
      />

      {/* Liquid glass border */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500"
        style={{
          border: `1px solid rgba(255, 255, 255, ${isHovered ? 0.12 : 0.04})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex items-center gap-5">
        {children ?? (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-light tracking-[0.2em] text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground/40 font-mono mt-1 tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
            <span className="text-[10px] font-mono text-foreground/20 group-hover:text-foreground/50 tracking-[0.2em] transition-colors shrink-0">
              ENTER →
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
