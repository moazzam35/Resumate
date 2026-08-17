'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Preloader.module.css';

const DEFAULT_MIN_DISPLAY_MS = 2600;
const REDUCED_MOTION_MIN_DISPLAY_MS = 350;
const DEFAULT_MAX_DISPLAY_MS = 8000;
const EXIT_DURATION_MS = 550;
const REDUCED_MOTION_EXIT_DURATION_MS = 250;

const withDelay = (seconds) => ({ '--d': seconds });

export default function Preloader({
  isReady,
  minDisplayMs = DEFAULT_MIN_DISPLAY_MS,
  maxDisplayMs = DEFAULT_MAX_DISPLAY_MS,
  onComplete,
}) {
  const [phase, setPhase] = useState('playing');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const effectiveMinDisplay = reduceMotion
      ? REDUCED_MOTION_MIN_DISPLAY_MS
      : minDisplayMs;

    const minTimer = setTimeout(() => setMinTimeElapsed(true), effectiveMinDisplay);
    const maxTimer = setTimeout(() => {
      setMinTimeElapsed(true);
      setContentReady(true);
    }, maxDisplayMs);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [minDisplayMs, maxDisplayMs]);

  useEffect(() => {
    if (typeof isReady === 'boolean') {
      setContentReady(isReady);
      return;
    }
    if (document.readyState === 'complete') {
      setContentReady(true);
      return;
    }
    const handleLoad = () => setContentReady(true);
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [isReady]);

  useEffect(() => {
    if (phase === 'playing' && minTimeElapsed && contentReady) {
      setPhase('exiting');
    }
  }, [phase, minTimeElapsed, contentReady]);

  useEffect(() => {
    if (phase !== 'exiting') return;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? REDUCED_MOTION_EXIT_DURATION_MS : EXIT_DURATION_MS;
    const timer = setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('removed');
      onCompleteRef.current?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'removed') return null;

  return (
    <div
      className={styles.overlay}
      data-state={phase}
      role="status"
      aria-live="polite"
      aria-label="Loading Resumate"
    >
      <div className={styles.stack}>
        <div className={styles.brand}>Resumate</div>

        <div className={styles.docWrap}>
          <svg
            className={styles.doc}
            viewBox="0 0 240 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect className={styles.pageFill} x="20" y="20" width="200" height="260" rx="16" />
            <rect
              className={styles.pageOutline}
              x="20" y="20" width="200" height="260" rx="16"
              pathLength={100}
            />

            <circle
              className={`${styles.avatar} ${styles.animPop}`}
              style={withDelay('0.46s')}
              cx="50" cy="56" r="14"
            />
            <rect
              className={`${styles.nameBar} ${styles.animReveal}`}
              style={withDelay('0.52s')}
              x="74" y="49" width="70" height="8" rx="4"
            />
            <rect
              className={`${styles.subtitleBar} ${styles.animReveal}`}
              style={withDelay('0.60s')}
              x="74" y="63" width="46" height="6" rx="3"
            />

            <rect
              className={`${styles.divider} ${styles.animGrow}`}
              style={withDelay('0.70s')}
              x="20" y="88" width="200" height="2" rx="1"
            />

            <rect
              className={`${styles.tag} ${styles.animReveal}`}
              style={withDelay('0.78s')}
              x="32" y="102" width="34" height="6" rx="3"
            />
            <rect
              className={`${styles.bodyLine} ${styles.animGrow}`}
              style={withDelay('0.86s')}
              x="32" y="118" width="176" height="7" rx="3.5"
            />
            <rect
              className={`${styles.bodyLine} ${styles.animGrow}`}
              style={withDelay('0.94s')}
              x="32" y="132" width="152" height="7" rx="3.5"
            />
            <rect
              className={`${styles.bodyLine} ${styles.animGrow}`}
              style={withDelay('1.02s')}
              x="32" y="146" width="168" height="7" rx="3.5"
            />

            <rect
              className={`${styles.tag} ${styles.animReveal}`}
              style={withDelay('1.14s')}
              x="32" y="168" width="30" height="6" rx="3"
            />
            <rect
              className={`${styles.pill} ${styles.animPop}`}
              style={withDelay('1.22s')}
              x="32" y="182" width="38" height="14" rx="7"
            />
            <rect
              className={`${styles.pill} ${styles.animPop}`}
              style={withDelay('1.29s')}
              x="76" y="182" width="50" height="14" rx="7"
            />
            <rect
              className={`${styles.pill} ${styles.animPop}`}
              style={withDelay('1.36s')}
              x="132" y="182" width="34" height="14" rx="7"
            />
            <rect
              className={`${styles.pill} ${styles.animPop}`}
              style={withDelay('1.43s')}
              x="172" y="182" width="42" height="14" rx="7"
            />

            <rect
              className={`${styles.tag} ${styles.animReveal}`}
              style={withDelay('1.56s')}
              x="32" y="210" width="46" height="6" rx="3"
            />
            <rect
              className={`${styles.bodyLine} ${styles.animGrow}`}
              style={withDelay('1.64s')}
              x="32" y="226" width="160" height="7" rx="3.5"
            />
            <rect
              className={`${styles.bodyLine} ${styles.animGrow}`}
              style={withDelay('1.72s')}
              x="32" y="240" width="120" height="7" rx="3.5"
            />

            <rect className={styles.finishGlow} x="20" y="20" width="200" height="260" rx="16" />
          </svg>
        </div>

        <div className={styles.caption}>Building your resume</div>
      </div>
    </div>
  );
}
