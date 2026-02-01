import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
