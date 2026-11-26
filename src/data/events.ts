export interface PullQuote {
  publication: string;
  quoteLine1: string;
  quoteLine2: string;
  stars: number; // e.g., 5 or 4.5
}

export interface DiscPalette {
  bgPrimary: string;
  bgSecondary: string;
  accent: string;
  titleColor: string;
  rimTextColor: string;
  titleFont: 'condensed' | 'bodoni' | 'syne' | 'serif' | 'grotesque' | 'stencil';
  motif: 'cinewars' | 'nalaiya' | 'script' | 'lens' | 'maven' | 'spoof';
}

export interface EventItem {
  id: string;
  code: string;
  indexNumber: string;
  title: string;
  discTitleTop?: string;
  discTitleMain: string;
  discTitleSub?: string;
  category: string;
  edition: string;
  format: string;
  coordinators: string[];
  tagline: string;
  rimCredits: string;
  rimFooter: string;
  pullQuotes: [PullQuote, PullQuote];
  day: 'Day 01 · Jan 22, 2027' | 'Day 02 · Jan 23, 2027';
  timeSlot: string;
  venue: string;
  teamMin: number;
  teamMax: number;
  teamLabel: string;
  prizePool: string;
  entryFee: string;
  requiresLink: boolean;
  linkLabel?: string;
  linkPlaceholder?: string;
  overview: string;
  rules: string[];
  judgingCriteria: { label: string; weight: string }[];
  palette: DiscPalette;
}

export const FESTIVAL_EVENTS: EventItem[] = [
  {
    id: 'cinewars-27',
    code: 'CW',
    indexNumber: '01',
    title: 'CINEWARS ’27',
    discTitleTop: 'OFFICIAL SELECTION · REC',
    discTitleMain: 'CINEWARS',
    discTitleSub: '’27',
    category: 'Flagship Short Film Competition',
    edition: 'Jan 2027 · REC',
    format: '2-Round Script-to-Screen (5 Min Max Cut)',
    coordinators: ['Aarav Krishnan', 'Meera Nair'],
    tagline: 'The ultimate inter-college filmmaking battleground.',
    rimCredits:
      'FRAMES ’27 · FILM CLUB REC · FLAGSHIP SHORT FILM COMPETITION · 2-ROUND SCRIPT-TO-SCREEN · 5 MIN MAX CUT · PRIZE POOL ₹25,000',
    rimFooter: 'DIRECTED BY STUDENT AUTEURS · JAN 2027 · REC',
    pullQuotes: [
      {
        publication: 'FRAMES JURY DESK',
        quoteLine1: '“PURE UNFILTERED',
        quoteLine2: 'INTER-COLLEGE CINEMA”',
        stars: 5,
      },
      {
        publication: 'REC FILM ARCHIVE',
        quoteLine1: '“FIVE MINUTES THAT',
        quoteLine2: 'COMMAND THE ROOM”',
        stars: 4.5,
      },
    ],
    day: 'Day 01 · Jan 22, 2027',
    timeSlot: '10:00 AM — 01:00 PM (Finals Day 02 · 02:30 PM)',
    venue: 'Main Auditorium · REC',
    teamMin: 1,
    teamMax: 6,
    teamLabel: '1–6 Crew Members',
    prizePool: '₹25,000 + Best Picture Laurel',
    entryFee: '₹350 / Crew',
    requiresLink: true,
    linkLabel: 'Round 1 Cut / Showreel Link (YouTube Unlisted or Google Drive)',
    linkPlaceholder: 'https://youtu.be/... or https://drive.google.com/file/...',
    overview:
      'The marquee inter-college short film showdown of FRAMES ’27. Shortlisted teams from Round 1 receive an on-spot thematic prompt and 24 hours to shoot, cut, and color a 5-minute narrative film screened before our guest jury.',
    rules: [
      'Round 1 accepts any original student short film (max 8 mins) submitted via unlisted YouTube or Google Drive link.',
      'Top 8 crews advance to Round 2: a 24-hour campus/city Script-to-Screen sprint with a 5-minute strict runtime cap (including credits).',
      'Non-Tamil/English dialogues must carry burnt-in English subtitles at 1080p H.264.',
      'Original score or properly licensed/royalty-free stems only; copyright strikes incur immediate disqualification.',
      'All crew members must carry valid college ID cards at check-in.',
    ],
    judgingCriteria: [
      { label: 'Screenplay & Structure', weight: '30%' },
      { label: 'Direction & Performance', weight: '25%' },
      { label: 'Cinematography & Lighting', weight: '25%' },
      { label: 'Editing & Sound Design', weight: '20%' },
    ],
    palette: {
      bgPrimary: '#160D0E',
      bgSecondary: '#C83B28',
      accent: '#E9C68D',
      titleColor: '#F3F2EE',
      rimTextColor: '#E9C68D',
      titleFont: 'condensed',
      motif: 'cinewars',
    },
  },
  {
    id: 'nalaiya-iyakunar',
    code: 'NI',
    indexNumber: '02',
    title: 'NALAIYA IYAKUNAR',
    discTitleTop: 'DIRECTOR’S CHAIR PITCH',
    discTitleMain: 'NALAIYA',
    discTitleSub: 'IYAKUNAR',
    category: 'Directing & Pitching',
    edition: 'Jan 2027 · REC',
    format: 'Live Jury Pitch + Scene Breakdown',
    coordinators: ['Vikramaditya R', 'Divya Bharathi'],
    tagline: "Step into the director's chair and defend your vision.",
    rimCredits:
      'FRAMES ’27 · FILM CLUB REC · DIRECTING & PITCHING · LIVE JURY PITCH + SCENE BREAKDOWN · PRIZE POOL ₹15,000',
    rimFooter: 'AUTEUR SERIES · MADRAS EDITION · JAN 2027',
    pullQuotes: [
      {
        publication: 'THE DIRECTORS GUILD',
        quoteLine1: '“COMMANDING AUTEUR',
        quoteLine2: 'VISION ON STAGE”',
        stars: 5,
      },
      {
        publication: 'SOUTH CINE REVIEW',
        quoteLine1: '“WHERE NEXT-GEN',
        quoteLine2: 'STORYTELLERS ARE BORN”',
        stars: 5,
      },
    ],
    day: 'Day 01 · Jan 22, 2027',
    timeSlot: '01:30 PM — 04:30 PM',
    venue: 'AV Seminar Hall II · REC',
    teamMin: 1,
    teamMax: 2,
    teamLabel: '1–2 Members (Director + Co-Writer)',
    prizePool: '₹15,000 + Production Mentorship',
    entryFee: '₹200 / Entry',
    requiresLink: false,
    linkLabel: 'Optional Lookbook / Pitch Deck Link (Google Drive / PDF)',
    linkPlaceholder: 'https://drive.google.com/... (optional)',
    overview:
      'Modeled after classic Tamil auteur pitch rooms. Directors present an original short-film logline, visual lookbook, and a live shot-by-shot scene breakdown before facing rapid-fire critique from working industry filmmakers.',
    rules: [
      'Each team gets 6 minutes to pitch their original concept + 4 minutes of live jury interrogation.',
      'Bring a 1-page treatment and a visual moodboard (6–10 frames) on a USB drive or linked PDF.',
      'Round 2 finalists must direct a live 90-second dramatic blocking exercise with volunteer actors on stage.',
      'Bilingual pitches (Tamil / English) are equally welcomed.',
    ],
    judgingCriteria: [
      { label: 'Originality of Premise', weight: '35%' },
      { label: 'Visual & Blocking Clarity', weight: '30%' },
      { label: 'Jury Defense & Composure', weight: '20%' },
      { label: 'Feasibility & Pacing', weight: '15%' },
    ],
    palette: {
      bgPrimary: '#111622',
      bgSecondary: '#D19336',
      accent: '#F1E2C2',
      titleColor: '#F3F2EE',
      rimTextColor: '#F1E2C2',
      titleFont: 'bodoni',
      motif: 'nalaiya',
    },
  },
  {
    id: 'script-to-screen',
    code: 'SS',
    indexNumber: '03',
    title: 'SCRIPT TO SCREEN',
    discTitleTop: 'LIVE SET & BLOCKING LAB',
    discTitleMain: 'SCRIPT TO',
    discTitleSub: 'SCREEN',
    category: 'Filmmaking Workshop',
    edition: 'Jan 2027 · REC',
    format: 'Hands-On Live Set & Blocking Lab',
    coordinators: ['Karthik Subramanian', 'Ananya S'],
    tagline: 'From raw screenplay pages to blocked camera frames.',
    rimCredits:
      'FRAMES ’27 · FILM CLUB REC · FILMMAKING WORKSHOP · HANDS-ON LIVE SET & BLOCKING LAB · CERTIFICATE INCLUDED',
    rimFooter: 'PRODUCTION WORKSHOP · STUDIO B · JAN 2027',
    pullQuotes: [
      {
        publication: 'CRAFT & CAMERA',
        quoteLine1: '“TACTILE BLOCKING LAB',
        quoteLine2: 'WITH REAL RIGS”',
        stars: 5,
      },
      {
        publication: 'REC PRODUCTION LAB',
        quoteLine1: '“EVERY FRAME EARNED',
        quoteLine2: 'FROM PAGE ONE”',
        stars: 4.5,
      },
    ],
    day: 'Day 01 · Jan 22, 2027',
    timeSlot: '09:30 AM — 12:30 PM',
    venue: 'Soundstage Studio B · REC',
    teamMin: 1,
    teamMax: 1,
    teamLabel: 'Individual Pass (40 Seats)',
    prizePool: 'Signed Certificate + Live Shoot Credit',
    entryFee: '₹150 / Delegate',
    requiresLink: false,
    overview:
      'A tactile, floor-taped production workshop dissecting how a two-page scene moves from marked-up script paper to 3-point lighting setups, 180-degree axis choreography, and cinema prime lensing.',
    rules: [
      'Open to all college students; limited to 40 hands-on seats on a first-registered basis.',
      'Printed script breakdowns, overhead floorplans, and shot-list sheets are provided at check-in.',
      'Participants rotate through Director, 1st AC, Gaffer, and Boom Operator stations during the live set exercise.',
      'No prior camera ownership required—cinema rig and LED fixtures are supplied by Film Club REC.',
    ],
    judgingCriteria: [
      { label: 'Hands-On Participation', weight: 'Non-Competitive Lab' },
      { label: 'Scene Blocking Exercise', weight: 'Live Critique' },
    ],
    palette: {
      bgPrimary: '#242C22',
      bgSecondary: '#E7E3D7',
      accent: '#C9B27C',
      titleColor: '#111111',
      rimTextColor: '#E7E3D7',
      titleFont: 'grotesque',
      motif: 'script',
    },
  },
  {
    id: 'narrative-lens',
    code: 'NL',
    indexNumber: '04',
    title: 'NARRATIVE LENS',
    discTitleTop: 'SILENT VISUAL STORYTELLING',
    discTitleMain: 'NARRATIVE',
    discTitleSub: 'LENS',
    category: 'Cinematography & Visual Storytelling',
    edition: 'Jan 2027 · REC',
    format: '3-Frame Photo/Video Essay Challenge',
    coordinators: ['Rohan Verma', 'Shreya Menon'],
    tagline: 'Tell a complete story without a single line of dialogue.',
    rimCredits:
      'FRAMES ’27 · FILM CLUB REC · CINEMATOGRAPHY · 3-FRAME PHOTO/VIDEO ESSAY CHALLENGE · PRIZE POOL ₹12,000',
    rimFooter: 'ANAMORPHIC EDITION · ZERO DIALOGUE · JAN 2027',
    pullQuotes: [
      {
        publication: 'VISUAL POETICS',
        quoteLine1: '“SILENCE SPEAKS THROUGH',
        quoteLine2: 'PURE LIGHT AND SHADOW”',
        stars: 5,
      },
      {
        publication: 'CELLULOID QUARTERLY',
        quoteLine1: '“THREE FRAMES, ONE',
        quoteLine2: 'UNFORGETTABLE ARC”',
        stars: 5,
      },
    ],
    day: 'Day 02 · Jan 23, 2027',
    timeSlot: '10:30 AM — 01:00 PM',
    venue: 'Gallery Atrium · REC',
    teamMin: 1,
    teamMax: 2,
    teamLabel: '1–2 Visual Artists',
    prizePool: '₹12,000 + Gallery Exhibition Print',
    entryFee: '₹180 / Team',
    requiresLink: true,
    linkLabel: '3-Frame Essay / Portfolio Folder (Google Drive or YouTube Unlisted)',
    linkPlaceholder: 'https://drive.google.com/drive/folders/...',
    overview:
      'Pure visual storytelling stripped of spoken exposition. Entrants craft a beginning, turn, and resolution across exactly three composed still frames—or a 45-second silent three-shot moving sequence.',
    rules: [
      'Submissions must consist of exactly 3 sequential photographs OR 3 locked/moving video shots (max 45s total).',
      'Zero spoken dialogue, zero intertitles, and zero explanatory captions inside the frames.',
      'Color grading and natural ambient sound (for video essays) are permitted; AI-generated imagery is strictly prohibited.',
      'Finalists will present an on-campus lightning 3-frame prompt challenge on Day 2.',
    ],
    judgingCriteria: [
      { label: 'Narrative Arc Across 3 Frames', weight: '40%' },
      { label: 'Composition & Lighting', weight: '35%' },
      { label: 'Color & Mood Cohesion', weight: '25%' },
    ],
    palette: {
      bgPrimary: '#0E1F24',
      bgSecondary: '#7EA5AB',
      accent: '#ECEBE5',
      titleColor: '#ECEBE5',
      rimTextColor: '#CFE2E5',
      titleFont: 'serif',
      motif: 'lens',
    },
  },
  {
    id: 'movie-maven',
    code: 'MM',
    indexNumber: '05',
    title: 'MOVIE MAVEN',
    discTitleTop: 'AUDIO-VISUAL & FRAME QUIZ',
    discTitleMain: 'MOVIE',
    discTitleSub: 'MAVEN',
    category: 'Cinema Trivia & Critique',
    edition: 'Jan 2027 · REC',
    format: 'Multi-Round Audio-Visual & Frame Quiz',
    coordinators: ['Siddharth Menon', 'Kavya Priya'],
    tagline: 'Only true cinephiles survive the final cut.',
    rimCredits:
      'FRAMES ’27 · FILM CLUB REC · CINEMA TRIVIA & CRITIQUE · MULTI-ROUND AUDIO-VISUAL & FRAME QUIZ · PRIZE POOL ₹10,000',
    rimFooter: 'ARCHIVAL TRIVIA · WORLD & INDIAN CINEMA · JAN 2027',
    pullQuotes: [
      {
        publication: 'CINEPHILE CHRONICLE',
        quoteLine1: '“RAZOR-SHARP TRIVIA',
        quoteLine2: 'FOR TRUE FILM NERDS”',
        stars: 5,
      },
      {
        publication: 'MADRAS FILM SOCIETY',
        quoteLine1: '“EVERY FRAME IS A',
        quoteLine2: 'TEST OF MEMORY”',
        stars: 4.5,
      },
    ],
    day: 'Day 02 · Jan 23, 2027',
    timeSlot: '01:00 PM — 03:30 PM',
    venue: 'Mini Auditorium · REC',
    teamMin: 2,
    teamMax: 3,
    teamLabel: 'Teams of 2–3 Cinephiles',
    prizePool: '₹10,000 + Criterion Collector Box',
    entryFee: '₹150 / Team',
    requiresLink: false,
    overview:
      'A high-voltage three-round cinema battle covering Tamil, Indian, and World Cinema—from isolated 1-second score cues and silhouette frame IDs to A24/Criterion lore and rapid-fire buzzer rounds.',
    rules: [
      'Teams of 2 to 3 members (cross-college teams permitted with valid IDs).',
      'Round 1: Written & Visual Screening Prelims (25 frame/audio questions).',
      'Top 6 teams enter the On-Stage Finals: Connect the Cut, Blind Needle-Drop Score ID, and Rapid Director Roulette.',
      'Electronic devices must remain sealed during all rounds.',
    ],
    judgingCriteria: [
      { label: 'Prelims Accuracy', weight: 'Qualifier' },
      { label: 'Buzzer & Audio-Visual Recall', weight: 'Finals Points' },
    ],
    palette: {
      bgPrimary: '#0E1428',
      bgSecondary: '#D8DF36',
      accent: '#F3F2EE',
      titleColor: '#D8DF36',
      rimTextColor: '#D8DF36',
      titleFont: 'syne',
      motif: 'maven',
    },
  },
  {
    id: 'spoof-off',
    code: 'SO',
    indexNumber: '06',
    title: 'SPOOF OFF',
    discTitleTop: 'ON-STAGE PARODY SHOWDOWN',
    discTitleMain: 'SPOOF',
    discTitleSub: 'OFF',
    category: 'Live Acting & Parody',
    edition: 'Jan 2027 · REC',
    format: '4-Minute On-Stage Scene Recreation',
    coordinators: ['Nithin Raj', 'Harshini V'],
    tagline: 'Iconic scenes, unhinged comedic reinvention.',
    rimCredits:
      'FRAMES ’27 · FILM CLUB REC · LIVE ACTING & PARODY · 4-MINUTE ON-STAGE SCENE RECREATION · PRIZE POOL ₹12,000',
    rimFooter: 'MADE FOR THE AMPHITHEATRE · GRAND FINALE · JAN 2027',
    pullQuotes: [
      {
        publication: 'STAGE & SATIRE',
        quoteLine1: '“UNHINGED TIMING',
        quoteLine2: 'AND PURE CHAOS”',
        stars: 5,
      },
      {
        publication: 'FESTIVAL ENCORE',
        quoteLine1: '“THE CROWD-PLEASING',
        quoteLine2: 'CLOSING RIOT”',
        stars: 5,
      },
    ],
    day: 'Day 02 · Jan 23, 2027',
    timeSlot: '04:30 PM — 06:30 PM',
    venue: 'Open Air Amphitheatre · REC',
    teamMin: 3,
    teamMax: 7,
    teamLabel: '3–7 Performers + Tech',
    prizePool: '₹12,000 + Crowd Favorite Trophy',
    entryFee: '₹250 / Troupe',
    requiresLink: false,
    overview:
      'Take an iconic cult scene—Tamil mass, Hollywood thriller, or arthouse drama—and flip its genre, dialogue, and blocking inside out in a high-energy 4-minute live stage spoof with Foley props and live cues.',
    rules: [
      'Strictly 4 minutes on stage (30-second buffer for prop setup; bell rings at 4:00).',
      'Teams may bring handheld props and pre-cued background tracks (MP3 on pen drive).',
      'Parody must clearly riff on an identifiable film or scene while keeping humor campus-appropriate.',
      'Surprise 30-second genre-twist card drawn live during the final minute for bonus jury points.',
    ],
    judgingCriteria: [
      { label: 'Comedic Timing & Writing', weight: '35%' },
      { label: 'Acting & Physicality', weight: '30%' },
      { label: 'Originality of Twist', weight: '20%' },
      { label: 'Audience & Stage Command', weight: '15%' },
    ],
    palette: {
      bgPrimary: '#C6471E',
      bgSecondary: '#16110F',
      accent: '#F4DFC8',
      titleColor: '#16110F',
      rimTextColor: '#16110F',
      titleFont: 'stencil',
      motif: 'spoof',
    },
  },
];
