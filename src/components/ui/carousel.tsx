/* eslint-disable react/no-unstable-context-value */
/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type CarouselContextProps = CarouselProps & {
  api: ReturnType<typeof useEmblaCarousel>[1]
  canScrollNext: boolean
  canScrollPrev: boolean
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  scrollNext: () => void
  scrollPrev: () => void
};
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions
  orientation?: "horizontal" | "vertical"
  plugins?: CarouselPlugin
  setApi?: (api: CarouselApi) => void
}

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.use(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({ ref, children, className, opts, orientation = "horizontal", plugins, setApi, ...props }: CarouselProps & React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      }
      else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext
      value={{
        api,
        canScrollNext,
        canScrollPrev,
        carouselRef,
        opts,
        orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollNext,
        scrollPrev,
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn("relative", className)}
        onKeyDownCapture={handleKeyDown}
        ref={ref}
        role="region"
        {...props}
      >
        {children}
      </div>
    </CarouselContext>
  );
}
Carousel.displayName = "Carousel";

function CarouselContent({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div className="overflow-hidden" ref={carouselRef}>
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
}
CarouselContent.displayName = "CarouselContent";

function CarouselItem({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { orientation } = useCarousel();

  return (
    <div
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      ref={ref}
      role="group"
      {...props}
    />
  );
}
CarouselItem.displayName = "CarouselItem";

function CarouselPrevious({ ref, className, size = "icon", variant = "outline", ...props }: React.ComponentProps<typeof Button> & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const { canScrollPrev, orientation, scrollPrev } = useCarousel();

  return (
    <Button
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      ref={ref}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}
CarouselPrevious.displayName = "CarouselPrevious";

function CarouselNext({ ref, className, size = "icon", variant = "outline", ...props }: React.ComponentProps<typeof Button> & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const { canScrollNext, orientation, scrollNext } = useCarousel();

  return (
    <Button
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      ref={ref}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
};
