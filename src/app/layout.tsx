import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { MindMapProvider } from "@/context/MindMapContext";

export const metadata: Metadata = {
  title: "Research-Mate | 고등학생 심화 탐구 주제 추천",
  description: "학년, 과목, 진로에 딱 맞는 AI 기반 심화 탐구 주제와 보고서 가이드를 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        <MindMapProvider>
          <Header />
          <main>{children}</main>
        </MindMapProvider>
        {/* Footer could be added here or in individual pages if distinct */}
      </body>
    </html>
  );
}
