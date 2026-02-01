"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (formData.id && formData.password) {
      router.push("/dashboard");
    } else {
      setError("Please enter your credentials");
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
        <p className="text-muted-foreground text-xs font-mono text-center">{error}</p>
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
        Press Enter to proceed
      </p>
    </form>
  );
}
