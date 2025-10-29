import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnitBlack Survey | 분기형 설문 시스템",
  description:
    "Next.js App Router 기반 분기형 설문 앱 — 질문 조건 분기, 세션 저장, 어드민 답변 조회/수정 기능 포함",
  openGraph: {
    title: "UnitBlack Survey",
    description: "React + Next.js로 구현된 Typeform 스타일 분기형 설문 시스템",
    url: "https://unitblack-test.vercel.app/",
    siteName: "UnitBlack Survey",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
