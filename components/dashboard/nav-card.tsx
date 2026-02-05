import Link from "next/link"
import { Folder, Calendar, Book, Lightbulb, ArrowUpRight } from "lucide-react"

interface NavCardProps {
  title: string
  // [수정됨] 헷갈리는 'calendar' 삭제 -> 'weekly', 'library' 로 변경
  icon: "project" | "weekly" | "library" | "thoughts"
  description: string
  href: string
  count: number
}

export function NavCard({ title, icon, description, href, count }: NavCardProps) {
  
  // [수정됨] 아이콘 연결표
  const iconMap = {
    project: Folder,
    weekly: Calendar, // 이름은 weekly지만, 그림은 달력 모양(Calendar) 사용
    library: Book,    // 이름은 library, 그림은 책 모양(Book) 사용
    thoughts: Lightbulb,
  }

  // 선택된 아이콘 꺼내기 (혹시 오타나면 기본값으로 Folder)
  const Icon = iconMap[icon] || Folder

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/50 transition-colors group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono text-[10px] text-white/30 transition-colors group-hover:text-white/60">
          {count.toString().padStart(2, "0")}
        </span>
      </div>

      <div>
        <h3 className="mb-1 text-xs font-bold tracking-widest text-white">{title}</h3>
        <p className="text-[10px] text-white/40">{description}</p>
      </div>

      {/* 우상단 화살표 장식 */}
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="h-3 w-3 text-white/30" />
      </div>
    </Link>
  )
}
