"use client"

import { Slider as SliderPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"

const Slider = SliderPrimitive.Root

function SliderControl({
  className,
  ...props
}: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn(
        "relative flex h-2.5 w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn(
        "bg-border/50 relative h-1.5 w-full grow overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  )
}

function SliderIndicator({
  className,
  ...props
}: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      className={cn("bg-violet-500 absolute h-full rounded-full", className)}
      {...props}
    />
  )
}

function SliderThumb({ className, ...props }: SliderPrimitive.Thumb.Props) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        "bg-background focus-visible:ring-violet-500/40 border-violet-500/60 hover:border-violet-500 size-4 shrink-0 rounded-full border-2 shadow-sm transition-colors focus-visible:ring-4 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  )
}

export {
  Slider,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
}
