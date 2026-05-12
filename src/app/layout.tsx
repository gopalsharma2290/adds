import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADDS Interactive Experiment Lab",
  description: "Real-time visualization of data structures, algorithms, and data analysis using Python. An interactive educational laboratory.",
  keywords: ["ADDS", "algorithms", "data structures", "Python", "visualization", "interactive learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-navy text-cream overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
