"use client";

import { motion } from "framer-motion";
import { ArrowDown, Disc3, ShoppingBag, Users, Play } from "lucide-react";
import { useLenis } from "@/hooks/use-lenis";
import Link from "next/link";
import MatrixText from "@/components/fancy/text/matrix-text";

export default function Home() {
  // Initialize smooth scrolling
  useLenis();

  return (
    <div className="relative">
      {/* Hero Section with YouTube Video */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-noir-void/60 z-10" />
          {/* Desktop Video (YouTube) */}
          <iframe
            src="https://www.youtube.com/embed/OOx9QAeRo8E?autoplay=1&mute=1&loop=1&playlist=OOx9QAeRo8E&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              pointerEvents: 'none'
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Loaf Records Featured Video"
          />

          {/* Mobile Video (Local) */}
          <video
            src="/0128.mp4"
            className="block md:hidden absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 text-center px-6"
        >
          {/* Main headline with Matrix effect */}
          <div className="mb-6">
            <MatrixText
              text="LOAF"
              textClassName="text-5xl sm:text-7xl md:text-8xl"
              initialDelay={300}
              letterAnimationDuration={400}
              letterInterval={80}
            />
            <MatrixText
              text="RECORDS"
              textClassName="text-5xl sm:text-7xl md:text-8xl"
              initialDelay={600}
              letterAnimationDuration={400}
              letterInterval={80}
            />
          </div>

          {/* Tagline */}
          <p className="text-noir-cloud text-lg sm:text-xl max-w-md mx-auto mb-8">
            Raw sound. Cinematic soul.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/music">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-accent-cyan text-noir-void font-semibold rounded-full hover:bg-accent-cyanMuted transition-colors shadow-glow-md flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Listen Now
              </motion.button>
            </Link>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 border border-noir-smoke text-foreground font-medium rounded-full hover:border-accent-cyan/50 transition-colors"
              >
                Shop Merch
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1.5 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-10 z-20 text-noir-ash"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Featured Video Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-noir-charcoal">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block mb-4 text-accent-cyan text-sm tracking-[0.3em] uppercase">
              Now Playing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight uppercase">
              Latest Video
            </h2>
          </motion.div>

          {/* Featured Video Embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video rounded-2xl overflow-hidden shadow-2xl"
          >
            <iframe
              src="https://www.youtube.com/embed/41Zx0etfnkM"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Abel - Rah Tha Ruler & Shadow The Great"
            />
          </motion.div>
        </div>
      </section>


    </div>
  );
}
