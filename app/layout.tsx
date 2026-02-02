import type { Metadata } from "next";
import "./globals.css";
import AutoLogout from "@/components/AutoLogout"; // 1. 감시자 임포트

export const metadata: Metadata = {
  title: "JYL Universe",
  description: "v0.dev에서 이식한 프로젝트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AutoLogout /> {/* 2. 감시자 배치 (화면엔 안 보임) */}
        {children}
      </body>
    </html>
  );
}
