"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value?: number;
  }
>(({ className, value, ...props }, ref) => {
  const progress = value ?? 0;
  const totalBlocks = 20;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);

  return (
    <div className="w-full flex items-center gap-2">
      <div
        className={cn(
          "flex w-full h-6 bg-zinc-800 border border-zinc-700 p-1 gap-1",
          className
        )}
        {...props}
      >
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className={cn("h-full w-full", {
              "bg-green-500": i < filledBlocks,
              "bg-zinc-700/50": i >= filledBlocks,
            })}
          />
        ))}
      </div>
      <span className="text-sm font-mono text-green-400">{`${Math.round(
        progress
      )}%`}</span>
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
