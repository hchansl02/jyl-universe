"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, Trash2, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function WeeklyPlanPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  interface Plan {
    id: number;
    day: string;
    content: string;
    is_done: boolean;
  }

  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState({ day: "Mon", content: "" });
  
  // 요일 순서 정렬을 위한 배열
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 데이터 불러오기
  const fetchPlans = async () => {
    const { data } = await supabase
      .from("weekly_plan")
      .select("*")
      .order("id", { ascending: true }); // 생성순 정렬 (나중에 요일별 정렬 처리)
    
    if (data) setPlans(data);
  };

  useEffect(() => { fetchPlans(); }, []);

  // 할 일 추가
  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.content.trim()) return;

    await supabase.from("weekly_plan").insert([newPlan]);
    setNewPlan({ ...newPlan, content: "" }); // 내용만 초기화 (요일은 유지)
    fetchPlans();
  };

  // 삭제
  const deletePlan = async (id: number) => {
    if (confirm("삭제하시겠습니까?")) {
      await supabase.from("weekly_plan").delete().eq("id", id);
      fetchPlans();
    }
  };

  // 요일별 색상 (시각적 구분용)
  const getDayColor = (day: string) => {
    switch(day) {
      case 'Mon': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Tue': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Wed': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Thu': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Fri': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Sat': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'Sun': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-white bg-white/10';
    }
  };

  // 리스트 정렬: 요일 순서대로 (Mon -> Sun)
  const sortedPlans = [...plans].sort((a, b) => {
    return days.indexOf(a.day) - days.indexOf(b.day);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-20">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
      </div>

      {/* 헤더 */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-10 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">WEEKLY PLAN</h1>
        <div className="w-10" />
      </div>

      {/* 입력창 (요일 선택 + 내용 입력) */}
      <div className="w-full max-w-3xl z-10 mb-8 sticky top-4">
        <form onSubmit={addPlan} className="flex gap-2 bg-[#0a0a0a]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
          <select 
            value={newPlan.day} 
            onChange={(e) => setNewPlan({...newPlan, day: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
          >
            {days.map(day => <option key={day} value={day} className="bg-[#0a0a0a] text-white">{day}</option>)}
          </select>
          <input 
            type="text" 
            value={newPlan.content}
            onChange={(e) => setNewPlan({...newPlan, content: e.target.value})}
            placeholder="Routine Content..."
            className="flex-1 bg-transparent px-4 py-3 text-white text-sm focus:outline-none placeholder:text-white/20"
          />
          <button type="submit" className="px-6 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors font-bold text-xs tracking-wider">
            ADD
          </button>
        </form>
      </div>

      {/* 세로 리스트 */}
      <div className="w-full max-w-3xl space-y-3 z-10">
        {sortedPlans.length > 0 ? (
          sortedPlans.map((plan) => (
            <div key={plan.id} className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-4">
                {/* 요일 뱃지 */}
                <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border min-w-[40px] text-center ${getDayColor(plan.day)}`}>
                  {plan.day}
                </span>
                
                {/* 내용 */}
                <span className="text-sm text-white/90 font-light">
                  {plan.content}
                </span>
              </div>

              {/* 삭제 버튼 */}
              <button 
                onClick={() => deletePlan(plan.id)} 
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <CalendarDays className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-xs text-white/30">루틴이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
