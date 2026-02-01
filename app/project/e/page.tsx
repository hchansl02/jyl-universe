"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { SpaceBackground } from "@/components/dashboard/space-background";
import { ArrowLeft, Activity, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

// --- 3D 모델 뷰어 (빨간점 제거됨) ---
function HumanModel() {
  const { scene } = useGLTF("/models/human.glb");

  return (
    <group position={[0, -1, 0]}>
      {/* 순수 3D 모델만 렌더링 */}
      <primitive object={scene} scale={0.8} />
    </group>
  );
}

export default function ProjectEPage() {
  // 카테고리 상태 관리 (현재 페이지 표시용)
  const [category, setCategory] = useState("inbody");

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center">
      <SpaceBackground />

      {/* 상단 뒤로가기 버튼 */}
      <div className="absolute top-8 left-8 z-30">
        <Link href="/project" className="flex items-center text-zinc-500 hover:text-white transition-colors text-xs tracking-[0.2em] group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO PROJECTS
        </Link>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center pt-16 px-6 h-[calc(100vh-40px)]">
        <h1 className="text-3xl font-extralight tracking-[0.4em] mb-2 uppercase">Analysis</h1>
        <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase mb-4 text-center font-mono">Bio-Environmental System</p>

        <div className="relative flex-grow w-full flex items-center justify-between">
          
          {/* 좌측 패널 (지금은 비워둠 - 나중에 기능 추가 시 활성화) */}
          <div className="w-80 z-20 min-h-[200px] flex items-center justify-center text-zinc-800 text-xs tracking-widest opacity-30">
            WAITING FOR INPUT...
          </div>

          {/* 중앙 3D 캔버스 (순수 뷰어) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-[800px] h-full cursor-grab active:cursor-grabbing">
              <Canvas shadows camera={{ position: [0, 0, 6], fov: 35 }}>
                <Suspense fallback={null}>
                  <Stage environment="night" intensity={0.5} contactShadow={{ opacity: 0.3 }}>
                    <HumanModel />
                  </Stage>
                  <OrbitControls enablePan={false} makeDefault autoRotate autoRotateSpeed={0.5} />
                </Suspense>
              </Canvas>
            </div>
          </div>

          {/* 우측 데이터 요약 (디자인 요소로 유지) */}
          <div className="w-80 z-20">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-sm">
              <h4 className="text-[10px] tracking-widest text-zinc-600 mb-6 uppercase font-bold text-center">Bio-Score</h4>
              <div className="text-4xl font-extralight mb-2 text-center text-white/90">--<span className="text-sm text-zinc-500 ml-1">/100</span></div>
              <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-800 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 카테고리 탭 (페이지 이동 기능) */}
        <div className="relative z-30 mb-8 flex gap-4 p-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
          {[
            { id: "inbody", label: "인바디", icon: Activity, href: "/project/e/inbody" },
            { id: "skin", label: "피부", icon: ShieldCheck, href: "/project/e/skin" },
            { id: "etc", label: "기타", icon: Zap, href: "/project/e/etc" },
          ].map((tab) => (
            <Link key={tab.id} href={tab.href}>
              <div className="flex items-center gap-2 px-10 py-3 rounded-full text-[11px] tracking-[0.2em] transition-all duration-500 text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer">
                <tab.icon size={14} />
                {tab.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="fixed bottom-6 w-full text-center z-10">
        <p className="text-[9px] tracking-[0.8em] text-zinc-700 uppercase">
          © 2026 JYL UNIVERSE
        </p>
      </footer>
    </main>
  );
}