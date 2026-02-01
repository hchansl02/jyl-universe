"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SpaceBackground } from "@/components/dashboard/space-background";
import { Logo } from "@/components/common/Logo";
import { ArrowLeft } from "lucide-react";

const CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const ITEM = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const glassStyle = {
  background: "rgba(255, 255, 255, 0.018)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
};

export default function SowoldamPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between relative overflow-hidden px-6 pt-20 pb-20">
      <SpaceBackground />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="fixed top-6 left-6 z-20">
        <Link
          href="/project/k"
          className="inline-flex items-center gap-2 text-[11px] font-mono text-muted-foreground/50 hover:text-foreground/90 tracking-[0.2em] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>BACK TO PROJECT K</span>
        </Link>
      </div>

      {/* 상단: 로고 + Ep 1 */}
      <motion.div
        className="w-full max-w-2xl flex flex-col items-center shrink-0"
        variants={CONTAINER}
        initial="hidden"
        animate="show"
      >
        <motion.header className="text-center mb-4" variants={ITEM}>
          <Logo imageSize={160} className="mb-2" />
        </motion.header>
        <motion.p
          className="text-center text-[10px] font-mono tracking-[0.2em] text-foreground/70"
          variants={ITEM}
        >
          Ep 1. 무제
        </motion.p>
      </motion.div>

      {/* 중간: Liquid Glass 박스 (mt-20 이상으로 하향) */}
      <motion.section
        className="w-full max-w-2xl mx-auto mt-20 min-h-[280px] flex items-center justify-center rounded-2xl overflow-hidden p-10 md:p-12 shrink-0"
        variants={ITEM}
        initial="hidden"
        animate="show"
        style={glassStyle}
      >
        <p className="text-sm text-muted-foreground/30 font-mono tracking-wider">
          콘텐츠 영역
        </p>
      </motion.section>

      {/* 하단: 2026 문구 고정용 공간 (실제 문구는 fixed로 맨 아래) */}
      <div className="shrink-0 h-8" aria-hidden />

      {/* © 2026 JYL UNIVERSE - 화면 맨 아래 고정 */}
      <footer className="fixed bottom-8 left-0 right-0 z-10 text-center pointer-events-none">
        <p className="text-[10px] text-muted-foreground/15 font-mono tracking-[0.2em]">
          &copy; 2026 JYL UNIVERSE
        </p>
      </footer>

      <div className="fixed top-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider z-10">
        <span>{"// SOWOLDAM"}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider z-10">
        <span>{"SYS.CONNECTED"}</span>
      </div>
    </div>
  );
}
