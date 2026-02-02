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
  
  // 섹션별 수정 모드 상태 (안전장치)
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  
  // 1. 프로필 데이터
  const [profile, setProfile] = useState({
    skin_type: "민감성 수분부족지성", // 한글 기본값
    improvements: [] as string[],      // 리스트 형태로 관리
    routine: {
      cleansing: "",
      toner: "",
      serum: "",
      cream: "",
      sunscreen: "",
      cushion: ""
    }
  });

  // 개선사항 입력 임시 저장소
  const [newImprovement, setNewImprovement] = useState("");

  // 2. 리뷰 데이터
  const [reviews, setReviews] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
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
      // improvements가 DB에는 text로 저장되어 있으므로, 가져올 때 줄바꿈 기준으로 잘라서 배열로 만듦
      const improvementsArray = profileData.improvements ? profileData.improvements.split('\n') : [];
      
      setProfile({
        skin_type: profileData.skin_type || "민감성 수분부족지성",
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
    // DB에 저장할 땐 배열을 다시 줄바꿈 문자열로 변환
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

  // 개선사항 삭제
  const deleteImprovement = async (index: number) => {
    const updatedList = profile.improvements.filter((_, i) => i !== index);
    const updatedProfile = { ...profile, improvements: updatedList };
    setProfile(updatedProfile);
    await saveToDB(updatedProfile);
  };

  // 루틴/타입 저장 핸들러
  const handleSaveRoutine = async () => {
    await saveToDB(profile);
    setIsEditingRoutine(false);
  };
  
  const handleSaveType = async () => {
    await saveToDB(profile);
    setIsEditingType(false);
  };

  // 리뷰 추가
  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("skin_reviews").insert([newReview]);
    setIsModalOpen(false);
    setNewReview({ category: "Toner", name: "", review: "", rating: 3, repurchase: true });
    fetchData();
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
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />
      </div>

      {/* 헤더 */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-10 z-10">
        <Link href="/project/e" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">SKIN LOG</h1>
        <div className="w-10"/> 
      </div>

      <main className="w-full max-w-2xl space-y-10 z-10">
        
        {/* ================= SECTION 1: SKIN TYPE ================= */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full relative group">
            <Droplets className="w-4 h-4 text-blue-400" />
            {isEditingType ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={profile.skin_type}
                  onChange={(e) => setProfile({...profile, skin_type: e.target.value})}
                  className="bg-transparent text-sm font-bold text-blue-100 text-center focus:outline-none min-w-[150px] border-b border-blue-400/50 pb-1"
                  autoFocus
                />
                <button onClick={handleSaveType} className="p-1 bg-blue-500 rounded-full text-white hover:bg-blue-400">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-blue-100 tracking-wide">{profile.skin_type}</span>
                <button onClick={() => setIsEditingType(true)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <Edit2 className="w-3 h-3 text-blue-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTION 2: IMPROVEMENTS (리스트 방식) ================= */}
        <section className="relative">
          <h2 className="text-xs font-bold text-white/70 tracking-widest mb-4 px-1">PRIORITY IMPROVEMENTS</h2>
          
          <div className="space-y-3">
            {/* 추가 입력창 */}
            <form onSubmit={addImprovement} className="flex gap-2">
              <input 
                type="text" 
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                placeholder="개선하고 싶은 점을 입력하고 엔터..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-all"
              />
              <button type="submit" className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {/* 리스트 목록 */}
            <div className="space-y-2">
              {profile.improvements.length === 0 ? (
                <p className="text-xs text-gray-500 italic pl-2">등록된 개선사항이 없습니다.</p>
              ) : (
                profile.improvements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span className="text-sm text-white font-medium">{item}</span>
                    </div>
                    <button 
                      onClick={() => deleteImprovement(index)} 
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: CURRENT ROUTINE (수정 모드 분리) ================= */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xs font-bold text-white/70 tracking-widest">CURRENT ROUTINE</h2>
            <button 
              onClick={() => isEditingRoutine ? handleSaveRoutine() : setIsEditingRoutine(true)} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isEditingRoutine ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              {isEditingRoutine ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">SAVE</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">EDIT</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(profile.routine).map((key) => (
              <div key={key} className={`flex flex-col p-4 rounded-xl border transition-all ${isEditingRoutine ? "bg-white/[0.05] border-blue-500/30" : "bg-white/[0.02] border-white/5"}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">{key}</span>
                {isEditingRoutine ? (
                  <input 
                    type="text" 
                    value={profile.routine[key as keyof typeof profile.routine]}
                    onChange={(e) => setProfile({
                      ...profile, 
                      routine: { ...profile.routine, [key]: e.target.value }
                    })}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="제품명 입력..."
                  />
                ) : (
                  <span className="text-sm text-white font-medium truncate h-6 flex items-center">
                    {profile.routine[key as keyof typeof profile.routine] || <span className="text-gray-600 text-xs">-</span>}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: PRODUCT ARCHIVE ================= */}
        <section className="pt-8">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-lg font-light tracking-[0.2em] text-white">PRODUCT ARCHIVE</h2>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
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
                  <h3 className="text-xs font-bold text-blue-400 px-2 uppercase tracking-wider">{cat}</h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                    {catReviews.map((item, idx) => (
                      <div key={item.id} className={`p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors ${idx !== catReviews.length - 1 ? 'border-b border-white/5' : ''}`}>
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">{item.name}</span>
                            <div className="flex items-center gap-0.5 bg-black/30 px-2 py-1 rounded-md border border-white/5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 font-light leading-relaxed">{item.review}</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          {/* 재구매 의사 */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">RE-BUY</span>
                            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${item.repurchase ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"}`} />
                          </div>
                          
                          <button onClick={() => deleteReview(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
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
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <p className="text-sm text-gray-500 font-mono tracking-wide">NO REVIEWS YET</p>
                <p className="text-xs text-gray-600 mt-2">화장품 사용 후기를 기록해보세요.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 리뷰 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-6 tracking-wide">ADD REVIEW</h3>
            <form onSubmit={addReview} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Category</label>
                  <select 
                    value={newReview.category} 
                    onChange={e => setNewReview({...newReview, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-white/30"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-black text-white">{c}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Repurchase</label>
                  <div 
                    className={`flex items-center justify-center h-[46px] border border-white/10 rounded-xl cursor-pointer transition-all ${newReview.repurchase ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`} 
                    onClick={() => setNewReview({...newReview, repurchase: !newReview.repurchase})}
                  >
                    <span className={`text-xs font-bold ${newReview.repurchase ? "text-green-400" : "text-red-400"}`}>
                      {newReview.repurchase ? "YES" : "NO"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <input type="text" placeholder="제품 이름" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-gray-600" required />
              </div>
              
              <div className="space-y-1">
                <textarea placeholder="한줄 평을 남겨주세요..." value={newReview.review} onChange={e => setNewReview({...newReview, review: e.target.value})} className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none placeholder:text-gray-600 focus:border-white/30" required />
              </div>

              <div className="flex justify-center gap-2 py-2 bg-white/5 rounded-xl border border-white/5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
                    onClick={() => setNewReview({...newReview, rating: star})}
                  />
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 mt-2 tracking-widest transition-colors">SAVE REVIEW</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
