import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "nini's room — Music Room",
  description: 'Phòng nghe nhạc trực tuyến — nghe nhạc YouTube cùng nhau',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#030303] text-[#f4f4f5]">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
