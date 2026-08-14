import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper-alt py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* BRAND COLUMN */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stamp text-paper">
                <FileText className="h-3 w-3" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-ink">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              Craft ATS-optimized, high-converting resumes with intelligent AI suggestions and modern templates designed for senior professionals.
            </p>
            <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-paper px-2.5 py-1 text-[10px] font-mono-data text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-verified" />
              All Systems Operational
            </div>
          </div>

          {/* PRODUCT */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-ink font-mono">Product</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/templates" className="hover:text-ink transition-colors">Templates Gallery</Link></li>
              <li><Link href="/dashboard/ats-checker" className="hover:text-ink transition-colors">ATS Checker</Link></li>
              <li><Link href="/dashboard/cover-letters" className="hover:text-ink transition-colors">Cover Letters</Link></li>
              <li><Link href="/#pricing" className="hover:text-ink transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-ink font-mono">Resources</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/blog" className="hover:text-ink transition-colors">Career Blog</Link></li>
              <li><Link href="/faq" className="hover:text-ink transition-colors">FAQ & Support</Link></li>
              <li><Link href="/about" className="hover:text-ink transition-colors">About Resumate</Link></li>
              <li><Link href="/contact" className="hover:text-ink transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-ink font-mono">Legal</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-ink transition-colors">Security Overview</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} Resumate Inc.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-paper px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:border-border-strong transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Blog
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Resumate on GitHub" className="hover:text-ink transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
