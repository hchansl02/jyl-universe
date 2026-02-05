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
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", author: "", category: "" });

  const [newBook, setNewBook] = useState({ 
    title: "", 
    author: "", 
    category: "인문학" 
  });

  const categories = ["인문학", "문학", "경제/경영", "취미", "전공 (마케팅/영상)"];

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (data) setBooks(data as any);
  };

  useEffect(() => { fetchBooks(); }, []);

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

  const startEditing = (book: BookItem) => {
    setEditingId(book.id);
    setEditForm({ title: book.title, author: book.author, category: book.category });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: "", author: "", category: "" });
  };

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editingId) return;

    setBooks(books.map(b => b.id === editingId ? { ...b, ...editForm } : b));
    setEditingId(null);

    await supabase.from("books").update(editForm).eq("id", editingId);
  };

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

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Reading" ? "Finished" : "Reading";
    setBooks(books.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
    await supabase.from("books").update({ status: newStatus }).eq("id", id);
  };

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
                                        <div className="flex items-center justify-center gap-1 text-white/30" {...provided.dragHandleProps}>
                                            <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                            <span className="font-mono text-sm font-bold w-4 text-center">{index + 1}</span>
                                        </div>

                                        {editingId === book.id ? (
                                          <>
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

                                            <div className="flex justify-center">
                                              <select 
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                className="bg-black border border-white/20 rounded text-[10px] text-white px-1 py-1 focus:outline-none"
                                              >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                              </select>
                                            </div>

                                            <div className="flex justify-center opacity-30">
                                              <div className="px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-[10px] font-bold">READ</div>
                                            </div>
                                            <div className="text-center opacity-30">
                                              <span className="text-[10px] font-mono text-white/20">--%</span>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                              <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Save className="w-4 h-4" /></button>
                                              <button onClick={cancelEditing} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="min-w-0">
                                                <h3 className={`text-sm font-medium truncate ${book.status === 'Finished' ? 'text-white/30 line-through decoration-white/30' : 'text-white'}`}>
                                                    {book.title}
                                                </h3>
                                                <p className="text-xs text-white/40 truncate">{book.author}</p>
                                            </div>

                                            <div className="flex justify-center">
                                                <span className={`text-[10px] px-2 py-1 rounded border whitespace-nowrap truncate max-w-[110px] ${getCategoryColor(book.category)}`}>
                                                    {book.category}
                                                </span>
                                            </div>

                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => toggleStatus(book.id, book.status)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                                                        book.status === 'Finished' 
                                                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                                    }`}
                                                >
                                                    {book.status === 'Finished' ? <CheckCircle2 className="w-3 h-3" /> : <Book className="w-3 h-3" />}
                                                    <span className="text-[10px] font-bold">{book.status === 'Finished' ? 'DONE' : 'READ'}</span>
                                                </button>
                                            </div>

                                            <div className="text-center">
                                                <span className={`text-[10px] font-mono ${book.status === 'Finished' ? "text-green-500" : "text-white/20"}`}>
                                                    {book.status === 'Finished' ? "100%" : "0%"}
                                                </span>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => startEditing(book)} className="text-white/20 hover:text-blue-400 transition-all" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteBook(book.id)} className="text-white/20 hover:text-red-400 transition-all" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                          </>
                                        )}
                                    </div>
                                )}
                            </Draggable>
                        )) : (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-white/20 text-xs">
                                등록된 책이 없습니다.
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/20 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-6 tracking-wide">ADD NEW BOOK</h3>
            <form onSubmit={addBook} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Book Title</label>
                <input type="text" placeholder="책 제목" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30" required autoFocus />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Author</label>
                <input type="text" placeholder="저자" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Category</label>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setNewBook({...newBook, category: cat})}
                            className={`px-2 py-2 text-[10px] rounded-lg border transition-all ${
                                newBook.category === cat 
                                ? "bg-white text-black border-white font-bold" 
                                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl mt-4 hover:bg-gray-200 transition-colors tracking-widest">SAVE BOOK</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
