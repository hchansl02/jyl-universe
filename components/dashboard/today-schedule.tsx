"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Plus, Trash2, Edit2, X, Clock, Calendar as CalendarIcon, 
  Repeat, Palette, Check, Save 
} from "lucide-react";

export function TodaySchedule() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const getTodayDay = () => days[new Date().getDay()];

  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(getTodayDay());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 수정 전용 상태
  const [editingItem, setEditingItem] = useState<any>(null);

  const colors = [
    { name: 'Default', value: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' },
    { name: 'Blue', value: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.3)' },
    { name: 'Green', value: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.3)' },
    { name: 'Purple', value: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)' },
    { name: 'Yellow', value: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.3)' },
    { name: 'Red', value: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .or(`day.eq.${selectedDay},recurrence_period.eq.daily`)
      .order("start_time", { ascending: true });
    
    if (data) setSchedules(data);
  };

  useEffect(() => { fetchSchedules(); }, [selectedDay]);

  // 위치 계산 (00:00 시작 기준)
  const calculatePosition = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hrs * 60 + mins;
    return (totalMinutes / 60) * 80; // 1시간당 80px
  };

  const nowDay = getTodayDay();
  const nowHrs = currentTime.getHours();
  const nowPos = calculatePosition(`${nowHrs}:${currentTime.getMinutes()}`);

  // 저장 및 수정 로직 통합
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const isRecurring = formData.get('is_recurring') === 'on';
    
    const payload = {
      title: formData.get('title'),
      start_time: formData.get('start'),
      end_time: formData.get('end'),
      day: selectedDay,
      color: formData.get('color'),
      is_recurring: isRecurring,
      recurrence_period: isRecurring ? formData.get('recurrence_period') : null,
      recurrence_until: formData.get('recurrence_until') || null
    };

    if (editingItem) {
      // 수정 모드
      await supabase.from("schedules").update(payload).eq("id", editingItem.id);
    } else {
      // 추가 모드
      await supabase.from("schedules").insert([payload]);
    }
    
    closeModal();
    fetchSchedules();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="relative bg-white/[0.015] border border-white/5 rounded-3xl p-7 h-[700px] flex flex-col backdrop-blur-xl shadow-2xl overflow-hidden font-sans">
      
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-white/30 mb-1">
              <CalendarIcon className="w-3 h-3" />
              <span className="text-[10px] font-mono tracking-widest uppercase">
                {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl font-light tracking-[0.2em] text-white/90">{selectedDay} <span className="text-white/30 text-sm font-light uppercase">Timeline</span></h2>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all group">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span className="text-[10px] font-bold tracking-widest">ADD</span>
          </button>
        </div>

        {/* 요일 선택 */}
        <div className="flex gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-2xl overflow-x-auto no-scrollbar">
          {days.map((day) => (
            <button key={day} onClick={() => setSelectedDay(day)} className={`flex-1 min-w-[50px] py-2 text-[10px] font-bold tracking-tighter rounded-xl transition-all ${selectedDay === day ? "bg-white text-black shadow-lg" : day === nowDay ? "text-blue-400 bg-blue-400/5" : "text-white/20 hover:text-white/50"}`}>
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* 타임라인 메인 (24시간 전체 표시) */}
      <div className="relative flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {/* NOW 라인 */}
        {selectedDay === nowDay && (
          <div className="absolute left-0 right-0 border-t border-red-500/60 z-30 flex items-center" style={{ top: `${nowPos}px`, transition: 'top 1s linear' }}>
            <div className="absolute left-0 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">NOW</div>
          </div>
        )}

        {/* 배경 시간 그리드 (00:00 ~ 23:00) */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-[80px] border-t border-white/[0.03] relative">
            <span className="absolute -top-2.5 left-0 text-[10px] font-mono text-white/10 w-12 text-right pr-4">
              {String(i).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* 일정 카드 */}
        {schedules.map((item) => {
          const top = calculatePosition(item.start_time);
          const [sH, sM] = item.start_time.split(':').map(Number);
          let [eH, eM] = item.end_time.split(':').map(Number);
          
          // 자정(00:00) 종료 처리: 시작 시간보다 종료 시간이 작으면 다음날 자정(24:00)으로 간주
          if (eH === 0 && eM === 0) eH = 24;

          const duration = (eH * 60 + eM) - (sH * 60 + sM);
          const height = (duration / 60) * 80;
          const colorObj = colors.find(c => c.value === item.color) || colors[0];

          return (
            <div 
              key={item.id}
              className="absolute left-16 right-0 rounded-xl border p-4 flex justify-between group transition-all"
              style={{ 
                top: `${top}px`, 
                height: `${height}px`, 
                minHeight: '45px',
                backgroundColor: item.color,
                borderColor: colorObj.border
              }}
            >
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-sm font-bold text-white/90 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1 text-white/50 font-mono text-[9px]">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</span>
                  {item.is_recurring && <Repeat className="w-2.5 h-2.5 text-blue-400" />}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(item)} className="p-1.5 text-white/30 hover:text-white rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={async () => { if(confirm("삭제할까요?")) { await supabase.from("schedules").delete().eq("id", item.id); fetchSchedules(); } }} className="p-1.5 text-white/20 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 통합 팝업 모달 (추가/수정 공용) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-light tracking-widest text-white uppercase">
                {editingItem ? "Edit Schedule" : "New Schedule"}
              </h3>
              <button onClick={closeModal} className="text-white/20 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-mono">Title</label>
                <input name="title" defaultValue={editingItem?.title} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-white/30" required placeholder="무엇을 하나요?" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-mono">Start</label>
                   <input name="start" type="time" defaultValue={editingItem?.start_time?.slice(0,5)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm" required />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-mono">End</label>
                   <input name="end" type="time" defaultValue={editingItem?.end_time?.slice(0,5)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm" required />
                </div>
              </div>

              {/* 반복 설정 */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/60">Recurrence</span>
                  </div>
                  <input type="checkbox" name="is_recurring" defaultChecked={editingItem?.is_recurring} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-white" />
                </div>
                <div className="flex gap-4">
                  <select name="recurrence_period" defaultValue={editingItem?.recurrence_period || "daily"} className="bg-black/40 text-[10px] text-white/80 border border-white/10 rounded-lg px-2 py-1 outline-none">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <input type="date" name="recurrence_until" defaultValue={editingItem?.recurrence_until} className="bg-black/40 text-[10px] text-white/80 border border-white/10 rounded-lg px-2 py-1 outline-none flex-1" />
                </div>
              </div>

              {/* 색상 선택 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-mono">Label Color</label>
                <div className="flex justify-between">
                  {colors.map((c) => (
                    <label key={c.name} className="relative cursor-pointer group">
                      <input type="radio" name="color" value={c.value} className="sr-only peer" defaultChecked={editingItem ? editingItem.color === c.value : c.name === 'Default'} />
                      <div className="w-8 h-8 rounded-full border border-white/10 transition-all peer-checked:scale-125 peer-checked:border-white shadow-sm" style={{ backgroundColor: c.value }} />
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-white text-black font-bold rounded-2xl text-[11px] tracking-[0.3em] hover:bg-gray-200 transition-all shadow-xl">
                {editingItem ? "UPDATE SCHEDULE" : "SAVE TO TIMELINE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
