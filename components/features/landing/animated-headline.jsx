"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export const PHRASES = [
  "Gets You Noticed.",
  "Gets You Hired.",
  "Opens Doors.",
  "Stands Out.",
];

const SLIDE_EM = 0.35; // subtle vertical travel, relative to the headline font size
const OUT_DURATION = 0.35; // fade/slide out of the outgoing phrase
const IN_DURATION = 0.55; // fade/slide in of the incoming phrase
const OVERLAP = 0.05; // incoming starts as the outgoing is finishing
const HOLD_DURATION = 2.2; // how long each phrase stays fully visible

const LONGEST_PHRASE = PHRASES.reduce((longest, phrase) =>
  phrase.length > longest.length ? phrase : longest
);

/**
 * Rotating headline phrase rendered with a premium GSAP "rewrite" transition.
 *
 * Two absolutely-positioned layers swap inside a container that is always sized
 * to the widest phrase (via an invisible sizer), so the headline never shifts
 * layout. The outgoing phrase fades/slides up while the incoming one reveals
 * from just below, on a power2.inOut / power3.out easing. Respects
 * prefers-reduced-motion by showing the first phrase statically.
 */
export default function AnimatedHeadline() {
  const wrapRef = useRef(null);
  const primaryRef = useRef(null);
  const secondaryRef = useRef(null);

  useEffect(() => {
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!primary || !secondary) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let timeline = null;

    const showStaticPhrase = () => {
      primary.textContent = PHRASES[0];
      gsap.set(primary, { clearProps: "all" });
      secondary.style.display = "none";
    };

    const startAnimation = () => {
      const fontSize = parseFloat(getComputedStyle(primary).fontSize) || 16;
      const slide = fontSize * SLIDE_EM;
      const cycle = OUT_DURATION + HOLD_DURATION;
      // Fully-visible hold every phrase gets between its fade-in and fade-out:
      // the incoming fade finishes OVERLAP + IN_DURATION after its transition
      // starts, and the next transition starts one full cycle later.
      const phraseHold = cycle - OVERLAP - IN_DURATION;

      // Reset both layers to the initial state before (re)building the loop,
      // so the timeline is deterministic even after a preference toggle.
      primary.textContent = PHRASES[0];
      secondary.textContent = PHRASES[1];
      secondary.style.display = "";
      gsap.set(primary, { clearProps: "all" });
      gsap.set(primary, { autoAlpha: 1, y: 0 });
      gsap.set(secondary, { autoAlpha: 0, y: slide });

      timeline = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });

      PHRASES.forEach((_, i) => {
        const from = i % 2 === 0 ? primary : secondary;
        const to = i % 2 === 0 ? secondary : primary;
        // Offset every transition by one phraseHold so the first phrase gets
        // the same fully-visible hold as the rest — both on first load and on
        // the wrap-around — and the loop spans exactly PHRASES.length * cycle.
        const at = phraseHold + i * cycle;

        timeline
          .set(
            to,
            {
              textContent: PHRASES[(i + 1) % PHRASES.length],
              autoAlpha: 0,
              y: slide,
              immediateRender: false,
            },
            at
          )
          .to(from, { autoAlpha: 0, y: -slide, duration: OUT_DURATION }, at)
          .to(
            to,
            { autoAlpha: 1, y: 0, duration: IN_DURATION, ease: "power3.out" },
            at + OVERLAP
          );
      });
    };

    const applyMotionPreference = () => {
      if (timeline) {
        timeline.kill();
        timeline = null;
      }
      if (prefersReducedMotion.matches) {
        showStaticPhrase();
      } else {
        startAnimation();
      }
    };

    applyMotionPreference();
    prefersReducedMotion.addEventListener("change", applyMotionPreference);

    return () => {
      prefersReducedMotion.removeEventListener("change", applyMotionPreference);
      if (timeline) timeline.kill();
    };
  }, []);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block whitespace-nowrap align-baseline"
    >
      {/* Invisible sizer keeps the container as wide as the longest phrase, so
          the headline never shifts when shorter phrases rotate in. */}
      <span aria-hidden="true" className="invisible">
        {LONGEST_PHRASE}
      </span>
      <span
        ref={primaryRef}
        className="absolute left-0 top-0 whitespace-nowrap text-stamp"
      >
        {PHRASES[0]}
      </span>
      <span
        ref={secondaryRef}
        className="absolute left-0 top-0 whitespace-nowrap text-stamp opacity-0"
      >
        {PHRASES[1]}
      </span>
    </span>
  );
}
