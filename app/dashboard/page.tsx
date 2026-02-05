import { SpaceBackground } from "@/components/dashboard/space-background";
import { CenterTasks } from "@/components/dashboard/center-tasks";
import { NavCard } from "@/components/dashboard/nav-card";
import { Orbit } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      <SpaceBackground />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      <main className="relative z-10 w-full max-w-5xl px-6 pt-12 pb-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-foreground/6 mb-4">
            <Orbit className="w-4 h-4 text-foreground/50" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-light tracking-[0.25em] text-foreground/85 mb-1">
            JYL UNIVERSE
          </h1>
          <p className="text-[10px] tracking-[0.35em] text-muted-foreground/35 uppercase">
            Command Center
          </p>
        </header>

        <div className="flex flex-col items-center gap-8">
          {/* 중앙: 투두 리스트 */}
          <div className="w-full max-w-2xl">
            <CenterTasks />
          </div>

          {/* 하단 네비게이션 카드 (6개 배치 - 3열 구조) */}
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
            
            {/* 1. PROJECT (기존 유지) */}
            <NavCard
              title="PROJECT"
              icon="project"
              description="Active development"
              href="/dashboard/project"
              count={4}
            />

            {/* 2. WEEKLY PLAN (추가됨) */}
            <NavCard
              title="WEEKLY PLAN"
              icon="weekly" 
              description="Routine & Schedules"
              href="/dashboard/weekly"
              count={7} 
            />

            {/* 3. BOOKS (Library -> BOOKS로 이름 변경) */}
            <NavCard
              title="BOOKS"
              icon="books"
              description="Book Archive & Reviews"
              href="/dashboard/books"
              count={12} 
            />

            {/* 4. YEARLY PLAN (복구됨) */}
            <NavCard
              title="YEARLY PLAN"
              icon="yearly"
              description="Long-term goals"
              href="/yearly"
              count={5}
            />

            {/* 5. MONTHLY PLAN (복구됨) */}
            <NavCard
              title="MONTHLY PLAN"
              icon="monthly"
              description="This month's priorities"
              href="/monthly"
              count={8}
            />

            {/* 6. THOUGHTS (기존 유지) */}
            <NavCard
              title="THOUGHTS"
              icon="thoughts"
              description="Ideas & reflections"
              href="/thoughts"
              count={12}
            />
          </div>
        </div>

        <footer className="mt-20 text-center">
          <p className="text-[10px] text-muted-foreground/15 font-mono tracking-[0.2em]">
            &copy; 2026 JYL UNIVERSE
          </p>
        </footer>
      </main>

      <div className="fixed top-6 left-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"// DASHBOARD"}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"SYS.CONNECTED"}</span>
      </div>
    </div>
  );
}
