"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/config/site";
import { useScroll } from "@/hooks/use-scroll";

// import Navigation from "@/components/navigation";

export default function Header() {
  const scrolled = useScroll(5);
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-semibold text-xl">{site.name.short}</span>
          </Link>
          {/* <Navigation /> */}
        </div>
      </div>
    </header>
  );
}
