"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainContent({ locale, children }) {
  const pathname = usePathname() ?? "";
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const homePath = `/${locale}`;
  const isHome = normalized === homePath || normalized === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [normalized]);

  return (
    <main className={`main${isHome ? "" : " main--soft-bg"}`}>
      {children}
    </main>
  );
}

