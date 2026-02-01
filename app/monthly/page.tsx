"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MonthlyPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState("");

  const fetchPlans = async () => {
    const { data } = await supabase.from("plans").select("*").order("created_at", { ascending: true });
    setPlans(data || []);
  };

  useEffect(() => { fetchPlans(); }, []);

  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.trim()) return;
    const { error } = await supabase.from("plans").insert([{ content: newPlan }]);
    if (!error) { setNewPlan(""); fetchPlans(); }
  };

  const deletePlan = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 부모 클릭 막기
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (!error) fetchPlans();
    else alert("삭제 실패");
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from("plans").update({ is_completed: !currentStatus }).eq("id", id);
    if (!error) fetchPlans();
    else alert("업데이트 실패");
  };

  return (
    <main className="min-h-screen bg-black text-white p-10 font-extralight tracking-widest">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl mb-12 text-center font-thin uppercase">Monthly Plan</h1>
        <form onSubmit={addPlan} className="flex gap-4 mb-16">
          <input
            type="text"
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            placeholder="ADD NEW GOAL..."
            className="flex-grow bg-transparent border-b border-zinc-800 px-2 py-4 text-sm focus:outline-none focus:border-white transition-all"
          />
          <button type="submit" className="text-zinc-500 hover:text-white"><Plus size={24} /></button>
        </form>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              onClick={() => toggleComplete(plan.id, plan.is_completed)}
              className="group flex items-center justify-between p-6 bg-zinc-900/20 border border-white/5 rounded-2xl cursor-pointer hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-6">
                {plan.is_completed ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-zinc-800" size={20} />}
                <span className={`text-sm ${plan.is_completed ? "text-zinc-700 line-through" : "text-zinc-300"}`}>{plan.content}</span>
              </div>
              <button onClick={(e) => deletePlan(e, plan.id)} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}