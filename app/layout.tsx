import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'WholesaleScout — Amazon FBA Wholesale Brand Research Tool',
    template: '%s | WholesaleScout',
  },
  description:
    'Upload a brand list, get verified wholesale contacts, LinkedIn decision makers, and Keepa product scores in minutes. Built for Amazon FBA wholesale sellers.',
  keywords: [
    'amazon wholesale supplier finder',
    'amazon fba wholesale',
    'wholesale brand contacts',
    'wholesale email finder',
    'brand research tool',
    'amazon seller lead generation',
    'b2b brand enrichment',
    'keepa product analyzer',
    'wholesale outreach tool',
    'WholesaleScout',
  ],
  authors: [{ name: 'WholesaleScout' }],
  creator: 'WholesaleScout',
  metadataBase: new URL('https://wholesale-scout.com'),
  openGraph: {
    title: 'WholesaleScout — Automate Amazon FBA Wholesale Research',
    description: 'Turn a brand list into a fully enriched contact database in minutes.',
    type: 'website',
    url: 'https://wholesale-scout.com',
    siteName: 'WholesaleScout',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WholesaleScout — Amazon FBA Wholesale Supplier Finder',
    description: 'Automate your brand research. Upload brands → get wholesale contacts in minutes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
