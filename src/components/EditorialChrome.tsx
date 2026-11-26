import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, RotateCw } from 'lucide-react';
import type { EventItem, PullQuote } from '../data/events';

interface EditorialChromeProps {
  event: EventItem;
  activeIndex: number;
  totalCount: number;
  onOpenDossier: () => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  isSettling?: boolean;
  isZoomingIntoDossier?: boolean;
}

const StarRow: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center justify-center gap-[3px]" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => {
      const isHalf = rating >= n - 0.5 && rating < n;
      const isEmpty = rating < n - 0.5;
      if (isEmpty) return null;
      return (
        <svg
          key={n}
          viewBox="0 0 11 10"
          className="h-[11px] w-[11px] text-[#111111]"
          style={isHalf ? { clipPath: 'inset(0 50% 0 0)', marginRight: '-5px' } : undefined}
        >
          <path
            fill="currentColor"
            d="M5.5 0L6.79 3.63L10.65 3.74L7.59 6.08L8.68 9.76L5.5 7.59L2.32 9.76L3.41 6.08L0.35 3.74L4.21 3.63L5.5 0Z"
          />
        </svg>
      );
    })}
  </div>
);

const QuoteColumn: React.FC<{ quote: PullQuote; delayBase: number; className?: string }> = ({
  quote,
  delayBase,
  className = '',
}) => (
  <div className={`flex flex-col items-center text-center gap-3 min-w-[230px] sm:min-w-[260px] ${className}`}>
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, delay: delayBase, ease: [0.32, 0.72, 0, 1] }}
    >
      <StarRow rating={quote.stars} />
    </motion.div>
    <div className="flex flex-col items-center gap-1">
      <div className="overflow-hidden">
        <motion.p
          initial={{ y: '115%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.36, delay: delayBase + 0.04, ease: [0.32, 0.72, 0, 1] }}
          className="font-eyebrow text-[#111111]/85"
        >
          {quote.publication}
        </motion.p>
      </div>
      <div className="font-pullquote text-[18px] sm:text-[21px] text-[#111111]">
        <span className="block overflow-hidden">
          <motion.span
            initial={{ y: '115%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.42, delay: delayBase + 0.08, ease: [0.32, 0.72, 0, 1] }}
            className="block whitespace-nowrap"
          >
            {quote.quoteLine1}
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span
            initial={{ y: '115%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.42, delay: delayBase + 0.14, ease: [0.32, 0.72, 0, 1] }}
            className="block whitespace-nowrap"
          >
            {quote.quoteLine2}
          </motion.span>
        </span>
      </div>
    </div>
  </div>
);

export const EditorialChrome: React.FC<EditorialChromeProps> = ({
  event,
  activeIndex,
  totalCount,
  onOpenDossier,
  isFlipped,
  onToggleFlip,
  isSettling = false,
  isZoomingIntoDossier = false,
}) => {
  const rows = [
    { label: 'CATEGORY', value: event.category },
    { label: 'EDITION', value: event.edition },
    { label: 'FORMAT', value: event.format },
    { label: 'COORDINATORS', value: event.coordinators.join('\n') },
  ];

  return (
    <>
      {/* TOP-LEFT STACKED HAIRLINE METADATA ROWS (Full-width on mobile like A24, compact left on desktop) */}
      <motion.aside
        animate={{ opacity: isZoomingIntoDossier ? 0 : 1 }}
        transition={{ duration: 0.22 }}
        className="order-1 pointer-events-auto z-40 w-full md:max-w-[275px] lg:max-w-[300px] px-3 pt-1 sm:px-5 sm:pt-1"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={event.id}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            className="flex flex-col gap-2"
          >
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.44, ease: [0.32, 0.72, 0, 1] }}
                className="font-serif-display text-[28px] lg:text-[31px] uppercase text-[#111111]"
              >
                {event.title}
              </motion.h1>
            </div>

            <div className="flex flex-col">
              {rows.map((row, idx) => (
                <div
                  key={row.label}
                  className="relative flex items-start justify-between gap-4 py-[6px]"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.46,
                      delay: idx * 0.045,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    style={{ transformOrigin: 'left' }}
                    className="absolute inset-x-0 top-0 h-[0.5px] bg-[#111111]/75"
                  />
                  <div className="overflow-hidden pt-[2px] shrink-0">
                    <motion.span
                      initial={{ y: '115%' }}
                      animate={{ y: '0%' }}
                      transition={{
                        duration: 0.38,
                        delay: idx * 0.045,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="block font-eyebrow text-[#111111]/85"
                    >
                      {row.label}
                    </motion.span>
                  </div>
                  <div className="overflow-hidden text-right">
                    <motion.span
                      initial={{ y: '115%' }}
                      animate={{ y: '0%' }}
                      transition={{
                        duration: 0.42,
                        delay: idx * 0.05 + 0.03,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="block font-meta-value text-right text-[#111111] whitespace-pre-line"
                    >
                      {row.value}
                    </motion.span>
                  </div>
                </div>
              ))}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.46, delay: 0.18, ease: [0.32, 0.72, 0, 1] }}
                style={{ transformOrigin: 'left' }}
                className="h-[0.5px] w-full bg-[#111111]/75"
              />
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenDossier}
                className="group inline-flex items-center gap-1.5 border border-[#111111] bg-[#111111] px-3 py-1.5 text-[11px] font-medium tracking-tight text-[#F3F2EE] transition-colors hover:bg-[#891A20] hover:border-[#891A20] cursor-pointer"
              >
                <span>Open Event Dossier / Register</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <button
                type="button"
                onClick={onToggleFlip}
                title="Flip Blu-ray disc (Spacebar)"
                className="inline-flex items-center gap-1 border border-[#111111]/35 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-[#111111] transition-colors hover:border-[#111111] hover:bg-[#111111]/5 cursor-pointer"
              >
                <RotateCw className={`h-3 w-3 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                <span className="hidden sm:inline">{isFlipped ? 'Front' : 'Flip'}</span>
              </button>
              <span className="ml-auto font-eyebrow text-[#111111]/50 shrink-0">
                0{activeIndex + 1}/0{totalCount}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.aside>

      {/* BOTTOM PULL-QUOTES: dual on >=640px, single primary quote cleanly above mobile bottom pill */}
      <motion.div
        animate={{ opacity: isZoomingIntoDossier ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="order-3 pointer-events-none z-40 flex w-full flex-col items-center justify-end pb-24 md:pb-5 px-4"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isSettling && (
            <motion.div
              key={`${event.id}-quotes`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
            >
              <QuoteColumn quote={event.pullQuotes[0]} delayBase={0.02} />
              <QuoteColumn quote={event.pullQuotes[1]} delayBase={0.08} className="hidden sm:flex" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
