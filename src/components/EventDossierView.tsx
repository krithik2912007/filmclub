import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Plus, Trash2, User, Users } from 'lucide-react';
import type { EventItem } from '../data/events';
import { BluRayDisc } from './BluRayDisc';
import { TicketStub, type RegistrationPayload } from './TicketStub';

interface EventDossierViewProps {
  event: EventItem;
  nextEvent: EventItem;
  initialFocusRegister?: boolean;
  onBackToStage: () => void;
  onJumpNextEvent: () => void;
}

interface CursorDrop {
  x: number; // 0..1 normalized
  strength: number;
  bornAt: number;
}

// Exact A24 bottom next-film overscroll constants (main.qdXy8l6N.js)
const PUSH_WHEEL = 620;
const PUSH_TOUCH = 380;
const PUSH_SETTLE_MS = 350;
const PUSH_HOLD_MS = 180;
const PUSH_DRAIN_PER_SEC = 0.9;
const PUSH_GROW = 1.04;

export const EventDossierView: React.FC<EventDossierViewProps> = ({
  event,
  nextEvent,
  initialFocusRegister = false,
  onBackToStage,
  onJumpNextEvent,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tornSectionRef = useRef<HTMLElement>(null);
  const rulesSectionRef = useRef<HTMLElement>(null);
  const registerSectionRef = useRef<HTMLElement>(null);

  // Live organic torn-paper wave path + pointer spotlight
  const [tornPathD, setTornPathD] = useState<string>(
    'M 0,46 L 1440,46 L 1440,0 L 0,0 Z'
  );
  const [spotX, setSpotX] = useState(0.5);
  const [nextHovered, setNextHovered] = useState(false);

  // Bottom overscroll spooling & scroll arrival state
  const [spoolRender, setSpoolRender] = useState<{
    charge: number;
    spinDeg: number;
    liftPx: number;
    scale: number;
    leanDeg: number;
    arrivalSpin: number;
  }>({ charge: 0, spinDeg: -14, liftPx: 0, scale: 1, leanDeg: 0, arrivalSpin: 0 });
  const [isCollapsingNext, setIsCollapsingNext] = useState(false);

  // Refs for 60fps Lenis-like smooth scroll + organic tear + bottom push physics
  const targetScrollRef = useRef(0);
  const smoothScrollActiveRef = useRef(false);
  const scrollVelRef = useRef(0);
  const dropsRef = useRef<CursorDrop[]>([]);
  const lastDropAtRef = useRef(0);

  const targetChargeRef = useRef(0);
  const smoothChargeRef = useRef(0);
  const spinDegRef = useRef(-14);
  const lastPushAtRef = useRef(0);
  const settledAtBottomRef = useRef(false);
  const arrivedBottomAtRef = useRef(0);
  const lastWheelAtRef = useRef(0);
  const triggeredRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  // Registration state
  const [entryMode, setEntryMode] = useState<'solo' | 'team'>('team');
  const [teamName, setTeamName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [college, setCollege] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [submissionLink, setSubmissionLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedStub, setGeneratedStub] = useState<RegistrationPayload | null>(null);

  useEffect(() => {
    setGeneratedStub(null);
    setErrorMsg('');
    setSubmissionLink('');
    targetChargeRef.current = 0;
    smoothChargeRef.current = 0;
    spinDegRef.current = -14;
    settledAtBottomRef.current = false;
    arrivedBottomAtRef.current = 0;
    triggeredRef.current = false;
    targetScrollRef.current = 0;
    smoothScrollActiveRef.current = false;
    setSpoolRender({ charge: 0, spinDeg: -14, liftPx: 0, scale: 1, leanDeg: 0, arrivalSpin: 0 });
    setIsCollapsingNext(false);

    if (event.teamMax === 1) {
      setEntryMode('solo');
      setMembers([]);
    } else if (event.teamMin >= 2) {
      setEntryMode('team');
      setMembers(Array.from({ length: Math.max(1, event.teamMin - 1) }, () => ''));
    } else {
      setEntryMode('team');
      setMembers(['']);
    }
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [event]);

  useEffect(() => {
    if (initialFocusRegister) {
      const t = window.setTimeout(() => {
        registerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 280);
      return () => window.clearTimeout(t);
    }
  }, [initialFocusRegister, event.id]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBackToStage();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onBackToStage]);

  // Unified 60fps loop: Lenis-style smooth scroll + organic torn-paper wave + bottom overscroll spooling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const triggerAdvance = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setIsCollapsingNext(true);
      window.setTimeout(() => {
        onJumpNextEvent();
      }, 280);
    };

    let rafId = 0;
    let lastTime = performance.now();
    let prevScrollTop = el.scrollTop;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // 1. Smooth Lenis-like scroll interpolation (`lerp: 0.165`)
      if (smoothScrollActiveRef.current) {
        const diff = targetScrollRef.current - el.scrollTop;
        if (Math.abs(diff) < 0.6) {
          el.scrollTop = targetScrollRef.current;
          smoothScrollActiveRef.current = false;
        } else {
          el.scrollTop += diff * Math.min(1, dt * 10); // ~0.165 per 16ms frame
        }
      }

      const instScrollVel = (el.scrollTop - prevScrollTop) / dt;
      prevScrollTop = el.scrollTop;
      scrollVelRef.current += (instScrollVel - scrollVelRef.current) * Math.min(1, dt * 8);

      // 2. Live Organic Domain-Warped Torn-Paper Edge + Cursor Wake Drops
      const tSec = now * 0.001;
      const surge = Math.min(18, Math.abs(scrollVelRef.current) * 0.008);
      // Prune decayed cursor drops
      dropsRef.current = dropsRef.current.filter((d) => now - d.bornAt < 850);

      const pts: string[] = [];
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const x = (u * 1440).toFixed(1);
        const warp = Math.sin(u * 11 + tSec * 0.45) * 0.45;
        const n1 = Math.sin((u + warp * 0.12) * 18 + tSec * 0.65) * 14;
        const n2 = Math.cos(u * 37 - tSec * 0.9) * (6 + surge * 0.4);
        const n3 = Math.sin(u * 71 + tSec * 1.4) * 3.2;

        let wake = 0;
        for (const drop of dropsRef.current) {
          const age = (now - drop.bornAt) / 850;
          const dist = Math.abs(u - drop.x);
          if (dist < 0.16) {
            const env = (1 - age) * Math.exp(-dist * 24);
            wake += Math.sin(dist * 75 - age * 14) * 19 * drop.strength * env;
          }
        }

        const y = Math.max(4, Math.min(68, 34 + n1 + n2 + n3 + wake)).toFixed(1);
        pts.push(`${x},${y}`);
      }
      setTornPathD(`M 0,0 L 1440,0 L ${pts.reverse().join(' L ')} Z`);

      // 3. Bottom Next-Disc Arrival & Overscroll Spooling (A24 constants)
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const atBottom = maxScroll > 0 && el.scrollTop >= maxScroll - 4;
      const distFromBottom = Math.max(0, maxScroll - el.scrollTop);
      const arrivalProgress = Math.max(0, Math.min(1, 1 - distFromBottom / 420));
      const arrivalSpin = -18 + arrivalProgress * 18;

      if (!atBottom) {
        settledAtBottomRef.current = false;
        arrivedBottomAtRef.current = 0;
        targetChargeRef.current = 0;
      } else {
        if (arrivedBottomAtRef.current === 0) arrivedBottomAtRef.current = now;
        const wheelIdleMs = now - lastWheelAtRef.current;
        if (
          !settledAtBottomRef.current &&
          (wheelIdleMs > 140 || now - arrivedBottomAtRef.current > PUSH_SETTLE_MS)
        ) {
          settledAtBottomRef.current = true;
        }
      }

      // Hold grace (`180ms`) before draining smoothly (`0.9 / s`)
      if (
        !triggeredRef.current &&
        now - lastPushAtRef.current > PUSH_HOLD_MS &&
        targetChargeRef.current > 0
      ) {
        targetChargeRef.current = Math.max(0, targetChargeRef.current - dt * PUSH_DRAIN_PER_SEC);
      }

      const prevCharge = smoothChargeRef.current;
      const nextCharge =
        prevCharge + (targetChargeRef.current - prevCharge) * Math.min(1, dt * 11);
      smoothChargeRef.current =
        Math.abs(nextCharge) < 0.002 && targetChargeRef.current === 0 ? 0 : nextCharge;

      const targetSpin = -14 + arrivalSpin + smoothChargeRef.current * 185;
      const prevSpin = spinDegRef.current;
      spinDegRef.current = prevSpin + (targetSpin - prevSpin) * Math.min(1, dt * 12);

      const spinVel = (spinDegRef.current - prevSpin) / Math.max(dt, 0.008);
      const leanDeg = Math.max(-8, Math.min(8, spinVel * 0.036));
      const liftPx = smoothChargeRef.current * 28;
      const scale = 1 + smoothChargeRef.current * (PUSH_GROW - 1);

      setSpoolRender({
        charge: smoothChargeRef.current,
        spinDeg: spinDegRef.current,
        liftPx,
        scale,
        leanDeg,
        arrivalSpin,
      });

      if (!triggeredRef.current && smoothChargeRef.current >= 0.96 && targetChargeRef.current >= 0.99) {
        triggerAdvance();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    const handleWheel = (e: WheelEvent) => {
      if (triggeredRef.current) return;
      const now = performance.now();
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const atBottom = maxScroll > 0 && el.scrollTop >= maxScroll - 4;

      if (!atBottom) {
        lastWheelAtRef.current = now;
        // Lenis-style smooth wheel scroll while browsing page
        e.preventDefault();
        if (!smoothScrollActiveRef.current) {
          targetScrollRef.current = el.scrollTop;
        }
        let dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 16;
        else if (e.deltaMode === 2) dy *= el.clientHeight;
        targetScrollRef.current = Math.max(0, Math.min(maxScroll, targetScrollRef.current + dy * 1.15));
        smoothScrollActiveRef.current = true;
        return;
      }

      // Absorb leftover flick momentum right after hitting bottom (`pushSettle: 350ms`)
      if (!settledAtBottomRef.current) {
        lastWheelAtRef.current = now;
        if (e.deltaY > 0) e.preventDefault();
        return;
      }

      lastWheelAtRef.current = now;

      if (e.deltaY > 0) {
        e.preventDefault();
        lastPushAtRef.current = now;
        const clampedDelta = Math.min(e.deltaY, 42);
        targetChargeRef.current = Math.min(1, targetChargeRef.current + clampedDelta / PUSH_WHEEL);
      } else if (e.deltaY < 0) {
        if (targetChargeRef.current > 0) {
          e.preventDefault();
          const clampedUp = Math.min(Math.abs(e.deltaY), 55);
          targetChargeRef.current = Math.max(0, targetChargeRef.current - clampedUp / 380);
        } else {
          // Scroll back up smoothly from bottom
          e.preventDefault();
          targetScrollRef.current = Math.max(0, el.scrollTop + e.deltaY * 1.15);
          smoothScrollActiveRef.current = true;
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
      smoothScrollActiveRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (triggeredRef.current || touchStartYRef.current === null) return;
      const now = performance.now();
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const atBottom = maxScroll > 0 && el.scrollTop >= maxScroll - 4;
      const curY = e.touches[0]?.clientY ?? touchStartYRef.current;
      const dy = touchStartYRef.current - curY;
      touchStartYRef.current = curY;

      if (atBottom && settledAtBottomRef.current && dy > 0) {
        lastWheelAtRef.current = now;
        lastPushAtRef.current = now;
        const clampedDy = Math.min(dy, 28);
        targetChargeRef.current = Math.min(1, targetChargeRef.current + clampedDy / PUSH_TOUCH);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onJumpNextEvent]);

  const smoothScrollToSection = (target: HTMLElement | null) => {
    const el = scrollContainerRef.current;
    if (!el || !target) return;
    const offset = target.offsetTop - 56;
    targetScrollRef.current = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, offset));
    smoothScrollActiveRef.current = true;
  };

  const canSolo = event.teamMin === 1;
  const canTeam = event.teamMax > 1;
  const maxAdditionalMembers = Math.max(0, event.teamMax - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!leadName.trim() || !college.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please complete all required delegate contact fields.');
      return;
    }

    if (entryMode === 'team') {
      const filledMembers = members.filter((m) => m.trim().length > 0);
      if (1 + filledMembers.length < event.teamMin) {
        setErrorMsg(
          `${event.title} requires at least ${event.teamMin} crew members. Please add ${
            event.teamMin - (1 + filledMembers.length)
          } more name(s).`
        );
        return;
      }
    }

    if (event.requiresLink) {
      const trimmed = submissionLink.trim();
      if (!trimmed) {
        setErrorMsg('Please provide your unlisted YouTube or Google Drive submission link.');
        return;
      }
      if (!/^https?:\/\/.+/i.test(trimmed)) {
        setErrorMsg('Submission link must be a valid https:// YouTube or Google Drive URL.');
        return;
      }
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const passId = `FRM27-${event.code}-${randomCode}`;
    const issuedAt = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setGeneratedStub({
      passId,
      event,
      entryMode,
      teamName: teamName.trim() || undefined,
      leadName: leadName.trim(),
      college: college.trim(),
      email: email.trim(),
      phone: phone.trim(),
      members: entryMode === 'team' ? members.filter((m) => m.trim()) : [],
      submissionLink: submissionLink.trim() || undefined,
      issuedAt,
    });
  };

  const taglineWords = event.tagline.replace(/[.“”"]/g, '').split(' ');
  const splitA = taglineWords.slice(0, Math.ceil(taglineWords.length / 3)).join(' ').toUpperCase();
  const splitB = taglineWords
    .slice(Math.ceil(taglineWords.length / 3), Math.ceil((taglineWords.length * 2) / 3))
    .join(' ')
    .toUpperCase();
  const splitC = taglineWords.slice(Math.ceil((taglineWords.length * 2) / 3)).join(' ').toUpperCase();

  return (
    <motion.div
      ref={scrollContainerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#F3F2EE] text-[#111111] swiss-scroll pt-6 md:pt-14 pb-20 md:pb-0"
    >
      {/* Top Floating Back to Discs Trigger */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 pt-2">
        <button
          type="button"
          onClick={onBackToStage}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#111111]/75 hover:text-[#111111] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="a24-hover-link">
            <span className="a24-hover-primary">Back to Discs</span>
            <span className="a24-hover-secondary" aria-hidden="true">
              Back to Discs
            </span>
          </span>
        </button>
        <span className="font-eyebrow text-[#111111]/55">
          DISC {event.indexNumber} · {event.code}
        </span>
      </div>

      {/* ================= 1. CENTERED SWISS HEADER & FULL-WIDTH HAIRLINE SPECS ================= */}
      <section className="relative pt-6 sm:pt-10 pb-8">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="font-eyebrow text-[#891A20] mb-3">{event.category}</p>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.52, ease: [0.32, 0.72, 0, 1] }}
              className="font-serif-display text-[44px] sm:text-[74px] leading-[0.95] uppercase tracking-[-0.03em]"
            >
              {event.title}
            </motion.h1>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px]">
            <div>
              <span className="font-eyebrow text-[#111111]/55 mr-2">FORMAT</span>
              <span className="font-medium">{event.format}</span>
            </div>
            <div>
              <span className="font-eyebrow text-[#111111]/55 mr-2">COORDINATORS</span>
              <span className="font-medium">{event.coordinators.join(' · ')}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#111111]/65 text-[12.5px]">
          {[
            { k: 'TEAM SIZE', v: event.teamLabel },
            { k: 'PRIZE POOL', v: event.prizePool },
            { k: 'SCHEDULE', v: `${event.day} · ${event.timeSlot}` },
            { k: 'VENUE / FEE', v: `${event.venue} · ${event.entryFee}` },
          ].map((row, idx) => (
            <div
              key={row.k}
              className="relative flex items-center justify-between px-4 sm:px-8 py-2"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.48, delay: idx * 0.04, ease: [0.32, 0.72, 0, 1] }}
                style={{ transformOrigin: 'left' }}
                className="absolute bottom-0 inset-x-0 h-[0.5px] bg-[#111111]/35"
              />
              <span className="font-eyebrow text-[#111111]/70">{row.k}</span>
              <span className="font-medium text-right">{row.v}</span>
            </div>
          ))}
        </div>

        {/* Left & Right Registration Crosshairs (+) */}
        <div className="flex items-center justify-between px-3 sm:px-6 pt-8 text-[#111111]/75 font-mono text-[14px] select-none">
          <span>+</span>
          <span>+</span>
        </div>

        {/* Centered Split Action Bar with A24 .btn micro-jitter */}
        <div className="mt-4 flex justify-center px-4">
          <div className="inline-flex items-stretch divide-x divide-[#111111]/55">
            <button
              type="button"
              onClick={() => smoothScrollToSection(rulesSectionRef.current)}
              className="a24-btn px-5 sm:px-7 py-3 font-serif-display text-[20px] sm:text-[24px] uppercase tracking-[-0.02em] text-[#111111] cursor-pointer"
            >
              <span className="a24-btn-label">VIEW RULES</span>
            </button>
            <button
              type="button"
              onClick={() => smoothScrollToSection(registerSectionRef.current)}
              className="a24-btn px-5 sm:px-7 py-3 font-serif-display text-[20px] sm:text-[24px] uppercase tracking-[-0.02em] text-[#111111] hover:text-[#891A20] cursor-pointer"
            >
              <span className="a24-btn-label">GET PASS STUB</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= 2. 60FPS ORGANIC TORN-PAPER WAVE & CURSOR WAKE BAND ================= */}
      <section
        ref={tornSectionRef}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          setSpotX(u);
          const now = performance.now();
          if (now - lastDropAtRef.current > 40) {
            lastDropAtRef.current = now;
            // CursorGuard around bottom-right REGISTER CREW area
            const nearBtn = e.clientY - rect.top > rect.height * 0.35 && u > 0.72;
            if (!nearBtn) {
              dropsRef.current.push({ x: u, strength: 1, bornAt: now });
              if (dropsRef.current.length > 24) dropsRef.current.shift();
            }
          }
        }}
        className="relative mt-4 w-full overflow-hidden py-24 sm:py-32 text-[#F3F2EE]"
        style={{
          background: `radial-gradient(circle at ${22 + spotX * 56}% 45%, ${event.palette.bgSecondary} 0%, ${event.palette.bgPrimary} 78%)`,
        }}
      >
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="pointer-events-none absolute top-0 left-0 w-full h-[52px] sm:h-[72px]"
        >
          <path d={tornPathD} fill="#F3F2EE" />
        </svg>

        <div className="relative z-10 flex flex-col gap-10 sm:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            className="border-b border-white/25 px-5 sm:px-14 pb-2 flex justify-end"
          >
            <span className="font-serif-display text-[32px] sm:text-[54px] tracking-[0.04em] opacity-95">
              {splitA}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
            className="border-b border-white/25 px-5 sm:px-14 pb-2 flex items-center justify-between gap-4"
          >
            <span className="font-serif-display text-[32px] sm:text-[54px] tracking-[0.04em] opacity-95">
              {splitB}
            </span>
            <button
              type="button"
              onClick={() => smoothScrollToSection(registerSectionRef.current)}
              className="a24-btn px-4 py-2 font-eyebrow text-white cursor-pointer shrink-0"
            >
              <span className="a24-btn-label">REGISTER CREW</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.32, 0.72, 0, 1] }}
            className="border-b border-white/25 px-5 sm:px-14 pb-2 flex justify-center sm:justify-between"
          >
            <span className="font-serif-display text-[32px] sm:text-[54px] tracking-[0.04em] opacity-95">
              {splitC}
            </span>
          </motion.div>
        </div>
      </section>

      {/* ================= 3. OVERVIEW, RULES & JURY RUBRIC ================= */}
      <section ref={rulesSectionRef} className="mx-auto max-w-5xl px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#111111]/25 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="md:col-span-5 space-y-4"
          >
            <p className="font-eyebrow text-[#891A20]">01 / EVENT BRIEF</p>
            <p className="text-[15px] leading-relaxed text-[#111111]/90">{event.overview}</p>
            <div className="pt-2 grid grid-cols-2 gap-2.5">
              {event.judgingCriteria.map((c) => (
                <div
                  key={c.label}
                  className="border border-[#111111]/30 p-3 flex flex-col justify-between gap-1"
                >
                  <span className="text-[12px] font-medium">{c.label}</span>
                  <span className="font-mono text-[11px] text-[#891A20]">{c.weight}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="md:col-span-7">
            <p className="font-eyebrow text-[#111111] mb-3">02 / RULES & REGULATIONS</p>
            <ol className="divide-y divide-[#111111]/20 border-y border-[#111111]/35">
              {event.rules.map((rule, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.36, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-start gap-4 py-3 text-[13px] leading-relaxed"
                >
                  <span className="font-mono text-[11px] text-[#891A20] pt-0.5">0{i + 1}</span>
                  <span className="text-[#111111]/90">{rule}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= 4. WORKING REGISTRATION & PERFORATED TICKET STUB ================= */}
      <section ref={registerSectionRef} className="mx-auto max-w-3xl px-4 sm:px-8 pb-16">
        <div className="border border-[#111111] bg-white/45 p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#111111]/30 pb-4 mb-6">
            <div>
              <p className="font-eyebrow text-[#891A20]">03 / OFFICIAL ENTRY</p>
              <h2 className="mt-1 font-serif-display text-[28px] sm:text-[32px] uppercase">
                REGISTER & ISSUE PASS STUB
              </h2>
            </div>
            <span className="font-mono text-[11px] text-[#111111]/65">{event.entryFee}</span>
          </div>

          {generatedStub ? (
            <div className="space-y-6">
              <TicketStub registration={generatedStub} />
              <div className="border-t border-[#111111]/20 pt-4">
                <button
                  type="button"
                  onClick={() => setGeneratedStub(null)}
                  className="text-[12px] underline underline-offset-4 text-[#111111]/75 hover:text-[#111111] cursor-pointer"
                >
                  ← Register another crew / edit submission
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-eyebrow text-[#111111]/70 mb-2">
                  ENTRY FORMAT ({event.teamLabel})
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!canSolo}
                    onClick={() => setEntryMode('solo')}
                    className={`flex items-center justify-center gap-2 border py-2 text-[12px] font-medium transition-colors ${
                      !canSolo
                        ? 'opacity-35 cursor-not-allowed border-[#111111]/20'
                        : entryMode === 'solo'
                          ? 'border-[#111111] bg-[#111111] text-[#F3F2EE] cursor-pointer'
                          : 'border-[#111111]/35 hover:border-[#111111] cursor-pointer'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Solo Entry</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canTeam}
                    onClick={() => setEntryMode('team')}
                    className={`flex items-center justify-center gap-2 border py-2 text-[12px] font-medium transition-colors ${
                      !canTeam
                        ? 'opacity-35 cursor-not-allowed border-[#111111]/20'
                        : entryMode === 'team'
                          ? 'border-[#111111] bg-[#111111] text-[#F3F2EE] cursor-pointer'
                          : 'border-[#111111]/35 hover:border-[#111111] cursor-pointer'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Team / Crew Entry</span>
                  </button>
                </div>
              </div>

              {entryMode === 'team' && (
                <div>
                  <label className="block font-eyebrow text-[#111111]/70 mb-1.5">
                    TEAM / PRODUCTION HOUSE NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., Celluloid Collective"
                    className="w-full border border-[#111111]/40 bg-white/80 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-eyebrow text-[#111111]/70 mb-1.5">
                    LEAD PARTICIPANT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-[#111111]/40 bg-white/80 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-eyebrow text-[#111111]/70 mb-1.5">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full border border-[#111111]/40 bg-white/80 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-eyebrow text-[#111111]/70 mb-1.5">
                    COLLEGE / INSTITUTION *
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g., Rajalakshmi Engg. College"
                    className="w-full border border-[#111111]/40 bg-white/80 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-eyebrow text-[#111111]/70 mb-1.5">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="crew@college.edu"
                    className="w-full border border-[#111111]/40 bg-white/80 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              {entryMode === 'team' && maxAdditionalMembers > 0 && (
                <div className="border-t border-[#111111]/20 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-eyebrow text-[#111111]/70">
                      CO-CREW MEMBERS (MAX {maxAdditionalMembers} ADDITIONAL)
                    </label>
                    {members.length < maxAdditionalMembers && (
                      <button
                        type="button"
                        onClick={() => setMembers([...members, ''])}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#111111] hover:text-[#891A20] cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Member</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {members.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={member}
                          onChange={(e) => {
                            const next = [...members];
                            next[idx] = e.target.value;
                            setMembers(next);
                          }}
                          placeholder={`Crew member ${idx + 2} (Name & Role)`}
                          className="flex-1 border border-[#111111]/40 bg-white/80 px-3 py-1.5 text-[12.5px] focus:border-[#111111] focus:outline-none"
                        />
                        {members.length > Math.max(0, event.teamMin - 1) && (
                          <button
                            type="button"
                            onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                            className="p-1.5 text-[#111111]/55 hover:text-[#891A20] cursor-pointer"
                            aria-label="Remove crew member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(event.requiresLink || event.linkLabel) && (
                <div className="border-t border-[#111111]/20 pt-4">
                  <label className="flex items-center gap-1.5 font-eyebrow text-[#111111]/70 mb-1.5">
                    <Film className="h-3 w-3 text-[#891A20]" />
                    <span>
                      {event.linkLabel || 'SUBMISSION URL'}
                      {event.requiresLink ? ' *' : ''}
                    </span>
                  </label>
                  <input
                    type="url"
                    required={event.requiresLink}
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder={
                      event.linkPlaceholder || 'https://youtu.be/... or https://drive.google.com/...'
                    }
                    className="w-full border border-[#111111]/40 bg-white/80 px-3 py-2 font-mono text-[12px] focus:border-[#111111] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-[#111111]/55">
                    Ensure sharing permissions are set to “Unlisted” or “Anyone with the link can view”.
                  </p>
                </div>
              )}

              {errorMsg && (
                <p className="border border-[#891A20] bg-[#891A20]/10 px-3 py-2 text-[12px] text-[#891A20]">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#111111] py-3 text-[12px] font-medium tracking-wider uppercase text-[#F3F2EE] hover:bg-[#891A20] transition-colors cursor-pointer"
              >
                Generate Official Festival Pass Stub
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ================= 5. LIVELY 3D SUSPENDED PEEKING "NEXT EVENT" DISC FOOTER ================= */}
      <section className="relative overflow-hidden pt-12">
        <motion.div
          animate={{ scaleX: isCollapsingNext ? 0 : 1, opacity: isCollapsingNext ? 0 : 1 }}
          transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
          className="h-[0.5px] w-full bg-[#111111]/45"
        />
        <div className="relative px-4 sm:px-12 py-3 flex items-center justify-between">
          <span className="font-eyebrow text-[#111111]/55">
            {spoolRender.charge > 0.04
              ? `KEEP SCROLLING · ${Math.round(spoolRender.charge * 100)}%`
              : 'NEXT EVENT DISC'}
          </span>
          <motion.span
            animate={{ opacity: isCollapsingNext ? 0 : 1 }}
            className="font-serif-display text-[30px] sm:text-[54px] uppercase leading-none"
          >
            {nextEvent.discTitleMain}
          </motion.span>
          <motion.div
            animate={{ scaleX: isCollapsingNext ? 0 : 1 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className="absolute bottom-0 inset-x-0 h-[0.5px] bg-[#111111]/45"
          />
        </div>
        <div className="relative px-4 sm:px-12 py-3 flex items-center justify-between">
          <motion.span
            animate={{ opacity: isCollapsingNext ? 0 : 1 }}
            className="font-serif-display text-[30px] sm:text-[54px] uppercase leading-none"
          >
            {nextEvent.discTitleSub || nextEvent.category}
          </motion.span>
          <span className="font-eyebrow text-[#111111]/55 hidden sm:inline">
            KEEP SCROLLING TO SPOOL · OR CLICK DISC →
          </span>
          <motion.div
            animate={{ scaleX: isCollapsingNext ? 0 : 1 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className="absolute bottom-0 inset-x-0 h-[0.5px] bg-[#111111]/45"
          />
        </div>

        {/* 3D Tilted Peeking Disc: arrives with scroll, lifts & scales on overscroll beneath fixed studio glare */}
        <div
          className="relative flex justify-center h-[215px] sm:h-[265px] overflow-hidden pt-8"
          style={{ perspective: '1050px' }}
        >
          <button
            type="button"
            onClick={onJumpNextEvent}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
            aria-label={`Jump to next event: ${nextEvent.title}`}
            className="cursor-pointer transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${-spoolRender.liftPx - (nextHovered ? 12 : 0)}px) scale(${spoolRender.scale})`,
            }}
          >
            <BluRayDisc
              event={nextEvent}
              isActive={true}
              isFlipped={false}
              isHovered={nextHovered}
              labelSpinDeg={spoolRender.spinDeg}
              scrollChargeProgress={spoolRender.charge}
              baseTilt3D={{
                x: 18 - spoolRender.charge * 4,
                y: -6 + spoolRender.leanDeg,
                z: 0,
              }}
              sizePx={410}
            />
          </button>
        </div>
      </section>
    </motion.div>
  );
};
