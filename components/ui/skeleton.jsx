import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-border/60", className)}
      {...props}
    >
      <div
        aria-hidden
        className="animate-shimmer pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />
    </div>
  );
}

export { Skeleton };
