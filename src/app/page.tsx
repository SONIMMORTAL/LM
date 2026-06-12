"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, ArrowUpRight } from "lucide-react";
import { useLenis } from "@/hooks/use-lenis";
import Link from "next/link";
import MatrixText from "@/components/fancy/text/matrix-text";
import { LostCityPromo } from "@/components/home/LostCityPromo";
import { EnterOverlay } from "@/components/layout/EnterOverlay";

export default function Home() {
  useLenis();

  const [isClient, setIsClient] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEnterSite = () => {
    setHasEntered(true);
  };

  // YouTube background — autoplay, muted, looped, no controls
  const youtubeUrl = `https://www.youtube.com/embed/OOx9QAeRo8E?autoplay=1&mute=1&loop=1&playlist=OOx9QAeRo8E&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  return (
    <div className="relative">
      {/* Enter Overlay */}
      {!hasEntered && <EnterOverlay onEnter={handleEnterSite} />}

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-noir-void/60 z-10" />

          {/* Desktop — YouTube embed */}
          {isClient && (
            <iframe
              src={youtubeUrl}
              className="hidden md:block absolute inset-0 w-full h-full"
              style={{
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                pointerEvents: 'none'
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Lost City - Loaf Records Featured Video"
            />
          )}

          {/* Mobile — local video with safe aspect ratio */}
          <div className="block md:hidden absolute inset-0">
            <video
              src="/0128.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-20 text-center px-6"
        >
          {/* Matrix headline */}
          <div className="mb-5">
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

          {/* Tagline — editorial weight */}
          <p className="text-noir-cloud text-base sm:text-lg md:text-xl tracking-[0.08em] max-w-lg mx-auto mb-10 uppercase font-light">
            Raw sound. Cinematic soul.
          </p>

          {/* CTA pair — bespoke rectangular language */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/music">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-accent-cyan text-noir-void font-semibold uppercase text-sm tracking-[0.15em] hover:bg-accent-cyanMuted transition-colors shadow-glow-md flex items-center gap-2.5"
              >
                <Play className="w-4 h-4" />
                Listen Now
              </motion.button>
            </Link>
            <Link href="/shop" className="group flex items-center gap-1.5 text-noir-cloud hover:text-foreground transition-colors text-sm tracking-[0.12em] uppercase font-medium">
              Shop Merch
              <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator — minimal text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-8 z-20"
        >
          <span className="text-noir-ash text-[10px] tracking-[0.4em] uppercase font-medium">
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          LOST CITY ALBUM PROMO
          ═══════════════════════════════════════════ */}
      <LostCityPromo />

      {/* ═══════════════════════════════════════════
          LATEST VIDEO
          ═══════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 bg-noir-charcoal">
        {/* Top accent rule */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-accent-cyan/40" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight uppercase">
              Latest <span className="text-accent-cyan">Video</span>
            </h2>
          </motion.div>

          {/* Video Embed — sharp corners */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5"
          >
            <iframe
              src="https://www.youtube.com/embed/sBc1fyc7K94"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Shadow The Great - Latest Video"
            />
          </motion.div>
        </div>
      </section>

    </div>
  );
}
