import { AnimatedBackground } from "@/components/landing/animated-background";
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card";
import { LoginForm } from "@/components/landing/login-form";
import { Orbit } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Subtle vignette overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Main content */}
      <main className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          {/* Universe icon with subtle glow */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-foreground/8 mb-8 relative group">
            <Orbit className="w-7 h-7 text-foreground/70 transition-all duration-500 group-hover:text-foreground/90" strokeWidth={1.5} />
            <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Brand name */}
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-foreground mb-4">
            JYL UNIVERSE
          </h1>

          {/* Tagline */}
          <p className="text-sm tracking-[0.3em] text-muted-foreground/50 uppercase">
            Exist Beyond Limits
          </p>
        </div>

        {/* Liquid Glass Login Card */}
        <LiquidGlassCard>
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground/50 tracking-wider">
              SYSTEM READY
            </span>
          </div>

          {/* Login Form */}
          <LoginForm />
        </LiquidGlassCard>

        {/* Minimal footer */}
        <p className="text-center text-xs text-muted-foreground/20 font-mono mt-10 tracking-wider">
          &copy; 2026 JYL UNIVERSE
        </p>
      </main>

      {/* Corner decorations */}
      <div className="fixed top-6 left-6 text-[10px] font-mono text-muted-foreground/10 hidden md:block tracking-wider">
        <span>{"// INITIALIZE"}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/10 hidden md:block tracking-wider">
        <span>{"SYS.ACTIVE"}</span>
      </div>
    </div>
  );
}
