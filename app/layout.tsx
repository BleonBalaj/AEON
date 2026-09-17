import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const assetPrefix = process.env.GITHUB_PAGES === 'true' ? '/AEON' : '';

export const metadata: Metadata = {
  title: 'AEON — A living history of Earth',
  description:
    'Explore 4.54 billion years of Earth with an interactive globe, geological history and human migration.',
  icons: {
    icon: [{ url: `${assetPrefix}/icon.svg?v=3`, type: 'image/svg+xml' }],
    apple: `${assetPrefix}/apple-touch-icon.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href={`${assetPrefix}/icon.svg?v=3`} />
        <link rel="apple-touch-icon" href={`${assetPrefix}/apple-touch-icon.png`} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
