"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, GripVertical, CheckCircle2, Circle, Trash2, Loader2, Edit2, Save, X } from "lucide-react";
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
    is_completed: boolean | null;
    position: number;
  }

  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState("");
  const [loading, setLoading] = useState(true);

  // 수정 모드 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // 1. 데이터 불러오기
  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("yearly_plans")
      .select("*")
      .order("position", { ascending: true });
    
    if (error) {
      console.error("데이터 로드 에러:", error);
    } else if (data) {
      setPlans(data as Plan[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 2. 목표 추가
  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.trim()) return;

    const nextPosition = plans.length > 0 ? Math.max(...plans.map(p => p.position)) + 1 : 0;
    
    const { error } = await supabase
        .from("yearly_plans")
        .insert([{ 
            content: newPlan, 
            position: nextPosition, 
            is_completed: false 
        }]);
    
    if (!error) {
        setNewPlan("");
        fetchPlans();
    }
  };

  // 3. 수정 시작
  const startEditing = (plan: Plan) => {
    setEditingId(plan.id);
    setEditContent(plan.content);
  };

  // 4. 수정 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  // 5. 수정 저장
  const saveEdit = async (id: number) => {
    if (!editContent.trim()) return;

    // UI 즉시 반영
    setPlans(plans.map(p => p.id === id ? { ...p, content: editContent } : p));
    setEditingId(null);

    // DB 업데이트
    await supabase.from("yearly_plans").update({ content: editContent }).eq("id", id);
  };

  // 6. 체크 토글
  const toggleDone = async (id: number, currentStatus: boolean | null) => {
    const newStatus = !currentStatus;
    setPlans(plans.map(p => p.id === id ? { ...p, is_completed: newStatus } : p));
    await supabase.from("yearly_plans").update({ is_completed: newStatus }).eq("id", id);
  };

  // 7. 삭제
  const deletePlan = async (id: number) => {
    if (confirm("삭제하시겠습니까?")) {
      setPlans(plans.filter(p => p.id !== id));
      await supabase.from("yearly_plans").delete().eq("id", id);
    }
  };

  // 8. 드래그 앤 드롭 정렬 저장
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newPlans = Array.from(plans);
    const [reorderedItem] = newPlans.splice(sourceIndex, 1);
    newPlans.splice(destinationIndex, 0, reorderedItem);

    const updatedPlans = newPlans.map((item, index) => ({ ...item, position: index }));
    setPlans(updatedPlans);

    await supabase.from("yearly_plans").upsert(
        updatedPlans.map(p => ({ 
          id: p.id, 
          content: p.content, 
          is_completed: p.is_completed, 
          position: p.position 
        })),
        { onConflict: 'id' }
    );
  };

  const completedCount = plans.filter(p => p.is_completed).length;
  const progress = plans.length > 0 ? Math.round((completedCount / plans.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-6">
      <div className="absolute top-8 left-8 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">Back to Dashboard</span>
        </Link>
      </div>

      <header className="text-center mb-10 mt-4">
        <p className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase mb-2">Yearly Plan</p>
        <h1 className="text-5xl font-light tracking-tight text-white">2026</h1>
      </header>

      {/* 진행률 바 */}
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

      <div className="w-full max-w-2xl">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 font-mono tracking-widest text-xs">
                <Loader2 className="w-6 h-6 animate-spin mb-4" />
                LOADING DATABASE...
            </div>
        ) : (
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
                                            ? "bg-white/10 border-white/30 z-50 shadow-2xl scale-[1.02]" 
                                            : "bg-white/[0.03] border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        {/* 드래그 핸들 */}
                                        <div {...provided.dragHandleProps} className="text-white/10 hover:text-white/50 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        {/* 체크 버튼 */}
                                        <button onClick={() => toggleDone(plan.id, plan.is_completed)} className="text-white/20 hover:text-white transition-colors">
                                            {plan.is_completed ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5" />}
                                        </button>

                                        {/* 내용 영역 (수정 모드 분기) */}
                                        <div className="flex-1">
                                            {editingId === plan.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text"
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="flex-1 bg-transparent border-b border-white/30 py-1 text-sm text-white focus:outline-none focus:border-white"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(plan.id)}
                                                    />
                                                </div>
                                            ) : (
                                                <span className={`text-sm font-light tracking-wide transition-all ${plan.is_completed ? "text-white/30 line-through" : "text-white/90"}`}>
                                                    {plan.content}
                                                </span>
                                            )}
                                        </div>

                                        {/* 액션 버튼 영역 */}
                                        <div className="flex items-center gap-1">
                                            {editingId === plan.id ? (
                                                <>
                                                    <button onClick={() => saveEdit(plan.id)} className="p-1 text-green-400 hover:text-green-300 transition-colors">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelEditing} className="p-1 text-white/20 hover:text-white transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => startEditing(plan)} 
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-blue-400 transition-all"
                                                        title="수정"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deletePlan(plan.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
          </DragDropContext>
        )}

        {/* 새 목표 추가 폼 */}
        <form onSubmit={addPlan} className="mt-8 relative group">
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
      </div>
    </div>
  );
}
