"use client";

import React, { useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SpaceBackground } from "@/components/dashboard/space-background";
import { ArrowLeft, ChevronRight } from "lucide-react";

const projects = [
  { slug: "k", name: "PROJECT K" },
  { slug: "s", name: "PROJECT S" },
  { slug: "e", name: "PROJECT E" },
  { slug: "x", name: "PROJECT X" },
  { slug: "alpha", name: "PROJECT α" },
] as const;

const CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const ITEM = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function ProjectCard({
  slug,
  name,
  index,
}: {
  slug: string;
  name: string;
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Link
      ref={cardRef}
      href={`/project/${slug}`}
      className="group relative block overflow-hidden rounded-2xl transition-all duration-500"
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.018)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${hovered ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)"}`,
        boxShadow: hovered
          ? "0 16px 56px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.06)"
          : "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Rim light - top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${hovered ? 0.18 : 0.06}) 20%, rgba(255,255,255,${hovered ? 0.28 : 0.1}) 50%, rgba(255,255,255,${hovered ? 0.18 : 0.06}) 80%, transparent 100%)`,
        }}
      />

      {/* Mouse-follow glow */}
      {hovered && (
        <div
          className="absolute rounded-2xl pointer-events-none transition-opacity duration-200"
          style={{
            width: 240,
            height: 240,
            left: mouse.x - 120,
            top: mouse.y - 120,
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Diagonal sheen on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%, transparent 55%, rgba(255,255,255,0.02) 100%)",
          opacity: hovered ? 1 : 0.5,
        }}
      />

      <div className="relative z-10 flex items-center justify-between p-7">
        {/* Index + Name */}
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-mono text-foreground/25 tabular-nums tracking-widest">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="text-[17px] font-light tracking-[0.22em] text-foreground/85 group-hover:text-foreground transition-colors duration-300">
            {name}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-foreground/15 group-hover:text-foreground/50 transition-all duration-300">
          <span className="text-[10px] font-mono tracking-[0.2em]">ENTER</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  );
}

export default function ProjectIndexPage() {
  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center overflow-hidden">
      <SpaceBackground />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6 pt-14 pb-24 max-w-xl">
        <div className="w-full flex justify-start mb-14">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[11px] font-mono text-muted-foreground/45 hover:text-foreground/90 tracking-[0.22em] transition-colors duration-300 group"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300"
              strokeWidth={1.5}
            />
            <span>BACK TO DASHBOARD</span>
          </Link>
        </div>

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-2xl font-light tracking-[0.32em] text-foreground/95 mb-2">
            PROJECTS
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground/40 tracking-[0.2em] uppercase">
            Active specimens
          </p>
        </motion.div>

        <motion.div
          className="w-full flex flex-col gap-5"
          variants={CONTAINER}
          initial="hidden"
          animate="show"
        >
          {projects.map((project, index) => (
            <motion.div key={project.slug} variants={ITEM} className="w-full">
              <ProjectCard slug={project.slug} name={project.name} index={index} />
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-24 text-[10px] text-muted-foreground/12 font-mono tracking-[0.2em]">
          &copy; 2026 JYL UNIVERSE
        </p>
      </div>

      <div className="fixed top-6 left-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider z-10">
        <span>{"// PROJECT_INDEX"}</span>
      </div>
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-muted-foreground/8 hidden md:block tracking-wider z-10">
        <span>{"SYS.CONNECTED"}</span>
      </div>
    </main>
  );
}
