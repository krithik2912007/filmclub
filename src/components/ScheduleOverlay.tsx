import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import type { EventItem } from '../data/events';

interface ScheduleOverlayProps {
  events: EventItem[];
  onClose: () => void;
  onJumpToEvent: (index: number, openDossier?: boolean) => void;
}

export const ScheduleOverlay: React.FC<ScheduleOverlayProps> = ({
  events,
  onClose,
  onJumpToEvent,
}) => {
  const days: EventItem['day'][] = [
    'Day 01 · Jan 22, 2027',
    'Day 02 · Jan 23, 2027',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#F3F2EE]/96 backdrop-blur-sm pt-14 pb-24 px-4 sm:px-8 swiss-scroll"
    >
      <div className="mx-auto max-w-4xl pt-4">
        <div className="flex items-end justify-between border-b border-[#111111] pb-4">
          <div>
            <p className="font-eyebrow text-[#111111]/65 mb-1">
              FILM CLUB REC · RAJALAKSHMI ENGINEERING COLLEGE
            </p>
            <h2 className="font-serif-display text-[36px] sm:text-[46px] uppercase text-[#111111]">
              FESTIVAL SCHEDULE ’27
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 border border-[#111111] px-3 py-1.5 text-[11px] font-medium text-[#111111] hover:bg-[#111111] hover:text-[#F3F2EE] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Back to Stage</span>
          </button>
        </div>

        <div className="mt-8 grid gap-10">
          {days.map((day) => {
            const dayEvents = events
              .map((ev, idx) => ({ ev, idx }))
              .filter(({ ev }) => ev.day === day);

            return (
              <section key={day}>
                <div className="flex items-center justify-between border-b border-[#111111]/40 pb-2 mb-1">
                  <h3 className="font-eyebrow text-[#111111]">{day}</h3>
                  <span className="font-eyebrow text-[#111111]/55">
                    {dayEvents.length} SESSIONS
                  </span>
                </div>

                <div className="divide-y divide-[#111111]/20 border-b border-[#111111]/40">
                  {dayEvents.map(({ ev, idx }) => (
                    <div
                      key={ev.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 transition-colors hover:bg-[#111111]/[0.03] px-2 -mx-2"
                    >
                      <div className="flex items-start gap-4">
                        <span className="font-mono text-[11px] text-[#111111]/50 pt-1">
                          {ev.indexNumber}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2.5">
                            <h4 className="font-serif-display text-[26px] uppercase text-[#111111]">
                              {ev.title}
                            </h4>
                            <span className="font-eyebrow text-[#891A20]">
                              {ev.category}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[12px] text-[#111111]/70">
                            {ev.timeSlot} · <span className="font-medium text-[#111111]">{ev.venue}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => onJumpToEvent(idx, false)}
                          className="border border-[#111111]/35 px-2.5 py-1 text-[11px] font-medium text-[#111111] hover:border-[#111111] transition-colors cursor-pointer"
                        >
                          Inspect Disc
                        </button>
                        <button
                          type="button"
                          onClick={() => onJumpToEvent(idx, true)}
                          className="inline-flex items-center gap-1 border border-[#111111] bg-[#111111] px-2.5 py-1 text-[11px] font-medium text-[#F3F2EE] hover:bg-[#891A20] hover:border-[#891A20] transition-colors cursor-pointer"
                        >
                          <span>Register</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
