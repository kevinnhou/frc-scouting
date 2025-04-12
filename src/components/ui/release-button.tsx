"use client";

import { motion, useAnimation } from "framer-motion";
import type * as React from "react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReleaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  holdDuration?: number;
}

function ReleaseButton({
  className,
  holdDuration = 2000,
  onClick,
  ...props
}: ReleaseButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const controls = useAnimation();
  const originalOnClick = useRef(onClick);

  async function handleHoldStart() {
    setIsHolding(true);
    setIsCompleted(false);
    controls.set({ width: "0%" });

    try {
      await controls.start({
        width: "100%",
        transition: {
          duration: holdDuration / 1000,
          ease: "linear",
        },
      });
      setIsCompleted(true);
      // eslint-disable-next-line ts/no-unused-vars
    } catch (error) {
      setIsCompleted(false);
    }
  }

  function handleHoldEnd(
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
  ) {
    if (isCompleted && originalOnClick.current) {
      originalOnClick.current(e as any);
    }

    setIsHolding(false);
    setIsCompleted(false);
    controls.stop();
    controls.start({
      width: "0%",
      transition: { duration: 0.1 },
    });
  }

  return (
    <Button
      className={cn(
        "relative touch-none overflow-hidden",
        isHolding
          ? "text-destructive-foreground bg-destructive hover:bg-destructive/90"
          : "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      onTouchCancel={handleHoldEnd}
      onClick={(e) => e.preventDefault()}
      {...props}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={controls}
        className={cn(
          "absolute top-0 left-0 h-full",
          isHolding ? "bg-destructive" : "bg-accent/10",
        )}
      />
      <span
        className={`relative z-10 flex w-full items-center justify-center ${isHolding ? "text-white" : ""}`}
      >
        {!isHolding ? "Reset" : "Release"}
      </span>
    </Button>
  );
}

export { ReleaseButton };
