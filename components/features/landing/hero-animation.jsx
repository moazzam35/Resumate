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

export default function HeroAnimation({
  folder = "/frames",
  prefix = "frame_",
  padding = 3,
  ext = "webp",
  maxFrames = 98,
  frameDuration = 60,
  mobileFrameDuration = 1000 / 16,
  className = "",
  chrome = true,
  mobile = { folder: "/mobile-frames", prefix: "frame_", padding: 3, ext: "png", maxFrames: 141 },
  breakpoint = 768,
  fit = "cover",
  mobileFit = "cover",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const framesRef = useRef([]);
  const dprRef = useRef(1);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [expected, setExpected] = useState(maxFrames);
  const [source, setSource] = useState("desktop");

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    let cancelled = false;
    let stopLoading = null;

    const start = (nextSource) => {
      const cfg =
        nextSource === "desktop"
          ? { folder, prefix, padding, ext, maxFrames }
          : {
              folder: mobile.folder,
              prefix: mobile.prefix,
              padding: mobile.padding,
              ext: mobile.ext,
              maxFrames: mobile.maxFrames,
            };

      let innerCancelled = false;
      let loadedCount = 0;

      setSource(nextSource);
      setLoaded(0);
      setTotal(0);
      setExpected(cfg.maxFrames);
      setReady(false);

      const loadOne = (i) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (!innerCancelled) {
              loadedCount++;
              setLoaded(loadedCount);
            }
            resolve(img);
          };
          img.onerror = () => {
            if (!innerCancelled) {
              loadedCount++;
              setLoaded(loadedCount);
            }
            resolve(null);
          };
          img.src = `${cfg.folder}/${cfg.prefix}${pad(i + 1, cfg.padding)}.${cfg.ext}`;
        });

      (async () => {
        const batch = Array.from({ length: cfg.maxFrames }, (_, i) => loadOne(i));
        const results = await Promise.all(batch);
        if (innerCancelled || cancelled) return;

        const valid = results.filter(Boolean);
        framesRef.current = valid;
        setTotal(valid.length);
        setReady(true);
      })();

      return () => {
        innerCancelled = true;
      };
    };

    const update = () => {
      const nextSource = mql.matches ? "desktop" : "mobile";
      if (stopLoading) stopLoading();
      stopLoading = start(nextSource);
    };

    update();
    mql.addEventListener("change", update);

    return () => {
      cancelled = true;
      if (stopLoading) stopLoading();
      framesRef.current = [];
      mql.removeEventListener("change", update);
    };
  }, [folder, prefix, padding, ext, maxFrames, mobile.folder, mobile.prefix, mobile.padding, mobile.ext, mobile.maxFrames, breakpoint]);

  const fitMode = source === "mobile" ? mobileFit : fit;

  const drawFrame = useCallback((ctx, img, w, h, alpha, driftX, driftY, currentFit) => {
    if (!img || !img.naturalWidth) return;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;

    if (currentFit === "contain") {
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.restore();
      return;
    }

    let sx, sy, sw, sh;
    if (imgAspect > canvasAspect) {
      sh = img.naturalHeight;
      sw = sh * canvasAspect;
      sy = 0;
      const slack = img.naturalWidth - sw;
      sx = slack / 2 + (driftX * slack) / 2;
    } else {
      sw = img.naturalWidth;
      sh = sw / canvasAspect;
      sx = 0;
      const slack = img.naturalHeight - sh;
      sy = slack / 2 + (driftY * slack) / 2;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!ready || total === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const frames = framesRef.current;
    const frameCount = frames.length;
    const duration = source === "mobile" ? mobileFrameDuration : frameDuration;
    const loopMs = frameCount * duration;

    function resize() {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dprRef.current = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dprRef.current);
      canvas.height = Math.round(rect.height * dprRef.current);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = null;
    let startTime = 0;

    function render(timestamp) {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = (elapsed % loopMs) / loopMs;
      const position = progress * frameCount;

      const indexA = Math.floor(position) % frameCount;
      const indexB = (indexA + 1) % frameCount;
      const blend = position - Math.floor(position);

      const imgA = frames[indexA];
      const imgB = frames[indexB];

      const w = canvas.width / dprRef.current;
      const h = canvas.height / dprRef.current;

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

    document.addEventListener("visibilitychange", onVisibilityChange);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ready, total, frameDuration, mobileFrameDuration, source, drawFrame, fitMode]);

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
            data-total={total}
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
                data-total={total}
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
