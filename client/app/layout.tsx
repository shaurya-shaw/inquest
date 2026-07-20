import {
  Inter,
  Playfair_Display,
  Courier_Prime,
  Geist,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

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
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
