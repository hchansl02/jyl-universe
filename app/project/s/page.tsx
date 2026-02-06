"use client";

import { SpaceBackground } from "@/components/dashboard/space-background";
import { ArrowLeft, FolderOpen, ChevronRight, Orbit } from "lucide-react";
import Link from "next/link";

export default function ProjectSPage() {
  const categories = [
    { id: "01", name: "ALPHA", sub: "에세이", symbol: "α", href: "/project/s/alpha" },
    { id: "02", name: "BETA", sub: "소설", symbol: "β", href: "/project/s/beta" },
    { id: "03", name: "GAMMA", sub: "나이 시리즈", symbol: "γ", href: "/project/s/gamma" },
    { id: "04", name: "DELTA", sub: "시", symbol: "δ", href: "/project/s/delta" },
    { id: "05", name: "ZETA", sub: "매거진", symbol: "ζ", href: "/project/s/zeta" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      <SpaceBackground />

      {/* 상단 네비게이션: 뒤로가기 */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold tracking-widest uppercase font-mono">Back to Command</span>
        </Link>
      </div>

      <main className="relative z-10 w-full max-w-7xl px-6 pt-24 pb-16">
        {/* JYL UNIVERSE 로고 스타일 헤더 */}
        <header className="text-center mb-24">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 mb-6">
            <Orbit className="w-4 h-4 text-white/50 animate-pulse" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-light tracking-[0.3em] text-white/85 mb-1">
            JYL UNIVERSE
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono">
            Project S / Archive System
          </p>
        </header>

        {/* 폴더 그리드 레이아웃 (5컬럼 가로 나열) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {categories.map((item) => (
            <Link key={item.name} href={item.href} className="group">
              <div className="relative aspect-[4/5.5] bg-white/[0.015] border border-white/5 rounded-2xl p-7 flex flex-col items-center justify-between transition-all duration-700 hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-3">
                
                {/* 상단 섹션 */}
                <div className="w-full flex justify-between items-start">
                  <span className="text-[9px] font-mono text-white/15 group-hover:text-white/40 transition-colors">NO.{item.id}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-white/40 transition-colors" />
                </div>

                {/* 중앙 로고 (그리스 심볼) */}
                <div className="flex flex-col items-center">
                  <div className="text-7xl font-light text-white/[0.03] group-hover:text-white transition-all duration-1000 mb-2 font-serif scale-90 group-hover:scale-110">
                    {item.symbol}
                  </div>
                  <h3 className="text-[11px] font-bold tracking-[0.5em] text-white/40 group-hover:text-white transition-colors">
                    {item.name}
                  </h3>
                </div>

                {/* 하단 섹션 */}
                <div className="w-full text-center">
                  <p className="text-[10px] text-white/20 group-hover:text-white/60 tracking-widest mb-6 font-light">
                    {item.sub}
                  </p>
                  <div className="w-full h-[1px] bg-white/5 group-hover:bg-white/10 mb-4 transition-colors" />
                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white transition-all group-hover:translate-x-1" />
                  </div>
                </div>

                {/* 배경 오버레이 장식 */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-32 text-center border-t border-white/[0.02] pt-8">
          <p className="text-[9px] text-white/10 font-mono tracking-[0.3em] uppercase">
            &copy; 2026 Universe Storage Protocol v.1.0
          </p>
        </footer>
      </main>
    </div>
  );
}
