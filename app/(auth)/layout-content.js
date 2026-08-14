"use client";

import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export default function AuthLayoutContent({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper p-4 sm:p-6">
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp text-paper">
            <FileText className="h-[18px] w-[18px]" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">{SITE_CONFIG.name}</span>
        </Link>
        <span className="text-xs text-muted flex items-center gap-1 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-verified" />
          256-bit SSL Secure
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="text-center text-xs text-muted">
        <p>© {new Date().getFullYear()} Resumate Inc. Protected by reCAPTCHA Enterprise.</p>
      </div>
    </div>
  );
}
