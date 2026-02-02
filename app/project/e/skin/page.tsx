"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Edit2, Save, Plus, Trash2, Star, ThumbsUp, ThumbsDown, Droplets } from "lucide-react";
import Link from "next/link";

export default function SkinPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // 프로필 수정 모드
  
  // 1. 프로필 데이터 (피부타입, 개선사항, 루틴)
  const [profile, setProfile] = useState({
    skin_type: "Oily Dehydrated Sensitive", // 기본값 (수부지 민감성)
    improvements: "",
    routine: {
      cleansing: "",
      toner: "",
      serum: "",
      cream: "",
      sunscreen: "",
      cushion: ""
    }
  });

  // 2. 리뷰 데이터 리스트
  const [reviews, setReviews] = useState<any[]>([]);
  
  // 리뷰 추가 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    category: "Toner", name: "", review: "", rating: 3, repurchase: true
  });

  // 데이터 불러오기
  const fetchData = async () => {
    // 프로필 가져오기 (ID 1번 고정)
    const { data: profileData } = await supabase
      .from("skin_profile")
      .select("*")
      .eq("id", 1)
      .single();

    if (profileData) {
      setProfile({
        skin_type: profileData.skin_type || "Oily Dehydrated Sensitive",
        improvements: profileData.improvements || "",
        routine: profileData.routine || profile.routine
      });
    }

    // 리뷰 리스트 가져오기
    const { data: reviewData } = await supabase
      .from("skin_reviews")
      .select("*")
      .order("id", { ascending: false });
    
    if (reviewData) setReviews(reviewData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 프로필 저장
  const saveProfile = async () => {
    await supabase.from("skin_profile").upsert({
      id: 1,
      skin_type: profile.skin_type,
      improvements: profile.improvements,
      routine: profile.routine
    });
    setEditing(false);
  };

  // 리뷰 추가
  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("skin_reviews").insert([newReview]);
    setIsModalOpen(false);
    setNewReview({ category: "Toner", name: "", review: "", rating: 3, repurchase: true }); // 초기화
    fetchData();
  };

  // 리뷰 삭제
  const deleteReview = async (id: number) => {
    if (confirm("Delete this review?")) {
      await supabase.from("skin_reviews").delete().eq("id", id);
      fetchData();
    }
  };

  // 카테고리별로 리뷰 분류
  const categories = ["Toner", "Serum", "Cream", "Sunscreen", "Cleansing", "Cushion", "Mask", "Etc"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-32">
       {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />
      </div>

      {/* 헤더 */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 z-10">
        <Link href="/project/e" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-mono tracking-widest">BACK</span>
        </Link>
        <h1 className="text-xl font-light tracking-[0.2em]">SKIN LOG</h1>
        <div className="w-10"/> 
      </div>

      <main className="w-full max-w-2xl space-y-8 z-10">
        
        {/* ================= SECTION 1: SKIN TYPE ================= */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Droplets className="w-3 h-3 text-blue-400" />
            {editing ? (
              <input 
                type="text" 
                value={profile.skin_type}
                onChange={(e) => setProfile({...profile, skin_type: e.target.value})}
                className="bg-transparent text-xs font-mono text-blue-300 text-center focus:outline-none min-w-[200px]"
              />
            ) : (
              <span className="text-xs font-mono text-blue-300 tracking-wide uppercase">{profile.skin_type}</span>
            )}
          </div>
        </div>

        {/* ================= SECTION 2: IMPROVEMENTS ================= */}
        <section className="relative">
          <div className="flex justify-between items-end mb-3 px-2">
            <h2 className="text-xs font-mono text-white/50 tracking-widest">PRIORITY IMPROVEMENTS</h2>
            <button onClick={() => editing ? saveProfile() : setEditing(true)} className="text-white/40 hover:text-white">
              {editing ? <Save className="w-4 h-4 text-blue-400" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            {editing ? (
              <textarea 
                value={profile.improvements}
                onChange={(e) => setProfile({...profile, improvements: e.target.value})}
                placeholder="1. Redness relief&#10;2. Pore care"
                className="w-full h-20 bg-transparent text-white/80 text-sm leading-relaxed focus:outline-none resize-none placeholder:text-white/20"
              />
            ) : (
              <div className="space-y-1">
                {profile.improvements ? profile.improvements.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-white/80 font-light">• {line}</p>
                )) : <p className="text-xs text-white/20 italic">No improvements set.</p>}
              </div>
            )}
          </div>
        </section>

        {/* ================= SECTION 3: CURRENT ROUTINE ================= */}
        <section>
          <div className="flex justify-between items-end mb-3 px-2">
            <h2 className="text-xs font-mono text-white/50 tracking-widest">CURRENT ROUTINE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(profile.routine).map((key) => (
              <div key={key} className="flex flex-col p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] font-mono text-white/30 uppercase mb-1 tracking-wider">{key}</span>
                {editing ? (
                  <input 
                    type="text" 
                    value={profile.routine[key as keyof typeof profile.routine]}
                    onChange={(e) => setProfile({
                      ...profile, 
                      routine: { ...profile.routine, [key]: e.target.value }
                    })}
                    className="bg-white/5 text-sm text-white px-2 py-1 rounded focus:outline-none"
                    placeholder="Product Name"
                  />
                ) : (
                  <span className="text-sm text-white/90 font-light truncate">
                    {profile.routine[key as keyof typeof profile.routine] || <span className="text-white/10">-</span>}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: PRODUCT REVIEWS ================= */}
        <section className="pt-8">
          <div className="flex justify-between items-end mb-6 px-2">
            <h2 className="text-lg font-light tracking-[0.2em] text-white">PRODUCT ARCHIVE</h2>
            <button onClick={() => setIsModalOpen(true)} className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {categories.map((cat) => {
              const catReviews = reviews.filter(r => r.category === cat);
              if (catReviews.length === 0) return null;

              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-mono text-blue-400/80 px-2 uppercase tracking-wider">{cat}</h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                    {catReviews.map((item, idx) => (
                      <div key={item.id} className={`p-4 flex items-center justify-between group ${idx !== catReviews.length - 1 ? 'border-b border-white/5' : ''}`}>
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{item.name}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-white/60 font-light leading-relaxed">{item.review}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* 재구매 의사 표시 */}
                          <div className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${item.repurchase ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"}`} title={item.repurchase ? "Repurchase: YES" : "Repurchase: NO"} />
                          
                          <button onClick={() => deleteReview(item.id)} className="opacity-0 group-hover:opacity-100 text-white/10 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            
            {reviews.length === 0 && (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-muted-foreground/30 font-mono">NO REVIEWS YET</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 리뷰 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-lg font-light text-white mb-6">ADD PRODUCT REVIEW</h3>
            <form onSubmit={addReview} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={newReview.category} 
                  onChange={e => setNewReview({...newReview, category: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                >
                  {categories.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                </select>
                <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-xl px-4 gap-2 cursor-pointer" onClick={() => setNewReview({...newReview, repurchase: !newReview.repurchase})}>
                  <span className="text-xs text-white/60">Repurchase?</span>
                  <div className={`w-3 h-3 rounded-full ${newReview.repurchase ? "bg-green-500" : "bg-red-500"}`} />
                </div>
              </div>

              <input type="text" placeholder="Product Name" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" required />
              
              <textarea placeholder="One-line review..." value={newReview.review} onChange={e => setNewReview({...newReview, review: e.target.value})} className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none" required />

              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-6 h-6 cursor-pointer transition-colors ${star <= newReview.rating ? "text-yellow-500 fill-yellow-500" : "text-white/20"}`}
                    onClick={() => setNewReview({...newReview, rating: star})}
                  />
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-white text-black font-medium rounded-xl hover:bg-gray-200 mt-2 tracking-widest">SAVE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
