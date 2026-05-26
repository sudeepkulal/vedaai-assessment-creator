import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/app/providers';
import Sidebar from '@/components/sidebar';
import MobileHeader from '@/components/mobile-header';
import BottomNavigation from '@/components/bottom-navigation';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VedaAI Assessment Creator',
  description: 'AI-Powered Assessment Creator for Teachers',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        Mobile:  body scrolls naturally (no overflow-hidden), flex-col stack
        Desktop: overflow-hidden locks the viewport, sidebar + content side-by-side
      */}
      <body className="bg-[#EBEBEB] text-[#1A1A1A] antialiased font-sans flex flex-col md:flex-row md:h-screen md:overflow-hidden">
        <Providers>
          {/* Desktop Sidebar — hidden on mobile */}
          <Sidebar />

          {/*
            Mobile:  a plain flex-col that grows with content (no fixed height, no overflow-hidden)
            Desktop: fixed height column that holds the scrollable main panel
          */}
          <div className="flex-1 flex flex-col md:h-[calc(100vh-32px)] md:my-4 md:mr-4 md:ml-2 md:overflow-hidden">
            {/* Mobile Header */}
            <MobileHeader />

            {/*
              Mobile:  grows naturally, padding at bottom so content clears fixed bottom nav
              Desktop: overflow-y-auto scrolls within the fixed-height card
            */}
            <main className="flex-1 flex flex-col pb-28 md:pb-0 md:overflow-y-auto">
              {children}
            </main>

            {/* Mobile Bottom Navigation (fixed, so doesn't affect flow) */}
            <BottomNavigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
