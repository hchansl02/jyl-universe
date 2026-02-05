"use client";

import { SpaceBackground } from "@/components/dashboard/space-background";
import { CenterTasks } from "@/components/dashboard/center-tasks";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { NavCard } from "@/components/dashboard/nav-card";
import { Orbit } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      <SpaceBackground />

      <main className="relative z-10 w-full max-w-[1400px] px-6 pt-12 pb-16">
        {/* 상단 제목: 원래 스타일로 복구 */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 mb-4">
            <Orbit className="w-4 h-4 text-white/50" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-light tracking-[0.25em] text-white/85 mb-1">
            JYL UNIVERSE
          </h1>
          <p className="text-[10px] tracking-[0.35em] text-white/30 uppercase">
            Command Center
          </p>
        </header>

        {/* 메인 2단 구성 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-5">
            <CenterTasks />
          </div>
          <div className="lg:col-span-7">
            <TodaySchedule />
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-6 gap-4">
          <NavCard title="PROJECT" icon="project" description="Development" href="/dashboard/project" count={4} />
          <NavCard title="WEEKLY" icon="weekly" description="Schedules" href="/dashboard/weekly" count={7} />
          <NavCard title="BOOKS" icon="books" description="Archive" href="/dashboard/books" count={12} />
          <NavCard title="YEARLY" icon="yearly" description="Goals" href="/yearly" count={5} />
          <NavCard title="MONTHLY" icon="monthly" description="Priorities" href="/monthly" count={8} />
          <NavCard title="THOUGHTS" icon="thoughts" description="Ideas" href="/thoughts" count={12} />
        </div>
      </main>
    </div>
  );
}
