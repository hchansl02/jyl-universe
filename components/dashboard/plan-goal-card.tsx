"use client";

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

interface PlanGoalCardProps {
  href: string;
  title: string;
  completed: boolean;
}

export function PlanGoalCard({ href, title, completed }: PlanGoalCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.018)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500"
        style={{ border: "1px solid rgba(255, 255, 255, 0.04)" }}
      />
      <div className="relative z-10 p-5 flex items-center gap-4">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
            completed ? "bg-foreground/70 border-foreground/70" : "border-foreground/15 group-hover:border-foreground/35"
          }`}
        >
          {completed && <Check className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />}
        </div>
        <span
          className={`flex-1 text-sm tracking-wide transition-all ${
            completed
              ? "text-muted-foreground/40 line-through"
              : "text-foreground/80 group-hover:text-foreground"
          }`}
        >
          {title}
        </span>
        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 shrink-0 transition-colors" />
      </div>
    </Link>
  );
}
