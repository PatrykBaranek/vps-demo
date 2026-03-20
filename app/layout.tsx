import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import BackgroundOrbs from "./components/BackgroundOrbs";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Cache Components Showcase",
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col items-center p-8">
        <BackgroundOrbs />
        {children}
      </body>
    </html>
  );
}
