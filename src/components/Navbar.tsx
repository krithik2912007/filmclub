import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { EventItem } from '../data/events';

interface NavbarProps {
  events: EventItem[];
  activeIndex: number;
  activeView: 'events' | 'schedule' | 'dossier';
  statusLabel: string | null;
  isIndexOpen: boolean;
  onToggleIndex: () => void;
  onCloseIndex: () => void;
  onSelectView: (view: 'events' | 'schedule') => void;
  onSelectEvent: (index: number) => void;
}

const HoverLabel: React.FC<{ text: string }> = ({ text }) => (
  <span className="a24-hover-link">
    <span className="a24-hover-primary">{text}</span>
    <span className="a24-hover-secondary" aria-hidden="true">
      {text}
    </span>
  </span>
);

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeIndex,
  activeView,
  statusLabel,
  isIndexOpen,
  onToggleIndex,
  onCloseIndex,
  onSelectView,
  onSelectEvent,
}) => {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isIndexOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        onCloseIndex();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseIndex();
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isIndexOpen, onCloseIndex]);

  return (
    <>
      <AnimatePresence>
        {isIndexOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onCloseIndex}
            className="fixed inset-0 z-40 bg-black/28 backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>

      {/* Fixed Centered Nav: top bar on desktop (>=768px), crisp white floating pill at bottom on mobile */}
      <header
        ref={navRef}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-0 md:left-0 md:right-0 md:translate-x-0 z-50 flex flex-col items-center pointer-events-none"
      >
        <div
          className={`pointer-events-auto relative flex flex-col items-center transition-colors duration-300 ${
            isIndexOpen
              ? 'bg-white shadow-[0_18px_50px_rgba(0,0,0,0.16)]'
              : activeView === 'dossier'
                ? 'bg-white md:w-full md:bg-[#F3F2EE]/92 md:backdrop-blur-md md:border-b md:border-[#111111]/10 shadow-[0_6px_24px_rgba(0,0,0,0.08)] md:shadow-none'
                : 'bg-white md:bg-transparent shadow-[0_6px_24px_rgba(0,0,0,0.08)] md:shadow-none'
          }`}
        >
          <nav
            aria-label="Primary Navigation"
            className="flex items-center justify-center px-5 py-2.5 md:px-4 md:pt-2.5 md:pb-1.5 gap-5 sm:gap-7 whitespace-nowrap"
          >
            {/* Brand Wordmark */}
            <button
              type="button"
              onClick={() => {
                onSelectView('events');
                onSelectEvent(0);
                onCloseIndex();
              }}
              className="font-serif-display text-[17px] sm:text-[18px] tracking-[-0.02em] font-semibold text-[#111111] px-1 py-0.5 cursor-pointer hover:opacity-75 transition-opacity whitespace-nowrap"
            >
              FRAMES ’27
            </button>

            {statusLabel ? (
              <motion.span
                key={statusLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.72, y: 0 }}
                transition={{ duration: 0.16 }}
                className="font-sans text-[13px] font-medium tracking-[-0.02em] text-[#111111] px-1 py-0.5"
              >
                {statusLabel}
              </motion.span>
            ) : (
              <div className="flex items-center gap-5 sm:gap-7">
                {/* Events Link */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('events');
                    onCloseIndex();
                  }}
                  className={`relative text-[13px] font-medium tracking-[-0.02em] px-1 py-0.5 transition-opacity cursor-pointer ${
                    activeView === 'events'
                      ? 'text-[#111111] opacity-100'
                      : 'text-[#111111] opacity-55 hover:opacity-95'
                  }`}
                >
                  <HoverLabel text="Events" />
                  {activeView === 'events' && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute left-1/2 -bottom-1 h-[3.5px] w-[3.5px] -translate-x-1/2 rounded-full bg-[#111111]"
                    />
                  )}
                </button>

                {/* Schedule Link */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectView(activeView === 'schedule' ? 'events' : 'schedule');
                    onCloseIndex();
                  }}
                  className={`relative text-[13px] font-medium tracking-[-0.02em] px-1 py-0.5 transition-opacity cursor-pointer ${
                    activeView === 'schedule'
                      ? 'text-[#111111] opacity-100'
                      : 'text-[#111111] opacity-55 hover:opacity-95'
                  }`}
                >
                  <HoverLabel text="Schedule" />
                  {activeView === 'schedule' && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute left-1/2 -bottom-1 h-[3.5px] w-[3.5px] -translate-x-1/2 rounded-full bg-[#111111]"
                    />
                  )}
                </button>

                {/* Index Quick-Jump Dropdown Trigger (hidden on mobile Dossier view just like A24!) */}
                <button
                  type="button"
                  onClick={onToggleIndex}
                  aria-expanded={isIndexOpen}
                  className={`items-center gap-1 text-[13px] font-medium tracking-[-0.02em] text-[#111111] px-1.5 py-0.5 cursor-pointer hover:opacity-75 transition-opacity ${
                    activeView === 'dossier' ? 'hidden md:inline-flex' : 'inline-flex'
                  }`}
                >
                  <span className="relative inline-flex h-[18px] w-[38px] overflow-hidden justify-end">
                    <motion.span
                      initial={false}
                      animate={{ y: isIndexOpen ? -20 : 0 }}
                      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                      className="inline-block"
                    >
                      <HoverLabel text="Index" />
                    </motion.span>
                    <motion.span
                      initial={false}
                      animate={{ y: isIndexOpen ? 0 : 20 }}
                      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute right-0 inline-block font-mono text-[12px]"
                    >
                      0{events.length}
                    </motion.span>
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      isIndexOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </nav>

          {/* Expanding Hairline Index Dropdown (0.62s open / 0.46s close matching A24) */}
          <AnimatePresence>
            {isIndexOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.56, ease: [0.32, 0.72, 0, 1] }}
                className="w-[310px] sm:w-[390px] overflow-hidden bg-white border-t border-[#111111]/15 order-first md:order-last"
              >
                <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#111111]/15">
                  <span className="font-eyebrow text-[#111111]/60">
                    FRAMES ’27 · DISC INDEX
                  </span>
                  <span className="font-eyebrow text-[#111111]/60">
                    FORMAT / DAY
                  </span>
                </div>

                <ul className="divide-y divide-[#111111]/12 py-1 max-h-[300px] overflow-y-auto swiss-scroll">
                  {events.map((item, idx) => {
                    const isCurrent = idx === activeIndex;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectView('events');
                            onSelectEvent(idx);
                            onCloseIndex();
                          }}
                          className={`group flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#111111] text-[#F3F2EE]'
                              : 'text-[#111111] hover:bg-[#111111] hover:text-[#F3F2EE]'
                          }`}
                        >
                          <div className="flex items-baseline gap-2.5 min-w-0">
                            <span
                              className={`font-mono text-[10px] ${
                                isCurrent
                                  ? 'text-[#F3F2EE]/70'
                                  : 'text-[#111111]/45 group-hover:text-[#F3F2EE]/70'
                              }`}
                            >
                              {item.indexNumber}
                            </span>
                            <span className="text-[13px] font-medium tracking-[-0.02em] truncate">
                              {item.title}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[10px] shrink-0 ${
                              isCurrent
                                ? 'text-[#F3F2EE]/80'
                                : 'text-[#111111]/55 group-hover:text-[#F3F2EE]/80'
                            }`}
                          >
                            {item.day.split('·')[0].trim()} · {item.code}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};
