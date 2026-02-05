"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Check, Plus, Trash2, Loader2, Repeat, Edit2, Save, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// 통합된 태스크 타입 정의
interface TaskItem {
  id: number;
  title: string;
  is_completed: boolean;
  type: 'todo' | 'routine'; 
}

export function CenterTasks() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // --- 수정 모드 상태 추가 ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'todo' | 'routine' | null>(null);
  const [editValue, setEditValue] = useState("");
  // --------------------------

  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const getTodayDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    const todayStr = getTodayDay();

    const { data: todoData } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false });

    const { data: routineData } = await supabase
      .from("weekly_plan")
      .select("*")
      .eq("day", todayStr);

    const formattedTodos: TaskItem[] = (todoData || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      is_completed: t.is_completed,
      type: 'todo'
    }));

    const formattedRoutines: TaskItem[] = (routineData || []).map((r: any) => ({
      id: r.id,
      title: r.content, 
      is_completed: r.is_done, 
      type: 'routine'
    }));

    setTasks([...formattedRoutines, ...formattedTodos]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { error } = await supabase
      .from("todos")
      .insert([{ title: newTask, is_completed: false }]);

    if (!error) {
      setNewTask("");
      fetchTasks();
    }
  };

  // --- 수정 기능 로직 ---
  const startEditing = (task: TaskItem) => {
    setEditingId(task.id);
    setEditingType(task.type);
    setEditValue(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingType(null);
    setEditValue("");
  };

  const saveEdit = async (id: number, type: 'todo' | 'routine') => {
    if (!editValue.trim()) return;

    // UI 즉시 업데이트
    setTasks(tasks.map(t => (t.id === id && t.type === type) ? { ...t, title: editValue } : t));
    setEditingId(null);

    if (type === 'todo') {
      await supabase.from("todos").update({ title: editValue }).eq("id", id);
    } else {
      await supabase.from("weekly_plan").update({ content: editValue }).eq("id", id);
    }
  };
  // ----------------------

  const toggleTask = async (task: TaskItem) => {
    const newStatus = !task.is_completed;
    setTasks(tasks.map(t => (t.id === task.id && t.type === task.type) ? { ...t, is_completed: newStatus } : t));

    if (task.type === 'todo') {
      await supabase.from("todos").update({ is_completed: newStatus }).eq("id", task.id);
    } else {
      await supabase.from("weekly_plan").update({ is_done: newStatus }).eq("id", task.id);
    }
  };

  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => !(t.id === id && t.type === 'todo')));
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

                <div className="flex-1 flex flex-col min-w-0">
                  {editingId === task.id && editingType === task.type ? (
                    <input 
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-transparent border-b border-foreground/20 py-0.5 text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-all"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id, task.type)}
                    />
                  ) : (
                    <>
                      <span
                        className={`text-sm tracking-wide transition-all truncate select-none ${
                          task.is_completed
                            ? "text-muted-foreground/30 line-through cursor-pointer"
                            : "text-foreground/65 group-hover:text-foreground/90 cursor-pointer"
                        }`}
                        onClick={() => toggleTask(task)}
                      >
                        {task.title}
                      </span>
                      {task.type === 'routine' && (
                        <span className="flex items-center gap-1 text-[9px] text-blue-400/80 mt-0.5">
                          <Repeat className="w-2.5 h-2.5" /> Weekly Routine
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* --- 액션 버튼 영역 (수정/저장/취소/삭제) --- */}
                <div className="flex items-center gap-1">
                  {editingId === task.id && editingType === task.type ? (
                    <>
                      <button 
                        onClick={() => saveEdit(task.id, task.type)}
                        className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-md transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="p-1.5 text-foreground/20 hover:text-foreground transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(task)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground/20 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {task.type === 'todo' && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
