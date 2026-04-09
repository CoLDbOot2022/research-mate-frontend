import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { InquiryFAB } from "@/components/common/InquiryFAB";
import { MindMapProvider } from "@/context/MindMapContext";
import { AmplitudeInitializer } from "@/components/common/AmplitudeInitializer";

export const metadata: Metadata = {
  title: "세특연구소 | 고등학생 심화 탐구 주제 추천",
  description: "학년, 과목, 진로에 딱 맞는 AI 기반 심화 탐구 주제와 보고서 가이드를 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://hangeul.pstatic.net/hangeul_static/css/nanum-square-round.css" />
      </head>
      <body className="min-h-screen bg-white">
        <AmplitudeInitializer />
        <MindMapProvider>
          <Header />
          <main>{children}</main>
          <InquiryFAB />
        </MindMapProvider>
        {/* Footer could be added here or in individual pages if distinct */}
      </body>
    </html>
  );
}
