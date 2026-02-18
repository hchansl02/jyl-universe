"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, Trash2, CalendarDays, Edit2, Save, X } from "lucide-react";
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

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ day: "", content: "" });
  
  // 정렬 순서: Any가 맨 위, 그 다음 월~일
  const days = ["Any", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    setNewPlan({ ...newPlan, content: "" });
    fetchPlans();
  };

  // 수정 시작
  const startEditing = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({ day: plan.day, content: plan.content });
  };

  // 수정 저장
  const saveEdit = async (id: number) => {
    // UI 즉시 반영
    setPlans(plans.map(p => p.id === id ? { ...p, day: editForm.day, content: editForm.content } : p));
    setEditingId(null);

    // DB 업데이트
    await supabase.from("weekly_plan").update({ day: editForm.day, content: editForm.content }).eq("id", id);
  };

  // 삭제
  const deletePlan = async (id: number) => {
    if (confirm("삭제하시겠습니까?")) {
      setPlans(plans.filter(p => p.id !== id));
      await supabase.from("weekly_plan").delete().eq("id", id);
    }
  };

  // 요일별 색상
  const getDayColor = (day: string) => {
    switch(day) {
      case 'Any': return 'text-white bg-white/20 border-white/40 font-bold'; // Any는 흰색 강조
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

  // 정렬 로직 (Any -> Mon -> ... -> Sun)
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
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold tracking-widest uppercase">BACK</span>
        </Link>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">WEEKLY PLAN</h1>
        <div className="w-10" />
      </div>

      {/* 입력창 (sticky) */}
      <div className="w-full max-w-3xl z-20 mb-8 sticky top-4">
        <form onSubmit={addPlan} className="flex gap-2 bg-[#0a0a0a]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
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
            placeholder="New weekly task..."
            className="flex-1 bg-transparent px-4 py-3 text-white text-sm focus:outline-none placeholder:text-white/20"
          />
          <button type="submit" className="px-6 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors font-bold text-xs tracking-wider">
            ADD
          </button>
        </form>
      </div>

      {/* 리스트 영역 */}
      <div className="w-full max-w-3xl space-y-3 z-10">
        {sortedPlans.length > 0 ? (
          sortedPlans.map((plan) => (
            <div key={plan.id} className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
              
              {/* 수정 모드 분기 */}
              {editingId === plan.id ? (
                <div className="flex-1 flex gap-2 items-center">
                  {/* 요일 수정 드롭다운 */}
                  <select 
                    value={editForm.day}
                    onChange={(e) => setEditForm({...editForm, day: e.target.value})}
                    className={`text-[10px] font-bold font-mono px-2 py-1.5 rounded border outline-none bg-[#0a0a0a] ${getDayColor(editForm.day)}`}
                  >
                    {days.map(day => <option key={day} value={day} className="bg-[#0a0a0a] text-white">{day}</option>)}
                  </select>
                  
                  {/* 내용 수정 인풋 */}
                  <input 
                    type="text" 
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    className="flex-1 bg-transparent border-b border-white/30 text-sm text-white px-2 py-1 focus:outline-none focus:border-white"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(plan.id)}
                  />

                  {/* 저장/취소 버튼 */}
                  <button onClick={() => saveEdit(plan.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-1">
                    {/* 요일 뱃지 */}
                    <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border min-w-[45px] text-center uppercase ${getDayColor(plan.day)}`}>
                      {plan.day}
                    </span>
                    
                    {/* 내용 */}
                    <span className="text-sm text-white/90 font-light truncate">
                      {plan.content}
                    </span>
                  </div>

                  {/* 액션 버튼 (수정/삭제) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(plan)}
                      className="p-2 text-white/20 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deletePlan(plan.id)} 
                      className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <CalendarDays className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-xs text-white/30">이번 주 계획이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
