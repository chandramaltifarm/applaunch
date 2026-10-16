"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowDownRight, ArrowUpRight, Check, Clock3, ExternalLink, Globe2, LockKeyhole, MoveRight, Scissors, Sparkles, Zap } from "lucide-react";
import { launchConfig } from "@/config/launch.config";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000)
  };
}

function validateHttpUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    if (!parsed.hostname || !parsed.hostname.includes(".")) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function formatLaunchDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Launch date not configured";
  return new Intl.DateTimeFormat("en", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short"
  }).format(date);
}

export default function Home() {
  const target = useMemo(() => new Date(launchConfig.launchDate).getTime(), []);
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft(target));
  const [isReady, setIsReady] = useState(() => Date.now() >= target);
  const [cut, setCut] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [redirectError, setRedirectError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [hasMovedScissors, setHasMovedScissors] = useState(false);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const dragPointerId = useRef<number | null>(null);

  const destination = useMemo(() => validateHttpUrl(launchConfig.websiteUrl), []);
  const invalidDate = !Number.isFinite(target);

  useEffect(() => {
    const update = () => {
      setTime(getTimeLeft(target));
      setIsReady(Date.now() >= target);
    };
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [target]);

  const celebrate = useCallback(() => {
    if (!launchConfig.enableConfetti) return;
    const duration = 2200;
    const end = Date.now() + duration;
    const colors = ["#f8d477", "#d9435f", "#fff2d0", "#8c78ff", "#ffffff"];
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0 }, colors, startVelocity: 48 });
      confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1 }, colors, startVelocity: 48 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 120, spread: 95, startVelocity: 42, origin: { y: 0.62 }, colors });
  }, []);

  const finishCut = useCallback(() => {
    if (!isReady || cut) return;
    setCut(true);
    setDragging(false);
    setRedirectError("");
    celebrate();
    if (!destination) {
      setRedirectError("The destination URL in src/config/launch.config.ts is invalid. Set it to a full https:// or http:// URL.");
      return;
    }
    setRedirecting(true);
    window.setTimeout(() => {
      window.location.assign(destination);
    }, Math.max(800, launchConfig.redirectDelayMs));
  }, [isReady, cut, celebrate, destination]);

  const onScissorsPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isReady || cut) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPointerId.current = event.pointerId;
    const stageRect = stageRef.current?.getBoundingClientRect();
    setDragPosition(stageRect ? { x: event.clientX - stageRect.left, y: event.clientY - stageRect.top } : { x: event.clientX, y: event.clientY });
    setDragging(true);
    setHasMovedScissors(true);
  };

  const onScissorsPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || dragPointerId.current !== event.pointerId || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDragPosition({ x, y });

    const ribbonRect = ribbonRef.current?.getBoundingClientRect();
    if (ribbonRect && event.clientX >= ribbonRect.left - 26 && event.clientX <= ribbonRect.right + 26 &&
        event.clientY >= ribbonRect.top - 38 && event.clientY <= ribbonRect.bottom + 38) {
      finishCut();
    }
  };

  const onScissorsPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragPointerId.current === event.pointerId) {
      dragPointerId.current = null;
      setDragging(false);
    }
  };

  const goToSite = () => {
    if (!destination) {
      setRedirectError("The destination URL in src/config/launch.config.ts is invalid. Use a full https:// or http:// URL.");
      return;
    }
    window.location.assign(destination);
  };

  const countdownParts = [
    { label: "DAYS", value: String(time.days).padStart(2, "0") },
    { label: "HOURS", value: String(time.hours).padStart(2, "0") },
    { label: "MINUTES", value: String(time.minutes).padStart(2, "0") },
    { label: "SECONDS", value: String(time.seconds).padStart(2, "0") }
  ];

  return (
    <main className="launch-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grain" />
      <header className="topbar">
        <a className="brand" href="#" aria-label="Launchday home">
          <span className="brand-mark">{launchConfig.logoText || "L"}</span>
          <span>{launchConfig.brand}</span>
        </a>
        <div className="topbar-right"><span className="live-dot" /> <span>LAUNCH EXPERIENCE</span><span className="topbar-divider" /><LockKeyhole size={13} /><span>SECURE REDIRECT</span></div>
      </header>

      <section className="hero">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="eyebrow"><span className="eyebrow-line" /><Sparkles size={13} /> {launchConfig.eyebrow}</div>
          <h1>{launchConfig.title}<br /><span>{launchConfig.titleAccent}</span></h1>
          <p className="hero-subtitle">{launchConfig.subtitle}</p>
          <div className="event-meta">
            <div className="meta-icon"><Clock3 size={17} /></div>
            <div><span className="meta-label">SCHEDULED LAUNCH</span><strong>{invalidDate ? "Check launch.config.ts" : formatLaunchDate(launchConfig.launchDate)}</strong></div>
          </div>
          <div className="hero-note"><span className="note-check"><Check size={12} /></span> The next chapter is closer than you think.</div>
        </motion.div>

        <motion.div className="countdown-card" initial={{ opacity: 0, y: 26, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.12 }}>
          <div className="card-topline"><span><span className="status-dot" /> {isReady ? "THE MOMENT IS HERE" : "TIME UNTIL LIFTOFF"}</span><span className="card-index">01 / 03</span></div>
          <div className="countdown-grid">
            {countdownParts.map((part, index) => (
              <div className="time-unit" key={part.label}>
                <div className="time-number" aria-label={`${part.value} ${part.label}`}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={part.value} initial={{ y: -10, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: 10, opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.22 }}>{part.value}</motion.span>
                  </AnimatePresence>
                </div>
                <span className="time-label">{part.label}</span>
                {index < 3 && <span className="time-separator">:</span>}
              </div>
            ))}
          </div>
          <div className="progress-track"><motion.div className="progress-fill" animate={{ width: isReady ? "100%" : `${Math.min(96, Math.max(8, 100 - (time.days * 4 + time.hours / 24 * 4 + time.minutes / 1440 * 4 + time.seconds / 86400 * 4)))}%` }} transition={{ duration: 0.5 }} /></div>
          <div className="countdown-foot"><span>{isReady ? "Countdown complete" : "A moment worth waiting for"}</span><span>{isReady ? "100%" : "PREPARING"}</span></div>
        </motion.div>
      </section>

      <section className="ceremony-section">
        <div className="section-heading">
          <div><div className="section-kicker">THE MAIN EVENT</div><h2>Every great story has a <em>beginning.</em></h2></div>
          <p>One final gesture. One unforgettable reveal.<br />You’re invited to make it official.</p>
        </div>

        <section ref={stageRef} className={`ceremony-stage ${isReady ? "stage-ready" : ""} ${cut ? "stage-cut" : ""}`}>
          <div className="stage-grid" />
          <div className="spotlight spotlight-left" /><div className="spotlight spotlight-right" />
          <div className="stage-top-label"><span className="stage-number">02</span><span>THE RIBBON CEREMONY</span><span className="stage-top-line" /><span className="stage-lock">{isReady ? <Zap size={13} /> : <LockKeyhole size={13} />}{isReady ? "UNLOCKED" : "LOCKED UNTIL LAUNCH"}</span></div>
          <div className="stage-content">
            <AnimatePresence mode="wait">
              {!cut ? (
                <motion.div className="ribbon-scene" key="ribbon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}>
                  <div className="ceremony-caption"><span className="caption-star">✦</span><span>{isReady ? "THE MOMENT YOU’VE BEEN WAITING FOR" : "A NEW EXPERIENCE IS ON THE HORIZON"}</span><span className="caption-star">✦</span></div>
                  <div className={`ribbon-wrap ${cut ? "is-cut" : ""}`} ref={ribbonRef}>
                    <div className="ribbon-shadow" />
                    <div className="ribbon-band"><span className="ribbon-edge ribbon-edge-left" /><span className="ribbon-center-label">{launchConfig.ribbonLabel}</span><span className="ribbon-edge ribbon-edge-right" /></div>
                    <div className="ribbon-fold ribbon-fold-left" /><div className="ribbon-fold ribbon-fold-right" />
                  </div>
                  <div className="scissors-instruction">
                    <div className={`scissor-halo ${isReady ? "halo-active" : ""}`}><Scissors size={24} /></div>
                    <div><strong>{isReady ? "It’s your moment." : "The scissors are waiting."}</strong><span>{isReady ? "Drag the golden scissors onto the ribbon to cut it." : "When the countdown reaches zero, the ceremony unlocks automatically."}</span></div>
                  </div>
                  <button
                    className={`scissors-control ${isReady ? "scissors-active" : "scissors-locked"} ${dragging ? "scissors-dragging" : ""}`}
                    style={dragging ? { left: `${dragPosition.x}px`, top: `${dragPosition.y}px`, transform: "translate(-50%, -50%) rotate(-24deg)" } : undefined}
                    onPointerDown={onScissorsPointerDown}
                    onPointerMove={onScissorsPointerMove}
                    onPointerUp={onScissorsPointerUp}
                    onPointerCancel={onScissorsPointerUp}
                    aria-label={isReady ? "Drag scissors to ribbon to cut it" : "Scissors locked until launch"}
                    disabled={!isReady || cut}
                  >
                    <span className="scissors-icon"><Scissors size={30} strokeWidth={1.7} /></span>
                    <span className="scissors-button-text">{isReady ? "DRAG TO CUT" : "LOCKED"}</span>
                    {isReady && <ArrowUpRight size={14} className="scissors-arrow" />}
                  </button>
                  {!isReady && <div className="locked-overlay"><div className="lock-badge"><LockKeyhole size={15} /></div><span>THE REVEAL IS NOT READY YET</span></div>}
                  {isReady && !hasMovedScissors && <div className="drag-hint"><ArrowDownRight size={15} /> Start by dragging the scissors</div>}
                </motion.div>
              ) : (
                <motion.div className="reveal-success" key="success" initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
                  <div className="success-orb"><Check size={36} /></div>
                  <div className="success-kicker"><Sparkles size={14} /> THE RIBBON HAS BEEN CUT</div>
                  <h3>The future starts <em>now.</em></h3>
                  <p>Your launch is official. We’re opening the doors to something new.</p>
                  {redirecting ? <div className="redirect-status"><span className="spinner" /> Taking you to the live website…</div> : destination ? <button className="primary-button" onClick={goToSite}>Visit the website <ArrowUpRight size={16} /></button> : null}
                  {redirectError && <p className="error-message">{redirectError}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="stage-bottom"><span><span className="tiny-green-dot" /> {isReady ? "CEREMONY AVAILABLE" : "AWAITING SCHEDULED TIME"}</span><span>DESIGNED FOR YOUR BIG MOMENT <Sparkles size={12} /></span></div>
        </section>
      </section>

      <section className="bottom-strip">
        <div className="bottom-item"><div className="bottom-icon"><Clock3 size={17} /></div><div><strong>Perfectly timed</strong><span>Launches on your schedule</span></div></div>
        <div className="bottom-item"><div className="bottom-icon"><Scissors size={17} /></div><div><strong>Made memorable</strong><span>A hands-on reveal moment</span></div></div>
        <div className="bottom-item"><div className="bottom-icon"><Globe2 size={17} /></div><div><strong>One click away</strong><span>Your world, ready to open</span></div></div>
        <div className="bottom-cta"><span>THE NEXT CHAPTER STARTS HERE</span><ArrowUpRight size={17} /></div>
      </section>

      <footer className="footer"><a className="footer-brand" href="#"><span className="brand-mark small">L</span> {launchConfig.brand}</a><span>MADE FOR MOMENTS THAT MATTER.</span><span>© {new Date().getFullYear()} {launchConfig.brand}</span></footer>
      {redirectError && !cut && <div className="toast-error" role="alert">{redirectError}</div>}
    </main>
  );
}
