import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../data/events';
import { BluRayDisc } from './BluRayDisc';

interface DiscCarouselProps {
  events: EventItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenDossier: () => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  isOverlayOpen: boolean;
  isZoomingIntoDossier: boolean;
  onSettleChange?: (isSettling: boolean) => void;
}

// Exact A24 main.qdXy8l6N.js carousel constants
const WHEEL_ENVELOPE_TAU = 550;
const WHEEL_NOISE_FLOOR = 0.3;
const WHEEL_EVENT_CAP = 24;
const WHEEL_STEP_THRESHOLD = 6;
const WHEEL_PAUSE_GAP = 130;
const WHEEL_IDLE_RESET = 150;
const WHEEL_SUSTAIN_DELAY = 480;

const DRAG_START_DISTANCE = 5;
const DRAG_SENSITIVITY = 0.95;
const DRAG_VELOCITY_SMOOTHING = 0.32;
const DRAG_MAX_VELOCITY = 0.5;
const FRICTION = 0.89;
const TOUCH_FLICK_VELOCITY = 0.035;
const SNAP_FREQ = 9.5;
const SNAP_DAMPING = 12;

const FLOW_LEAN = 0.055;
const FLOW_LEAN_MAX = 0.3;
const FLOW_BANK = 0.32;
const FLOW_DIP = 0.014;
const FLOW_DIP_MAX = 0.09;

function discGlideEase(t: number): number {
  // Approximates cubic-bezier(0.32, 0.72, 0, 1)
  return 1 - Math.pow(1 - t, 3.2);
}

function getCircularOffset(index: number, continuousPos: number, total: number): number {
  const modPos = ((continuousPos % total) + total) % total;
  let diff = index - modPos;
  while (diff > total / 2) diff -= total;
  while (diff < -total / 2) diff += total;
  return diff;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const DiscCarousel: React.FC<DiscCarouselProps> = ({
  events,
  activeIndex,
  onSelectIndex,
  onOpenDossier,
  isFlipped,
  onToggleFlip,
  isOverlayOpen,
  isZoomingIntoDossier,
  onSettleChange,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pointerTilt, setPointerTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);

  // Continuous render state synced at 60fps from RAF simulation
  const [simState, setSimState] = useState<{
    pos: number;
    flowRad: number;
    flowDip: number;
    wipePush: number;
    wipeSpin: number;
  }>({
    pos: activeIndex,
    flowRad: 0,
    flowDip: 0,
    wipePush: 0,
    wipeSpin: 0,
  });

  const total = events.length;

  // Simulation refs
  const posRef = useRef<number>(activeIndex);
  const targetIndexRef = useRef<number>(activeIndex);
  const tweenRef = useRef<{
    startPos: number;
    endPos: number;
    startTime: number;
    durationMs: number;
  } | null>(null);

  const dragRef = useRef<{
    active: boolean;
    started: boolean;
    pointerType: string;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    startPos: number;
    velocity: number;
  }>({
    active: false,
    started: false,
    pointerType: 'mouse',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    startPos: activeIndex,
    velocity: 0,
  });

  const coastVelRef = useRef<number>(0);
  const springVelRef = useRef<number>(0);
  const flowVelRef = useRef<number>(0);
  const prevLoopPosRef = useRef<number>(activeIndex);
  const wipeRef = useRef<{ push: number; spin: number; lastX: number; lastY: number; lastT: number }>({
    push: 0,
    spin: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
  });
  const settlingRef = useRef<boolean>(false);
  const settleTimerRef = useRef<number | null>(null);

  // Wheel envelope detector refs
  const wheelEnvRef = useRef<{
    envelope: number;
    accum: number;
    locked: boolean;
    lockTime: number;
    lastEventTime: number;
    idleTimer: number | null;
  }>({
    envelope: 0,
    accum: 0,
    locked: false,
    lockTime: 0,
    lastEventTime: 0,
    idleTimer: null,
  });

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sync external activeIndex changes (e.g. Index dropdown, Schedule jump, Arrow keys)
  useEffect(() => {
    const currentRounded = ((Math.round(posRef.current) % total) + total) % total;
    if (currentRounded !== activeIndex && !dragRef.current.active) {
      let diff = activeIndex - (((posRef.current % total) + total) % total);
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      const endPos = posRef.current + diff;
      targetIndexRef.current = activeIndex;
      tweenRef.current = {
        startPos: posRef.current,
        endPos,
        startTime: performance.now(),
        durationMs: 510,
      };
      coastVelRef.current = 0;
      springVelRef.current = 0;
    }
  }, [activeIndex, total]);

  const snapToIndex = (targetIdx: number, durationMs = 510) => {
    const wrapped = ((targetIdx % total) + total) % total;
    let diff = wrapped - (((posRef.current % total) + total) % total);
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    targetIndexRef.current = wrapped;
    tweenRef.current = {
      startPos: posRef.current,
      endPos: posRef.current + diff,
      startTime: performance.now(),
      durationMs,
    };
    coastVelRef.current = 0;
    springVelRef.current = 0;
    onSelectIndex(wrapped);
  };

  // 60fps physics loop (GSAP-style tween + coast friction + harmonic spring + flow lean/dip + wipe decay)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const updateSettleFlag = (moving: boolean) => {
      if (moving) {
        if (settleTimerRef.current) {
          window.clearTimeout(settleTimerRef.current);
          settleTimerRef.current = null;
        }
        if (!settlingRef.current) {
          settlingRef.current = true;
          onSettleChange?.(true);
        }
      } else if (settlingRef.current && !settleTimerRef.current) {
        // Exact 100ms settleDelay from A24 before revealing metadata & quotes
        settleTimerRef.current = window.setTimeout(() => {
          settlingRef.current = false;
          settleTimerRef.current = null;
          onSettleChange?.(false);
        }, 100);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      let pos = posRef.current;
      let isMoving = false;

      if (dragRef.current.active && dragRef.current.started) {
        isMoving = true;
      } else if (tweenRef.current) {
        isMoving = true;
        const elapsed = now - tweenRef.current.startTime;
        const t = Math.min(1, elapsed / tweenRef.current.durationMs);
        pos = lerp(tweenRef.current.startPos, tweenRef.current.endPos, discGlideEase(t));
        if (t >= 1) {
          pos = tweenRef.current.endPos;
          tweenRef.current = null;
        }
      } else if (Math.abs(coastVelRef.current) > 4e-4) {
        isMoving = true;
        const r = Math.min(3, dt * 60);
        pos += coastVelRef.current * r;
        coastVelRef.current *= Math.pow(FRICTION, r);
        if (Math.abs(coastVelRef.current) <= 4e-4) {
          coastVelRef.current = 0;
          const rounded = ((Math.round(pos) % total) + total) % total;
          if (rounded !== targetIndexRef.current) {
            targetIndexRef.current = rounded;
            onSelectIndex(rounded);
          }
        }
      } else {
        // Damped harmonic spring pull toward nearest integer
        const nearest = Math.round(pos);
        const diff = nearest - pos;
        if (Math.abs(diff) > 8e-4 || Math.abs(springVelRef.current) > 0.004) {
          isMoving = Math.abs(diff) > 0.035;
          springVelRef.current += diff * SNAP_FREQ * SNAP_FREQ * dt;
          springVelRef.current *= Math.exp(-SNAP_DAMPING * dt);
          pos += springVelRef.current * dt;
        } else {
          pos = nearest;
          springVelRef.current = 0;
          const wrapped = ((nearest % total) + total) % total;
          if (wrapped !== targetIndexRef.current) {
            targetIndexRef.current = wrapped;
            onSelectIndex(wrapped);
          }
        }
      }

      posRef.current = pos;

      // Flow velocity Ce -> lean & dip
      const rawInstVel = Math.max(-40, Math.min(40, (pos - prevLoopPosRef.current) / dt));
      prevLoopPosRef.current = pos;
      const flowRate = Math.abs(rawInstVel) > Math.abs(flowVelRef.current) ? 14 : 6;
      flowVelRef.current += (rawInstVel - flowVelRef.current) * Math.min(1, dt * flowRate);

      const ce = flowVelRef.current;
      const flowRad =
        Math.abs(ce) > 0.005
          ? Math.max(-FLOW_LEAN_MAX, Math.min(FLOW_LEAN_MAX, Math.sign(ce) * Math.sqrt(Math.abs(ce)) * FLOW_LEAN))
          : 0;
      const flowDip = Math.min(FLOW_DIP_MAX, Math.abs(ce) * FLOW_DIP);

      // Decay pointer wipe impulse
      wipeRef.current.push *= Math.exp(-4.5 * dt);
      wipeRef.current.spin *= Math.exp(-3.4 * dt);

      updateSettleFlag(isMoving);

      setSimState((prev) => {
        if (
          Math.abs(prev.pos - pos) < 0.0005 &&
          Math.abs(prev.flowRad - flowRad) < 0.0005 &&
          Math.abs(prev.flowDip - flowDip) < 0.0005 &&
          Math.abs(prev.wipePush - wipeRef.current.push) < 0.0005 &&
          Math.abs(prev.wipeSpin - wipeRef.current.spin) < 0.0005
        ) {
          return prev;
        }
        return {
          pos,
          flowRad,
          flowDip,
          wipePush: wipeRef.current.push,
          wipeSpin: wipeRef.current.spin,
        };
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    };
  }, [onSelectIndex, onSettleChange, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOverlayOpen || isZoomingIntoDossier) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        snapToIndex(targetIndexRef.current + 1, 460);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        snapToIndex(targetIndexRef.current - 1, 460);
      } else if (e.key === ' ') {
        e.preventDefault();
        onToggleFlip();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onOpenDossier();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Wheel Envelope Detector matching A24's Mr / Lr / Ir
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (isOverlayOpen || isZoomingIntoDossier) return;
      e.preventDefault();

      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.deltaMode === 1) {
        dx *= 16;
        dy *= 16;
      } else if (e.deltaMode === 2) {
        dx *= window.innerWidth;
        dy *= window.innerHeight;
      }

      const raw = Math.abs(dx) > Math.abs(dy) * 1.25 ? dx : dy;
      const mag = Math.abs(raw);
      if (mag < WHEEL_NOISE_FLOOR) return;

      const now = performance.now();
      const env = wheelEnvRef.current;
      const dtMs = env.lastEventTime ? now - env.lastEventTime : 999;
      env.lastEventTime = now;

      if (env.idleTimer) window.clearTimeout(env.idleTimer);
      env.idleTimer = window.setTimeout(() => {
        env.locked = false;
        env.accum = 0;
        env.envelope = 0;
      }, WHEEL_IDLE_RESET);

      const decayed = env.envelope * Math.exp(-dtMs / WHEEL_ENVELOPE_TAU);
      const stepMag = Math.min(mag, WHEEL_EVENT_CAP);
      env.envelope = Math.max(decayed, stepMag);

      // Unlock conditions on sustained or new gesture
      if (env.locked) {
        const elapsed = now - env.lockTime;
        const canRelease =
          dtMs >= WHEEL_PAUSE_GAP ||
          (mag > decayed * 1.2 && elapsed >= 190) ||
          elapsed >= WHEEL_SUSTAIN_DELAY;
        if (!canRelease) return;
        env.locked = false;
        env.accum = 0;
      }

      env.accum += stepMag;
      if (env.accum >= WHEEL_STEP_THRESHOLD) {
        const dir = raw > 0 ? 1 : -1;
        env.locked = true;
        env.lockTime = now;
        env.accum = 0;
        snapToIndex(targetIndexRef.current + dir, 510);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (wheelEnvRef.current.idleTimer) window.clearTimeout(wheelEnvRef.current.idleTimer);
    };
  });

  // Pointer drag + inertia handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOverlayOpen || isZoomingIntoDossier) return;
    dragRef.current = {
      active: true,
      started: false,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: performance.now(),
      startPos: posRef.current,
      velocity: 0,
    };
    tweenRef.current = null;
    coastVelRef.current = 0;
    springVelRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;

    const dxTotal = e.clientX - d.startX;
    if (!d.started && Math.abs(dxTotal) >= DRAG_START_DISTANCE) {
      d.started = true;
      setPressedIdx(null);
    }

    if (d.started) {
      const stageW = stageRef.current?.clientWidth || window.innerWidth;
      const span = d.pointerType !== 'mouse' ? 2.1 : 6 * DRAG_SENSITIVITY;
      const now = performance.now();
      const dtMs = Math.max(4, now - d.lastTime);
      const dxStep = e.clientX - d.lastX;
      const stepPos = -(dxStep / stageW) * span;

      posRef.current += stepPos;
      const instVel = Math.max(
        -DRAG_MAX_VELOCITY,
        Math.min(DRAG_MAX_VELOCITY, (16.667 / dtMs) * stepPos)
      );
      d.velocity += (instVel - d.velocity) * DRAG_VELOCITY_SMOOTHING;
      d.lastX = e.clientX;
      d.lastTime = now;
    }
  };

  const handlePointerUp = () => {
    const d = dragRef.current;
    setPressedIdx(null);
    if (!d.active) return;
    d.active = false;

    if (d.started) {
      if (d.pointerType !== 'mouse') {
        // Touch flick snap
        let target = Math.round(posRef.current);
        if (d.velocity > TOUCH_FLICK_VELOCITY) target = Math.floor(posRef.current) + 1;
        else if (d.velocity < -TOUCH_FLICK_VELOCITY) target = Math.ceil(posRef.current) - 1;
        snapToIndex(target, 560);
      } else {
        // Mouse momentum glide -> harmonic spring settle
        coastVelRef.current = d.velocity;
      }
    }
  };

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1100;

  const discSize = isMobile
    ? Math.min(256, Math.max(210, viewportWidth * 0.59))
    : isTablet
      ? 395
      : Math.min(545, Math.max(430, viewportWidth * 0.372));

  const flowLeanDeg = (simState.flowRad * 180) / Math.PI;
  const flowDipPx = simState.flowDip * 340;

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex h-full w-full touch-pan-y items-center justify-center overflow-x-clip overflow-y-visible md:overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ perspective: '1150px' }}
    >
      <div className="relative flex items-center justify-center" style={{ width: discSize, height: discSize }}>
        {events.map((event, idx) => {
          const m = getCircularOffset(idx, simState.pos, total);
          const absM = Math.abs(m);
          const isActive = absM < 0.35;
          const isPressed = pressedIdx === idx;

          // Continuous curved 3D arc interpolation matching A24's br() & mobile st()
          let translateX = 0;
          let translateY = 0;
          let scale = 1;
          let rotateX = 25;
          let rotateY = -26;
          let rotateZ = -8;
          let opacity = 1;

          if (isMobile) {
            // Exact A24 mobile geometry (step_81_shot_1_mobile_home_1.png): center lead disc + peeking right/left sides
            translateX = m * (viewportWidth * 0.54);
            translateY = Math.min(absM, 2) * 34 + (isActive ? -6 : 0);
            scale = Math.max(0.5, 1 - Math.min(absM, 1) * 0.44);
            rotateX = 24;
            rotateY = -25 + flowLeanDeg * 0.6;
            rotateZ = -9 + flowLeanDeg * FLOW_BANK;
            opacity = absM <= 1.35 ? 1 : 0;
          } else {
            // Asymmetric 3D perspective arc (closer & cropped right +1, receding left -1 & -2 edge peek)
            const hSpan = isTablet ? 315 : Math.min(475, viewportWidth * 0.328);
            const theta = m * 0.36;
            translateX = Math.sin(theta) * hSpan * 2.28 + (m > 0 ? m * 76 : 0);
            translateY = m * (isTablet ? -96 : -128) + (isActive ? 6 : 16 * Math.abs(m)) + flowDipPx;

            // Perspective scale gradient: right disc (+1) closer/larger (~0.96), left (-1) smaller (~0.74)
            scale =
              m >= 0
                ? Math.max(0.75, 1 - m * 0.04)
                : Math.max(0.54, 1 + m * 0.25);

            rotateX = 25 - m * 3;
            rotateY = -26 + m * 6 + flowLeanDeg + (isActive ? simState.wipeSpin * 16 : 0);
            rotateZ = -8 + m * 4 - flowLeanDeg * FLOW_BANK;
            opacity = m < -2.35 || m > 1.85 ? 0 : m < -1.85 ? 0.92 : 1;
          }

          if (isPressed && !isZoomingIntoDossier) {
            scale *= 0.965;
            rotateX += 4;
          }

          if (isZoomingIntoDossier) {
            if (isActive) {
              translateX = 0;
              translateY = 0;
              scale = 1.55;
              rotateX = 0;
              rotateY = 0;
              rotateZ = 0;
              opacity = 0.06;
            } else {
              scale = 0.55;
              opacity = 0;
            }
          }

          const zIndex = isActive ? 30 : absM <= 1.2 ? (m > 0 ? 28 : 22) : 12;

          return (
            <motion.div
              key={event.id}
              data-disc-index={idx}
              data-active={isActive ? 'true' : 'false'}
              aria-label={`${event.title} — ${event.category}`}
              role="button"
              tabIndex={isActive ? 0 : -1}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseMove={(e) => {
                if (!isActive) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
                setPointerTilt({
                  x: Math.max(-1, Math.min(1, nx)),
                  y: Math.max(-1, Math.min(1, ny)),
                });

                // Pointer wipe impulse (Er)
                const now = performance.now();
                const w = wipeRef.current;
                if (w.lastT) {
                  const speed = Math.hypot(e.clientX - w.lastX, e.clientY - w.lastY);
                  if (speed >= 9) {
                    w.push = Math.max(-0.5, Math.min(0.5, w.push + (e.clientX - w.lastX) * 0.012));
                    w.spin = Math.max(-0.4, Math.min(0.4, w.spin + (e.clientX - w.lastX) * 0.009));
                  }
                }
                w.lastX = e.clientX;
                w.lastY = e.clientY;
                w.lastT = now;
              }}
              onMouseLeave={() => {
                setHoveredIdx(null);
                setPressedIdx(null);
                setPointerTilt({ x: 0, y: 0 });
              }}
              onPointerDown={() => {
                if (!isZoomingIntoDossier && absM <= 1.2) setPressedIdx(idx);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (dragRef.current.started || isZoomingIntoDossier) return;
                if (isActive) {
                  onOpenDossier();
                } else {
                  snapToIndex(idx, 560);
                }
              }}
              style={{
                position: 'absolute',
                zIndex,
                opacity,
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
                transition: isZoomingIntoDossier
                  ? 'transform 440ms cubic-bezier(0.32, 0.72, 0, 1), opacity 320ms ease'
                  : isPressed
                    ? 'transform 140ms ease-out'
                    : undefined,
                pointerEvents: absM <= 1.2 && !isZoomingIntoDossier ? 'auto' : 'none',
                transformStyle: 'preserve-3d',
                cursor: 'pointer',
              }}
            >
              <BluRayDisc
                event={event}
                isActive={isActive}
                isFlipped={isActive && isFlipped}
                isHovered={hoveredIdx === idx && !isZoomingIntoDossier}
                pointerTilt={isActive && hoveredIdx === idx ? pointerTilt : { x: 0, y: 0 }}
                sizePx={discSize}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
