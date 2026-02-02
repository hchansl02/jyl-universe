"use client";

import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function EtcPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
      </div>

      {/* 뒤로가기 버튼 */}
      <div className="absolute top-10 left-8 z-50">
        <Link href="/project/e" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
      </div>

      {/* 메인 텍스트 */}
      <div className="text-center z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-6 opacity-30">
          <Construction className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-sm md:text-base font-mono text-blue-400 tracking-[0.3em] mb-4 uppercase">
          Fashion, Hairstyle, etc..
        </h2>
        
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter opacity-90">
          COMING<br />SOON
        </h1>
        
        <p className="mt-8 text-xs text-white/30 font-light tracking-wider">
          System update in progress.
        </p>
      </div>
    </div>
  );
}
