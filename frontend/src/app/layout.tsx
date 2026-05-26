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
      <body className="bg-[#EBEBEB] text-[#1A1A1A] antialiased min-h-screen flex flex-col md:flex-row overflow-hidden font-sans">
        <Providers>
          {/* Desktop Sidebar — hidden on mobile */}
          <Sidebar />

          {/* Main Layout Area — full height col on mobile, adjusted on desktop */}
          <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-[calc(100vh-32px)] md:my-4 md:mr-4 md:ml-2 overflow-hidden">
            {/* Mobile Header — only renders on mobile */}
            <MobileHeader />

            {/* Scrollable Content Panel */}
            <main className="flex-1 flex flex-col overflow-y-auto px-0 md:px-0 pb-0 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <BottomNavigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
