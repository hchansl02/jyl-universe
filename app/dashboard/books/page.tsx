"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, Trash2, GripVertical, CheckCircle2, Book, Edit2, Save, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";

export default function BookPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  interface BookItem {
    id: number;
    title: string;
    author: string;
    status: "Reading" | "Finished";
    category: string;
    order_index: number;
  }

  const [books, setBooks] = useState<BookItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 수정 모드 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", author: "", category: "" });

  // 새 책 입력 상태
  const [newBook, setNewBook] = useState({ 
    title: "", 
    author: "", 
    category: "인문학" 
  });

  const categories = ["인문학", "문학", "경제/경영", "취미", "전공 (마케팅/영상)"];

  // 1. 데이터 불러오기
  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (data) setBooks(data as any);
  };

  useEffect(() => { fetchBooks(); }, []);

  // 2. 책 추가
  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;

    const nextOrder = books.length > 0 ? Math.max(...books.map(b => b.order_index)) + 1 : 0;

    const bookToSave = {
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      status: "Reading",
      order_index: nextOrder
    };

    await supabase.from("books").insert([bookToSave]);
    setNewBook({ title: "", author: "", category: "인문학" });
    setIsModalOpen(false);
    fetchBooks();
  };

  // 3. 수정 시작 (연필 버튼 클릭)
  const startEditing = (book: BookItem) => {
    setEditingId(book.id);
    setEditForm({ title: book.title, author: book.author, category: book.category });
  };

  // 4. 수정 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: "", author: "", category: "" });
  };

  // 5. 수정 저장
  const saveEdit = async () => {
    if (!editForm.title.trim() || !editingId) return;

    // UI 즉시 반영 (낙관적 업데이트)
    setBooks(books.map(b => b.id === editingId ? { ...b, ...editForm } : b));
    setEditingId(null);

    // DB 업데이트
    await supabase.from("books").update(editForm).eq("id", editingId);
  };

  // 6. 드래그 앤 드롭
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newBooks = Array.from(books);
    const [reorderedItem] = newBooks.splice(sourceIndex, 1);
    newBooks.splice(destinationIndex, 0, reorderedItem);

    const updatedBooks = newBooks.map((book, index) => ({
      ...book,
      order_index: index
    }));

    setBooks(updatedBooks);
    await supabase.from("books").upsert(
        updatedBooks.map(b => ({ id: b.id, order_index: b.order_index }))
    );
  };

  // 7. 상태 토글
  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Reading" ? "Finished" : "Reading";
    setBooks(books.map(b => b.id === id ? { ...b, status: newStatus } : b));
    await supabase.from("books").update({ status: newStatus }).eq("id", id);
  };

  // 8. 삭제
  const deleteBook = async (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await supabase.from("books").delete().eq("id", id);
      fetchBooks();
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case "인문학": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        case "문학": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        case "경제/경영": return "bg-green-500/10 text-green-400 border-green-500/20";
        case "취미": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        case "전공 (마케팅/영상)": return "bg-red-500/10 text-red-400 border-red-500/20";
        default: return "bg-white/10 text-white/50";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-20">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
      </div>

      {/* 헤더 */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-10 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">2026 BOOK LIST</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">ADD</span>
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="w-full max-w-4xl z-10">
        <div className="grid grid-cols-[50px_1fr_120px_120px_80px_70px] gap-4 px-4 py-2 text-[10px] font-bold text-white/30 tracking-widest uppercase border-b border-white/10 mb-2">
            <div className="text-center">#</div>
            <div>Title / Author</div>
            <div className="text-center">Category</div>
            <div className="text-center">Reading</div>
            <div className="text-center">Status</div>
            <div className="text-right">Action</div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="book-list">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {books.length > 0 ? books.map((book, index) => (
                            <Draggable key={book.id} draggableId={book.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`grid grid-cols-[50px_1fr_120px_120px_80px_70px] gap-4 items-center p-4 rounded-xl border transition-all group ${
                                            snapshot.isDragging 
                                            ? "bg-white/10 border-white/30 shadow-2xl scale-105 z-50" 
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        {/* 1. 드래그 핸들 & 번호 */}
                                        <div className="flex items-center justify-center gap-1 text-white/30" {...provided.dragHandleProps}>
                                            <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                            <span className="font-mono text-sm font-bold w-4 text-center">{index + 1}</span>
                                        </div>

                                        {/* ================= 수정 모드 분기점 ================= */}
                                        {editingId === book.id ? (
                                          // [수정 모드 화면]
                                          <>
                                            {/* 제목 & 저자 수정 */}
                                            <div className="flex flex-col gap-1 min-w-0">
                                              <input 
                                                type="text" 
                                                value={editForm.title} 
                                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                                className="w-full bg-transparent border-b border-white/30 text-sm text-white focus:border-blue-500 focus:outline-none"
                                              />
                                              <input 
                                                type="text" 
                                                value={editForm.author} 
                                                onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                                                className="w-full bg-transparent border-b border-white/30 text-xs text-white/60 focus:border-blue-500 focus:outline-none"
                                              />
                                            </div>

                                            {/* 카테고리 수정 */}
                                            <div className="flex justify-center">
                                              <select 
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                className="bg-black border border-white/20 rounded text-[10px] text-white px-1 py-1 focus:outline-none"
                                              >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                              </select>
                                            </div>

                                            {/* 읽기 버튼 (수정 중 비활성화) */}
                                            <div className="flex justify-center opacity-30">
                                              <div className="px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-[10px] font-bold">READ</div>
                                            </div>
                                            <div className="text-center opacity-30">
                                              <span className="text-[10px] font-mono text-white/20">--%</span>
                                            </div>

                                            {/* 저장 / 취소 버튼 */}
                                            <div className="flex justify-end gap-2">
                                              <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Save className="w-4 h-
