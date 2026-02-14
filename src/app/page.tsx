"use client";

import { Hero } from "@/components/sections/Hero";
import { TheStack } from "@/components/sections/TheStack";
import { TheNetwork } from "@/components/sections/TheNetwork";
import { QuickStart } from "@/components/sections/QuickStart";
import { WhatsInside } from "@/components/sections/WhatsInside";
import { Philosophy } from "@/components/sections/Philosophy";
import { Showcase } from "@/components/sections/Showcase";
import { Newsletter } from "@/components/sections/Newsletter";
import { Support } from "@/components/sections/Support";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingParticles } from "@/components/shared/FloatingParticles";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0f0a1f] to-slate-900 overflow-hidden">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        Skip to main content
      </a>

      {/* Breathing background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3), transparent),
              radial-gradient(ellipse 60% 40% at 100% 50%, rgba(59, 130, 246, 0.2), transparent),
              radial-gradient(ellipse 50% 30% at 0% 80%, rgba(236, 72, 153, 0.15), transparent)
            `,
          }}
        />
        <div
          className="absolute inset-0 animate-breathe-slow"
          style={{
            background: `
              radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.15), transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(34, 211, 238, 0.12), transparent 50%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <FloatingParticles />
      </div>

      <Header />

      <Hero />

      <main id="main-content">
        <TheStack />
        <TheNetwork />
        <QuickStart />
        <WhatsInside />
        <Philosophy />
        <Showcase />
        <Newsletter />
        <Support />
      </main>

      <Footer />
    </div>
  );
}
