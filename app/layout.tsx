import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store/app-context';
import { Header } from '@/components/navigation/header';
import { BottomNav } from '@/components/navigation/bottom-nav';

export const metadata: Metadata = {
  title: 'Sans Pattes | Entraide Locale & Respect Animal',
  description: 'Application d\'entraide locale pour personnes phobiques des araignées et insectes. Un helper vient retirer la petite bête sans lui faire de mal.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#2E7D32',
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
    <html lang="fr">
      <body className="bg-cream-50 text-warmgray-900 font-sans antialiased min-h-screen selection:bg-nature-200 selection:text-nature-900">
        <AppProvider>
          <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-cream-50 shadow-2xl relative border-x border-cream-200">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
