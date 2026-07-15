"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      allowNestedScroll: true,
    });

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
