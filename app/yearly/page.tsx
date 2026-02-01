"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function YearlyPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState("");

  // 1. Yearly 테이블에서 데이터 가져오기
  const fetchPlans = async () => {
    const { data } = await supabase
      .from("yearly_plans")
      .select("*")
      .order("created_at", { ascending: true });
    setPlans(data || []);
  };

  useEffect(() => { fetchPlans(); }, []);

  // 2. 추가
  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.trim()) return;
    const { error } = await supabase.from("yearly_plans").insert([{ content: newPlan }]);
    if (!error) { setNewPlan(""); fetchPlans(); }
  };

  // 3. 삭제
  const deletePlan = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const { error } = await supabase.from("yearly_plans").delete().eq("id", id);
    if (!error) fetchPlans();
  };

  // 4. 완료 토글
  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("yearly_plans")
      .update({ is_completed: !currentStatus })
      .eq("id", id);
    if (!error) fetchPlans();
  };

  return (
    <main className="min-h-screen bg-black text-white p-10 font-extralight tracking-widest">
      <div className="max-w-xl mx-auto mb-16">
        <Link href="/" className="flex items-center text-zinc-600 hover:text-white transition-colors text-[10px] tracking-[0.3em]">
          <ArrowLeft className="mr-2 h-3 w-3" /> BACK TO DASHBOARD
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl tracking-[0.4em] mb-12 text-center font-thin uppercase">Yearly Plan</h1>

        <form onSubmit={addPlan} className="flex gap-4 mb-16 px-2">
          <input
            type="text"
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            placeholder="TYPE YOUR ANNUAL GOAL..."
            className="flex-grow bg-transparent border-b border-zinc-800 px-2 py-4 text-sm focus:outline-none focus:border-white transition-all font-light"
          />
          <button type="submit" className="text-zinc-500 hover:text-white"><Plus size={24} /></button>
        </form>

        <div className="space-y-4 px-2">
          <AnimatePresence>
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center justify-between p-6 bg-zinc-900/20 border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer"
                onClick={() => toggleComplete(plan.id, plan.is_completed)}
              >
                <div className="flex items-center gap-6">
                  {plan.is_completed ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-zinc-800" size={20} />}
                  <span className={`text-sm tracking-widest ${plan.is_completed ? "text-zinc-700 line-through" : "text-zinc-300"}`}>
                    {plan.content}
                  </span>
                </div>
                <button onClick={(e) => deletePlan(e, plan.id)} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}