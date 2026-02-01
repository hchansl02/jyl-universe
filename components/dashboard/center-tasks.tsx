"use client";

import { useState, useRef, type MouseEvent } from "react";
import { Check } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const initialTasks: Task[] = [
  { id: "1", text: "Review architecture design for Project K", completed: false, priority: "high" },
  { id: "2", text: "Update monthly report documentation", completed: false, priority: "medium" },
  { id: "3", text: "Sync with team on quarterly goals", completed: true, priority: "high" },
  { id: "4", text: "Deploy staging environment", completed: false, priority: "low" },
  { id: "5", text: "Write unit tests for core module", completed: false, priority: "medium" },
  { id: "6", text: "Performance optimization review", completed: false, priority: "high" },
];

export function CenterTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.018)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.025) 100%)`,
          opacity: isHovered ? 1 : 0.6,
          transition: "opacity 0.5s ease",
        }}
      />

      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            width: 250,
            height: 250,
            left: mousePosition.x - 125,
            top: mousePosition.y - 125,
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative z-10 p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-light tracking-[0.2em] text-foreground/90">
              TODAY&apos;S TASKS
            </h2>
            <p className="text-[11px] text-muted-foreground/40 font-mono mt-1 tracking-wider">
              {completedCount} of {tasks.length} completed
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border border-foreground/8 flex items-center justify-center bg-foreground/[0.02]">
            <span className="text-sm font-mono text-foreground/60">{percentage}%</span>
          </div>
        </div>

        <div className="h-0.5 bg-foreground/[0.06] mb-6 rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground/40 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-foreground/[0.015] hover:bg-foreground/[0.035] border border-foreground/[0.025] hover:border-foreground/[0.06] transition-all text-left group"
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  task.completed
                    ? "bg-foreground/70 border-foreground/70"
                    : "border-foreground/15 group-hover:border-foreground/35"
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-background" strokeWidth={2.5} />}
              </div>

              <span
                className={`flex-1 text-sm tracking-wide transition-all ${
                  task.completed
                    ? "text-muted-foreground/30 line-through"
                    : "text-foreground/65 group-hover:text-foreground/90"
                }`}
              >
                {task.text}
              </span>

              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  task.priority === "high"
                    ? "bg-foreground/45"
                    : task.priority === "medium"
                    ? "bg-foreground/25"
                    : "bg-foreground/12"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
