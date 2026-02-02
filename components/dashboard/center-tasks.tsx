"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Check, Plus, Trash2, Loader2 } from "lucide-react"; // 아이콘 추가
import { createBrowserClient } from "@supabase/ssr";

// Supabase 테이블 구조에 맞춘 타입 정의
interface Task {
  id: number;
  title: string;
  is_completed: boolean;
  // created_at 등은 UI에 당장 필요 없으므로 생략 가능
}

export function CenterTasks() {
  // 1. Supabase 클라이언트 초기화
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 2. 상태 관리 (데이터, 로딩, 입력값)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 3. 디자인용 Refs 및 상태 (기존 코드 유지)
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 4. 데이터 불러오기 (Read)
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false }); // 최신순 정렬

    if (!error && data) {
      setTasks(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 5. 할 일 추가 (Create)
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    // 낙관적 업데이트 (화면에 먼저 표시해서 반응속도 높임)
    const tempId = Date.now();
    const tempTask: Task = { id: tempId, title: newTask, is_completed: false };
    setTasks([tempTask, ...tasks]);
    setNewTask("");

    // 실제 DB 저장
    const { error } = await supabase
      .from("todos")
      .insert([{ title: newTask, is_completed: false }]);

    if (error) {
      // 에러 시 롤백 (다시 불러오기)
      fetchTasks();
    } else {
      // 성공 시 ID 동기화를 위해 백그라운드에서 다시 불러오기
      fetchTasks();
    }
  };

  // 6. 체크 토글 (Update)
  const toggleTask = async (id: number, currentStatus: boolean) => {
    // 화면 먼저 반영
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

    await supabase
      .from("todos")
      .update({ is_completed: !currentStatus })
      .eq("id", id);
  };

  // 7. 삭제 (Delete)
  const deleteTask = async (id: number) => {
    // 화면 먼저 반영
    setTasks(tasks.filter(t => t.id !== id));

    await supabase.from("todos").delete().eq("id", id);
  };

  // 디자인 효과 로직 (기존 코드 유지)
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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
      {/* 배경 그라데이션 효과 */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.025) 100%)`,
          opacity: isHovered ? 1 : 0.6,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* 마우스 따라다니는 빛 효과 */}
      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            width: 250,
            height: 250,
            left: mousePosition.x - 125,
            top: mousePosition.y - 125,
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative z-10 p-7">
        {/* 헤더 섹션 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-light tracking-[0.2em] text-foreground/90">
              TODAY&apos;S TASKS
            </h2>
            <p className="text-[11px] text-muted-foreground/40 font-mono mt-1 tracking-wider">
              {completedCount} of {tasks.length} completed
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border border-foreground/8 flex items-center justify-center bg-foreground/[0.02]">
            <span className="text-sm font-mono text-foreground/60">{percentage}%</span>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="h-0.5 bg-foreground/[0.06] mb-6 rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground/40 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* [NEW] 입력 폼 추가 */}
        <form onSubmit={addTask} className="relative mb-4 group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new mission..."
            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.05] transition-all"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/40 hover:text-foreground/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* 할 일 목록 */}
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
                key={task.id}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-foreground/[0.015] hover:bg-foreground/[0.035] border border-foreground/[0.025] hover:border-foreground/[0.06] transition-all text-left group"
              >
                {/* 체크박스 버튼 */}
                <button
                  onClick={() => toggleTask(task.id, task.is_completed)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    task.is_completed
                      ? "bg-foreground/70 border-foreground/70"
                      : "border-foreground/15 group-hover:border-foreground/35"
                  }`}
                >
                  {task.is_completed && <Check className="w-3 h-3 text-background" strokeWidth={2.5} />}
                </button>

                {/* 할 일 텍스트 */}
                <span
                  className={`flex-1 text-sm tracking-wide transition-all cursor-pointer select-none ${
                    task.is_completed
                      ? "text-muted-foreground/30 line-through"
                      : "text-foreground/65 group-hover:text-foreground/90"
                  }`}
                  onClick={() => toggleTask(task.id, task.is_completed)}
                >
                  {task.title}
                </span>

                {/* [NEW] 삭제 버튼 (호버 시에만 등장) */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
