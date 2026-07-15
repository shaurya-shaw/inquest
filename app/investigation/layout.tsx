import LenisProvider from "@/components/providers/LenisProvider";

export default function InvestigationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // CHANGED: Replaced 'h-screen overflow-hidden' with 'min-h-screen'
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans text-white">
      <LenisProvider>{children}</LenisProvider>
    </div>
  );
}
