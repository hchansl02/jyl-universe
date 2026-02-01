import Link from "next/link";
import { SpaceBackground } from "@/components/dashboard/space-background";
import { Orbit, ArrowLeft } from "lucide-react";

interface YearlyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function YearlyDetailPage({ params }: YearlyDetailPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start relative overflow-hidden">
      <SpaceBackground />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      <main className="relative z-10 w-full max-w-2xl px-6 pt-12 pb-16">
        <header className="text-center mb-12">
          <Link
            href="/yearly"
            className="inline-flex items-center gap-2 text-[11px] font-mono text-muted-foreground/50 hover:text-foreground/80 tracking-[0.2em] mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>BACK TO 2026</span>
          </Link>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-foreground/6 mb-4">
            <Orbit className="w-4 h-4 text-foreground/50" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-light tracking-[0.25em] text-foreground/85 mb-1">
            GOAL #{id}
          </h1>
          <p className="text-[10px] tracking-[0.35em] text-muted-foreground/35 uppercase">
            Yearly objective detail
          </p>
        </header>

        <div
          className="rounded-2xl overflow-hidden p-8"
          style={{
            background: "rgba(255, 255, 255, 0.018)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <p className="text-sm text-muted-foreground/50 font-mono tracking-wider">
            Goal detail view · Content placeholder
          </p>
        </div>

        <footer className="mt-20 text-center">
          <p className="text-[10px] text-muted-foreground/15 font-mono tracking-[0.2em]">
            &copy; 2026 JYL UNIVERSE
          </p>
        </footer>
      </main>

      <div className="fixed top-6 left-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"// YEARLY/"}{id}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider">
        <span>{"SYS.CONNECTED"}</span>
      </div>
    </div>
  );
}
