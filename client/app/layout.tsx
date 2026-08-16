import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Courier_Prime,
  Geist,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://inquest-lemon.vercel.app"),
  title: "INQUEST — AI-Powered Multiplayer Detective & Interrogation Game",
  description:
    "An immersive multiplayer AI detective experience. Interrogate suspects, analyze forensic evidence, discuss theories with your team, and uncover the truth.",
  openGraph: {
    type: "website",
    title: "INQUEST — AI-Powered Multiplayer Detective & Interrogation Game",
    description:
      "An immersive multiplayer AI detective experience. Interrogate suspects, analyze forensic evidence, discuss theories with your team, and uncover the truth.",
    url: "https://inquest-lemon.vercel.app",
    siteName: "INQUEST",
    images: [
      {
        url: "/og-image.png",
        width: 1536,
        height: 1024,
        alt: "INQUEST - AI-Powered Multiplayer Detective Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INQUEST — AI-Powered Multiplayer Detective & Interrogation Game",
    description:
      "An immersive multiplayer AI detective experience. Interrogate suspects, analyze forensic evidence, discuss theories with your team, and uncover the truth.",
    images: ["/og-image.png"],
  },
};

import IntroOverlay from "@/components/intro/IntroOverlay";
import MobileBlockerOverlay from "@/components/device/MobileBlockerOverlay";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});
const courier = Courier_Prime({
  variable: "--font-courier",
  weight: ["400", "700"],
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "min-h-full",
        "overflow-hidden",
        "antialiased",
        "dark",
        inter.variable,
        playfair.variable,
        courier.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-screen overflow-hidden flex flex-col bg-[#050505] text-white font-sans">
        <MobileBlockerOverlay />
        <IntroOverlay />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
