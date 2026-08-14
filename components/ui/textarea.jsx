import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(
  ({ className, error, success, helperText, ...props }, ref) => {
    const messageId = React.useId();
    return (
      <div className="w-full space-y-1.5">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-border bg-paper px-3 py-3 text-[16px] md:text-sm font-sans text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stamp focus-visible:border-stamp disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none md:min-h-[80px] md:py-2",
            error && "border-flag focus-visible:ring-flag",
            success && "border-verified focus-visible:ring-verified",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? messageId : undefined}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p
            id={messageId}
            className={cn(
              "text-[11px] font-medium leading-normal",
              error ? "text-flag" : "text-muted"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
