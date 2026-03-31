import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "더본투비 - DHLUX",
  description: "전자담배 전문 쇼핑몰 더본투비",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full font-pretendard">{children}</body>
    </html>
  );
}
