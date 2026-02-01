import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sigstack.dev"),
  title: "Sigstack 2.0 — The Vibe Coder's Operating System for Claude",
  description: "127 skills across 12 plugins. AI Vision QA workflow: Build → Screenshot → Claude Reviews → Fix → Repeat. The complete Claude Code stack for shipping software with AI.",
  keywords: ["Claude Code", "AI coding", "developer tools", "MCP servers", "Claude AI", "Opus 4.5", "vibe coding", "AI Vision QA"],
  authors: [{ name: "Will Sigmon", url: "https://willsigmon.media" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Sigstack 2.0 — 127 Skills for Vibe Coders",
    description: "AI Vision QA workflow: Build → Screenshot → Claude Reviews → Fix → Repeat. Ready to clone.",
    url: "https://sigstack.dev",
    siteName: "sigstack",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigstack 2.0 - The Vibe Coder's OS for Claude",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigstack 2.0 — The Vibe Coder's OS",
    description: "127 skills, 12 plugins, AI Vision QA workflow. Build → Screenshot → Fix → Ship.",
    creator: "@willsigmon",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sigstack.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f0a1f" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
