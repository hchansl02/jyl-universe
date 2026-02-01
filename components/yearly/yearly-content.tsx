"use client";

import { motion } from "framer-motion";
import { PlanGoalCard } from "@/components/dashboard/plan-goal-card";

const YEARLY_GOALS = [
  { id: "1", title: "Complete Q1 product launch", completed: false },
  { id: "2", title: "Establish core research pipeline", completed: true },
  { id: "3", title: "Scale team to 12 members", completed: false },
  { id: "4", title: "Publish annual technical report", completed: false },
  { id: "5", title: "Achieve 100% infrastructure migration", completed: false },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function YearlyContent() {
  const completedCount = YEARLY_GOALS.filter((g) => g.completed).length;
  const percentage = Math.round((completedCount / YEARLY_GOALS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="rounded-2xl overflow-hidden p-6" style={{
        background: "rgba(255, 255, 255, 0.018)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono text-muted-foreground/50 tracking-wider">
            {completedCount} of {YEARLY_GOALS.length} completed
          </span>
          <span className="text-sm font-mono text-foreground/70">{percentage}%</span>
        </div>
        <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-foreground/50 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </div>

      {/* Checklist cards */}
      <motion.ul
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {YEARLY_GOALS.map((goal) => (
          <motion.li key={goal.id} variants={item}>
            <PlanGoalCard
              href={`/yearly/${goal.id}`}
              title={goal.title}
              completed={goal.completed}
            />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
