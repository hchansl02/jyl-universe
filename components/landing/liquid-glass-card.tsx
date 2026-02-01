"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
}

export function LiquidGlassCard({ children, className = "" }: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.015)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, ${isHovering ? 0.15 : 0.06}) 20%,
            rgba(255, 255, 255, ${isHovering ? 0.25 : 0.1}) 50%,
            rgba(255, 255, 255, ${isHovering ? 0.15 : 0.06}) 80%,
            transparent 100%
          )`,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.02) 30%,
            rgba(255, 255, 255, 0.04) 50%,
            rgba(255, 255, 255, 0.02) 70%,
            transparent 100%
          )`,
        }}
      />

      <div
        className="absolute inset-y-0 left-0 w-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(180deg,
            rgba(255, 255, 255, ${isHovering ? 0.12 : 0.05}) 0%,
            rgba(255, 255, 255, 0.02) 50%,
            transparent 100%
          )`,
        }}
      />

      <div
        className="absolute inset-y-0 right-0 w-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(180deg,
            rgba(255, 255, 255, ${isHovering ? 0.12 : 0.05}) 0%,
            rgba(255, 255, 255, 0.02) 50%,
            transparent 100%
          )`,
        }}
      />

      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, rgba(255, 255, 255, ${isHovering ? 0.04 : 0}) 0%, transparent 70%)`,
          opacity: isHovering ? 1 : 0,
        }}
      />

      <div
        className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, rgba(255, 255, 255, ${isHovering ? 0.08 : 0.03}) 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 0%, rgba(255, 255, 255, ${isHovering ? 0.06 : 0.02}) 0%, transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
        style={{
          boxShadow: `inset 0 1px 1px rgba(255, 255, 255, ${isHovering ? 0.06 : 0.03})`,
        }}
      />

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500"
        style={{
          border: `1px solid rgba(255, 255, 255, ${isHovering ? 0.1 : 0.04})`,
        }}
      />

      <div className="relative z-10 p-8">
        {children}
      </div>
    </div>
  );
}
