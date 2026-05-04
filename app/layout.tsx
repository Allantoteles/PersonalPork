import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './components/AuthProvider';
import { QueryProvider } from './components/QueryProvider';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

export const metadata: Metadata = {
  title: 'IRON FOCUS',
  description: 'Forge Your Reality',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0e1416',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Header />
        {children}
        <BottomNav />
      </AuthProvider>
    </QueryProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface text-on-surface font-body-md antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}