import { SpaceBackground } from "@/components/dashboard/space-background";
import { CenterTasks } from "@/components/dashboard/center-tasks";
import { NavCard } from "@/components/dashboard/nav-card";
import { Orbit } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      {/* Space background */}
      <SpaceBackground />

      {/* Subtle vignette - lighter to show more stars */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Main content */}
      <main className="relative z-10 w-full max-w-5xl px-6 pt-12 pb-16">
        {/* Header */}
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

        {/* T-shaped Layout */}
        <div className="flex flex-col items-center gap-8">
          {/* Center Tasks - Upper Center, Largest */}
          <div className="w-full max-w-2xl">
            <CenterTasks />
          </div>

          {/* 4 Category Cards - Horizontal Row */}
          <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <NavCard
              title="PROJECT"
              icon="project"
              description="Active development projects"
              href="/dashboard/project"
              count={4}
            />
            <NavCard
              title="YEARLY PLAN"
              icon="yearly"
              description="Long-term goals & milestones"
              href="/yearly"
              count={5}
            />
            <NavCard
              title="MONTHLY PLAN"
              icon="monthly"
              description="This month's priorities"
              href="/monthly"
              count={8}
            />
            <NavCard
              title="THOUGHTS"
              icon="thoughts"
              description="Ideas & reflections"
              href="/thoughts"
              count={12}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-[10px] text-muted-foreground/15 font-mono tracking-[0.2em]">
            &copy; 2026 JYL UNIVERSE
          </p>
        </footer>
      </main>

      {/* Corner decorations */}
      <div className="fixed top-6 left-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"// DASHBOARD"}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"SYS.CONNECTED"}</span>
      </div>
    </div>
  );
}
