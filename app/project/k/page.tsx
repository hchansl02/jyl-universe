"use client";

import React from "react";
import { motion } from "framer-motion";
import { SpaceBackground } from "@/components/dashboard/space-background";
import { ArrowLeft, Moon, Star } from "lucide-react";
import Link from "next/link";

export default function ProjectKPage() {
  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      <SpaceBackground />

      {/* 1. 상단 뒤로가기 & 타이틀 영역 */}
      {/* pt-20으로 상단 여백을 줘서 너무 위에 붙지 않게 함 */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20">
        <Link href="/project" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO LIST
        </Link>
        
        <div className="text-center">
          <h1 className="text-6xl font-thin tracking-[0.2em] mb-6 text-white">PROJECT K</h1>
          <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto">
            "식사를 넘어선 예술적 경험을 통해 찰나의 순간을 영원한 기억으로 각인시킨다."
          </p>
        </div>
      </div>

      {/* 2. 중앙 메인 박스들 (여기가 핵심) */}
      {/* mt-32 : 이 수치로 박스 위치를 강제로 아래로 밀어버립니다. 더 내리고 싶으면 40, 48로 올리세요. */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-32 pb-40">
        
        {/* Alpha / 소월담 카드 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Alpha Card */}
          <Link href="/project/K/alpha">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-10 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-center cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Star className="h-8 w-8 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-light tracking-widest">PROJECT α</h2>
            </motion.div>
          </Link>

          {/* Sowoldam Card */}
          <Link href="/project/K/sowoldam">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-10 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-center cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Moon className="h-8 w-8 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-light tracking-widest">소월담</h2>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* 3. 최하단 고정 푸터 */}
      {/* fixed bottom-8 : 화면 바닥에서 정확히 32px(8 * 4) 위에 고정 */}
      <footer className="fixed bottom-8 left-0 w-full text-center z-50 pointer-events-none">
        <p className="text-[10px] tracking-[0.6em] text-zinc-600 uppercase opacity-60">
          © 2026 JYL Universe
        </p>
      </footer>
    </main>
  );
}