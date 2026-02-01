import Link from "next/link";
import { SpaceBackground } from "@/components/dashboard/space-background";
import { Orbit } from "lucide-react";
import { ThoughtsContent } from "@/components/thoughts/thoughts-content";

// 반드시 export default function으로 시작해야 에러가 나지 않습니다.
export default function ThoughtsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      <SpaceBackground />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      <main className="relative z-10 w-full min-h-screen px-4 pt-12 pb-24">
        <header className="text-center mb-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-foreground/6 mb-4 hover:border-foreground/12 transition-colors"
          >
            <Orbit className="w-4 h-4 text-foreground/50" strokeWidth={1.5} />
          </Link>
          <h1 className="text-xl font-light tracking-[0.25em] text-foreground/85 mb-1">
            THOUGHTS
          </h1>
          <p className="text-[10px] tracking-[0.35em] text-muted-foreground/35 uppercase">
            Fragments adrift
          </p>
        </header>

        {/* 실제 생각 조각들이 둥둥 떠다니는 구역 */}
        <ThoughtsContent />

        <footer className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[10px] text-muted-foreground/15 font-mono tracking-[0.2em]">
            &copy; 2026 JYL UNIVERSE
          </p>
        </footer>
      </main>

      {/* 데코레이션 텍스트 */}
      <div className="fixed top-6 left-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"// THOUGHTS"}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"SYS.CONNECTED"}</span>
      </div>
    </div>
  );
}