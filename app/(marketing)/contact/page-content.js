"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  CheckCircle2,
  Send,
  Briefcase,
  Code,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useUIStore } from "@/store";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "moazzampasha356@gmail.com",
    href: "mailto:moazzampasha356@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Bahawalnagar",
    href: null,
  },
];

const socialLinks = [
  { icon: Briefcase, label: "LinkedIn", href: "https://www.linkedin.com/in/moazzam-pasha-9619783a9/" },
  { icon: Code, label: "GitHub", href: "https://github.com/moazzam35" },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to send message");
      }
      showToast({ type: "success", message: "Message sent successfully! We'll get back to you soon." });
      setIsSubmitted(true);
      reset();
    } catch (err) {
      showToast({ type: "error", message: err.message || "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
              Contact
            </div>
            <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
              Get in touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
              Have a question, feedback, or need help? We&apos;d love to hear from you.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="https://moazzam35.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="xl"
                  variant="gradient"
                  rightIcon={Code2}
                  className="w-full sm:w-auto shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--stamp)_60%,transparent)]"
                >
                  Contact Developer
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2"
            >
              <h2 className="heading-display mb-6 text-lg font-semibold">Contact Information</h2>
              <div className="space-y-5">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const Wrapper = item.href ? "a" : "div";
                  const wrapperProps = item.href
                    ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  return (
                    <Wrapper
                      key={item.label}
                      {...wrapperProps}
                      className="flex items-start gap-3 group"
                    >
                      <div className="rounded-md bg-stamp/10 p-2.5 shrink-0">
                        <Icon className="h-4 w-4 text-stamp" />
                      </div>
                      <div>
                        <p className="text-xs text-muted">{item.label}</p>
                        <p className="text-sm font-medium group-hover:text-stamp transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>

              <div className="mt-8">
                <h3 className="mb-3 text-xs font-semibold text-muted uppercase tracking-wider">
                  Follow Us
                </h3>
                <div className="flex gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-paper-alt text-muted transition-colors hover:bg-stamp/10 hover:text-stamp"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-3"
            >
              <Card>
                <CardContent className="p-6 sm:p-8">
                  {isSubmitted ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-verified/10 mb-4">
                        <CheckCircle2 className="h-7 w-7 text-verified" />
                      </div>
                      <h3 className="heading-display text-lg font-semibold">Message Sent!</h3>
                      <p className="mt-2 text-sm text-muted">
                        Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" placeholder="Moazzam" {...register("name")} />
                          {errors.name && <p className="text-xs text-flag">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="moazzampasha@gmail.com" {...register("email")} />
                          {errors.email && <p className="text-xs text-flag">{errors.email.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="How can we help?" {...register("subject")} />
                        {errors.subject && <p className="text-xs text-flag">{errors.subject.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your question or feedback..."
                          rows={5}
                          {...register("message")}
                        />
                        {errors.message && <p className="text-xs text-flag">{errors.message.message}</p>}
                      </div>

                      <Button type="submit" variant="gradient" className="w-full sm:w-auto" disabled={isSubmitting} loading={isSubmitting} rightIcon={Send}>
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
