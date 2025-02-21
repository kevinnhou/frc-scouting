"use client";

import Link from "next/link";

import { site } from "@/config/site";
import { useScroll } from "@/hooks/use-scroll";

// import Navigation from "@/components/navigation";

export default function Header() {
  const scrolled = useScroll(50);

  return (
    <header
      className={`sticky top-0 z-50 w-full ${
        scrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm"
          : "bg-white dark:bg-black"
      } transition-all`}
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
