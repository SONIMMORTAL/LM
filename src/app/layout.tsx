import type { Metadata } from "next";
import { Inter, Geist, Bebas_Neue } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth";
import { AnalyticsTracker } from "@/components/analytics";
import { CartProvider } from "@/context/CartContext";

const MusicPlayer = dynamic(() => import("@/components/player/MusicPlayer").then(mod => mod.MusicPlayer));
const CartSidebar = dynamic(() => import("@/components/shop/CartSidebar").then(mod => mod.CartSidebar));
import { ThemeProvider } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-druk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loafrecords.shop"),
  title: {
    default: "Loaf Records | Official Store",
    template: "%s | Loaf Records",
  },
  description: "The official home of Loaf Records. Brooklyn-born independent record label. Music, merch, and films.",
  keywords: ["Loaf Records", "Shadow The Great", "Hip Hop", "Brooklyn", "Music", "Merch"],
  authors: [{ name: "Loaf Records" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Loaf Records | Official Store",
    description: "The official home of Loaf Records. Brooklyn-born independent record label. Music, merch, and films.",
    url: "https://loafrecords.shop",
    siteName: "Loaf Records",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loaf Records | Official Store",
    description: "Brooklyn-born independent record label. Music, merch, and films.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable, bebasNeue.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://bnjoouzcnxwdxcgcknoe.supabase.co" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider>
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

              {/* Social Media Sidebar - REMOVED */}
              {/* <SocialSidebar /> */}

              {/* Toast Notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "var(--color-noir-charcoal)",
                    color: "var(--color-foreground)",
                    border: "1px solid var(--color-noir-smoke)",
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

