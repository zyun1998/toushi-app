import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NISA投資シミュレーター",
  description: "やさしく続ける、わんこ投資サポート",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}