// Every fact on the site comes from Gauri's CVs (public/Gauri_Tichkule_CV.pdf,
// the latest, plus the details of her March 2026 CV) and her own notes, and
// lives here so the story, the work and the full record never drift apart.
// Change the words here, not in the pages.

import { withBase } from "./utils";

export const NAME = "Gauri Tichkule";
export const FIRST_NAME = "Gauri";
export const EMAIL = "gauritichkule@gmail.com";
export const LOCATION = "Milton Keynes, United Kingdom";
export const CV_PATH = withBase("Gauri_Tichkule_CV.pdf");

// From the March 2026 CV. Left empty, every LinkedIn link on the site hides.
export const LINKEDIN_URL = "https://www.linkedin.com/in/gauritichkule";

export type Role = {
  id: string;
  company: string;
  title: string;
  place: string;
  dates: string;
  channel: string;
  summary: string;
  highlights: { value: string; label: string }[];
  points: string[];
};

export const roles: Role[] = [
  {
    id: "navatech",
    company: "Navatech",
    title: "B2B Marketing and CRM Intern",
    place: "United Kingdom",
    dates: "Jun 2026 – Aug 2026",
    channel: "B2B · Health & safety",
    summary: "B2B marketing for Navatech's AI-powered construction safety product: content for construction professionals, answer-engine visibility, and the buyer journey behind the CRM.",
    highlights: [
      { value: "15%", label: "of site content optimised for AEO" },
      { value: "4+", label: "industry blog posts a month" },
    ],
    points: [
      "Optimised 15% of website content for Answer Engine Optimisation (AEO).",
      "Established off-site brand profiles, including Trustpilot, to feed external trust signals into AI search results.",
      "Authored 4+ blog posts a month for construction industry professionals to drive inbound B2B engagement.",
      "Created the customer buyer journey that shaped the CRM set-up at each stage of the journey.",
    ],
  },
  {
    id: "ipg",
    company: "IPG Mediabrands",
    title: "Executive, Media Planning and Buying",
    place: "India",
    dates: "Jun 2024 – Sep 2025",
    channel: "Broadcast · US national TV",
    summary: "Planning and buying US national TV for four global brands, as the link between each client and the networks.",
    highlights: [
      { value: "10%", label: "average saving per campaign" },
      { value: "30%", label: "faster planning turnaround" },
      { value: "97%", label: "client retention across the year" },
    ],
    points: [
      "Planned and bought US national TV for Merck, Floor & Decor, Eggland’s Best and Henkel, acting as the link between each client and the networks, including MTV.",
      "Negotiated 100+ placements a quarter with 20+ networks and media partners, achieving an average 10% saving per campaign.",
      "Created 50+ detailed media estimates and packages in Media Ocean, improving accuracy and reducing planning turnaround time by 30%.",
      "Ran bi-weekly GRP and unit-count analyses, optimising campaign performance and increasing viewership engagement by 12%.",
      "Coordinated 25+ networks and vendors to deliver 95% of activity on target, and kept client retention at 97% across the year.",
    ],
  },
  {
    id: "mediamint",
    company: "Mediamint",
    title: "Platform Support Specialist",
    place: "India",
    dates: "Sep 2021 – May 2024",
    channel: "Digital · Campaign operations",
    summary: "The full digital campaign lifecycle on AdRoll: onboarding clients, troubleshooting campaign issues and optimising live campaigns, plus the CRM integrations around them.",
    highlights: [
      { value: "99.2%", label: "customer satisfaction" },
      { value: "150+", label: "campaigns executed a month" },
      { value: "50+", label: "advertisers onboarded a month" },
    ],
    points: [
      "Executed 150+ paid display, video and retargeting campaigns a month on AdRoll, with rapid recommendations on ad size, budgeting and targeting.",
      "Optimised 100+ multi-channel campaigns each quarter, using analytics and market insight to beat client KPIs.",
      "Led CRM integrations for HubSpot, Mailchimp and Marketo, enabling automation and personalised customer journeys.",
      "Onboarded 50+ advertisers a month, integrating ad formats across global social media channels.",
      "Contributed to the AdRoll and Shopify integration, which earned 12+ positive reviews on the Google Play Store for the implementation and support.",
      "Delivered 99.2% customer satisfaction across 20+ client conversations a day, and proposed new product features from what clients needed.",
      "Recognised four quarters running: the Client’s Favourite accolade (Q3 2022) and the highest chat CSAT score for Q2–Q4 2023.",
    ],
  },
];

export type Metric = { value: number; decimals?: number; prefix?: string; suffix: string; label: string; context: string };

// Each number keeps the meaning it has on the CV, with where it came from.
export const metrics: Metric[] = [
  { value: 10, suffix: "%", label: "average saving per campaign", context: "US national TV negotiations · IPG Mediabrands" },
  { value: 30, suffix: "%", label: "faster planning turnaround", context: "50+ media estimates in Media Ocean · IPG Mediabrands" },
  { value: 99.2, decimals: 1, suffix: "%", label: "customer satisfaction", context: "20+ client conversations a day · Mediamint" },
  { value: 97, suffix: "%", label: "client retention across the year", context: "Media planning and buying · IPG Mediabrands" },
  { value: 12, suffix: "%", label: "increase in viewership engagement", context: "Bi-weekly GRP and unit-count analyses · IPG Mediabrands" },
  { value: 50, suffix: "+", label: "advertisers onboarded every month", context: "AdRoll platform operations · Mediamint" },
];

// The career, told in six chapters (Gauri's own timeline, checked against
// her CVs). Each says what happened and what it added.
export const journey = [
  {
    year: "2019",
    stage: "First marketing experience",
    title: "Started with mystery shopping.",
    org: "Mystery shopping internship",
    body: "My first marketing internship: evaluating service quality as a customer would, and seeing how businesses actually interact with the people they serve.",
    learned: "A customer's-eye view of service",
  },
  {
    year: "2020",
    stage: "Academic foundation",
    title: "Business school, plus digital.",
    org: "Bachelor of Business Management, City Premium College · PG Certification in Digital Marketing and Communication, upGrad–MICA",
    body: "Business fundamentals with a marketing specialisation, alongside my first hands-on campaigns: Google display and search, Facebook paid, and a WordPress site of short brand stories for upGrad. Both completed in 2021.",
    learned: "Marketing fundamentals, put into practice",
  },
  {
    year: "2021",
    stage: "Digital campaign operations",
    title: "Into the digital campaign lifecycle.",
    org: "Mediamint · Platform Support Specialist",
    body: "Onboarding clients, troubleshooting campaign issues and optimising live campaigns: learning how campaign performance, client needs and day-to-day execution fit together.",
    learned: "Campaign operations and client onboarding",
  },
  {
    year: "2024",
    stage: "Transition to broadcast media",
    title: "From digital to broadcast.",
    org: "IPG Mediabrands · Executive, Media Planning and Buying",
    body: "US national TV for four global brands. Working across both digital and broadcast showed me how differently audiences are reached, bought and measured on each.",
    learned: "Broadcast planning and negotiation",
  },
  {
    year: "2025",
    stage: "Cranfield University",
    title: "Stepping back to think strategically.",
    org: "MSc Strategic Marketing, Cranfield University",
    body: "Brand management, CRM and omnichannel, sustainable and digital marketing, with a 15% merit scholarship, and a research thesis on trust and AI adoption in construction.",
    learned: "Strategy, brand and research",
  },
  {
    year: "2026",
    stage: "B2B experience in HSE",
    title: "B2B, in health and safety.",
    org: "Navatech · B2B Marketing and CRM Intern",
    body: "B2B marketing for a construction safety technology company: writing for industry professionals, building answer-engine visibility, and mapping the buyer journey that shaped the CRM.",
    learned: "B2B stakeholders and go-to-market",
  },
];

// The MSc thesis, from Gauri's own summary. The finding is reported as she
// stated it: no statistics beyond the 43 respondents.
export const research = {
  title: "Go-to-Market Strategy for Navatech’s Intelligence Layer",
  focus: "Trust and the adoption of AI-powered safety technology in construction.",
  school: "MSc Strategic Marketing · Cranfield University · 2026",
  summary:
    "My thesis studied how trust affects whether construction companies and site workers would adopt Navatech's AI safety product. I surveyed 43 people and found that overall trust, rather than any one factor alone, was what most influenced willingness to adopt. From that, I built a go-to-market strategy for Navatech focused on earning trust from both buyers and frontline workers.",
  question: "Does trust shape whether construction companies and site workers would adopt an AI-powered safety product?",
  method: "A survey of 43 respondents.",
  finding: "Overall trust, rather than any single factor alone, most influenced willingness to adopt.",
  application: "A go-to-market strategy built on earning trust from both organisational buyers and frontline workers.",
  why: "Safety technology on a construction site has two audiences: the business that buys it and the people who use it every day. A product only works if both trust it, so the go-to-market has to speak to both.",
};

export const education = [
  {
    title: "MSc Strategic Marketing",
    school: "Cranfield University, United Kingdom",
    dates: "Sep 2025 – Sep 2026",
    notes: ["15% merit scholarship for academic distinction", "Thesis: Go-to-Market Strategy for Navatech’s Intelligence Layer"],
    projects: [
      "Brand Management: 2nd place, brand identity and market entry for the UK premium meat market",
      "Sales & Revenue Management: Curry UK market strategy",
      "CRM & Omnichannel Management: Uniqlo UK customer experience",
      "Sustainable Marketing: Cadbury Bournville rebrand",
      "Marketing Communication & Digital Marketing: Age UK brand awareness",
    ],
  },
  {
    title: "Bachelor of Business Management",
    school: "City Premium College, India",
    dates: "Jun 2018 – Aug 2021",
    notes: ["CGPA 9.4/10, specialising in marketing", "1st rank in the college summer examination", "10th rank, Nagpur University (RTMNU) merit list"],
    projects: ["Consumer buying capacity for Haldiram’s sweets and snacks: purchasing trends and market insights"],
  },
  {
    title: "PG Certification in Digital Marketing and Communication",
    school: "upGrad and MICA, India",
    dates: "Dec 2020 – Aug 2021",
    notes: [],
    projects: ["Ran upGrad campaigns: Google display, Google search and Facebook paid, plus a WordPress site of short brand stories"],
  },
];

export const skillGroups = [
  { title: "Media and campaigns", items: ["TV and digital planning and buying", "Paid social", "Display and retargeting", "Negotiation", "GRP analysis", "Campaign reporting"] },
  { title: "CRM and content", items: ["HubSpot", "Marketo", "Mailchimp", "SEO and AEO", "Blog writing", "Email marketing", "Customer journey mapping"] },
  { title: "Platforms and tools", items: ["Media Ocean", "AdRoll", "Banyan", "GA4", "GTM", "Zendesk", "Canva", "Microsoft Excel", "Microsoft Word", "Microsoft PowerPoint"] },
];

export type LeadershipRole = { title: string; org: string; detail: string; stat: { value: string; label: string }; skills: string[] };

// The three roles Gauri wants highlighted beside the work.
export const leadership: LeadershipRole[] = [
  {
    title: "Careers Representative",
    org: "Cranfield University",
    detail: "Promoted career resources, workshops and upcoming opportunities to fellow students on behalf of the Cranfield careers team, mobilising 100+ students to weekly career workshops over a full year.",
    stat: { value: "100+", label: "students to weekly workshops" },
    skills: ["Student engagement", "Communication", "Representing the careers team"],
  },
  {
    title: "Social Media & Events Manager",
    org: "Art & Craft Society · Board Member",
    detail: "Managed the society’s social media and event promotion, and organised open campus events for students across the university.",
    stat: { value: "5+", label: "open campus events" },
    skills: ["Social media", "Event promotion", "Event management"],
  },
  {
    title: "Event Manager",
    org: "Hult Prize",
    detail: "Managed five campus events across every round of the global student entrepreneurship competition, from the introduction to the final.",
    stat: { value: "5", label: "campus events, intro to final" },
    skills: ["Event management", "Programme coordination"],
  },
];

// Community and the life around the work, for the full record.
export const community = [
  { title: "Volunteering", org: "Fly High India (2020) · Zero Gravity’s Project Happiness (2018)", detail: "Promoted value-education awareness through orphanage visits and ran educational programmes for 1000+ children across shelter homes in Nagpur." },
  { title: "Student societies", org: "Walking Society and Green Society, Cranfield University", detail: "Took part in 3+ large-scale tree-planting initiatives and hiking events." },
  { title: "Off the clock", org: "Painting", detail: "Took part in a canvas painting exhibition (2017–2018)." },
];

export type JournalEntry = {
  id: string;
  kicker: string;
  date: string;
  title: string;
  excerpt: string;
  photo: "brand" | "lecture";
  caption: string;
  badge?: { value: string; label: string };
  quote?: { text: string; by: string };
  body: string[];
  listTitle: string;
  list: string[];
  stats?: { value: string; label: string }[];
  statsNote?: string;
  closing: string;
};

// Two moments from the MSc, in Gauri's own words (from her LinkedIn posts).
export const journal: JournalEntry[] = [
  {
    id: "brand",
    kicker: "Managing Brands · MSc Strategic Marketing",
    date: "Mar 2026",
    title: "We built a brand from absolute scratch.",
    excerpt: "A brand identity and market-entry strategy for the UK premium meat market: a living identity with a story, a voice and a purpose behind every decision. Our team placed 2nd of 6 competing brand proposals.",
    photo: "brand",
    caption: "brand presentation day ✦",
    badge: { value: "2nd", label: "of 6 brand proposals" },
    body: [
      "I used to think branding was just a logo, a colour palette, maybe a catchy tagline. A month in Professor Sharifah Alwi's Managing Brands course changed that.",
      "Alongside back-to-back guest lectures and regular classes, our learning team built a brand from absolute scratch. Every step was a masterclass: we weren't just completing an assignment, we were thinking like founders.",
      "The diversity of thought in the team is what made us stronger. Yi Chiu, one of the most experienced people on the team, taught me to work analytically: to ask better questions, challenge assumptions and think beyond the surface.",
    ],
    listTitle: "what we built",
    list: ["The brand logo and identity", "A brand voice and story", "A marketing strategy", "Forecast KPIs"],
    closing: "Managing a brand taught me collaboration, strategy, resilience, and the power of a team that genuinely believes in what it's building.",
  },
  {
    id: "circular",
    kicker: "Guest lecture · Circular fashion",
    date: "MSc, Cranfield",
    title: "Circular fashion isn't a design problem.",
    excerpt: "A guest lecture that shifted how I think about sustainability, and about the part marketing plays in how often we buy and how long we keep.",
    photo: "lecture",
    caption: "guest lecture day ✿",
    quote: { text: "Circular fashion isn't a design problem. It's a system, market and business model problem.", by: "Tze Ching Yeung, Founder, We Disrupt Agency" },
    body: [
      "I always believed sustainable fashion was mainly about organic cotton or recycled materials. But sustainability starts much earlier and much closer to us: with how easily we buy new clothes and how quickly we discard old ones.",
      "Recycled materials are only the beginning. True circularity is about how long a garment is used, what happens after use, and how responsibly it re-enters (or exits) the system.",
      "As a marketer, I believe we play a critical role. Marketing shapes desire, normalises consumption and influences buying frequency. If we understand why consumers buy, we can also influence how they buy, and how long they keep.",
    ],
    listTitle: "the 5C framework from the session",
    list: ["Circularity", "Clarity", "Connection", "Commercialization", "Consistency"],
    stats: [
      { value: "92M", label: "tonnes of textile waste from the fashion industry every year" },
      { value: "<1%", label: "of clothing recycled into new garments" },
      { value: "~90%", label: "of consumers still engage with fast fashion" },
    ],
    statsNote: "Industry figures shared during the lecture.",
    closing: "Circular fashion isn't about doing more. It's about doing better, for longer, and marketers, designers and consumers share that responsibility.",
  },
];
