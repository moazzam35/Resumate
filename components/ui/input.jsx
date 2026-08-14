import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      label,
      error,
      success,
      helperText,
      leftIcon: LeftIcon,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    const inputId = React.useId();
    const messageId = React.useId();

    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between text-xs font-medium text-ink-soft">
            <label htmlFor={inputId}>{label}</label>
            {maxLength && (
              <span className="text-[10px] text-muted font-mono-data tabular-nums">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3 text-muted">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}

          <input
            id={inputId}
            type={currentType}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={cn(
              "flex h-12 w-full rounded-md border border-border bg-paper px-3 py-2 text-[16px] md:text-sm font-mono-data text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stamp focus-visible:border-stamp disabled:cursor-not-allowed disabled:opacity-50 transition-all md:h-9",
              LeftIcon && "pl-9",
              (isPassword || error || success) && "pr-9",
              error && "border-flag focus-visible:ring-flag",
              success && "border-verified focus-visible:ring-verified",
              className
            )}
            ref={ref}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 text-muted hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {!isPassword && error && (
            <div className="absolute right-3 text-flag">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}

          {!isPassword && success && (
            <div className="absolute right-3 text-verified">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>

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
Input.displayName = "Input";

export { Input };
