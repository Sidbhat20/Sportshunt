import type { Metadata } from 'next';
import { Inter, Anton } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/app-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sportshunt',
  description:
    'Sportshunt helps players, venues, organizers, and admins run local sport beautifully.',
  applicationName: 'Sportshunt',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/sh-favicon.png', type: 'image/png', sizes: '256x256' },
      { url: '/sh-logo.png', type: 'image/png', sizes: '1024x1024' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`} data-scroll-behavior="smooth">
      <body className="bg-canvas font-sans text-ink antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
