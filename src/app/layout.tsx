import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MISA AMIS - Nền tảng quản trị doanh nghiệp hợp nhất',
  description: 'Phần mềm quản trị doanh nghiệp hợp nhất MISA AMIS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.className}>
      <body className="h-screen w-screen overflow-hidden bg-[#f4f5f8] text-slate-800 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
