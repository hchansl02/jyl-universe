"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Edit2, X, Clock, Calendar as CalendarIcon } from "lucide-react";

export function TodaySchedule() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [schedules, setSchedules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 시간 및 날짜 갱신 (KST 기준 보장)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").order("start_time", { ascending: true });
    if (data) setSchedules(data);
  };

  useEffect(() => { fetchSchedules(); }, []);

  // 시간선 위치 계산 (06:00 시작 기준)
  const calculatePosition = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    const startHour = 6;
    const totalMinutes = (hrs - startHour) * 60 + mins;
    return (totalMinutes / 60) * 80; // 1시간당 80px
  };

  // 현재 KST 시간 기반 NOW 라인 위치
  const nowHrs = currentTime.getHours();
  const nowMins = currentTime.getMinutes();
  const nowPos = calculatePosition(`${nowHrs}:${nowMins}`);

  // 날짜 포맷
  const dateStr = currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  return (
    <div className="relative bg-white/[0.015] border border-white/5 rounded-3xl p-7 h-[650px] flex flex-col backdrop-blur-xl shadow-2xl">
      
      {/* 타임라인 헤더 (날짜 추가됨) */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-white/30 mb-1">
            <CalendarIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono tracking-widest uppercase">{dateStr}</span>
          </div>
          <h2 className="text-xl font-light tracking-[0.2em] text-white/90">
            {dayName} <span className="text-white/30 text-sm font-light">TIMELINE</span>
          </h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span className="text-[10px] font-bold tracking-widest">ADD SCHEDULE</span>
        </button>
      </div>

      {/* 타임라인 바디 (스크롤바 스타일 수정) */}
      <div className="relative flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 transition-all">
        
        {/* 현재 시간선 (NOW) */}
        {(nowHrs >= 6) && (
          <div 
            className="absolute left-0 right-0 border-t border-red-500/60 z-30 flex items-center"
            style={{ top: `${nowPos}px`, transition: 'top 1s linear' }}
          >
            <div className="absolute left-0 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              NOW
            </div>
          </div>
        )}

        {/* 배경 시간 그리드 */}
        {Array.from({ length: 19 }).map((_, i) => (
          <div key={i} className="h-[80px] border-t border-white/[0.03] relative">
            <span className="absolute -top-2.5 left-0 text-[10px] font-mono text-white/10 w-12 text-right pr-4">
              {String(i + 6).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* 일정 데이터 */}
        {schedules.map((item) => {
          const top = calculatePosition(item.start_time);
          const [sH, sM] = item.start_time.split(':').map(Number);
          const [eH, eM] = item.end_time.split(':').map(Number);
          const duration = (eH * 60 + eM) - (sH * 60 + sM);
          const height = (duration / 60) * 80;

          return (
            <div 
              key={item.id}
              className="absolute left-16 right-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 flex justify-between group transition-all hover:bg-white/[0.07] hover:border-white/20"
              style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
            >
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-1 text-white/30 font-mono text-[10px]">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</span>
                </div>
              </div>
              <button 
                onClick={async () => {
                  if(confirm("일정을 삭제할까요?")) {
                    await supabase.from("schedules").delete().eq("id", item.id);
                    fetchSchedules();
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 p-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 일정 추가 팝업 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-light tracking-widest text-white">NEW MISSION</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form 
              onSubmit={async (e: any) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await supabase.from("schedules").insert([{
                  title: formData.get('title'),
                  start_time: formData.get('start'),
                  end_time: formData.get('end')
                }]);
                setIsModalOpen(false);
                fetchSchedules();
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Task Name</label>
                <input name="title" placeholder="무엇을 하나요?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-all" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Start</label>
                  <input name="start" type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase">End</label>
                  <input name="end" type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none" required />
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all mt-4 tracking-[0.2em] text-xs">
                SAVE TO TIMELINE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
