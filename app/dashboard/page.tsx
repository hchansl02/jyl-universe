"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";

export function CenterTasks() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. 할 일 불러오기
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false });
    
    if (!error && data) setTodos(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchTodos(); }, []);

  // 2. 추가하기 (엔터 치면 바로 실행)
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const { error } = await supabase
      .from("todos")
      .insert([{ title: newTodo, is_completed: false }]);
    
    if (!error) {
      setNewTodo("");
      fetchTodos();
    }
  };

  // 3. 체크/해제 (클릭 한 번으로 끝)
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    await supabase
      .from("todos")
      .update({ is_completed: !currentStatus })
      .eq("id", id);
    fetchTodos();
  };

  // 4. 삭제 (X 버튼)
  const deleteTodo = async (id: number) => {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
  };

  return (
    <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-light tracking-[0.2em] text-foreground/60 uppercase">Today Tasks</h2>
        <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
          {todos.length} Active
        </span>
      </div>

      {/* 입력창: 여기서 엔터 치면 바로 등록됩니다. */}
      <form onSubmit={addTodo} className="relative mb-8 group">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What is your mission today?"
          className="w-full bg-white/[0.05] border border-white/5 rounded-xl px-5 py-4 text-sm font-light tracking-wide focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* 목록창 */}
      <div className="space-y-3 min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-20 text-white/10">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <p className="text-center text-xs text-white/10 py-10 font-mono uppercase tracking-[0.2em]">All Systems Clear</p>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.05] transition-all duration-300"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => toggleTodo(todo.id, todo.is_completed)}
              >
                {todo.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-white/80" />
                ) : (
                  <Circle className="w-5 h-5 text-white/10 group-hover:text-white/30" />
                )}
                <span className={`text-sm tracking-wide transition-all duration-500 ${todo.is_completed ? "text-white/20 line-through" : "text-white/70"}`}>
                  {todo.title}
                </span>
              </div>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/10 hover:text-red-400/60 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
