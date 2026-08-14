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
      "We've helped professionals in 50+ countries build resumes that open doors.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-Founder",
    bio: "Former recruiter turned tech entrepreneur. Passionate about democratizing access to career tools.",
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-Founder",
    bio: "AI researcher with 10+ years in NLP. Previously led ML teams at top tech companies.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Design",
    bio: "Award-winning designer focused on creating beautiful, functional experiences.",
  },
  {
    name: "David Kim",
    role: "Head of Engineering",
    bio: "Full-stack engineer building scalable systems. Open source enthusiast.",
  },
];

const stats = [
  { label: "Resumes Created", value: "50,000+" },
  { label: "Interviews Landed", value: "12,000+" },
  { label: "Countries Served", value: "50+" },
  { label: "Average ATS Score", value: "92%" },
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
            {stats.map((stat, i) => (
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
            Our founders — a former recruiter and an AI researcher — teamed up to
            build a solution. They envisioned a tool that would combine the
            intelligence of AI with the expertise of recruiting professionals to
            give every job seeker a fair shot.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg leading-relaxed"
          >
            Today, Resumate has helped over 50,000 professionals create
            resumes that not only look great but actually get results. We&apos;re
            proud of the impact we&apos;ve had, but we&apos;re just getting started.
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

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl">Meet the Team</h2>
            <p className="mt-3 text-muted">The people behind Resumate.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeUp}>
                <Card hover className="h-full text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stamp text-sm font-semibold text-paper">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <h3 className="heading-display font-semibold text-sm">{member.name}</h3>
                    <p className="text-xs text-stamp mt-0.5">{member.role}</p>
                    <p className="mt-2 text-xs text-muted leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
