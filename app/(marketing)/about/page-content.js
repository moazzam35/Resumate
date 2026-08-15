"use client";

import { motion } from "framer-motion";
import {
  Target,
  Users,
  Heart,
  Zap,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description:
      "We believe everyone deserves access to tools that help them succeed in their career journey.",
  },
  {
    icon: Users,
    title: "User First",
    description:
      "Every feature we build starts with the question: how does this help our users get hired?",
  },
  {
    icon: Heart,
    title: "Passion for Quality",
    description:
      "We obsess over the details — from ATS compatibility to pixel-perfect templates.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We leverage cutting-edge AI to give our users an unfair advantage in the job market.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Your data is encrypted and private. We never share your information with third parties.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "We're building tools that help professionals everywhere put their best foot forward.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
              About Us
            </div>
            <h1 className="heading-display text-4xl font-semibold sm:text-5xl lg:text-6xl text-balance">
              We&apos;re on a mission to{" "}
              <span className="gradient-text">level the playing field</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted text-balance leading-relaxed">
              Resumate was founded with a simple belief: everyone should
              have access to the tools they need to land their dream job, regardless
              of background or connections.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {[
              { label: "Free to start", value: "$0" },
              { label: "ATS-optimized templates", value: "30+" },
              { label: "AI actions per month (free)", value: "7" },
              { label: "PDF export", value: "Yes" },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} variants={fadeUp}>
                <Card hover className="text-center">
                  <CardContent className="p-6">
                    <p className="text-2xl font-semibold text-stamp">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-muted">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-display text-3xl font-semibold text-center mb-8"
          >
            Our Story
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg leading-relaxed"
          >
            It started with a frustrating observation: talented professionals were
            being screened out by algorithms before a human ever read their resume.
            The job market had become a game of keywords and formatting tricks,
            and most people didn&apos;t even know the rules existed.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-lg leading-relaxed"
          >
            The team behind Resumate set out to build a solution that would
            combine the intelligence of AI with the expertise of recruiting
            professionals to give every job seeker a fair shot.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg leading-relaxed"
          >
            Today, Resumate helps professionals create resumes that not only
            look great but actually get results. We&apos;re proud of the work
            we do, and we&apos;re just getting started.
          </motion.p>
        </div>
      </section>

      <section className="border-t border-border bg-paper-alt px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl">Our Values</h2>
            <p className="mt-3 text-muted">The principles that guide everything we do.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} variants={fadeUp}>
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex rounded-md bg-stamp/10 p-2.5">
                        <Icon className="h-5 w-5 text-stamp" />
                      </div>
                      <h3 className="heading-display font-semibold text-sm mb-1.5">{value.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl text-balance">
              Join us in transforming careers
            </h2>
            <p className="mt-3 text-lg text-muted text-balance">
              Start building your winning resume today — it&apos;s free.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="gradient" rightIcon={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
