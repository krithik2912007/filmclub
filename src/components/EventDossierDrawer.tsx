import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, X, Film, Users, User } from 'lucide-react';
import type { EventItem } from '../data/events';
import { TicketStub, type RegistrationPayload } from './TicketStub';

interface EventDossierDrawerProps {
  event: EventItem | null;
  isOpen: boolean;
  initialTab: 'dossier' | 'register';
  onClose: () => void;
}

export const EventDossierDrawer: React.FC<EventDossierDrawerProps> = ({
  event,
  isOpen,
  initialTab,
  onClose,
}) => {
  const [tab, setTab] = useState<'dossier' | 'register'>(initialTab);
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
    setTab(initialTab);
  }, [initialTab, event?.id]);

  // Reset form defaults cleanly when switching events
  useEffect(() => {
    if (!event) return;
    setGeneratedStub(null);
    setErrorMsg('');
    setSubmissionLink('');
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
  }, [event]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!event) return null;

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]"
          />

          {/* Slide-over Editorial Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.46, ease: [0.32, 0.72, 0, 1] }}
            aria-label={`${event.title} Dossier and Registration`}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[560px] flex-col border-l border-[#111111] bg-[#F3F2EE] text-[#111111] shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[#111111] px-6 py-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] border border-[#111111] px-1.5 py-0.5">
                    DISC {event.indexNumber}
                  </span>
                  <span className="font-eyebrow text-[#891A20]">{event.category}</span>
                </div>
                <h2 className="mt-2 font-serif-display text-[36px] leading-none uppercase">
                  {event.title}
                </h2>
                <p className="mt-1.5 text-[13px] text-[#111111]/75 italic font-serif">
                  “{event.tagline}”
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="border border-[#111111]/30 p-1.5 text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-[#F3F2EE] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-[#111111]">
              <button
                type="button"
                onClick={() => setTab('dossier')}
                className={`py-2.5 font-eyebrow transition-colors cursor-pointer ${
                  tab === 'dossier'
                    ? 'bg-[#111111] text-[#F3F2EE]'
                    : 'bg-transparent text-[#111111] hover:bg-[#111111]/5'
                }`}
              >
                01 / EVENT DOSSIER & RULES
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`border-l border-[#111111] py-2.5 font-eyebrow transition-colors cursor-pointer ${
                  tab === 'register'
                    ? 'bg-[#111111] text-[#F3F2EE]'
                    : 'bg-transparent text-[#111111] hover:bg-[#111111]/5'
                }`}
              >
                02 / REGISTER & PASS STUB
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 swiss-scroll">
              {tab === 'dossier' ? (
                <div className="space-y-7">
                  {/* Overview */}
                  <p className="text-[13.5px] leading-relaxed text-[#111111]/90">
                    {event.overview}
                  </p>

                  {/* Hairline Specs Table */}
                  <div className="border-t border-[#111111]">
                    {[
                      { k: 'FORMAT', v: event.format },
                      { k: 'TEAM LIMIT', v: event.teamLabel },
                      { k: 'PRIZE POOL', v: event.prizePool },
                      { k: 'ENTRY FEE', v: event.entryFee },
                      { k: 'SCHEDULE', v: `${event.day} · ${event.timeSlot}` },
                      { k: 'VENUE', v: event.venue },
                      { k: 'COORDINATORS', v: event.coordinators.join(' · ') },
                    ].map((row) => (
                      <div
                        key={row.k}
                        className="flex items-baseline justify-between gap-4 border-b border-[#111111]/25 py-2.5"
                      >
                        <span className="font-eyebrow text-[#111111]/65 shrink-0">{row.k}</span>
                        <span className="text-right text-[12.5px] font-medium">{row.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rules */}
                  <div>
                    <h3 className="font-eyebrow text-[#111111] mb-3">
                      COMPETITION RULES & REGULATIONS
                    </h3>
                    <ol className="space-y-2.5 border-t border-[#111111]/25 pt-3">
                      {event.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-3 text-[12.5px] leading-relaxed">
                          <span className="font-mono text-[10px] text-[#891A20] pt-0.5">
                            0{i + 1}
                          </span>
                          <span className="text-[#111111]/88">{rule}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Judging Criteria */}
                  <div>
                    <h3 className="font-eyebrow text-[#111111] mb-3">JURY RUBRIC</h3>
                    <div className="grid grid-cols-2 gap-2.5">
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
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="w-full bg-[#111111] py-3 text-[12px] font-medium tracking-wide uppercase text-[#F3F2EE] hover:bg-[#891A20] transition-colors cursor-pointer"
                    >
                      Proceed to Registration & Pass Generation →
                    </button>
                  </div>
                </div>
              ) : generatedStub ? (
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
                  {/* Entry Type Switch (Solo vs Team) */}
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
                        className="w-full border border-[#111111]/40 bg-white/70 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
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
                        className="w-full border border-[#111111]/40 bg-white/70 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
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
                        className="w-full border border-[#111111]/40 bg-white/70 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
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
                        className="w-full border border-[#111111]/40 bg-white/70 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
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
                        className="w-full border border-[#111111]/40 bg-white/70 px-3 py-2 text-[13px] focus:border-[#111111] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Crew Member List */}
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
                              className="flex-1 border border-[#111111]/40 bg-white/70 px-3 py-1.5 text-[12.5px] focus:border-[#111111] focus:outline-none"
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

                  {/* Unlisted YouTube / Google Drive Link Submission */}
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
                          event.linkPlaceholder ||
                          'https://youtu.be/... or https://drive.google.com/...'
                        }
                        className="w-full border border-[#111111]/40 bg-white/70 px-3 py-2 font-mono text-[12px] focus:border-[#111111] focus:outline-none"
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
