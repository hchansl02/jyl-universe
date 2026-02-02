"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Edit2, Save, Activity, Flame } from "lucide-react";
import Link from "next/link";

export default function InbodyProfilePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const today = new Date().toISOString().split('T')[0];

  const [profile, setProfile] = useState({
    weight: 0, muscle_mass: 0, fat_percent: 0,
    calories_in: 0, calories_out: 0, bmr: 0
  });
  
  const [improvements, setImprovements] = useState("");
  const [routine, setRoutine] = useState<any>({
    Mon: "", Tue: "", Wed: "", Thu: "", Fri: "", Sat: "", Sun: ""
  });

  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: logData } = await supabase
        .from("health_logs")
        .select("*")
        .eq("date", today)
        .single();

      if (logData) setProfile(logData);

      const { data: configData } = await supabase
        .from("bio_config")
        .select("*")
        .limit(1)
        .single();

      if (configData) {
        setImprovements(configData.improvements || "");
        if (configData.routine) setRoutine(configData.routine);
      }
    };
    fetchData();
  }, [today]);

  const saveProfile = async () => {
    const { error } = await supabase
      .from("health_logs")
      .upsert({ date: today, ...profile }, { onConflict: 'date' });
    if (!error) setEditing(null);
  };

  const saveConfig = async () => {
    const { error } = await supabase
      .from("bio_config")
      .upsert({ id: 1, improvements, routine });
    if (!error) setEditing(null);
  };

  const finalCalorie = profile.calories_in - profile.calories_out - profile.bmr;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-32">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
      </div>

      {/* [수정됨] 뒤로가기 경로: /project/e */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 z-10">
        <Link href="/project/e" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-mono tracking-widest">BACK TO DASHBOARD</span>
        </Link>
        <div className="text-[10px] font-mono text-blue-400 border border-blue-400/30 px-2 py-1 rounded">
          {today}
        </div>
      </div>

      <main className="w-full max-w-2xl space-y-8 z-10">
        {/* SECTION 1: PROFILE */}
        <section className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-sm font-mono text-white/50 tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" /> BODY COMPOSITION
            </h2>
            <button onClick={() => editing === 'profile' ? saveProfile() : setEditing('profile')} className="text-white/40 hover:text-white">
              {editing === 'profile' ? <Save className="w-4 h-4 text-blue-400" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "WEIGHT", key: "weight", unit: "kg" },
              { label: "BODY FAT", key: "fat_percent", unit: "%" },
              { label: "MUSCLE", key: "muscle_mass", unit: "kg" }
            ].map((item) => (
              <div key={item.key} className="bg-black/20 rounded-2xl p-4">
                <p className="text-[10px] text-white/30 mb-2 tracking-widest">{item.label}</p>
                {editing === 'profile' ? (
                  <input type="number" value={profile[item.key as keyof typeof profile]} onChange={(e) => setProfile({...profile, [item.key]: parseFloat(e.target.value)})} className="w-full bg-white/10 text-center text-white text-lg rounded py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                ) : (
                  <p className="text-2xl font-light text-white">{profile[item.key as keyof typeof profile]} <span className="text-xs text-white/30">{item.unit}</span></p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: TODAY STATS */}
        <section className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-sm font-mono text-white/50 tracking-widest flex items-center gap-2">
              <Flame className="w-4 h-4" /> TODAY'S ENERGY
            </h2>
            <button onClick={() => editing === 'today' ? saveProfile() : setEditing('today')} className="text-white/40 hover:text-white">
              {editing === 'today' ? <Save className="w-4 h-4 text-blue-400" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: "Calories In", key: "calories_in", color: "text-white" },
              { label: "Calories Out", key: "calories_out", color: "text-white" },
              { label: "BMR (Basic)", key: "bmr", color: "text-white/50" },
            ].map((item) => (
              <div key={item.key} className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-sm text-white/60 font-light">{item.label}</span>
                {editing === 'today' ? (
                  <input type="number" value={profile[item.key as keyof typeof profile]} onChange={(e) => setProfile({...profile, [item.key]: parseFloat(e.target.value)})} className="w-24 bg-white/10 text-right text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                ) : (
                  <span className={`font-mono text-lg ${item.color}`}>{profile[item.key as keyof typeof profile]}</span>
                )}
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-blue-400 font-bold tracking-wide">NET BALANCE</span>
              <span className={`font-mono text-xl font-bold ${finalCalorie > 0 ? "text-red-400" : "text-green-400"}`}>
                {finalCalorie > 0 ? `+${finalCalorie}` : finalCalorie}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: IMPROVEMENTS */}
        <section className="relative">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-lg font-light tracking-[0.2em] text-white">PRIORITY FIXES</h2>
            <button onClick={() => editing === 'improvements' ? saveConfig() : setEditing('improvements')} className="text-white/40 hover:text-white">
              {editing === 'improvements' ? <Save className="w-4 h-4 text-blue-400" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[100px]">
            {editing === 'improvements' ? (
              <textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="1. Fix Thoracic Mobility&#10;2. Pelvic Tilt" className="w-full h-32 bg-transparent text-white/80 text-sm leading-relaxed focus:outline-none resize-none placeholder:text-white/20" />
            ) : (
              <div className="space-y-2">
                {improvements ? improvements.split('\n').map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs font-mono text-blue-500 mt-1">{i + 1}.</span>
                    <p className="text-sm text-white/80 font-light">{line}</p>
                  </div>
                )) : <p className="text-xs text-white/20 italic">No priorities set.</p>}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: ROUTINE */}
        <section className="relative pb-10">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-lg font-light tracking-[0.2em] text-white">WEEKLY ROUTINE</h2>
            <button onClick={() => editing === 'routine' ? saveConfig() : setEditing('routine')} className="text-white/40 hover:text-white">
              {editing === 'routine' ? <Save className="w-4 h-4 text-blue-400" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="space-y-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="w-8 text-xs font-mono text-white/40 pt-1">{day.toUpperCase()}</span>
                {editing === 'routine' ? (
                  <input type="text" value={routine[day]} onChange={(e) => setRoutine({...routine, [day]: e.target.value})} placeholder="Rest or Workout..." className="flex-1 bg-white/5 text-sm text-white px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                ) : (
                  <div className="flex-1">
                    {routine[day] ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-white/80">{routine[day]}</span>
                      </div>
                    ) : <span className="text-xs text-white/10 italic">Rest Day</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
