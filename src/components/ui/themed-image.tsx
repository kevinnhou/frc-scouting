/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemedImage({
  alt,
  className,
  dark,
  light,
}: {
  alt: string;
  className?: string;
  dark: string;
  light: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`relative ${className}`} aria-label={alt} />;
  }

  const src = resolvedTheme === "dark" ? dark : light;

  return (
    <Image
      alt={alt}
      className={className}
      priority
      fill
      src={src || "/placeholder.svg"}
    />
  );
}
