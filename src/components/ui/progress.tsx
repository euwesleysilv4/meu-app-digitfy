"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-100",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-emerald-500 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className = "" }: ProgressProps) {
  return (
    <div className={`h-2 w-full bg-gray-100 rounded-full ${className}`}>
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
} 