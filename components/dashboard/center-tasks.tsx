"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Check, Plus, Trash2, Loader2, Repeat } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// 통합된 태스크 타입 정의
interface TaskItem {
  id: number;
  title: string;
  is_completed: boolean;
  type: 'todo' | 'routine'; // 일반 할 일인지, 루틴인지 구분
}

export function CenterTasks() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 오늘 요일 구하기 (Mon, Tue...)
  const getTodayDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  // 데이터 불러오기 (투두 + 오늘 루틴)
  const fetchTasks = async () => {
    setIsLoading(true);
    const todayStr = getTodayDay();

    // 1. 일반 투두 가져오기
    const { data: todoData } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false });

    // 2. 오늘의 Weekly Routine 가져오기
    const { data: routineData } = await supabase
      .from("weekly_plan")
      .select("*")
      .eq("day", todayStr);

    // 3. 데이터 포맷 통일 및 합치기
    const formattedTodos: TaskItem[] = (todoData || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      is_completed: t.is_completed,
      type: 'todo'
    }));

    const formattedRoutines: TaskItem[] = (routineData || []).map((r: any) => ({
      id: r.id,
      title: r.content, // weekly_plan은 content 컬럼 사용
      is_completed: r.is_done, // weekly_plan은 is_done 컬럼 사용
      type: 'routine'
    }));

    // 루틴을 위에, 일반 투두를 아래에 배치
    setTasks([...formattedRoutines, ...formattedTodos]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 할 일 추가 (항상 일반 투두로 추가됨)
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    // 낙관적 업데이트
    const tempId = Date.now();
    const tempTask: TaskItem = { id: tempId, title: newTask, is_completed: false, type: 'todo' };
    setTasks((prev) => [...prev, tempTask]); // 맨 뒤에 추가하거나 원하시는대로 조정 가능
    setNewTask("");

    // DB 저장
    const { error } = await supabase
      .from("todos")
      .insert([{ title: newTask, is_completed: false }]);

    if (!error) fetchTasks(); // ID 동기화를 위해 재조회
  };

  // 체크 토글 (타입에 따라 다른 테이블 업데이트)
  const toggleTask = async (task: TaskItem) => {
    // UI 먼저 변경 (반응속도)
    setTasks(tasks.map(t => 
      (t.id === task.id && t.type === task.type) 
        ? { ...t, is_completed: !task.is_completed } 
        : t
    ));

    if (task.type === 'todo') {
      await supabase.from("todos").update({ is_completed: !task.is_completed }).eq("id", task.id);
    } else {
      // 루틴인 경우 weekly_plan 테이블 업데이트
      await supabase.from("weekly_plan").update({ is_done: !task.is_completed }).eq("id", task.id);
    }
  };

  // 삭제 (일반 투두만 가능)
  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => t.id !== id)); // UI에서 즉시 제거
    await supabase.from("todos").delete().eq("id", id);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

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
            width: 250, height: 250,
            left: mousePosition.x - 125, top: mousePosition.y - 125,
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative z-10 p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-light tracking-[0.2em] text-foreground/90">TODAY'S TASKS</h2>
            <p className="text-[11px] text-muted-foreground/40 font-mono mt-1 tracking-wider">
              {completedCount} of {tasks.length} completed ({getTodayDay()})
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border border-foreground/8 flex items-center justify-center bg-foreground/[0.02]">
            <span className="text-sm font-mono text-foreground/60">{percentage}%</span>
          </div>
        </div>

        <div className="h-0.5 bg-foreground/[0.06] mb-6 rounded-full overflow-hidden">
          <div className="h-full bg-foreground/40 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>

        <form onSubmit={addTask} className="relative mb-4 group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new mission..."
            className="w-full bg-white border border-white/20 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground/20 py-4 font-mono tracking-widest uppercase">
              No active tasks
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={`${task.type}-${task.id}`}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-foreground/[0.015] hover:bg-foreground/[0.035] border border-foreground/[0.025] hover:border-foreground/[0.06] transition-all text-left group"
              >
                <button
                  onClick={() => toggleTask(task)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    task.is_completed
                      ? "bg-foreground/70 border-foreground/70"
                      : "border-foreground/15 group-hover:border-foreground/35"
                  }`}
                >
                  {task.is_completed && <Check className="w-3 h-3 text-background" strokeWidth={2.5} />}
                </button>

                <div 
                  className="flex-1 flex flex-col cursor-pointer select-none"
                  onClick={() => toggleTask(task)}
                >
                  <span
                    className={`text-sm tracking-wide transition-all ${
                      task.is_completed
                        ? "text-muted-foreground/30 line-through"
                        : "text-foreground/65 group-hover:text-foreground/90"
                    }`}
                  >
                    {task.title}
                  </span>
                  {/* 루틴 태그 표시 */}
                  {task.type === 'routine' && (
                    <span className="flex items-center gap-1 text-[9px] text-blue-400/80 mt-0.5">
                      <Repeat className="w-2.5 h-2.5" /> Weekly Routine
                    </span>
                  )}
                </div>

                {/* 삭제 버튼은 일반 투두(type === 'todo')일 때만 표시 */}
                {task.type === 'todo' && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
