"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Floating particles component
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-purple-500/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Magnetic button component
function MagneticButton({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  );
}

// 3D tilt card component
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setRotateX(-y * 10);
    setRotateY(x * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Scroll reveal component
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  );
}

// Tech stack data
const brainStack = [
  {
    name: "Claude Code",
    description: "CLI-first AI coding with Opus 4.5",
    logo: "https://cdn.simpleicons.org/anthropic/white",
    url: "https://claude.ai/code",
    highlight: true,
  },
  {
    name: "Omi",
    description: "AI wearable + MCP for memory persistence",
    logo: "https://www.omi.me/cdn/shop/files/OMI_LOGO_WEB_80ec2009-6d2f-43b9-a81d-7ae7b7fa6cf0.png?v=1732038253&width=500",
    url: "https://www.omi.me/?ref=WILLSIGMON",
  },
];

const voiceStack = [
  {
    name: "Typeless",
    description: "Dictation that actually works",
    logo: "https://framerusercontent.com/images/FJhzz7gLCB9nAqG8cANzU0gT8.png",
    url: "https://www.typeless.com/?via=wsig",
  },
  {
    name: "Wispr Flow",
    description: "Voice-to-code engine",
    logo: "https://wisprflow.ai/_next/image?url=%2Fflow-icon.png&w=128&q=75",
    url: "https://wisprflow.ai/r?WILL48",
  },
];

const terminalStack = [
  {
    name: "iTerm2",
    description: "Feature-rich macOS terminal",
    logo: "https://iterm2.com/img/logo2x.jpg",
    url: "https://iterm2.com",
  },
];

const infraStack = [
  {
    name: "GitHub",
    description: "Code, PRs, Actions",
    logo: "https://cdn.simpleicons.org/github/white",
    url: "https://github.com",
  },
  {
    name: "Vercel",
    description: "Deploy frontend + serverless",
    logo: "https://cdn.simpleicons.org/vercel/white",
    url: "https://vercel.com",
  },
  {
    name: "Supabase",
    description: "Postgres + Auth + Realtime",
    logo: "https://cdn.simpleicons.org/supabase/white",
    url: "https://supabase.com",
  },
];

const mcpServers = [
  { name: "Omi", purpose: "Memory persistence" },
  { name: "Sosumi", purpose: "Apple documentation" },
  { name: "GitHub", purpose: "PR reviews, issues" },
  { name: "SQLite", purpose: "Local database" },
  { name: "Puppeteer", purpose: "Browser automation" },
];

const stats = [
  { label: "Skills", value: "89", color: "from-blue-400 to-blue-600" },
  { label: "Commands", value: "24", color: "from-green-400 to-green-600" },
  { label: "MCP Servers", value: "15+", color: "from-purple-400 to-purple-600" },
];

function StackCard({
  name,
  description,
  logo,
  url,
  highlight,
  index,
}: {
  name: string;
  description: string;
  logo: string;
  url: string;
  highlight?: boolean;
  index: number;
}) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <TiltCard
        className={`group glass rounded-xl p-5 transition-all cursor-pointer ${
          highlight ? "glow-purple ring-1 ring-purple-500/30" : ""
        }`}
      >
        <Link href={url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/10 p-2"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <img src={logo} alt={name} className="h-full w-full object-contain" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                {name}
                {highlight && (
                  <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    Core
                  </span>
                )}
              </h3>
              <p className="text-sm text-zinc-400">{description}</p>
            </div>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl" />
        </Link>
      </TiltCard>
    </ScrollReveal>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <motion.pre
      className="code-block rounded-lg p-4 overflow-x-auto text-sm relative"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <code className="text-green-400">{children}</code>
      {/* Copy indicator glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 pointer-events-none" />
    </motion.pre>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Hero with Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background layers */}
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          {/* Hero image from GLIF */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url(https://res.cloudinary.com/dzkwltgyd/image/upload/v1768353671/glif-run-outputs/fa9caqoahgkcywutrwry.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </motion.div>

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full filter blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <FloatingParticles />

        {/* Hero content */}
        <motion.div
          className="relative z-10 mx-auto max-w-6xl px-6 text-center"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-zinc-400 ring-1 ring-white/10 mb-8 backdrop-blur-sm"
          >
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Open Source
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl sm:text-8xl font-black tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-gradient-text">
              sigstack
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-zinc-400 max-w-2xl mx-auto mb-4"
          >
            My personal <span className="text-white font-semibold">Claude Code stack</span> for shipping software with AI
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-zinc-500 mb-10"
          >
            89 skills &bull; 24 commands &bull; iOS bundle + Apple&apos;s hidden docs &bull; Ready to clone
          </motion.p>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center gap-8 sm:gap-12 mb-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton
              href="https://github.com/willsigmon/sigstack"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-black font-medium hover:bg-zinc-200 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </MagneticButton>
            <MagneticButton
              href="#quick-start"
              className="inline-flex items-center justify-center rounded-full glass px-8 py-3 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Quick Start
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-zinc-400"
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* The Stack */}
      <section className="relative mx-auto max-w-6xl px-6 py-32">
        <ScrollReveal>
          <h2 className="text-4xl font-black text-white mb-2 text-center">The Stack</h2>
          <p className="text-zinc-500 text-center mb-16">Tools that power the workflow</p>
        </ScrollReveal>

        {/* Brain */}
        <div className="mb-16">
          <ScrollReveal>
            <h3 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-2">
              <span className="text-2xl">🧠</span> The Brain
            </h3>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {brainStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>
        </div>

        {/* Voice */}
        <div className="mb-16">
          <ScrollReveal>
            <h3 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎤</span> Voice Input
            </h3>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {voiceStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div className="mb-16">
          <ScrollReveal>
            <h3 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-2">
              <span className="text-2xl">💻</span> Terminal
            </h3>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {terminalStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>
        </div>

        {/* Infrastructure */}
        <div className="mb-16">
          <ScrollReveal>
            <h3 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-2">
              <span className="text-2xl">☁️</span> Infrastructure
            </h3>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {infraStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>
        </div>

        {/* MCP Servers */}
        <ScrollReveal>
          <h3 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔌</span> MCP Servers
          </h3>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <motion.div
            className="glass rounded-xl p-6"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mcpServers.map((server, i) => (
                <motion.div
                  key={server.name}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                  <span className="text-white font-medium">{server.name}</span>
                  <span className="text-zinc-500 text-sm">{server.purpose}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="relative mx-auto max-w-6xl px-6 py-32">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full filter blur-[100px]" />
        </div>

        <ScrollReveal>
          <h2 className="text-4xl font-black text-white mb-2 text-center">Quick Start</h2>
          <p className="text-zinc-500 text-center mb-12">Clone and install in 30 seconds</p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <CodeBlock>{`# Clone and install
git clone https://github.com/willsigmon/sigstack.git && cd sigstack && \\
cp -r skills/* ~/.claude/skills/ && \\
cp -r commands/* ~/.claude/commands/ && \\
mkdir -p ~/.claude/rules && cp -r rules/* ~/.claude/rules/`}</CodeBlock>
          </div>
        </ScrollReveal>
      </section>

      {/* What's Inside */}
      <section className="relative mx-auto max-w-6xl px-6 py-32">
        <ScrollReveal>
          <h2 className="text-4xl font-black text-white mb-2 text-center">What&apos;s Inside</h2>
          <p className="text-zinc-500 text-center mb-16">Everything you need to ship with Claude Code</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🧠",
              title: "89 Skills",
              description: "iOS, audio/ML, debug, architecture, n8n workflows, and more",
              gradient: "from-blue-500/20 to-purple-500/20",
            },
            {
              icon: "⚡",
              title: "24 Commands",
              description: "/test, /build, /deploy, /analyze, /cleanup, /git...",
              gradient: "from-green-500/20 to-emerald-500/20",
            },
            {
              icon: "🍎",
              title: "iOS Bundle",
              description: "Sosumi + Ralph Wiggum protocol + 20 Apple internal docs",
              gradient: "from-pink-500/20 to-rose-500/20",
            },
            {
              icon: "🔮",
              title: "BRAIN Network",
              description: "Multi-device sync via Tailscale for Claude context",
              gradient: "from-purple-500/20 to-violet-500/20",
            },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <TiltCard className={`glass rounded-xl p-6 text-center h-full bg-gradient-to-br ${item.gradient}`}>
                <motion.div
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-6xl px-6 py-32">
        <ScrollReveal>
          <motion.div
            className="glass rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <h2 className="relative text-2xl sm:text-3xl font-black text-white mb-4">
              Philosophy: Nanobot Healing Swarm
            </h2>
            <p className="relative text-zinc-400 max-w-2xl mx-auto mb-10">
              My CLAUDE.md instructs Claude to act as a &ldquo;healing swarm of nanobots&rdquo;&mdash;find every bug,
              scrub every infection, optimize every inefficiency.
            </p>
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
              {[
                { principle: "Tools first", meaning: "Check MCP/skill before writing code" },
                { principle: "Parallel agents", meaning: "Spawn 20+ agents for complex tasks" },
                { principle: "Context is attention", meaning: "Manage 60% threshold, use /compact" },
                { principle: "Memory graph", meaning: "Use Omi for session continuity" },
              ].map((item, i) => (
                <motion.div
                  key={item.principle}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="font-semibold text-white mb-1">{item.principle}</div>
                  <div className="text-sm text-zinc-500">{item.meaning}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      {/* Support */}
      <section className="mx-auto max-w-6xl px-6 py-32">
        <ScrollReveal>
          <h2 className="text-4xl font-black text-white mb-2 text-center">Support the Stack</h2>
          <p className="text-zinc-500 text-center mb-12">
            If this helps you ship faster, consider using my affiliate links
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Omi", url: "https://www.omi.me/?ref=WILLSIGMON", icon: "🧠" },
              { name: "Typeless", url: "https://www.typeless.com/?via=wsig", icon: "🎤" },
              { name: "Wispr Flow", url: "https://wisprflow.ai/r?WILL48", icon: "🗣" },
              { name: "Tip the Creator", url: "https://tip.wsig.me", icon: "💜" },
            ].map((item, i) => (
              <MagneticButton
                key={item.name}
                href={item.url}
                className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 hover:bg-white/10 transition-colors"
              >
                <span>{item.icon}</span>
                <span className="text-white">{item.name}</span>
              </MagneticButton>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <motion.div
                className="font-black text-xl text-white mb-1"
                whileHover={{ scale: 1.05 }}
              >
                sigstack
              </motion.div>
              <div className="text-sm text-zinc-500">
                Built with Claude Code Opus 4.5 and ~5,000 hours of figuring out what works.
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { href: "https://x.com/willsigmon", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
                { href: "https://github.com/willsigmon", icon: <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /> },
                { href: "https://linkedin.com/in/willsigmon", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
              ].map((social, i) => (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  className="text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.2, y: -2 }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    {social.icon}
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-zinc-600">
            MIT License — Use it, modify it, make it yours.
          </div>
        </div>
      </footer>
    </div>
  );
}
