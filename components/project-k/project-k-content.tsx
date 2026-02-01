"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

const ITEM = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const INTRO =
  "식사를 넘어선 예술적 경험을 통해 찰나의 순간을 영원한 기억으로 각인시키고, 삶의 위안이 되는 행복의 본질을 설계한다.";

const NARRATIVE = `Project K는 단순한 요리 제공을 넘어, 한 끼의 경험이 인생의 터닝포인트가 될 수 있다는 믿음에서 출발합니다. 우리는 음식을 ‘제공’하는 곳이 아니라, 그 순간을 ‘설계’하는 팀입니다. 손님 한 분 한 분의 기억에 남는 시간을 만들기 위해 재료의 본질, 공간의 호흡, 서비스의 디테일까지 하나의 세계관으로 엮어냅니다.

Alpha에서는 미니멀한 완성도와 원천적 가치에 집중합니다. 불필요한 것을 덜어내고, 남은 것만으로 완결된 경험을 만듭니다. 소월담에서는 정갈한 공간과 세심한 서비스 철학을 통해, 일상의 경계를 넘어선 예술적 경험을 제안합니다. 두 축은 서로 다른 톤을 가지지만, ‘찰나를 영원한 기억으로’라는 한 가지 목표로 연결됩니다.

우리는 식사를 예술로, 공간을 서사로, 서비스를 설계로 정의합니다. 고객 한 분 한 분의 순간이 영원한 기억이 되고, 그 기억이 삶의 위안이 되도록 디테일을 놓지 않습니다. Project K는 단순한 브랜드가 아닌, 행복의 본질을 설계하는 프로젝트입니다.`;

function SubCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Link
      ref={cardRef}
      href={href}
      className="group relative block overflow-hidden rounded-2xl transition-all duration-500 flex-1 min-w-0"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.018)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${isHovered ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)"}`,
        boxShadow: isHovered
          ? "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.08)"
          : "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Rim light / sheen on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 45%, transparent 55%, rgba(255,255,255,0.03) 100%)",
          opacity: isHovered ? 1 : 0.4,
        }}
      />
      {/* Mouse-follow glow */}
      {isHovered && (
        <div
          className="absolute pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{
            width: 220,
            height: 220,
            left: mousePosition.x - 110,
            top: mousePosition.y - 110,
            background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
          }}
        />
      )}
      <div className="relative z-10 p-8 flex flex-col justify-between min-h-[200px]">
        <div>
          <h3 className="text-lg font-light tracking-[0.2em] text-foreground/90 group-hover:text-foreground transition-colors mb-1">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground/50 font-mono tracking-wider">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-foreground/20 group-hover:text-foreground/50 transition-colors mt-4">
          <span className="text-[10px] font-mono tracking-[0.2em]">ENTER</span>
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  );
}

export function ProjectKContent() {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto px-6 pb-24"
      variants={CONTAINER}
      initial="hidden"
      animate="show"
    >
      {/* 1. Hero */}
      <motion.header className="text-center mb-14" variants={ITEM}>
        <h1
          className="text-4xl md:text-5xl font-light text-foreground/95 mb-6"
          style={{ letterSpacing: "0.35em" }}
        >
          PROJECT K
        </h1>
        <p className="text-sm md:text-base font-light tracking-wide text-foreground/70 leading-relaxed max-w-xl mx-auto">
          {INTRO}
        </p>
      </motion.header>

      {/* 2. Nav Cards */}
      <motion.section
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20"
        variants={ITEM}
      >
        <SubCard href="/project/k/alpha" title="α" subtitle="Alpha" />
        <SubCard href="/project/k/sowoldam" title="소월담" subtitle="Sowoldam" />
      </motion.section>

      {/* 3. Narrative */}
      <motion.section
        className="rounded-2xl overflow-hidden p-8 md:p-10"
        variants={ITEM}
        style={{
          background: "rgba(255, 255, 255, 0.018)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        }}
      >
        <h2 className="text-xs font-mono text-muted-foreground/50 tracking-[0.3em] uppercase mb-8">
          Project Narrative
        </h2>
        <div className="text-sm md:text-base font-light text-foreground/75 leading-[2.2] tracking-wide whitespace-pre-line text-balance">
          {NARRATIVE}
        </div>
      </motion.section>
    </motion.div>
  );
}
