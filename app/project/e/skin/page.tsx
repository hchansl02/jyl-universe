"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Edit2, Save, Plus, Trash2, Star, Droplets, Check } from "lucide-react";
import Link from "next/link";

export default function SkinPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  
  // 루틴 수정 모드 상태
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  
  // 1. 프로필 데이터
  const [profile, setProfile] = useState({
    skin_type: "민감성 수분부족지성",
    improvements: [] as string[],
    routine: {
      cleansing: "",
      toner: "",
      serum: "",
      cream: "",
      sunscreen: "",
      cushion: ""
    }
  });

  const [newImprovement, setNewImprovement] = useState("");

  // 2. 리뷰 데이터 & 수정 상태 관리
  const [reviews, setReviews] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 수정 중인 리뷰 ID (null이면 새 리뷰 추가 모드)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  
  const [reviewForm, setReviewForm] = useState({
    category: "Toner", name: "", review: "", rating: 3, repurchase: true
  });

  // 데이터 불러오기
  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from("skin_profile")
      .select("*")
      .eq("id", 1)
      .single();

    if (profileData) {
      const improvementsArray = profileData.improvements ? profileData.improvements.split('\n') : [];
      setProfile({
        skin_type: "민감성 수분부족지성", 
        improvements: improvementsArray,
        routine: profileData.routine || profile.routine
      });
    }

    const { data: reviewData } = await supabase
      .from("skin_reviews")
      .select("*")
      .order("id", { ascending: false });
    
    if (reviewData) setReviews(reviewData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 저장 (통합)
  const saveToDB = async (updatedProfile: typeof profile) => {
    const improvementsString = updatedProfile.improvements.join('\n');
    await supabase.from("skin_profile").upsert({
      id: 1,
      skin_type: updatedProfile.skin_type,
      improvements: improvementsString,
      routine: updatedProfile.routine
    });
  };

  // 개선사항 추가
  const addImprovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImprovement.trim()) return;
    const updatedList = [...profile.improvements, newImprovement];
    const updatedProfile = { ...profile, improvements: updatedList };
    setProfile(updatedProfile);
    setNewImprovement("");
    await saveToDB(updatedProfile);
  };

  const deleteImprovement = async (index: number) => {
    const updatedList = profile.improvements.filter((_, i) => i !== index);
    const updatedProfile = { ...profile, improvements: updatedList };
    setProfile(updatedProfile);
    await saveToDB(updatedProfile);
  };

  const handleSaveRoutine = async () => {
    await saveToDB(profile);
    setIsEditingRoutine(false);
  };

  // --- 리뷰 관련 로직 (수정 기능 추가됨) ---

  // 리뷰 저장 (추가/수정 분기 처리)
  const saveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReviewId) {
      // 수정 모드 (UPDATE)
      await supabase.from("skin_reviews").update(reviewForm).eq("id", editingReviewId);
    } else {
      // 추가 모드 (INSERT)
      await supabase.from("skin_reviews").insert([reviewForm]);
    }

    setIsModalOpen(false);
    setReviewForm({ category: "Toner", name: "", review: "", rating: 3, repurchase: true });
    setEditingReviewId(null); // ID 초기화
    fetchData();
  };

  // 리뷰 수정 버튼 클릭 시
  const openEditModal = (review: any) => {
    setReviewForm({
      category: review.category,
      name: review.name,
      review: review.review,
      rating: review.rating,
      repurchase: review.repurchase
    });
    setEditingReviewId(review.id); // 수정할 ID 설정
    setIsModalOpen(true);
  };

  // 리뷰 추가 버튼 클릭 시
  const openAddModal = () => {
    setReviewForm({ category: "Toner", name: "", review: "", rating: 3, repurchase: true });
    setEditingReviewId(null); // ID 초기화 (새글)
    setIsModalOpen(true);
  };

  const deleteReview = async (id: number) => {
    if (confirm("리뷰를 삭제하시겠습니까?")) {
      await supabase.from("skin_reviews").delete().eq("id", id);
      fetchData();
    }
  };

  const categories = ["Toner", "Serum", "Cream", "Sunscreen", "Cleansing", "Cushion", "Mask", "Etc"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-32">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
      </div>

      {/* 헤더 */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-10 z-10">
        <Link href="/project/e" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
        {/* 제목 변경: SKIN STATUS */}
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">SKIN STATUS</h1>
        <div className="w-10"/> 
      </div>

      <main className="w-full max-w-2xl space-y-12 z-10">
        
        {/* ================= SECTION 1: SKIN TYPE ================= */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/20 border border-blue-400/40 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Droplets className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold text-blue-100 tracking-wide">{profile.skin_type}</span>
          </div>
        </div>

        {/* ================= SECTION 2: IMPROVEMENTS ================= */}
        <section className="relative">
          <h2 className="text-xs font-bold text-white/90 tracking-widest mb-4 px-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            PRIORITY IMPROVEMENTS
          </h2>
          
          <div className="space-y-3">
            <form onSubmit={addImprovement} className="flex gap-2">
              <input 
                type="text" 
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                placeholder="피부 고민이나 개선할 점을 입력해주세요"
                className="flex-1 bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all font-medium"
              />
              <button type="submit" className="p-3 bg-white/[0.1] border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all hover:scale-105">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2.5">
              {profile.improvements.length === 0 ? (
                <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
                  <p className="text-xs text-gray-500 italic">등록된 내용이 없습니다.</p>
                </div>
              ) : (
                profile.improvements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/15 rounded-xl group hover:border-white/30 hover:bg-white/[0.06] transition-all">
                    <span className="text-sm text-white/90 font-medium">{item}</span>
                    <button 
                      onClick={() => deleteImprovement(index)} 
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all p-2 rounded-full hover:bg-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: CURRENT ROUTINE ================= */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xs font-bold text-white/90 tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              CURRENT ROUTINE
            </h2>
            <button 
              onClick={() => isEditingRoutine ? handleSaveRoutine() : setIsEditingRoutine(true)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${isEditingRoutine ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "border-white/10 text-gray-300 hover:text-white hover:bg-white/10"}`}
            >
              {isEditingRoutine ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold tracking-wider">SAVE</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold tracking-wider">EDIT</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(profile.routine).map((key) => (
              <div key={key} className={`flex flex-col p-5 rounded-xl border transition-all ${isEditingRoutine ? "bg-white/[0.08] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "bg-white/[0.04] border-white/15 hover:border-white/30"}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase mb-2.5 tracking-widest">{key}</span>
                {isEditingRoutine ? (
                  <input 
                    type="text" 
                    value={profile.routine[key as keyof typeof profile.routine]}
                    onChange={(e) => setProfile({
                      ...profile, 
                      routine: { ...profile.routine, [key]: e.target.value }
                    })}
                    className="bg-black/40 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400 focus:bg-black/60 transition-all placeholder:text-gray-600"
                    placeholder="제품명을 입력하세요"
                  />
                ) : (
                  <span className="text-sm text-white font-medium truncate h-6 flex items-center">
                    {profile.routine[key as keyof typeof profile.routine] || <span className="text-gray-600 text-xs italic">비어있음</span>}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: REVIEWS (제목 수정됨) ================= */}
        <section className="pt-8">
          <div className="flex justify-between items-center mb-6 px-1">
            {/* 제목 변경: REVIEWS */}
            <h2 className="text-lg font-light tracking-[0.2em] text-white">REVIEWS</h2>
            <button 
              onClick={openAddModal} 
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">ADD REVIEW</span>
            </button>
          </div>

          <div className="space-y-8">
            {categories.map((cat) => {
              const catReviews = reviews.filter(r => r.category === cat);
              if (catReviews.length === 0) return null;

              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-bold text-blue-400 px-2 uppercase tracking-widest border-l-2 border-blue-500 pl-3">{cat}</h3>
                  <div className="bg-white/[0.03] border border-white/15 rounded-2xl overflow-hidden">
                    {catReviews.map((item, idx) => (
                      <div key={item.id} className={`p-5 flex items-center justify-between group hover:bg-white/[0.05] transition-colors ${idx !== catReviews.length - 1 ? 'border-b border-white/10' : ''}`}>
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">{item.name}</span>
                            <div className="flex items-center gap-0.5 bg-black/40 px-2 py-1 rounded-md border border-white/10">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 font-normal leading-relaxed">{item.review}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* 재구매 의사 */}
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">RE-BUY</span>
                            <div className={`w-3.5 h-3.5 rounded-full shadow-[0_0_10px] transition-transform group-hover:scale-110 ${item.repurchase ? "bg-green-500 shadow-green-500/60" : "bg-red-500 shadow-red-500/60"}`} />
                          </div>
                          
                          {/* 수정 버튼 (추가됨) */}
                          <button onClick={() => openEditModal(item)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>

                          {/* 삭제 버튼 */}
                          <button onClick={() => deleteReview(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            
            {reviews.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl bg-white/[0.02]">
                <p className="text-sm text-gray-400 font-bold tracking-wide">NO REVIEWS YET</p>
                <p className="text-xs text-gray-600 mt-2">화장품 사용 후기를 기록하고 나만의 데이터를 만드세요.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 리뷰 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            {/* 제목 동적 변경 (ADD vs EDIT) */}
            <h3 className="text-lg font-bold text-white mb-6 tracking-wide">
              {editingReviewId ? "EDIT REVIEW" : "ADD REVIEW"}
            </h3>
            <form onSubmit={saveReview} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</label>
                  <select 
                    value={reviewForm.category} 
                    onChange={e => setReviewForm({...reviewForm, category: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Repurchase</label>
                  <div 
                    className={`flex items-center justify-center h-[46px] border border-white/20 rounded-xl cursor-pointer transition-all ${reviewForm.repurchase ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}`} 
                    onClick={() => setReviewForm({...reviewForm, repurchase: !reviewForm.repurchase})}
                  >
                    <span className={`text-xs font-bold tracking-wider ${reviewForm.repurchase ? "text-green-400" : "text-red-400"}`}>
                      {reviewForm.repurchase ? "YES" : "NO"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <input type="text" placeholder="제품 이름" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 placeholder:text-gray-500 transition-colors" required />
              </div>
              
              <div className="space-y-1">
                <textarea placeholder="한줄 평을 남겨주세요..." value={reviewForm.review} onChange={e => setReviewForm({...reviewForm, review: e.target.value})} className="w-full h-24 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none placeholder:text-gray-500 focus:border-white/50 transition-colors" required />
              </div>

              <div className="flex justify-center gap-3 py-3 bg-white/5 rounded-xl border border-white/10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                  />
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 mt-2 tracking-widest transition-colors shadow-lg">
                {editingReviewId ? "UPDATE REVIEW" : "SAVE REVIEW"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
