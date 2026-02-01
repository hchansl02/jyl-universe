"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus } from "lucide-react";

export function ThoughtsContent() {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [newThought, setNewThought] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  // DB에서 데이터 가져오기
  const fetchThoughts = async () => {
    const { data } = await supabase.from("thoughts").select("*");
    setThoughts(data || []);
  };

  useEffect(() => { fetchThoughts(); }, []);

  // 생각 추가 (랜덤 위치 지정)
  const addThought = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    // 화면의 15% ~ 75% 사이 랜덤 위치에 배치
    const randomX = Math.floor(Math.random() * 60) + 15;
    const randomY = Math.floor(Math.random() * 50) + 20;

    const { error } = await supabase.from("thoughts").insert([
      { content: newThought, x_pos: randomX, y_pos: randomY }
    ]);

    if (!error) {
      setNewThought("");
      setIsInputVisible(false);
      fetchThoughts();
    }
  };

 // 삭제 기능
  const deleteThought = async (id: number) => {
    const { error } = await supabase.from("thoughts").delete().eq("id", id);
    
    // 성공하든 실패하든 최신 목록을 가져오도록 fetchThoughts()로 통일합니다.
    if (!error) {
      fetchThoughts();
    } else {
      fetchThoughts();
    }
  };

  return (
    <div className="relative w-full h-[60vh]">
      {/* 둥둥 떠다니는 생각들 */}
      <AnimatePresence>
        {thoughts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ position: "absolute", left: `${t.x_pos}%`, top: `${t.y_pos}%` }}
            className="group"
          >
            <div className="bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl max-w-[220px] text-center transition-all hover:border-white/30">
              <p className="text-[13px] text-zinc-300 font-extralight leading-relaxed tracking-widest">
                {t.content}
              </p>
              <button
                onClick={() => deleteThought(t.id)}
                className="absolute -top-2 -right-2 bg-black border border-white/10 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-zinc-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 하단 + 버튼 및 입력창 */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6">
        <AnimatePresence>
          {isInputVisible && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={addThought}
              className="flex gap-2"
            >
              <input
                autoFocus
                type="text"
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="Fragment your thought..."
                className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-full px-8 py-3 text-[12px] focus:outline-none focus:border-white/40 transition-all text-white w-72 tracking-[0.2em]"
              />
            </motion.form>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsInputVisible(!isInputVisible)}
          className={`p-5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md transition-all ${
            isInputVisible ? "rotate-45 text-red-500 border-red-500/20" : "hover:border-white/30 text-zinc-500"
          }`}
        >
          <Plus size={28} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );

}
