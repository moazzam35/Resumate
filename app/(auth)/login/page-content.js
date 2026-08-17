"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/store";


const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, role } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If a valid session is restored (e.g. the access token expired and was
  // silently refreshed after the proxy bounced us here), send the user back
  // to their home instead of making them sign in again.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [authLoading, isAuthenticated, role, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password, rememberMe);
      const role = data.user?.role || "USER";
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-border rounded-md p-2 sm:p-4">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <CardTitle className="heading-display text-xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-xs">
            Sign in to access your resumes and ATS analytics
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={ExternalLink}
            >
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="w-full" leftIcon={GoogleIcon}>
              Google
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-paper px-2 text-[10px] uppercase font-mono tracking-wider text-muted">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Work Email"
              type="email"
              placeholder="moazzampasha@gmail.com"
              leftIcon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                required
              />
              <div className="flex items-center justify-between pt-1.5">
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-sm border border-border bg-paper-alt accent-stamp transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50 focus-visible:ring-offset-1 focus-visible:ring-offset-paper"
                  />
                  <span className="text-[11px] text-muted">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-muted hover:text-ink"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              rightIcon={ArrowRight}
            >
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-4 mt-2">
          <p className="text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-ink hover:underline">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
