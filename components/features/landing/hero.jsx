"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroAnimation from "./hero-animation";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-paper">
      <div className="absolute inset-x-0 bottom-0 top-20">
        <div className="hidden md:block w-full h-full">
          <HeroAnimation
            chrome={false}
            className="w-full h-full"
            folder="/frames"
            prefix="frame_"
            padding={3}
            ext="webp"
            maxFrames={98}
            frameDuration={60}
            fit="cover"
            isMobile={false}
          />
        </div>
        <div className="block md:hidden w-full h-full">
          <HeroAnimation
            chrome={false}
            className="w-full h-full"
            folder="/mobile-frames"
            prefix="frame_"
            padding={3}
            ext="png"
            maxFrames={141}
            frameDuration={1000 / 16}
            fit="cover"
            isMobile={true}
          />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-end pb-12 sm:pb-12 lg:pb-16 px-6 sm:px-10 lg:px-16">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg space-y-3 md:space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-heading font-bold md:font-medium tracking-tight text-ink leading-[1.1] text-balance rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md md:border-transparent md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
                Build Resumes That{" "}
                <span className="text-stamp">Get You Hired.</span>
              </h1>

              <p className="hidden sm:block text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed text-balance">
                Generate recruiter-ready resumes with AI, improve your ATS score, create tailored
                cover letters, and prepare for interviews—all in one place.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link href="/register">
                <Button
                  size="xl"
                  variant="primary"
                  className="relative overflow-hidden group"
                  rightIcon={ArrowRight}
                >
                  <span className="relative z-10">Start Building Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                </Button>
              </Link>
              <Link
                href="/#live-demo"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("live-demo")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <Button
                  variant="outline"
                  size="xl"
                  className="bg-paper/40 backdrop-blur-sm"
                  leftIcon={Play}
                >
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
