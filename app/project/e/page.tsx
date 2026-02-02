"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from "recharts";
import { Activity, Moon, Scale, Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link"; 

interface HealthLog {
  date: string;
  weight: number;
  muscle_mass: number;
  fat_percent: number;
  sleep_hours: number;
  calories_in: number;
  calories_out: number;
}

export default function AnalysisPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [data, setData] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: logs } = await supabase
        .from("health_logs")
        .select("*")
        .order("date", { ascending: true })
        .limit(7);
      
      if (logs) setData(logs);
      setLoading(false);
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-white/50 mb-1">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-xs font-mono" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden pt-20 px-6 pb-32">
       {/* 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
      </div>

      {/* [수정됨] 뒤로가기 경로 변경: /dashboard/project */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/dashboard/project" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK TO PROJECTS</span>
        </Link>
      </div>

      <header className="mb-10 text-center z-10">
        <h1 className="text-3xl font-light text-foreground tracking-[0.1em] mb-1">PROJECT E DASHBOARD</h1>
        <h2 className="text-xs font-mono text-muted-foreground/60 tracking-[0.4em]">OVERVIEW</h2>
      </header>

      {/* 차트 영역 */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
        
        {/* Weight Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Scale className="w-4 h-4" /></div>
            <div>
              <h3 className="text-sm font-medium text-white/90 tracking-wide">BODY COMPOSITION</h3>
              <p className="text-[10px] text-white/40">Weight vs Muscle Mass</p>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={false} name="Weight" />
                <Line type="monotone" dataKey="muscle_mass" stroke="#10b981" strokeWidth={2} dot={false} name="Muscle" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calories Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Utensils className="w-4 h-4" /></div>
            <div>
              <h3 className="text-sm font-medium text-white/90 tracking-wide">CALORIE BALANCE</h3>
              <p className="text-[10px] text-white/40">Intake vs Burned</p>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="calories_in" fill="#f97316" radius={[4, 4, 0, 0]} name="In" />
                <Bar dataKey="calories_out" fill="#ef4444" radius={[4, 4, 0, 0]} name="Out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Moon className="w-4 h-4" /></div>
            <div>
              <h3 className="text-sm font-medium text-white/90 tracking-wide">SLEEP CYCLE</h3>
              <p className="text-[10px] text-white/40">Duration Trend</p>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sleep_hours" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSleep)" name="Sleep" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        
        <Link href="/project/e/inbody">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] border border-white/10 rounded-full hover:border-white/30 hover:bg-white/5 transition-all group">
            <Activity className="w-3 h-3 text-white/50 group-hover:text-white" />
            <span className="text-[10px] font-mono text-white/60 tracking-widest group-hover:text-white">INBODY</span>
          </button>
        </Link>

        <Link href="/project/e/skin">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] border border-white/10 rounded-full hover:border-white/30 hover:bg-white/5 transition-all group">
            <span className="text-[10px] font-mono text-white/60 tracking-widest group-hover:text-white">SKIN</span>
          </button>
        </Link>

        <Link href="/project/e/etc">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] border border-white/10 rounded-full hover:border-white/30 hover:bg-white/5 transition-all group">
            <span className="text-[10px] font-mono text-white/60 tracking-widest group-hover:text-white">ETC</span>
          </button>
        </Link>
      </div>

    </div>
  );
}
