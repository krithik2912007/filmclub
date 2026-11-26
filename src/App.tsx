import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FESTIVAL_EVENTS } from './data/events';
import { Navbar } from './components/Navbar';
import { DiscCarousel } from './components/DiscCarousel';
import { EditorialChrome } from './components/EditorialChrome';
import { ScheduleOverlay } from './components/ScheduleOverlay';
import { EventDossierView } from './components/EventDossierView';

const LAB_STATUS_WORDS = ['Projecting...', 'Developing...', 'Splicing...', 'Spooling...', 'Printing...'];

export function App() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'events' | 'schedule' | 'dossier'>('events');
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isZoomingIntoDossier, setIsZoomingIntoDossier] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [focusRegisterOnDossier, setFocusRegisterOnDossier] = useState<boolean>(false);
  const zoomTimerRef = useRef<number | null>(null);
  const statusTimerRef = useRef<number | null>(null);

  const activeEvent = FESTIVAL_EVENTS[activeIndex];
  const nextEvent = FESTIVAL_EVENTS[(activeIndex + 1) % FESTIVAL_EVENTS.length];

  const triggerLabTransition = useCallback((onDone: () => void, withZoom = false) => {
    if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    const word = LAB_STATUS_WORDS[Math.floor(Math.random() * LAB_STATUS_WORDS.length)];
    setStatusLabel(word);
    if (withZoom) setIsZoomingIntoDossier(true);

    zoomTimerRef.current = window.setTimeout(() => {
      onDone();
      setIsZoomingIntoDossier(false);
      statusTimerRef.current = window.setTimeout(() => setStatusLabel(null), 160);
    }, withZoom ? 420 : 240);
  }, []);

  const handleSelectIndex = useCallback((idx: number) => {
    setActiveIndex(idx);
    setIsFlipped(false);
  }, []);

  const handleOpenDossier = useCallback(
    (focusRegister = false) => {
      setIsIndexOpen(false);
      setFocusRegisterOnDossier(focusRegister);
      triggerLabTransition(() => {
        setActiveView('dossier');
      }, true);
    },
    [triggerLabTransition]
  );

  const handleBackToStage = useCallback(() => {
    triggerLabTransition(() => {
      setActiveView('events');
      setFocusRegisterOnDossier(false);
    }, false);
  }, [triggerLabTransition]);

  const handleJumpFromSchedule = useCallback(
    (idx: number, openReg?: boolean) => {
      setActiveIndex(idx);
      setIsFlipped(false);
      if (openReg) {
        setFocusRegisterOnDossier(true);
        setActiveView('dossier');
      } else {
        setActiveView('events');
      }
    },
    []
  );

  const handleJumpNextFromDossier = useCallback(() => {
    const nextIdx = (activeIndex + 1) % FESTIVAL_EVENTS.length;
    triggerLabTransition(() => {
      setActiveIndex(nextIdx);
      setIsFlipped(false);
      setFocusRegisterOnDossier(false);
      setActiveView('dossier');
    }, false);
  }, [activeIndex, triggerLabTransition]);

  return (
    <div className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden bg-[#F3F2EE] text-[#111111]">
      {/* Subtle 35mm Film Grain Overlay */}
      <div className="film-grain" aria-hidden="true" />

      {/* Top Centered Navigation & Index Hairline Dropdown */}
      <Navbar
        events={FESTIVAL_EVENTS}
        activeIndex={activeIndex}
        activeView={activeView}
        statusLabel={statusLabel}
        isIndexOpen={isIndexOpen}
        onToggleIndex={() => setIsIndexOpen((v) => !v)}
        onCloseIndex={() => setIsIndexOpen(false)}
        onSelectView={(view) => {
          if (view === 'events' && activeView === 'dossier') {
            handleBackToStage();
          } else {
            setActiveView(view);
          }
        }}
        onSelectEvent={(idx) => {
          handleSelectIndex(idx);
          if (activeView === 'dossier') {
            setActiveView('events');
          }
        }}
      />

      {/* Main Gallery Stage: Swiss Grid Metadata + Diagonal 3-Disc Stage + Dual Pull-Quotes */}
      <main className="relative flex flex-1 flex-col justify-between pt-3">
        <EditorialChrome
          event={activeEvent}
          activeIndex={activeIndex}
          totalCount={FESTIVAL_EVENTS.length}
          onOpenDossier={() => handleOpenDossier(false)}
          isFlipped={isFlipped}
          onToggleFlip={() => setIsFlipped((f) => !f)}
          isSettling={isSettling}
          isZoomingIntoDossier={isZoomingIntoDossier}
        />

        <div className="order-2 relative md:absolute md:inset-0 z-20 flex items-center justify-center my-4 md:my-0 min-h-[330px] sm:min-h-[390px] md:min-h-0">
          <DiscCarousel
            events={FESTIVAL_EVENTS}
            activeIndex={activeIndex}
            onSelectIndex={handleSelectIndex}
            onOpenDossier={() => handleOpenDossier(false)}
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped((f) => !f)}
            isOverlayOpen={isIndexOpen || activeView !== 'events'}
            isZoomingIntoDossier={isZoomingIntoDossier}
            onSettleChange={setIsSettling}
          />
        </div>
      </main>

      {/* Brief White Gallery Flash Overlay during Disc Zoom-Through */}
      <AnimatePresence>
        {isZoomingIntoDossier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.72 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="pointer-events-none fixed inset-0 z-30 bg-[#F3F2EE]"
          />
        )}
      </AnimatePresence>

      {/* Schedule Overlay */}
      <AnimatePresence>
        {activeView === 'schedule' && (
          <ScheduleOverlay
            events={FESTIVAL_EVENTS}
            onClose={() => setActiveView('events')}
            onJumpToEvent={handleJumpFromSchedule}
          />
        )}
      </AnimatePresence>

      {/* Full Editorial Event Dossier & Registration Stub View */}
      <AnimatePresence>
        {activeView === 'dossier' && (
          <EventDossierView
            event={activeEvent}
            nextEvent={nextEvent}
            initialFocusRegister={focusRegisterOnDossier}
            onBackToStage={handleBackToStage}
            onJumpNextEvent={handleJumpNextFromDossier}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
