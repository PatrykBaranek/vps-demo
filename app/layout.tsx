import React from 'react';

import { GoogleTagManager } from '@next/third-parties/google';
import Navbar from '@/components/navbar';

import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

import type { Metadata } from 'next';

import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'VPS demo app',
};

const gtmContainerId = process.env.GTM_CONTAINER_ID;

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      {gtmContainerId && <GoogleTagManager gtmId={gtmContainerId} />}
      <body className="grid-bg min-h-dvh bg-background text-foreground">
        <Navbar />
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
