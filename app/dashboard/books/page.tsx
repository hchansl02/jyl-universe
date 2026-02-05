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
