"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Edit2, Save, X, Clock } from "lucide-react";

export function TodaySchedule() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [schedules, setSchedules] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 시간선 위치 계산을 위한 함수
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").order("start_time", { ascending: true });
    if (data) setSchedules(data);
  };

  useEffect(() => { fetchSchedules(); }, []);

  // 시간선을 위한 위치 계산 (오전 06:00 ~ 자정 기준)
  const calculatePosition = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    const startHour = 6; // 시작 시간 설정
    const totalMinutes = (hrs - startHour) * 60 + mins;
    return (totalMinutes / 60) * 80; // 1시간당 80px 기준
  };

  const nowPos = calculatePosition(`${currentTime.getHours()}:${currentTime.getMinutes()}`);

  return (
    <div className="relative bg-white/[0.02] border border-white/5 rounded-3xl p-7 h-[600px] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-light tracking-[0.2em] text-white/90">TIMELINE</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2 rounded-lg transition-all ${isEditing ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"}`}
        >
          {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto custom-scrollbar pr-4">
        {/* 시간선 (Red Indicator) */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-red-500/50 z-20 flex items-center"
          style={{ top: `${nowPos}px`, transition: 'top 0.5s ease' }}
        >
          <span className="bg-red-500 text-[8px] font-bold px-1 rounded ml-12">NOW</span>
        </div>

        {/* 배경 그리드 (시간 표시) */}
        {Array.from({ length: 19 }).map((_, i) => (
          <div key={i} className="h-[80px] border-t border-white/[0.03] relative flex items-start">
            <span className="text-[10px] font-mono text-white/20 -mt-2 w-12 text-right pr-4">
              {String(i + 6).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* 일정 카드들 */}
        {schedules.map((item) => {
          const top = calculatePosition(item.start_time);
          const [sHrs, sMins] = item.start_time.split(':').map(Number);
          const [eHrs, eMins] = item.end_time.split(':').map(Number);
          const duration = (eHrs * 60 + eMins) - (sHrs * 60 + sMins);
          const height = (duration / 60) * 80;

          return (
            <div 
              key={item.id}
              className="absolute left-16 right-0 rounded-xl border border-white/10 bg-white/5 p-3 flex justify-between group transition-all hover:bg-white/[0.08]"
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                <p className="text-[9px] text-white/40 font-mono mt-1">
                  {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                </p>
              </div>
              {isEditing && (
                <button 
                  onClick={async () => {
                    await supabase.from("schedules").delete().eq("id", item.id);
                    fetchSchedules();
                  }}
                  className="text-white/20 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 입력 영역 (에디트 모드일 때만 하단에 등장) */}
      {isEditing && (
        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2">
           <form 
             onSubmit={async (e: any) => {
               e.preventDefault();
               const formData = new FormData(e.target);
               await supabase.from("schedules").insert([{
                 title: formData.get('title'),
                 start_time: formData.get('start'),
                 end_time: formData.get('end')
               }]);
               e.target.reset();
               fetchSchedules();
             }}
             className="flex gap-2 items-end"
           >
             <div className="flex-1 space-y-2">
               <input name="title" placeholder="일정 이름" className="w-full bg-transparent border-b border-white/20 text-xs py-1 focus:outline-none focus:border-white" required />
               <div className="flex gap-2">
                 <input name="start" type="time" className="bg-white/5 border-none text-[10px] rounded px-1" required />
                 <span className="text-white/20">~</span>
                 <input name="end" type="time" className="bg-white/5 border-none text-[10px] rounded px-1" required />
               </div>
             </div>
             <button type="submit" className="p-2 bg-white text-black rounded-lg"><Plus className="w-4 h-4" /></button>
           </form>
        </div>
      )}
    </div>
  );
}

const CheckCircle2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
