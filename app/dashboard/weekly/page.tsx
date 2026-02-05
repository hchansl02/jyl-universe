"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export default function WeeklyPlanPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 데이터 타입 정의
  interface Plan {
    id: number;
    day: string;
    content: string;
    is_done: boolean;
  }

  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState({ day: "Mon", content: "" });
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 데이터 불러오기
  const fetchPlans = async () => {
    const { data } = await supabase
      .from("weekly_plan")
      .select("*")
      .order("id", { ascending: true });
    
    if (data) setPlans(data);
  };

  useEffect(() => { fetchPlans(); }, []);

  // 할 일 추가
  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.content.trim()) return;

    await supabase.from("weekly_plan").insert([newPlan]);
    setNewPlan({ ...newPlan, content: "" }); // 입력창 초기화
    fetchPlans(); // 목록 갱신
  };

  // 체크 토글 (완료/미완료)
  const toggleDone = async (id: number, currentStatus: boolean) => {
    // 낙관적 업데이트 (화면 먼저 바꾸고 DB 통신)
    setPlans(plans.map(p => p.id === id ? { ...p, is_done: !currentStatus } : p));
    
    await supabase.from("weekly_plan").update({ is_done: !currentStatus }).eq("id", id);
    fetchPlans(); 
  };

  // 삭제
  const deletePlan = async (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await supabase.from("weekly_plan").delete().eq("id", id);
      fetchPlans();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-20">
      {/* 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
      </div>

      {/* 헤더 */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-10 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">WEEKLY PLAN</h1>
        <div className="w-10" />
      </div>

      {/* 입력창 (상단 고정) */}
      <form onSubmit={addPlan} className="w-full max-w-2xl flex gap-2 mb-12 z-10">
        <select 
          value={newPlan.day} 
          onChange={(e) => setNewPlan({...newPlan, day: e.target.value})}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
        >
          {days.map(day => <option key={day} value={day} className="bg-[#0a0a0a] text-white">{day}</option>)}
        </select>
        <input 
          type="text" 
          value={newPlan.content}
          onChange={(e) => setNewPlan({...newPlan, content: e.target.value})}
          placeholder="계획을 입력하세요 (예: 하체 운동, 독서 30분...)"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600"
        />
        <button type="submit" className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* 요일별 카드 리스트 (그리드 레이아웃) */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-10">
        {days.map((day) => {
          // 해당 요일의 계획만 필터링
          const dayPlans = plans.filter(p => p.day === day);
          
          return (
            <div key={day} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 min-h-[200px] flex flex-col hover:border-white/20 transition-colors">
              <h3 className="text-sm font-bold text-blue-400 mb-5 tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {day.toUpperCase()}
              </h3>
              
              <div className="space-y-3 flex-1">
                {dayPlans.length > 0 ? (
                  dayPlans.map((plan) => (
                    <div key={plan.id} className="group flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* 체크 버튼 */}
                      <button 
                        onClick={() => toggleDone(plan.id, plan.is_done)} 
                        className={`mt-0.5 transition-colors ${plan.is_done ? "text-green-500" : "text-white/20 hover:text-green-400"}`}
                      >
                        {plan.is_done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                      
                      {/* 내용 */}
                      <span className={`text-sm flex-1 leading-snug break-words transition-all ${plan.is_done ? "text-white/20 line-through decoration-white/20" : "text-white/90"}`}>
                        {plan.content}
                      </span>
                      
                      {/* 삭제 버튼 (호버 시 등장) */}
                      <button 
                        onClick={() => deletePlan(plan.id)} 
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-white/10 italic">No plans</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
