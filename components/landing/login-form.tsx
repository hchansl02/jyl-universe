"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export function LoginForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 이제 hchansl02 라고 입력하면 자동으로 @gmail.com을 붙여서 인증합니다.
      const loginEmail = formData.id.includes("@") 
        ? formData.id 
        : `${formData.id}@gmail.com`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formData.password,
      });

      if (authError) {
        setError("Invalid ID or PASSWORD");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="ID"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className="h-12 bg-transparent border-border/30 text-foreground placeholder:text-muted-foreground/40 font-mono text-sm focus:border-foreground/30 focus:ring-0 transition-all tracking-wider"
            disabled={isLoading}
          />
        </div>
        <div className="relative">
          <Input
            type="password"
            placeholder="PASSWORD"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-12 bg-transparent border-border/30 text-foreground placeholder:text-muted-foreground/40 font-mono text-sm focus:border-foreground/30 focus:ring-0 transition-all tracking-wider"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <p className="text-[#ff4d4d] text-xs font-mono text-center animate-pulse">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        variant="outline"
        className="w-full h-12 bg-transparent border-foreground/20 hover:bg-foreground hover:text-background text-foreground font-mono text-sm tracking-[0.2em] transition-all duration-300"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>CONNECTING</span>
          </span>
        ) : (
          <span>ENTER</span>
        )}
      </Button>

      <p className="text-center text-[10px] text-muted-foreground/30 font-mono tracking-wider">
        Authorized Access Only
      </p>
    </form>
  );
}
