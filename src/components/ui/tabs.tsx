/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

function Tabs({
  ref,
  className,
  tabs,
  activeTab,
  onTabChange,
  ...props
}: TabsProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const firstElement = tabRefs.current[0];
      if (firstElement) {
        const { offsetLeft, offsetWidth } = firstElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (activeTab) {
      const index = tabs.findIndex((tab) => tab.id === activeTab);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [activeTab, tabs]);

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <div className="relative">
        <div
          className="absolute flex h-[30px] items-center rounded-[6px] bg-[#0e0f1114] transition-all duration-300 ease-out dark:bg-[#ffffff1a]"
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />

        <div
          className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] transition-all duration-300 ease-out dark:bg-white"
          style={activeStyle}
        />

        <div className="relative flex items-center justify-center space-x-[6px]">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={cn(
                "h-[30px] cursor-pointer px-3 py-2 transition-colors duration-300",
                index === activeIndex
                  ? "text-[#0e0e10] dark:text-white"
                  : "text-[#0e0f1199] dark:text-[#ffffff99]",
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                setActiveIndex(index);
                onTabChange?.(tab.id);
              }}
            >
              <div className="flex h-full items-center justify-center text-sm leading-5 font-medium whitespace-nowrap">
                {tab.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
Tabs.displayName = "Tabs";

export { Tabs };
