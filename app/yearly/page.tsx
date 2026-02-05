"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, GripVertical, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";

export default function YearlyPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  interface Plan {
    id: number;
    content: string;
    is_done: boolean;
    order_index: number;
  }

  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. 데이터 불러오기
  const fetchPlans = async () => {
    const { data } = await supabase
      .from("yearly_plan")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (data) setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  // 2. 목표 추가
  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.trim()) return;

    const nextOrder = plans.length > 0 ? Math.max(...plans.map(p => p.order_index)) + 1 : 0;
    
    const { error } = await supabase
        .from("yearly_plan")
        .insert([{ content: newPlan, order_index: nextOrder }]);
    
    if (!error) {
        setNewPlan("");
        fetchPlans();
    }
  };

  // 3. 체크 토글
  const toggleDone = async (id: number, currentStatus: boolean) => {
    setPlans(plans.map(p => p.id === id ? { ...p, is_done: !currentStatus } : p));
    await supabase.from("yearly_plan").update({ is_done: !currentStatus }).eq("id", id);
  };

  // 4. 삭제
  const deletePlan = async (id: number) => {
    if (confirm("삭제하시겠습니까?")) {
      setPlans(plans.filter(p => p.id !== id));
      await supabase.from("yearly_plan").delete().eq("id", id);
    }
  };

  // 5. 드래그 앤 드롭 정렬
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newPlans = Array.from(plans);
    const [reorderedItem] = newPlans.splice(sourceIndex, 1);
    newPlans.splice(destinationIndex, 0, reorderedItem);

    const updatedPlans = newPlans.map((item, index) => ({ ...item, order_index: index }));
    setPlans(updatedPlans);

    await supabase.from("yearly_plan").upsert(
        updatedPlans.map(p => ({ id: p.id, content: p.content, is_done: p.is_done, order_index: p.order_index }))
    );
  };

  // 진행률 계산
  const completedCount = plans.filter(p => p.is_done).length;
  const progress = plans.length > 0 ? Math.round((completedCount / plans.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-6">
      {/* 뒤로가기 버튼 (추가됨) */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK TO DASHBOARD</span>
        </Link>
      </div>

      {/* 헤더 영역 */}
      <header className="text-center mb-10 mt-4">
        <p className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase mb-2">Yearly Plan</p>
        <h1 className="text-5xl font-light tracking-tight text-white">2026</h1>
      </header>

      {/* 진행바 영역 */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[10px] font-bold text-white/40 tracking-widest">ANNUAL PROGRESS</span>
            <span className="text-xs font-mono text-white/60">
                {completedCount} / {plans.length} <span className="text-white/20 mx-2">|</span> {progress}%
            </span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
                className="h-full bg-white transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* 리스트 영역 (Drag & Drop) */}
      <div className="w-full max-w-2xl">
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="yearly-list">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {plans.map((plan, index) => (
                            <Draggable key={plan.id} draggableId={plan.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                            snapshot.isDragging 
                                            ? "bg-white/10 border-white/30 z-50 shadow-2xl" 
                                            : "bg-white/[0.03] border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        {/* 드래그 핸들 */}
                                        <div {...provided.dragHandleProps} className="text-white/10 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        {/* 체크 버튼 */}
                                        <button onClick={() => toggleDone(plan.id, plan.is_done)} className="text-white/20 hover:text-white transition-colors">
                                            {plan.is_done ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5" />}
                                        </button>

                                        {/* 내용 */}
                                        <div className="flex-1">
                                            <span className={`text-sm font-light tracking-wide transition-all ${plan.is_done ? "text-white/30 line-through" : "text-white/90"}`}>
                                                {plan.content}
                                            </span>
                                        </div>

                                        {/* 삭제 버튼 (호버시 표시) */}
                                        <button 
                                            onClick={() => deletePlan(plan.id)}
                                            className="opacity-0 group-hover:opacity-100 text-white/10 hover:text-red-400 transition-all px-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>

        {/* 입력창 */}
        <form onSubmit={addPlan} className="mt-6 relative group">
            <input 
                type="text" 
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                placeholder="Add a new goal for 2026..."
                className="w-full bg-transparent border-b border-white/10 py-3 pl-2 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all"
            />
            <button 
                type="submit" 
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </form>

        {/* 로딩 표시 */}
        {loading && (
            <div className="text-center py-10 text-white/20 text-xs animate-pulse">
                Loading database...
            </div>
        )}
      </div>
    </div>
  );
}
