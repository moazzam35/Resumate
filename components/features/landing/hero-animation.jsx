"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

function pad(n, width) {
  return String(n).padStart(width, "0");
}

const BADGES = [
  { label: "Top Match \u2014 94%", x: "2%", y: "4%", color: "var(--stamp)" },
  { label: "Hired in 2 weeks", x: "68%", y: "0%", color: "var(--verified)" },
  { label: "ATS Score: 96", x: "74%", y: "52%", color: "var(--seal)" },
];

/* =====================================================================
   Frame preload cache (module scope).

   - Dedupes in-flight requests: the same URL shares a single decode, so
     switching desktop <-> mobile (or navigating back to the page) never
     re-downloads frames the browser has already delivered this session.
   - Frames are decoded with `createImageBitmap` where available, which keeps
     WebP/PNG decode off the main thread. Browsers without
     `createImageBitmap` fall back to <img> with explicit decode().
   - Failed frames are cached as `null` so a 404 is not retried endlessly.
   - The returned promise resolves with the bitmap/Image (usable directly by
     the canvas renderer) or `null` on failure — never rejects.
   ===================================================================== */
const FRAME_CACHE = new Map();

function loadFrame(url) {
  let pending = FRAME_CACHE.get(url);
  if (pending) return pending;

  const viaImage = () =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        // Explicit decode() reduces main-thread jank during animation.
        if (typeof img.decode === "function") {
          img.decode().then(() => resolve(img)).catch(() => resolve(img));
        } else {
          resolve(img);
        }
      };
      img.onerror = () => {
        console.error(`[HeroAnimation] failed to load frame: ${url}`);
        resolve(null);
      };
      img.src = url;
    });

  pending = new Promise((resolve) => {
    if (typeof createImageBitmap === "function") {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`frame fetch failed: ${url}`);
          return res.blob();
        })
        .then((blob) => createImageBitmap(blob))
        .then((bitmap) => resolve(bitmap))
        .catch(() => viaImage().then(resolve));
    } else {
      viaImage().then(resolve);
    }
  });
  FRAME_CACHE.set(url, pending);
  return pending;
}

/* Progressive-loading tuning.
   Desktop frames are ~32KB each: 8 critical frames is roughly 250KB and
   gives a clearly smooth opening beat. Mobile frames are now WebP ~36KB
   each (previously ~700KB PNGs), so 8 critical frames is ~290KB — we use
   the same count for both devices now. The renderer holds on the last
   loaded frame (with the existing drift animation) until more frames
   arrive, like progressive video buffering. */
const CONCURRENCY = 6;
const CRITICAL_FRAMES = 8;
const START_TIMEOUT_MS = 4000;
const HARD_TIMEOUT_MS = 10000;

/* Render at most this many device pixels per CSS pixel. The source frames
   cap the real sharpness (mobile frames are 720px wide), so rendering a 3×
   DPR phone's hero at 1170px+ just upscales 720px art while tripling the
   GPU fill cost. Capping at 2× keeps the canvas at ~the source resolution
   with no visible quality loss. */
const MAX_DEVICE_PIXEL_RATIO = 2;

/* =====================================================================
   Responsive breakpoint detection.
   Uses a single matchMedia query instead of mounting TWO HeroAnimation
   instances (the old pattern downloaded BOTH frame sets simultaneously).
   ===================================================================== */
const MOBILE_BREAKPOINT = "(max-width: 767px)";

function getFrameConfig(isMobile) {
  if (isMobile) {
    return {
      folder: "/mobile-frames",
      prefix: "frame_",
      padding: 3,
      ext: "webp",
      maxFrames: 141,
      frameDuration: 1000 / 16,
      source: "mobile",
    };
  }
  return {
    folder: "/frames",
    prefix: "frame_",
    padding: 3,
    ext: "webp",
    maxFrames: 98,
    frameDuration: 60,
    source: "desktop",
  };
}

export default function HeroAnimation({
  className = "",
  chrome = true,
  fit = "cover",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const framesRef = useRef([]);
  const doneRef = useRef(false);
  const dprRef = useRef(1);
  const loadingRef = useRef(false);
  const abortRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const configRef = useRef(getFrameConfig(false));

  /* =====================================================================
     Responsive detection — single matchMedia listener.
     When the breakpoint changes, abort current frame loading, clear
     frames, and reload with the correct set.
     ===================================================================== */
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT);

    const handleChange = (e) => {
      const mobile = e.matches;
      setIsMobile(mobile);
      configRef.current = getFrameConfig(mobile);

      // Abort any in-progress loading
      abortRef.current = true;
      framesRef.current = [];
      doneRef.current = false;
      setReady(false);
      setLoaded(0);
      loadingRef.current = false;

      // Small delay to let the abort settle, then reload
      requestAnimationFrame(() => {
        abortRef.current = false;
        startLoading();
      });
    };

    // Set initial state
    setIsMobile(mq.matches);
    configRef.current = getFrameConfig(mq.matches);

    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
    } else {
      mq.addListener(handleChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleChange);
      } else {
        mq.removeListener(handleChange);
      }
    };
  }, []);

  /* =====================================================================
     PHASE 1 — load critical frames first, then stream the rest.
     ===================================================================== */
  const startLoading = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const cfg = configRef.current;
    const { folder, prefix, padding, ext, maxFrames } = cfg;

    framesRef.current = [];
    doneRef.current = false;
    setLoaded(0);
    setReady(false);

    const urls = Array.from(
      { length: maxFrames },
      (_, i) => `${folder}/${prefix}${pad(i + 1, padding)}.${ext}`
    );
    const results = new Array(maxFrames);
    let head = 0;
    let cursor = 0;
    let pending = 0;

    const maybeStart = () => {
      if (abortRef.current) return;
      const have = framesRef.current.length;
      if (have >= CRITICAL_FRAMES || (doneRef.current && have > 0)) {
        setReady(true);
      }
    };

    const append = () => {
      while (head < maxFrames && results[head] !== undefined) {
        const img = results[head];
        if (img) {
          framesRef.current.push(img);
          setLoaded(framesRef.current.length);
          maybeStart();
        }
        head++;
      }
    };

    const pump = () => {
      while (!abortRef.current && pending < CONCURRENCY && cursor < maxFrames) {
        const i = cursor++;
        pending++;
        loadFrame(urls[i]).then((img) => {
          if (abortRef.current) return;
          results[i] = img;
          pending--;
          append();
          pump();
          if (head >= maxFrames) {
            doneRef.current = true;
            setReady(true);
            loadingRef.current = false;
          }
        });
      }
    };

    pump();
  }, []);

  /* Kick off initial load when container is available */
  useEffect(() => {
    if (containerRef.current && !loadingRef.current) {
      startLoading();
    }

    return () => {
      abortRef.current = true;
      framesRef.current = [];
      doneRef.current = false;
      loadingRef.current = false;
    };
  }, [startLoading]);

  const fitMode = fit;

  const drawFrame = useCallback((ctx, img, w, h, alpha, driftX, driftY, currentFit) => {
    // `img` may be an Image (naturalWidth) or an ImageBitmap (width).
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!img || !iw || !ih) return;
    const imgAspect = iw / ih;
    const canvasAspect = w / h;

    if (currentFit === "contain") {
      const scale = Math.min(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, 0, 0, iw, ih, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.restore();
      return;
    }

    let sx, sy, sw, sh;
    if (imgAspect > canvasAspect) {
      sh = ih;
      sw = sh * canvasAspect;
      sy = 0;
      const slack = iw - sw;
      sx = slack / 2 + (driftX * slack) / 2;
    } else {
      sw = iw;
      sh = sw / canvasAspect;
      sx = 0;
      const slack = ih - sh;
      sy = slack / 2 + (driftY * slack) / 2;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();
  }, []);

  /* =====================================================================
     PHASE 2/3 — canvas render loop.

     The loop runs the moment the Hero becomes ready and keeps running while
     the remaining frames stream in. While frames are still loading it plays
     forward frame-by-frame at the existing cadence and holds (with the same
     drift animation) at the last loaded frame; once the full set has arrived
     it seamlessly switches to the original wrap-around loop — identical
     timing, blending and drift as before.
     ===================================================================== */
  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const cfg = configRef.current;
    const duration = cfg.frameDuration;

    function resize() {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dprRef.current = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.round(rect.width * dprRef.current);
      canvas.height = Math.round(rect.height * dprRef.current);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = null;
    let startTime = 0;
    let prevDone = false;

    function render(timestamp) {
      if (!startTime) startTime = timestamp;

      const frames = framesRef.current;
      const frameCount = frames.length;
      const done = doneRef.current;

      /* Seamless transition from progressive playback to the full loop:
         continue from the frame we were holding instead of popping to the
         wrapped position. */
      if (done && !prevDone && frameCount > 0) {
        const held = Math.min(
          Math.floor((timestamp - startTime) / duration),
          frameCount - 1
        );
        startTime = timestamp - held * duration;
        prevDone = true;
      }

      const elapsed = timestamp - startTime;

      const w = canvas.width / dprRef.current;
      const h = canvas.height / dprRef.current;

      if (frameCount > 0) {
        let position;
        if (done) {
          const loopMs = frameCount * duration;
          position = ((elapsed % loopMs) / loopMs) * frameCount;
        } else {
          position = elapsed / duration;
          if (position > frameCount - 1) position = frameCount - 1;
        }

        const indexA = Math.floor(position) % frameCount;
        const indexB = (indexA + 1) % frameCount;
        const blend = position - Math.floor(position);

        const imgA = frames[indexA];
        const imgB = frames[indexB];

        const t = timestamp / 1000;
        const driftX = Math.sin(t * 0.08) * 0.4;
        const driftY = Math.cos(t * 0.11) * 0.3;

        ctx.save();
        ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
        ctx.clearRect(0, 0, w, h);
        drawFrame(ctx, imgA, w, h, 1, driftX, driftY, fitMode);
        if (blend > 0.001) {
          drawFrame(ctx, imgB, w, h, blend, driftX, driftY, fitMode);
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else {
        startTime = 0;
        raf = requestAnimationFrame(render);
      }
    }

    // Pause the loop entirely while the hero is off-screen (scrolled away, or
    // the desktop/mobile instance hidden at a breakpoint). The wrap-around
    // loop is seamless, so restarting from frame 0 on re-entry is invisible
    // and saves all compositing/draw work during scroll.
    let inView = true;
    let io = null;
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries[entries.length - 1]?.isIntersecting;
          if (visible && !inView) {
            inView = true;
            startTime = 0;
            raf = requestAnimationFrame(render);
          } else if (!visible && inView) {
            inView = false;
            if (raf) cancelAnimationFrame(raf);
            raf = null;
          }
        },
        { threshold: 0 }
      );
      io.observe(container);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (io) io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ready, drawFrame, fitMode]);

  const expected = configRef.current.maxFrames;
  const source = isMobile ? "mobile" : "desktop";

  if (!chrome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className={className}
      >
        <div ref={containerRef} className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
            data-source={source}
            data-ready={ready ? "1" : "0"}
            data-total={loaded}
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper">
              <p className="text-xs text-muted-foreground/30 font-mono tabular-nums">
                {loaded}/{expected}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-paper-alt shadow-xl">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/40 bg-paper/80">
              <div className="h-2.5 w-2.5 rounded-full bg-flag/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-seal/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-verified/70" />
              <div className="ml-3 flex-1 max-w-[180px] h-5 rounded-md bg-border/30 px-2 flex items-center">
                <span className="text-[10px] text-muted-foreground font-mono truncate">
                  app.resumearchitect.io
                </span>
              </div>
            </div>

            <div
              ref={containerRef}
              className="relative w-full aspect-[4/3] bg-paper-alt"
            >
              <canvas
                ref={canvasRef}
                className="block w-full h-full"
                data-source={source}
                data-ready={ready ? "1" : "0"}
                data-total={loaded}
              />

              {!ready && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-paper/90 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-full border-2 border-stamp/20 border-t-stamp animate-spin" />
                  <p className="mt-3 text-xs text-muted-foreground font-mono">
                    {expected > 0
                      ? `${Math.round((loaded / expected) * 100)}%`
                      : "Loading\u2026"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -bottom-2 -right-2 -left-2 h-3 rounded-b-2xl bg-border/20 blur-sm" />
        </motion.div>

        {BADGES.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5 + i * 0.2,
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute z-20"
            style={{ top: badge.y, left: badge.x }}
          >
            <motion.div
              animate={{ y: [0, -(4 + i * 1.5), 0] }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="px-3 py-1.5 rounded-lg bg-paper/95 backdrop-blur-sm border border-border/50 shadow-md whitespace-nowrap"
            >
              <span
                className="text-[9px] font-semibold"
                style={{ color: badge.color }}
              >
                {badge.label}
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
