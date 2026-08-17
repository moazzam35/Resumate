"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const verify = useCallback(async (verifyToken) => {
    if (!verifyToken) {
      setStatus("error");
      setError("No verification token provided. Enter your email below to request a new link.");
      return;
    }
    setStatus("verifying");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifyToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        return;
      }
      setStatus("error");
      setError(data.error || "Unable to verify your email. Please request a new link.");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }, []);

  useEffect(() => {
    verify(token);
  }, [token, verify]);

  useEffect(() => {
    if (status === "verifying" || status === "success") return;
    if (!canResend) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canResend, status]);

  const handleResend = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("sent");
      } else {
        setError(data.error || "Unable to send a verification email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
      setCanResend(false);
      setCountdown(60);
    }
  };

  const showResend = status === "error" || status === "sent";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {status === "verifying" ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stamp/10">
              <Loader2 className="h-8 w-8 text-stamp animate-spin" />
            </div>
            <h1 className="heading-display text-2xl font-semibold">
              Verifying your email
            </h1>
            <p className="mt-2 text-muted">
              Please wait while we verify your email address...
            </p>
          </>
        ) : status === "success" ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-verified/10">
              <CheckCircle2 className="h-8 w-8 text-verified" />
            </div>
            <h1 className="heading-display text-2xl font-semibold">
              Email verified!
            </h1>
            <p className="mt-2 text-muted">
              Your email address has been successfully verified. You can now
              access all features of your account.
            </p>

            <div className="mt-8 space-y-3">
              <Link href="/login">
                <Button className="w-full" rightIcon={ArrowRight}>
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-flag/10">
              {status === "sent" ? (
                <Mail className="h-8 w-8 text-stamp" />
              ) : (
                <AlertCircle className="h-8 w-8 text-flag" />
              )}
            </div>
            <h1 className="heading-display text-2xl font-semibold">
              {status === "sent" ? "Verification email sent" : "Verification failed"}
            </h1>
            <p className="mt-2 text-muted">
              {status === "sent"
                ? "Check your inbox. If you don't see it, check your spam folder."
                : error}
            </p>

            <div className="mt-8 rounded-md border p-4 text-left">
              <div className="flex items-center justify-center gap-2 text-sm text-muted mb-3">
                <Mail className="h-4 w-4" />
                Didn&apos;t receive the email?
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="verify-email" className="text-xs">
                    Email address
                  </Label>
                  <Input
                    id="verify-email"
                    type="email"
                    placeholder="moazzampasha@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="link"
                  size="link"
                  className="mt-1"
                  leftIcon={RefreshCw}
                  onClick={handleResend}
                  disabled={!canResend || !email.trim() || isResending}
                  loading={isResending}
                >
                  {isResending
                    ? "Sending..."
                    : canResend
                    ? "Resend verification email"
                    : `Resend in ${countdown}s`}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
