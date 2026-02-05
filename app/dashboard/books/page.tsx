"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Plus, Trash2, Star, BookOpen, Check, Bookmark } from "lucide-react";
import Link from "next/link";

export default function BookPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [books, setBooks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", status: "Reading", rating: 0 });

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("id", { ascending: false });
    if (data) setBooks(data);
  };

  useEffect(() => { fetchBooks(); }, []);

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    await supabase.from("books").insert([newBook]);
    setNewBook({ title: "", author: "", status: "Reading", rating: 0 });
    setIsModalOpen(false);
    fetchBooks();
  };

  const deleteBook = async (id: number) => {
    if (confirm("삭제하시겠습니까?")) {
      await supabase.from("books").delete().eq("id", id);
      fetchBooks();
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("books").update({ status }).eq("id", id);
    fetchBooks();
  };

  const statusColors: any = {
    Reading: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    Finished: "text-green-400 border-green-400/30 bg-green-400/10",
    Wish: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-6 pb-20">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_60%)]" />
      </div>

      <div className="w-full max-w-5xl flex items-center justify-between mb-10 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest">BACK</span>
        </Link>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white">LIBRARY</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all">
          <Plus className="w-4 h-4" /> <span className="text-xs font-bold">ADD</span>
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
        {books.map((book) => (
          <div key={book.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 group hover:bg-white/[0.05] transition-all relative flex flex-col min-h-[180px]">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${statusColors[book.status] || statusColors.Reading}`}>
                {book.status.toUpperCase()}
              </span>
              <button onClick={() => deleteBook(book.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{book.title}</h3>
            <p className="text-xs text-white/50 mb-auto">{book.author}</p>
            <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < book.rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
                ))}
              </div>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <button onClick={() => updateStatus(book.id, "Reading")} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-blue-400"><BookOpen className="w-3.5 h-3.5" /></button>
                <button onClick={() => updateStatus(book.id, "Finished")} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-green-400"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => updateStatus(book.id, "Wish")} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-purple-400"><Bookmark className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
         {books.length === 0 && <div className="col-span-full text-center py-20 text-white/20 border border-dashed border-white/10 rounded-2xl">책이 없습니다.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/20 rounded-2xl p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-6">ADD BOOK</h3>
            <form onSubmit={addBook} className="space-y-4">
              <input type="text" placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" required autoFocus />
              <input type="text" placeholder="Author" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
              <div className="flex justify-center gap-2 bg-white/5 p-3 rounded-xl">
                 {[1,2,3,4,5].map(star => (
                   <Star key={star} onClick={() => setNewBook({...newBook, rating: star})} className={`w-6 h-6 cursor-pointer ${star <= newBook.rating ? "text-yellow-500 fill-yellow-500" : "text-white/20"}`} />
                 ))}
              </div>
              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl mt-2 tracking-widest">SAVE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
