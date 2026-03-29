import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Music Room',
  description: 'Your ultimate personal music companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${outfit.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-[#030303] text-[#f4f4f5]">
        {children}
      </body>
    </html>
  );
}
