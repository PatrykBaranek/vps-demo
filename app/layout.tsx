import React from 'react';

import Navbar from '../components/Navbar';
import { GoogleAdsense } from "@/components/GoogleAdsense";

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

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className="min-h-full flex flex-col items-center p-8 grid-bg">
        <Navbar />
        <main className="app-shell mt-20">{children}</main>
        <GoogleAdsense />
      </body>
    </html>
  );
}
