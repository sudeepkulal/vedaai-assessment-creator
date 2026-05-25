import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import Sidebar from '@/components/sidebar';
import MobileHeader from '@/components/mobile-header';
import BottomNavigation from '@/components/bottom-navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI Assessment Creator',
  description: 'AI-Powered Assessment Creator for Teachers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#EBEBEB] text-[#1A1A1A] antialiased min-h-screen flex flex-col md:flex-row overflow-hidden">
        <Providers>
          {/* Desktop Sidebar Layout */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col h-screen md:h-[calc(100vh-32px)] md:my-4 md:mr-4 md:ml-2 rounded-[28px] overflow-hidden md:bg-transparent">
            {/* Mobile Header */}
            <MobileHeader />

            {/* Content Display Panel */}
            <main className="flex-1 flex flex-col overflow-y-auto px-4 md:px-0 pt-3 md:pt-0 pb-[100px] md:pb-0 h-full">
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
