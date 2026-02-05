import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth";
import { AnalyticsTracker } from "@/components/analytics";
import { CartSidebar } from "@/components/shop/CartSidebar";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loaf Records | Official Store",
  description: "The official digital flagship for Loaf Records. Brooklyn-born record label bringing raw, cinematic sound to the world.",
  keywords: ["Loaf Records", "Shadow The Great", "Hip Hop", "Brooklyn", "Music", "Merch"],
  authors: [{ name: "Loaf Records" }],
  openGraph: {
    title: "Loaf Records | Official Store",
    description: "The official digital flagship for Loaf Records.",
    type: "website",
  },
};

import { CartProvider } from "@/context/CartContext";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <CartProvider>
            {/* Analytics Tracker */}
            <AnalyticsTracker />

            {/* Film Grain Overlay */}
            <div className="film-grain" aria-hidden="true" />

            {/* Site Header */}
            <Header />
            <CartSidebar />

            {/* Main Content */}
            <main className="relative min-h-screen">
              {children}
            </main>

            {/* Site Footer */}
            <Footer />

            {/* Persistent Music Player - Dynamic Island */}
            <MusicPlayer />

            {/* Social Media Sidebar */}
            <SocialSidebar />

            {/* Toast Notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#1A1A1A",
                  color: "#F5F5F5",
                  border: "1px solid #3A3A3A",
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
