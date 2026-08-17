"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/store";


export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await register(name, email, password);
      setRegistered(data);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const continueToDashboard = () => {
    const role = registered?.user?.role || "USER";
    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: "", val: 0, color: "bg-border" };
    if (password.length < 6) return { label: "Weak", val: 33, color: "bg-flag" };
    if (password.length < 10) return { label: "Fair", val: 66, color: "bg-stamp" };
    return { label: "Strong", val: 100, color: "bg-verified" };
  };

  const strength = getPasswordStrength();

  return registered ? (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-border rounded-md p-2 sm:p-4">
        <CardContent className="pt-6 pb-2 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-verified/10">
            <CheckCircle2 className="h-7 w-7 text-verified" />
          </div>
          <div className="space-y-1">
            <CardTitle className="heading-display text-xl font-semibold">
              Account created!
            </CardTitle>
            <CardDescription className="text-xs">
              We sent a verification email to{" "}
              <span className="font-semibold text-ink">{registered.user?.email}</span>. Please
              verify your address to keep your account fully active.
            </CardDescription>
          </div>

          {registered.devVerifyLink && (
            <div className="rounded-md border border-stamp/30 bg-stamp/5 p-3 text-left">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted mb-1">
                Dev mode — email provider not configured
              </p>
              <a
                href={registered.devVerifyLink}
                className="text-xs text-stamp break-all hover:underline"
              >
                {registered.devVerifyLink}
              </a>
            </div>
          )}

          <div className="grid gap-2 pt-2">
            <Button className="w-full" onClick={continueToDashboard} rightIcon={ArrowRight}>
              Continue to Dashboard
            </Button>
            <Link href="/verify-email">
              <Button variant="outline" className="w-full">
                Resend verification email
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-border rounded-md p-2 sm:p-4">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <CardTitle className="heading-display text-xl font-semibold">Create your account</CardTitle>
          <CardDescription className="text-xs">
            Start building ATS-optimized resumes in seconds
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
            <Button variant="outline" size="sm" className="w-full">
              Google
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-paper px-2 text-[10px] uppercase font-mono tracking-wider text-muted">
              or register with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Moazzam"
              leftIcon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="moazzampasha@gmail.com"
              leftIcon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                required
              />

              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted">
                    <span>Password strength:</span>
                    <span className="font-semibold text-ink">{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-paper-alt rounded-sm overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.val}%` }} />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              rightIcon={ArrowRight}
            >
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-4 mt-2">
          <p className="text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
