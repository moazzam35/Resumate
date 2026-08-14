import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* Icon sizing scales with button size — 16px default, 18px for XL. */
const iconSizes = {
  sm: "h-4 w-4",
  default: "h-4 w-4",
  lg: "h-4 w-4",
  xl: "h-[18px] w-[18px]",
  icon: "h-4 w-4",
  "icon-sm": "h-4 w-4",
};

const buttonVariants = cva(
  [
    // Layout — every button is a centered flex row, no wrapping.
    // The 8px gap comes from `gap-2`; icons and labels align perfectly
    // because both are `leading-none` inside a flex container.
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium select-none cursor-pointer",
    // Transitions — 200ms, covers colors + press transform.
    "transition-all duration-200 ease-out",
    // Focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50 focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-40",
    // Subtle press
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Flat, quiet, no lift — hover is a subtle color/border shift.
        primary: [
          "bg-stamp text-paper border border-stamp",
          "shadow-[0_1px_2px_oklch(0_0_0/0.06)]",
          "hover:bg-stamp-hover hover:border-stamp-hover",
        ].join(" "),
        secondary: [
          "bg-paper-alt text-ink border border-border",
          "hover:bg-paper hover:border-border-strong",
        ].join(" "),
        outline: [
          "bg-transparent text-ink border border-border",
          "hover:bg-paper-alt hover:border-border-strong",
        ].join(" "),
        ghost: [
          "bg-transparent text-ink-soft border border-transparent",
          "hover:bg-paper-alt hover:text-ink",
        ].join(" "),
        danger: [
          "bg-flag text-paper border border-flag",
          "hover:bg-flag/90 hover:border-flag/90",
        ].join(" "),
        success: [
          "bg-verified text-paper border border-verified",
          "hover:bg-verified/90 hover:border-verified/90",
        ].join(" "),
        seal: [
          "bg-seal text-paper border border-seal",
          "hover:bg-seal/90 hover:border-seal/90",
        ].join(" "),
        gradient: [
          "bg-gradient-to-b from-stamp-hover to-stamp text-paper border border-stamp",
          "hover:brightness-110",
        ].join(" "),
        link: [
          "bg-transparent text-stamp underline-offset-4",
          "hover:underline",
        ].join(" "),
        // Alias so existing `variant="default"` doesn't break
        default: [
          "bg-stamp text-paper border border-stamp",
          "shadow-[0_1px_2px_oklch(0_0_0/0.06)]",
          "hover:bg-stamp-hover hover:border-stamp-hover",
        ].join(" "),
      },
      size: {
        // Compact, balanced proportions. Mobile gets taller tap targets.
        // Heights: sm=48/36, default=48/40, lg=48/44, xl=48/48 (mobile/desktop).
        sm: "h-12 min-h-12 px-3.5 text-[13px] rounded-[8px] md:h-9 md:min-h-9",
        default: "h-12 min-h-12 px-4 text-sm rounded-[10px] md:h-10 md:min-h-10",
        lg: "h-12 min-h-12 px-5 text-sm rounded-[10px] md:h-11 md:min-h-11",
        xl: "h-12 min-h-12 px-6 text-[15px] rounded-[12px] md:h-12 md:min-h-12",
        // Square icon buttons — large touch targets on mobile
        icon: "h-12 w-12 rounded-[10px] p-0 shrink-0 md:h-10 md:w-10",
        "icon-sm": "h-11 w-11 rounded-[8px] p-0 shrink-0 md:h-8 md:w-8",
        // Inline text link
        link: "h-auto p-0 gap-1",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

/**
 * Reusable Button component.
 *
 * Pass icons via the `leftIcon` / `rightIcon` props — they are sized and
 * spaced automatically (16px icon, 8px gap).  If you pass icons as children,
 * wrap them in a span with `className="inline-flex items-center"` so they
 * inherit the gap from the button's flex container.
 *
 * @param {React.ElementType} leftIcon  – Icon component rendered before the label
 * @param {React.ElementType} rightIcon – Icon component rendered after the label
 * @param {boolean}           loading   – Shows a centered spinner, hides icons
 * @param {boolean}           showLabelWhileLoading – Keeps the label visible next to the spinner when `loading`
 * @param {boolean}           asChild   – Renders as the child element (Radix Slot)
 */
const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "default",
      loading = false,
      disabled = false,
      showLabelWhileLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const iconClass = cn(iconSizes[size] || iconSizes.default, "shrink-0 leading-none");

    const content = loading ? (
      // Loading: single centered spinner, no gap shift. The label is kept
      // visually hidden (for screen readers) unless the caller opts into
      // showing it next to the spinner via `showLabelWhileLoading`.
      <>
        <Loader2 className={cn(iconClass, "animate-spin")} aria-hidden="true" />
        {children && (
          <span className={cn("leading-none", !showLabelWhileLoading && "sr-only")}>
            {children}
          </span>
        )}
      </>
    ) : (
      // Normal: left icon (if any) → label → right icon (if any)
      <>
        {LeftIcon && <LeftIcon className={iconClass} aria-hidden="true" />}
        {children && <span className="leading-none">{children}</span>}
        {RightIcon && <RightIcon className={iconClass} aria-hidden="true" />}
      </>
    );

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
