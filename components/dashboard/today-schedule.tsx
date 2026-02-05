"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, X, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export function TodaySchedule() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  // 오늘 요일 구하기
  const getTodayDay = () => days[new Date().getDay()];

  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(getTodayDay()); // 기본값은 오늘 요일
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // KST 시간 갱신 및 자정 체크
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // 만약 날이 바뀌면 자동으로 오늘 요일로 업데이트 (선택 사항)
      // if (selectedDay !== days[now.getDay()]) setSelectedDay(days[now.getDay()]);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedDay]);

  // 선택된 요일의 일정만 불러오기
  const fetchSchedules = async () => {
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .eq("day", selectedDay) // 요일 필터링 추가
      .order("start_time", { ascending: true });
    
    if (data) setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDay]); // 요일이 바뀔 때마다 다시 불러옴

  const calculatePosition = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    const startHour = 6;
    const totalMinutes = (hrs - startHour) * 60 + mins;
    return (totalMinutes / 60) * 80;
  };

  const nowDay = getTodayDay();
  const nowHrs = currentTime.getHours();
  const nowPos = calculatePosition(`${nowHrs}:${currentTime.getMinutes()}`);

  return (
    <div className="relative bg-white/[0.015] border border-white/5 rounded-3xl p-7 h-[650px] flex flex-col backdrop-blur-xl shadow-2xl">
      
      {/* 1. 요일 선택 및 헤더 */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-white/30 mb-1">
              <CalendarIcon className="w-3 h-3" />
              <span className="text-[10px] font-mono tracking-widest uppercase">
                {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl font-light tracking-[0.2em] text-white/90">
              {selectedDay} <span className="text-white/30 text-sm font-light">TIMELINE</span>
            </h2>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span className="text-[10px] font-bold tracking-widest">ADD</span>
          </button>
        </div>

        {/* 요일 탭 선택기 */}
        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-2 text-[10px] font-bold tracking-tighter rounded-xl transition-all ${
                selectedDay === day 
                ? "bg-white text-black shadow-lg" 
                : day === nowDay 
                  ? "text-blue-400 bg-blue-400/5" 
                  : "text-white/20 hover:text-white/50"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 타임라인 리스트 (기존 유지) */}
      <div className="relative flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {/* 현재 요일이고 6시 이후일 때만 NOW 라인 표시 */}
        {selectedDay === nowDay && nowHrs >= 6 && (
          <div 
            className="absolute left-0 right-0 border-t border-red-500/60 z-30 flex items-center"
            style={{ top: `${nowPos}px`, transition: 'top 1s linear' }}
          >
            <div className="absolute left-0 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              NOW
            </div>
          </div>
        )}

        {Array.from({ length: 19 }).map((_, i) => (
          <div key={i} className="h-[80px] border-t border-white/[0.03] relative">
            <span className="absolute -top-2.5 left-0 text-[10px] font-mono text-white/10 w-12 text-right pr-4">
              {String(i + 6).padStart(2, '0')}:00
            </span>
          </div>
        ))}

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

      {/* 3. 모달 팝업 (day 정보 포함하여 저장) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-lg font-light tracking-widest text-white mb-8">
              ADD FOR {selectedDay}
            </h3>
            
            <form 
              onSubmit={async (e: any) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await supabase.from("schedules").insert([{
                  title: formData.get('title'),
                  start_time: formData.get('start'),
                  end_time: formData.get('end'),
                  day: selectedDay // 선택된 요일에 저장
                }]);
                setIsModalOpen(false);
                fetchSchedules();
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Task Name</label>
                <input name="title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="start" type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm" required />
                <input name="end" type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm" required />
              </div>
              <button type="submit" className="w-full py-5 bg-white text-black font-bold rounded-2xl text-xs tracking-[0.2em]">
                SAVE TO {selectedDay}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
