"use client";

import { SpaceBackground } from "@/components/dashboard/space-background";
import { CenterTasks } from "@/components/dashboard/center-tasks";
import { TodaySchedule } from "@/components/dashboard/today-schedule"; // 새로 만들 컴포넌트
import { NavCard } from "@/components/dashboard/nav-card";
import { Orbit } from "lucide-react";

export default function DashboardPage() {
  // 오늘 날짜 및 요일 계산
  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      <SpaceBackground />

      <main className="relative z-10 w-full max-w-7xl px-6 pt-12 pb-16">
        {/* 헤더: 오늘 날짜 추가 */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-foreground/6 mb-4">
            <Orbit className="w-4 h-4 text-foreground/50" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase mb-1">{dateString}</p>
          <h1 className="text-2xl font-light tracking-[0.25em] text-white mb-1">
            {dayName} COMMAND
          </h1>
        </header>

        {/* 메인 2단 구성 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* 왼쪽: 투두 리스트 (5칸 차지) */}
          <div className="lg:col-span-5">
            <CenterTasks />
          </div>

          {/* 오른쪽: 타임라인 일정 (7칸 차지) */}
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
