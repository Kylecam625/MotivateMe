import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import React from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Motivate Me, Or Not?',
  description: 'AI-powered personalized motivational speeches with synchronized audio and visuals',
  keywords: ['motivation', 'AI', 'speech', 'audio', 'ElevenLabs', 'OpenAI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className}`} style={{ '--font-space-grotesk': spaceGrotesk.style.fontFamily } as React.CSSProperties}>
        <div className="min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
