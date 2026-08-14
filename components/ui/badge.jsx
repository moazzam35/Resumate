import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase font-mono transition-colors border",
  {
    variants: {
      variant: {
        default:
          "bg-paper-alt text-ink-soft border-border",
        primary:
          "bg-stamp/10 text-stamp border-stamp/20",
        success:
          "bg-verified/10 text-verified border-verified/20",
        warning:
          "bg-seal/10 text-seal border-seal/20",
        danger:
          "bg-flag/10 text-flag border-flag/20",
        outline:
          "bg-transparent text-ink border-border",
        pro:
          "bg-stamp/10 text-stamp border-stamp/20",
        ai:
          "bg-stamp/8 text-stamp border-stamp/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, dot = false, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
