import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../data/events';

interface BluRayDiscProps {
  event: EventItem;
  isActive: boolean;
  isFlipped: boolean;
  isHovered: boolean;
  pointerTilt?: { x: number; y: number };
  sizePx?: number;
  /** Rotates ONLY the printed label/artwork beneath fixed studio lighting (deg) */
  labelSpinDeg?: number;
  /** 0..1 progressive hand-drawn ink scribble arc along top perimeter */
  scrollChargeProgress?: number;
  /** Optional static 3D base perspective tilt (e.g. peeking bottom disc) */
  baseTilt3D?: { x: number; y: number; z?: number };
}

const FONT_MAP: Record<EventItem['palette']['titleFont'], string> = {
  condensed: '"Bebas Neue", Impact, sans-serif',
  bodoni: '"Bodoni Moda", Georgia, serif',
  syne: '"Syne", sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  grotesque: '"Plus Jakarta Sans", sans-serif',
  stencil: '"Bebas Neue", "Syne", sans-serif',
};

/**
 * Full-loop 10fps hand-drawn scribble halo for hovered carousel discs.
 */
const SCRIBBLE_FRAMES: Array<[string, string]> = [
  [
    'M 94,484 C 30,378 30,202 138,98 C 250,-4 440,10 528,124 C 612,234 604,420 494,514 C 394,598 224,590 144,534',
    'M 82,442 C 42,312 68,146 184,66 C 308,-14 488,36 560,164 C 626,288 582,468 450,544 C 358,596 226,578 170,542',
  ],
  [
    'M 88,478 C 24,368 36,194 146,92 C 258,-10 448,16 534,132 C 616,242 598,428 486,520 C 386,602 216,584 138,528',
    'M 88,450 C 38,318 62,152 176,60 C 302,-18 482,30 554,158 C 630,280 588,462 458,550 C 364,600 232,582 164,536',
  ],
  [
    'M 100,490 C 36,384 22,208 132,104 C 244,2 434,4 522,118 C 608,228 608,414 500,508 C 400,594 230,596 150,540',
    'M 78,436 C 46,304 74,140 190,72 C 314,-8 494,42 566,170 C 620,294 576,474 444,538 C 352,590 220,572 176,548',
  ],
  [
    'M 91,481 C 27,374 33,198 142,95 C 254,-7 444,13 531,128 C 614,238 601,424 490,517 C 390,600 220,588 141,531',
    'M 85,446 C 40,315 65,149 180,63 C 305,-16 485,33 557,161 C 628,284 585,465 454,547 C 361,598 229,580 167,539',
  ],
];

/**
 * Clockwise upper-arch hand-drawn ink paths (9 o'clock -> 12 -> 3 o'clock)
 * used for progressive scroll-to-advance drawing on the bottom peeking disc.
 */
const PROGRESS_SCRIBBLE_FRAMES: Array<[string, string]> = [
  [
    'M 18,340 C 12,188 118,24 316,12 C 492,2 622,148 624,335',
    'M 28,325 C 24,180 128,32 322,20 C 484,10 612,154 614,320',
  ],
  [
    'M 16,336 C 18,182 124,28 320,16 C 496,6 618,154 622,338',
    'M 30,330 C 20,176 122,26 316,16 C 488,14 616,148 610,324',
  ],
  [
    'M 20,344 C 10,192 114,20 312,10 C 488,0 624,144 626,332',
    'M 25,322 C 26,184 132,36 324,22 C 480,8 608,158 616,318',
  ],
  [
    'M 17,338 C 14,186 120,25 318,14 C 494,4 620,150 623,336',
    'M 29,327 C 22,179 125,29 319,18 C 486,12 614,151 612,322',
  ],
];

function DiscArtwork({ event }: { event: EventItem }) {
  const { palette, id } = event;
  const uid = id.replace(/[^a-z0-9]/gi, '');

  switch (palette.motif) {
    case 'cinewars':
      return (
        <g>
          <rect x="0" y="0" width="600" height="600" fill={`url(#base-grad-${uid})`} />
          <polygon
            points="90,0 590,210 590,410 20,250"
            fill={`url(#beam-${uid})`}
            opacity="0.72"
          />
          <path
            d="M 0,318 Q 190,288 330,312 T 600,298 L 600,600 L 0,600 Z"
            fill={`url(#lower-grad-${uid})`}
            opacity="0.92"
          />
          <g opacity="0.16" fill={palette.accent}>
            {Array.from({ length: 14 }).map((_, i) => (
              <rect key={i} x={45 + i * 38} y="156" width="16" height="10" rx="1.5" />
            ))}
          </g>
          <circle cx="395" cy="188" r="82" fill="none" stroke={palette.accent} strokeWidth="0.9" opacity="0.28" />
          <circle cx="395" cy="188" r="44" fill={palette.accent} opacity="0.12" />
          <line x1="0" y1="312" x2="600" y2="312" stroke={palette.accent} strokeWidth="0.8" opacity="0.38" />
        </g>
      );

    case 'nalaiya':
      return (
        <g>
          <rect x="0" y="0" width="600" height="600" fill={`url(#base-grad-${uid})`} />
          <path d="M 0,322 L 600,322 L 600,600 L 0,600 Z" fill="#171D2B" opacity="0.78" />
          <circle cx="300" cy="235" r="185" fill={`url(#beam-${uid})`} opacity="0.76" />
          <path
            d="M 125,130 L 165,130 M 125,130 L 125,170 M 475,130 L 435,130 M 475,130 L 475,170"
            stroke={palette.accent}
            strokeWidth="1.3"
            fill="none"
            opacity="0.45"
          />
          <path
            d="M 225,322 C 232,265 256,225 292,225 C 328,225 352,258 362,322 Z"
            fill="#090C12"
            opacity="0.78"
          />
          <line x1="0" y1="322" x2="600" y2="322" stroke={palette.bgSecondary} strokeWidth="1.6" opacity="0.75" />
        </g>
      );

    case 'script':
      return (
        <g>
          <rect x="0" y="0" width="600" height="316" fill={`url(#base-grad-${uid})`} />
          <rect x="0" y="316" width="600" height="284" fill={palette.bgSecondary} />
          <g stroke={palette.bgSecondary} strokeWidth="0.6" opacity="0.14">
            {[110, 150, 190, 230, 270].map((y) => (
              <line key={`h-${y}`} x1="40" y1={y} x2="560" y2={y} />
            ))}
            {[140, 200, 260, 340, 400, 460].map((x) => (
              <line key={`v-${x}`} x1={x} y1="70" x2={x} y2="316" />
            ))}
          </g>
          <g opacity="0.92">
            <rect x="0" y="302" width="600" height="16" fill="#171B16" />
            {Array.from({ length: 12 }).map((_, i) => (
              <polygon
                key={i}
                points={`${i * 56 - 20},318 ${i * 56 + 12},302 ${i * 56 + 34},302 ${i * 56 + 2},318`}
                fill={palette.bgSecondary}
              />
            ))}
          </g>
          <text
            x="150"
            y="195"
            fill={palette.accent}
            fontSize="11"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="2"
            opacity="0.72"
          >
            INT. SOUNDSTAGE B — DAY
          </text>
          <text
            x="150"
            y="214"
            fill={palette.bgSecondary}
            fontSize="9"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="1.5"
            opacity="0.55"
          >
            CAMERA LOCKS ON 35MM ANAMORPHIC
          </text>
        </g>
      );

    case 'lens':
      return (
        <g>
          <rect x="0" y="0" width="600" height="600" fill={`url(#base-grad-${uid})`} />
          <circle cx="300" cy="240" r="240" fill={`url(#beam-${uid})`} opacity="0.58" />
          <g opacity="0.92">
            <rect x="78" y="138" width="136" height="92" fill="#18323A" stroke={palette.accent} strokeWidth="1" strokeOpacity="0.45" />
            <circle cx="132" cy="182" r="26" fill={palette.bgSecondary} opacity="0.4" />
            <rect x="232" y="138" width="136" height="92" fill="#1F3E47" stroke={palette.accent} strokeWidth="1" strokeOpacity="0.6" />
            <polygon points="248,225 300,158 352,225" fill={palette.accent} opacity="0.28" />
            <rect x="386" y="138" width="136" height="92" fill="#2A4F59" stroke={palette.accent} strokeWidth="1" strokeOpacity="0.45" />
            <rect x="424" y="160" width="60" height="48" fill={palette.accent} opacity="0.35" />
          </g>
          <rect x="20" y="305" width="560" height="2.2" fill={palette.bgSecondary} opacity="0.7" />
          <ellipse cx="300" cy="306" rx="180" ry="10" fill={palette.accent} opacity="0.16" />
        </g>
      );

    case 'maven':
      return (
        <g>
          <rect x="0" y="0" width="600" height="600" fill={`url(#base-grad-${uid})`} />
          <polygon points="300,300 45,50 185,20" fill={palette.bgSecondary} opacity="0.12" />
          <polygon points="300,300 415,20 555,50" fill={palette.bgSecondary} opacity="0.12" />
          <circle cx="300" cy="200" r="118" fill="none" stroke={palette.bgSecondary} strokeWidth="1.2" opacity="0.32" />
          <circle cx="300" cy="200" r="88" fill="none" stroke={palette.bgSecondary} strokeWidth="0.8" strokeDasharray="4 5" opacity="0.48" />
          <text
            x="300"
            y="182"
            textAnchor="middle"
            fill={palette.bgSecondary}
            fontSize="11"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="3"
            opacity="0.85"
          >
            ROUND 01 · 02 · 03
          </text>
          <text
            x="300"
            y="204"
            textAnchor="middle"
            fill={palette.accent}
            fontSize="9"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="2"
            opacity="0.6"
          >
            ARCHIVE QUIZ · 24 FPS
          </text>
          <line x1="80" y1="318" x2="520" y2="318" stroke={palette.bgSecondary} strokeWidth="1.5" opacity="0.65" />
        </g>
      );

    case 'spoof':
      return (
        <g>
          <rect x="0" y="0" width="600" height="600" fill={`url(#base-grad-${uid})`} />
          <circle cx="360" cy="210" r="240" fill={`url(#beam-${uid})`} opacity="0.52" />
          <g fill={palette.bgSecondary} opacity="0.82">
            <polygon points="235,152 241,168 258,168 244,178 249,194 235,184 221,194 226,178 212,168 229,168" />
            <polygon points="365,152 371,168 388,168 374,178 379,194 365,184 351,194 356,178 342,168 359,168" />
          </g>
          <circle cx="300" cy="300" r="246" fill="none" stroke={palette.bgSecondary} strokeWidth="1" strokeDasharray="8 6" opacity="0.22" />
          <line x1="90" y1="325" x2="510" y2="325" stroke={palette.bgSecondary} strokeWidth="1.5" opacity="0.35" />
        </g>
      );
  }
}

export const BluRayDisc: React.FC<BluRayDiscProps> = ({
  event,
  isActive,
  isFlipped,
  isHovered,
  pointerTilt = { x: 0, y: 0 },
  sizePx = 440,
  labelSpinDeg = 0,
  scrollChargeProgress = 0,
  baseTilt3D,
}) => {
  const uid = event.id.replace(/[^a-z0-9]/gi, '');
  const titleFont = FONT_MAP[event.palette.titleFont];
  const [scribbleFrame, setScribbleFrame] = useState(0);

  const isSpooling = scrollChargeProgress > 0.015;
  const shouldAnimateInk = (isActive && isHovered) || isSpooling;

  useEffect(() => {
    if (!shouldAnimateInk) {
      setScribbleFrame(0);
      return;
    }
    const timer = window.setInterval(() => {
      setScribbleFrame((prev) => (prev + 1) % SCRIBBLE_FRAMES.length);
    }, 100);
    return () => window.clearInterval(timer);
  }, [shouldAnimateInk]);

  const [outerLoop, innerLoop] = SCRIBBLE_FRAMES[scribbleFrame];
  const [progOuter, progInner] = PROGRESS_SCRIBBLE_FRAMES[scribbleFrame];
  const clampedProgress = Math.max(0, Math.min(1, scrollChargeProgress));

  return (
    <div
      className="relative select-none"
      style={{
        width: sizePx,
        height: sizePx,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 10fps Stop-Motion Ink Scribble Halo on Hover (when not mid-spool) */}
      <motion.svg
        viewBox="0 0 640 640"
        className="pointer-events-none absolute -inset-[5%] h-[110%] w-[110%]"
        initial={false}
        animate={{
          opacity: isActive && isHovered && !isSpooling ? 0.96 : 0,
          scale: isActive && isHovered ? 1.01 : 0.97,
        }}
        transition={{
          opacity: { duration: 0.16 },
          scale: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
        }}
      >
        <path d={outerLoop} fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
        <path d={innerLoop} fill="none" stroke="#111111" strokeWidth="1.45" strokeLinecap="round" opacity="0.86" />
      </motion.svg>

      {/* Progressive Hand-Drawn Double Ink Scribble Arc for Bottom Scroll-to-Advance */}
      {isSpooling && (
        <svg
          viewBox="0 0 640 640"
          className="pointer-events-none absolute -inset-[5%] h-[110%] w-[110%]"
          style={
            baseTilt3D
              ? {
                  transform: `rotateX(${baseTilt3D.x}deg) rotateY(${baseTilt3D.y}deg) rotateZ(${baseTilt3D.z ?? 0}deg)`,
                }
              : undefined
          }
        >
          <path
            d={progOuter}
            pathLength={1}
            fill="none"
            stroke="#111111"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset={1 - clampedProgress}
          />
          <path
            d={progInner}
            pathLength={1}
            fill="none"
            stroke="#111111"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.72"
            strokeDasharray="1"
            strokeDashoffset={1 - Math.max(0, clampedProgress - 0.06)}
          />
        </svg>
      )}

      {/* 3D Tilting & Flipping Physical Disc Body (lighting stays in room space while inner print rotates!) */}
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY:
            (baseTilt3D?.y ?? 0) +
            (isFlipped ? 180 : 0) +
            (isActive && isHovered ? pointerTilt.x * 11 : 0),
          rotateX:
            (baseTilt3D?.x ?? 0) + (isActive && isHovered ? -pointerTilt.y * 9 : 0),
          rotateZ: baseTilt3D?.z ?? 0,
        }}
        transition={{
          rotateY: {
            duration: isFlipped ? 0.72 : 0.22,
            ease: [0.32, 0.72, 0, 1],
          },
          rotateX: { duration: 0.2, ease: 'easeOut' },
          rotateZ: { duration: 0.2, ease: 'easeOut' },
        }}
      >
        {/* ================= FRONT PRINTED LABEL SIDE ================= */}
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible">
            <defs>
              <mask id={`disc-mask-${uid}`}>
                <rect x="0" y="0" width="600" height="600" fill="black" />
                <circle cx="300" cy="300" r="298" fill="white" />
                <circle cx="300" cy="300" r="50" fill="black" />
              </mask>

              <linearGradient id={`base-grad-${uid}`} x1="85%" y1="10%" x2="10%" y2="95%">
                <stop offset="0%" stopColor={event.palette.bgPrimary} stopOpacity="0.92" />
                <stop offset="52%" stopColor={event.palette.bgPrimary} />
                <stop offset="100%" stopColor="#070709" />
              </linearGradient>

              <linearGradient id={`lower-grad-${uid}`} x1="85%" y1="15%" x2="10%" y2="95%">
                <stop offset="0%" stopColor={event.palette.bgSecondary} />
                <stop offset="65%" stopColor={event.palette.bgSecondary} />
                <stop offset="100%" stopColor="#5D1B12" />
              </linearGradient>

              <linearGradient id={`rim-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D6D8DE" stopOpacity="0.88" />
                <stop offset="28%" stopColor="#FFFFFF" stopOpacity="0.98" />
                <stop offset="52%" stopColor="#90949E" stopOpacity="0.72" />
                <stop offset="76%" stopColor="#FFFFFF" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#C4C7CF" stopOpacity="0.85" />
              </linearGradient>

              <linearGradient
                id={`studio-sweep-${uid}`}
                x1={`${68 + pointerTilt.x * 16}%`}
                y1={`${4 + pointerTilt.y * 14}%`}
                x2="16%"
                y2="92%"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
                <stop offset="22%" stopColor="#FFFFFF" stopOpacity="0.14" />
                <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0.02" />
                <stop offset="68%" stopColor="#000000" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
              </linearGradient>

              <linearGradient id={`softbox-bar-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="44%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.16" />
                <stop offset="56%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              <radialGradient id={`beam-${uid}`} cx="58%" cy="32%" r="58%">
                <stop offset="0%" stopColor={event.palette.accent} stopOpacity="0.54" />
                <stop offset="58%" stopColor={event.palette.bgSecondary} stopOpacity="0.24" />
                <stop offset="100%" stopColor={event.palette.bgPrimary} stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`hub-frost-${uid}`} cx="38%" cy="32%" r="62%">
                <stop offset="54%" stopColor="#F5F7FA" stopOpacity="0.72" />
                <stop offset="72%" stopColor="#D8DCE4" stopOpacity="0.88" />
                <stop offset="86%" stopColor="#FFFFFF" stopOpacity="0.56" />
                <stop offset="100%" stopColor="#B8BDC7" stopOpacity="0.76" />
              </radialGradient>

              <path id={`rim-top-${uid}`} d="M 24,300 A 276,276 0 1,1 576,300" />
              <path id={`rim-bottom-${uid}`} d="M 24,300 A 276,276 0 0,0 576,300" />
            </defs>

            <g mask={`url(#disc-mask-${uid})`}>
              {/* ROTATING PRINT LAYER (spins beneath fixed studio glare & polycarbonate bevels!) */}
              <g transform={`rotate(${labelSpinDeg} 300 300)`}>
                <DiscArtwork event={event} />

                {[130, 175, 220, 260].map((r) => (
                  <circle
                    key={r}
                    cx="300"
                    cy="300"
                    r={r}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.045"
                    strokeWidth="0.6"
                    pointerEvents="none"
                  />
                ))}

                <text
                  fill={event.palette.rimTextColor}
                  fontSize="7.4"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight="500"
                  letterSpacing="2.4"
                  opacity="0.72"
                >
                  <textPath href={`#rim-top-${uid}`} startOffset="50%" textAnchor="middle">
                    {event.rimCredits}
                  </textPath>
                </text>

                <text
                  fill={event.palette.rimTextColor}
                  fontSize="6.8"
                  fontFamily="IBM Plex Mono, monospace"
                  letterSpacing="2.4"
                  opacity="0.55"
                >
                  <textPath href={`#rim-bottom-${uid}`} startOffset="50%" textAnchor="middle">
                    {event.rimFooter}
                  </textPath>
                </text>

                <g>
                  {event.discTitleTop && (
                    <text
                      x="300"
                      y="404"
                      textAnchor="middle"
                      fill={event.palette.titleColor}
                      fontSize="8.5"
                      fontFamily="IBM Plex Mono, monospace"
                      letterSpacing="3.4"
                      opacity="0.74"
                    >
                      {event.discTitleTop}
                    </text>
                  )}

                  <text
                    x="300"
                    y={event.discTitleSub ? '450' : '462'}
                    textAnchor="middle"
                    fill={event.palette.titleColor}
                    fontFamily={titleFont}
                    fontSize={
                      event.palette.titleFont === 'condensed' ||
                      event.palette.titleFont === 'stencil'
                        ? '58'
                        : event.palette.titleFont === 'syne'
                          ? '42'
                          : '44'
                    }
                    fontWeight={event.palette.titleFont === 'grotesque' ? '700' : '600'}
                    letterSpacing={event.palette.titleFont === 'condensed' ? '2.5' : '-1'}
                  >
                    {event.discTitleMain}
                  </text>

                  {event.discTitleSub && (
                    <text
                      x="300"
                      y="490"
                      textAnchor="middle"
                      fill={
                        event.id === 'cinewars-27'
                          ? event.palette.accent
                          : event.palette.titleColor
                      }
                      fontFamily={titleFont}
                      fontSize={
                        event.palette.titleFont === 'condensed' ||
                        event.palette.titleFont === 'stencil'
                          ? '38'
                          : '32'
                      }
                      fontWeight="600"
                      letterSpacing="2.5"
                    >
                      {event.discTitleSub}
                    </text>
                  )}

                  <text
                    x="300"
                    y="526"
                    textAnchor="middle"
                    fill={event.palette.titleColor}
                    fontFamily="Cormorant Garamond, Georgia, serif"
                    fontSize="13.5"
                    fontWeight="600"
                    letterSpacing="2.4"
                    opacity="0.88"
                  >
                    FRAMES ’27 · REC
                  </text>
                </g>
              </g>

              {/* FIXED ROOM STUDIO GLARE & BEVELS */}
              <circle cx="300" cy="300" r="293" fill={`url(#studio-sweep-${uid})`} pointerEvents="none" />
              <circle cx="300" cy="300" r="293" fill={`url(#softbox-bar-${uid})`} pointerEvents="none" />

              <circle cx="300" cy="300" r="295.5" fill="none" stroke={`url(#rim-grad-${uid})`} strokeWidth="5.2" />
              <circle cx="300" cy="300" r="292.4" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.9" />
              <circle cx="300" cy="300" r="297.8" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" />

              <circle cx="300" cy="300" r="82" fill="none" stroke="rgba(245,247,250,0.48)" strokeWidth="20" />
              <circle cx="300" cy="300" r="92" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="1.2" />
              <circle cx="300" cy="300" r="84" fill="none" stroke="rgba(17,17,17,0.18)" strokeWidth="0.9" />

              <circle cx="300" cy="300" r="66" fill="none" stroke={`url(#hub-frost-${uid})`} strokeWidth="12" />
              <circle cx="300" cy="300" r="71.5" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" />
              <circle cx="300" cy="300" r="68.5" fill="none" stroke="rgba(17,17,17,0.2)" strokeWidth="0.6" />
              <circle cx="300" cy="300" r="65.5" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="0.6" />
              <circle cx="300" cy="300" r="62.5" fill="none" stroke="rgba(17,17,17,0.18)" strokeWidth="0.6" />

              <circle cx="300" cy="300" r="55" fill="none" stroke="rgba(238,240,245,0.78)" strokeWidth="10" />
              <circle cx="300" cy="300" r="50.4" fill="none" stroke="rgba(17,17,17,0.34)" strokeWidth="1.1" />
            </g>
          </svg>
        </div>

        {/* ================= BACK IRIDESCENT OPTICAL DATA SIDE ================= */}
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible">
            <defs>
              <mask id={`disc-back-mask-${uid}`}>
                <rect x="0" y="0" width="600" height="600" fill="black" />
                <circle cx="300" cy="300" r="298" fill="white" />
                <circle cx="300" cy="300" r="50" fill="black" />
              </mask>
              <linearGradient id={`iridescent-${uid}`} x1="0%" y1="15%" x2="100%" y2="85%">
                <stop offset="0%" stopColor="#1B342E" />
                <stop offset="22%" stopColor="#262B38" />
                <stop offset="48%" stopColor="#1A1E2A" />
                <stop offset="72%" stopColor="#3B252E" />
                <stop offset="100%" stopColor="#212D3C" />
              </linearGradient>
              <radialGradient id={`irid-flare-${uid}`} cx="36%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#5BE6C4" stopOpacity="0.24" />
                <stop offset="45%" stopColor="#7A94FF" stopOpacity="0.14" />
                <stop offset="75%" stopColor="#E488A2" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1A1E2A" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g mask={`url(#disc-back-mask-${uid})`}>
              <circle cx="300" cy="300" r="298" fill={`url(#iridescent-${uid})`} />
              <circle cx="300" cy="300" r="298" fill={`url(#irid-flare-${uid})`} />

              {[120, 155, 192, 228, 264, 286].map((r) => (
                <circle
                  key={r}
                  cx="300"
                  cy="300"
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.7"
                />
              ))}

              <text
                x="300"
                y="188"
                textAnchor="middle"
                fill="rgba(255,255,255,0.34)"
                fontSize="8"
                fontFamily="IBM Plex Mono, monospace"
                letterSpacing="2.4"
              >
                BD-ROM · FRAMES-27-{event.code} · REC FILM ARCHIVE
              </text>

              <circle cx="300" cy="300" r="295.5" fill="none" stroke={`url(#rim-grad-${uid})`} strokeWidth="5.2" />
              <circle cx="300" cy="300" r="82" fill="none" stroke="rgba(245,247,250,0.36)" strokeWidth="20" />
              <circle cx="300" cy="300" r="66" fill="none" stroke="rgba(223,226,233,0.7)" strokeWidth="12" />
              <circle cx="300" cy="300" r="55" fill="none" stroke="rgba(238,240,245,0.65)" strokeWidth="10" />
              <circle cx="300" cy="300" r="50.4" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
