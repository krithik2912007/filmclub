import React from 'react';
import { Download, Printer, CheckCircle2 } from 'lucide-react';
import type { EventItem } from '../data/events';

export interface RegistrationPayload {
  passId: string;
  event: EventItem;
  entryMode: 'solo' | 'team';
  teamName?: string;
  leadName: string;
  college: string;
  email: string;
  phone: string;
  members: string[];
  submissionLink?: string;
  issuedAt: string;
}

interface TicketStubProps {
  registration: RegistrationPayload;
}

export const TicketStub: React.FC<TicketStubProps> = ({ registration }) => {
  const {
    passId,
    event,
    entryMode,
    teamName,
    leadName,
    college,
    members,
    submissionLink,
    issuedAt,
  } = registration;

  const totalCrew = entryMode === 'solo' ? 1 : 1 + members.filter((m) => m.trim()).length;

  const handleDownloadSvg = () => {
    const safeTitle = event.title.replace(/&/g, '&amp;');
    const safeLead = leadName.replace(/&/g, '&amp;');
    const safeCollege = college.replace(/&/g, '&amp;');
    const safeCategory = event.category.replace(/&/g, '&amp;');
    const safeVenue = event.venue.replace(/&/g, '&amp;');

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="320" viewBox="0 0 760 320">
  <rect width="760" height="320" fill="#F3F2EE" stroke="#111111" stroke-width="2"/>
  <line x1="540" y1="14" x2="540" y2="306" stroke="#111111" stroke-width="1.5" stroke-dasharray="6 6"/>
  <circle cx="540" cy="0" r="14" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
  <circle cx="540" cy="320" r="14" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
  <text x="32" y="40" font-family="monospace" font-size="11" letter-spacing="3" fill="#111111">FRAMES ’27 · FILM CLUB REC · OFFICIAL ADMIT PASS</text>
  <text x="32" y="92" font-family="Georgia, serif" font-size="40" fill="#111111">${safeTitle}</text>
  <text x="32" y="118" font-family="monospace" font-size="11" letter-spacing="2" fill="#891A20">${safeCategory.toUpperCase()}</text>
  <line x1="32" y1="138" x2="508" y2="138" stroke="#111111" stroke-width="0.8"/>
  <text x="32" y="165" font-family="monospace" font-size="10" fill="#555555">LEAD / REGISTRANT</text>
  <text x="32" y="185" font-family="sans-serif" font-size="15" font-weight="600" fill="#111111">${safeLead}${teamName ? ` (${teamName})` : ''}</text>
  <text x="32" y="216" font-family="monospace" font-size="10" fill="#555555">INSTITUTION</text>
  <text x="32" y="236" font-family="sans-serif" font-size="13" fill="#111111">${safeCollege}</text>
  <text x="32" y="274" font-family="monospace" font-size="10" fill="#555555">VENUE: ${safeVenue} · ${event.day}</text>
  <text x="32" y="294" font-family="monospace" font-size="10" fill="#111111">CREW SIZE: ${totalCrew} · ISSUED: ${issuedAt}</text>
  <text x="650" y="54" text-anchor="middle" font-family="monospace" font-size="10" letter-spacing="2" fill="#111111">PASS STUB</text>
  <text x="650" y="94" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" fill="#111111">${passId}</text>
  <rect x="572" y="122" width="156" height="44" fill="#111111"/>
  <text x="650" y="149" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="2" fill="#F3F2EE">ADMIT ${totalCrew} · ${event.code}</text>
  <text x="650" y="206" text-anchor="middle" font-family="monospace" font-size="10" fill="#555555">JAN 2027 · REC CHENNAI</text>
  <text x="650" y="286" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#111111">FRAMES ’27</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FRAMES27-${passId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#111111]">
        <CheckCircle2 className="h-4 w-4 text-[#891A20]" />
        <p className="font-eyebrow text-[#111111]">
          REGISTRATION CONFIRMED · OFFICIAL FESTIVAL PASS GENERATED
        </p>
      </div>

      {/* Perforated A24-Style Cinema Ticket Stub */}
      <div
        id="printable-ticket-stub"
        className="relative flex flex-col sm:flex-row border border-[#111111] bg-[#F3F2EE] text-[#111111] overflow-hidden"
      >
        {/* Main Ticket Body */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#111111]/25 pb-2">
              <span className="font-eyebrow text-[#111111]/70">
                FRAMES ’27 · FILM CLUB REC
              </span>
              <span className="font-mono text-[10px] font-medium bg-[#111111] text-[#F3F2EE] px-1.5 py-0.5">
                {passId}
              </span>
            </div>

            <h3 className="mt-3 font-serif-display text-[32px] leading-none uppercase text-[#111111]">
              {event.title}
            </h3>
            <p className="mt-1 font-eyebrow text-[#891A20]">{event.category}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#111111]/25 pt-3 text-[12px]">
            <div>
              <span className="block font-eyebrow text-[#111111]/55">LEAD / CREW</span>
              <span className="font-medium">
                {leadName}
                {teamName ? ` · ${teamName}` : ''}
              </span>
            </div>
            <div>
              <span className="block font-eyebrow text-[#111111]/55">ENTRY</span>
              <span className="font-medium uppercase">
                {entryMode} ({totalCrew} {totalCrew === 1 ? 'Delegate' : 'Members'})
              </span>
            </div>
            <div className="col-span-2">
              <span className="block font-eyebrow text-[#111111]/55">INSTITUTION</span>
              <span className="font-medium">{college}</span>
            </div>
            <div>
              <span className="block font-eyebrow text-[#111111]/55">SCHEDULE</span>
              <span className="font-medium">{event.day}</span>
            </div>
            <div>
              <span className="block font-eyebrow text-[#111111]/55">VENUE</span>
              <span className="font-medium">{event.venue}</span>
            </div>
            {submissionLink && (
              <div className="col-span-2">
                <span className="block font-eyebrow text-[#111111]/55">FILM / DECK LINK</span>
                <span className="block truncate font-mono text-[11px] text-[#111111]/85">
                  {submissionLink}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Perforation Seam with Semicircular Punches */}
        <div className="relative flex sm:flex-col items-center justify-between border-t sm:border-t-0 sm:border-l border-dashed border-[#111111]/60">
          <span className="hidden sm:block -mt-2.5 -ml-[9px] h-4 w-4 rounded-full border border-[#111111] bg-white" />
          <span className="hidden sm:block -mb-2.5 -ml-[9px] h-4 w-4 rounded-full border border-[#111111] bg-white" />
        </div>

        {/* Counterfoil Stub */}
        <div className="sm:w-[156px] p-4 flex flex-col justify-between items-start sm:items-center sm:text-center bg-[#EAE8E1]">
          <div className="w-full">
            <p className="font-eyebrow text-[#111111]/60">COUNTERFOIL</p>
            <p className="mt-1 font-mono text-[13px] font-semibold tracking-tight">
              {passId}
            </p>
          </div>

          {/* Crisp Archival Barcode */}
          <div className="my-3 flex h-10 w-full items-stretch justify-center gap-[2px] opacity-85" aria-hidden="true">
            {[2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2, 3, 1, 1, 2].map((w, i) => (
              <span
                key={i}
                className="bg-[#111111]"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>

          <div className="w-full border-t border-[#111111]/25 pt-2">
            <span className="inline-block bg-[#111111] px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#F3F2EE]">
              ADMIT {totalCrew} · {event.code}
            </span>
            <p className="mt-1.5 font-mono text-[9px] text-[#111111]/55">
              ISSUED {issuedAt}
            </p>
          </div>
        </div>
      </div>

      {/* Print & Download Controls */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 bg-[#111111] px-3.5 py-2 text-[12px] font-medium text-[#F3F2EE] hover:bg-[#891A20] transition-colors cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save PDF Stub</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadSvg}
          className="inline-flex items-center gap-1.5 border border-[#111111] px-3.5 py-2 text-[12px] font-medium text-[#111111] hover:bg-[#111111] hover:text-[#F3F2EE] transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download Vector Pass (.SVG)</span>
        </button>
      </div>
    </div>
  );
};
