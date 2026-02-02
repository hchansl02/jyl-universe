"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, X, Trash2, CheckCircle2, GripVertical, Loader2 } from "lucide-react";
// 드래그 앤 드롭 라이브러리 추가
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Plan {
  id: number;
  content: string;
  is_completed: boolean;
  position: number; // 순서 저장용
}

export default function MonthlyPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  // 1. 목록 불러오기 (position 순서대로 정렬)
  const fetchPlans = async () => {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .order("position", { ascending: true }) // 순서대로 정렬
      .order("id", { ascending: false });     // 순서 같으면 최신순
    
    if (data) setPlans(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  // 2. 추가하기
  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.trim()) return;

    // 새 아이템은 맨 마지막 순서(length)로 배정
    const newPosition = plans.length;
    const tempPlan = { id: Date.now(), content: newPlan, is_completed: false, position: newPosition };
    
    setPlans([...plans, tempPlan]);
    setNewPlan("");
    setIsModalOpen(false);

    await supabase.from("plans").insert([{ content: newPlan, position: newPosition }]);
    fetchPlans();
  };

  // 3. 체크 토글
  const togglePlan = async (id: number, currentStatus: boolean) => {
    setPlans(plans.map(p => p.id === id ? { ...p, is_completed: !currentStatus } : p));
    await supabase.from("plans").update({ is_completed: !currentStatus }).eq("id", id);
  };

  // 4. 삭제
  const deletePlan = async (id: number) => {
    setPlans(plans.filter(p => p.id !== id));
    await supabase.from("plans").delete().eq("id", id);
  };

  // 5. [핵심] 드래그 끝났을 때 순서 저장
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(plans);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 1. 화면에 즉시 반영 (렉 없이 보이게)
    setPlans(items);

    // 2. 변경된 순서대로 DB 업데이트
    const updates = items.map((item, index) => ({
      id: item.id,
      position: index,
      content: item.content,
      is_completed: item.is_completed
    }));

    // upsert로 한방에 업데이트
    await supabase.from("plans").upsert(updates);
  };

  const completedCount = plans.filter(p => p.is_completed).length;
  const totalCount = plans.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden pt-20 px-6">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />
      </div>

      <main className="w-full max-w-2xl relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-xs font-mono text-muted-foreground/60 tracking-[0.4em] mb-2">MONTHLY PLAN</h1>
          <h2 className="text-4xl font-light text-foreground tracking-[0.1em] uppercase">{currentMonth}</h2>
        </header>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">PROGRESS</span>
            <span className="text-xs font-mono text-foreground/80 tracking-widest">
              {completedCount} / {totalCount} <span className="text-muted-foreground/40 mx-1">|</span> {progress}%
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 드래그 앤 드롭 영역 */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="plans">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-4 pb-32"
              >
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-white/20"/></div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
                    <p className="text-xs text-muted-foreground/30 font-mono tracking-widest">NO PLANS FOR {currentMonth.toUpperCase()}</p>
                  </div>
                ) : (
                  plans.map((plan, index) => (
                    <Draggable key={plan.id} draggableId={plan.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group relative flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl transition-colors duration-300 ${
                            snapshot.isDragging ? "bg-white/[0.08] border-white/20 shadow-xl z-50" : "hover:bg-white/[0.04] hover:border-white/10"
                          }`}
                          style={{ ...provided.draggableProps.style }}
                        >
                          {/* 드래그 핸들 (점 6개 아이콘) */}
                          <div {...provided.dragHandleProps} className="text-white/10 hover:text-white/50 cursor-grab active:cursor-grabbing p-1">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <button 
                            onClick={() => togglePlan(plan.id, plan.is_completed)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                              plan.is_completed ? "bg-white/80 border-white/80 text-black" : "border-white/20 text-transparent hover:border-white/50"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          
                          <span 
                            className={`flex-1 text-sm font-light tracking-wide transition-all duration-300 ${
                              plan.is_completed ? "text-white/20 line-through decoration-white/10" : "text-white/80"
                            }`}
                          >
                            {plan.content}
                          </span>

                          <button 
                            onClick={() => deletePlan(plan.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-white/10 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300 z-50"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-light text-white mb-6 tracking-wider">NEW MONTHLY PLAN</h3>
            
            <form onSubmit={addPlan} className="space-y-6">
              <input
                autoFocus
                type="text"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                placeholder="What is your goal?"
                className="w-full bg-white border border-white/20 rounded-xl px-4 py-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button 
                type="submit"
                className="w-full py-4 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-medium tracking-widest rounded-xl transition-all duration-300"
              >
                REGISTER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
