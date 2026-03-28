import type { Metadata } from 'next'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import './globals.css'

export const metadata: Metadata = {
  title: "NISA投資シミュレーター",
  description: "やさしく続ける、わんこ投資サポート",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}