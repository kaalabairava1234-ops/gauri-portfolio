// Every fact on the site comes from Gauri's CV (public/Gauri_Tichkule_CV.pdf)
// and lives here, so the story, the case studies and the full record never
// drift apart. Change the words here, not in the pages.

export const NAME = "Gauri Tichkule";
export const FIRST_NAME = "Gauri";
export const EMAIL = "gauritichkule@gmail.com";
export const LOCATION = "Milton Keynes, United Kingdom";
export const CV_PATH = "/Gauri_Tichkule_CV.pdf";

// The CV names LinkedIn but the PDF carries no link, so there is no verified
// URL yet. Paste the full profile URL here (https://www.linkedin.com/in/…)
// and every LinkedIn link on the site appears; left empty, they stay hidden
// rather than pointing nowhere.
export const LINKEDIN_URL = "";

export type Role = {
  id: string;
  company: string;
  title: string;
  place: string;
  dates: string;
  summary: string;
  points: string[];
};

export const roles: Role[] = [
  {
    id: "navatech",
    company: "Navatech",
    title: "B2B Marketing and CRM Intern",
    place: "United Kingdom",
    dates: "Jun 2026 – Aug 2026",
    summary: "B2B content, answer-engine visibility and the buyer journey behind the CRM.",
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
    summary: "US national TV for four global brands, between the client and the networks.",
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
    summary: "Paid display, video and retargeting on AdRoll, plus the CRM integrations around it.",
    points: [
      "Executed 150+ paid display, video and retargeting campaigns a month on AdRoll, with rapid recommendations on ad size, budgeting and targeting.",
      "Led CRM integrations for HubSpot, Mailchimp and Marketo, enabling automation and personalised customer journeys.",
      "Onboarded 50+ advertisers a month, integrating ad formats across global social media channels.",
      "Contributed to the AdRoll and Shopify integration, which earned 12+ positive reviews on the Google Play Store for the implementation and support.",
      "Delivered 99.2% customer satisfaction across 20+ client conversations a day, and won the Client’s Favourite award four times, in different quarters.",
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

export type CaseStudy = {
  id: string;
  number: string;
  title: string;
  tags: string[];
  blurb: string;
  employer: string;
  role: string;
  dates: string;
  context: string;
  did: string[];
  results: { value: string; label: string }[];
  visual: "media" | "aeo" | "journey" | "ops";
};

// Experience-based case studies: real roles and real numbers, with
// illustrative visuals. No budgets, screenshots or client material.
export const caseStudies: CaseStudy[] = [
  {
    id: "media",
    number: "01",
    title: "US national TV, planned and bought",
    tags: ["Media"],
    blurb: "Negotiating national TV for four global brands, and getting more out of every plan.",
    employer: "IPG Mediabrands",
    role: "Executive, Media Planning and Buying",
    dates: "Jun 2024 – Sep 2025",
    context: "Four global brands (Merck, Floor & Decor, Eggland’s Best and Henkel) bought US national TV through the team. The role sat between each client and the networks, including MTV.",
    did: [
      "Negotiated 100+ placements a quarter with 20+ networks and media partners.",
      "Built 50+ media estimates and packages in Media Ocean.",
      "Ran bi-weekly GRP and unit-count analyses to optimise live campaigns.",
      "Coordinated 25+ networks and vendors through delivery.",
    ],
    results: [
      { value: "10%", label: "average saving per campaign" },
      { value: "30%", label: "faster planning turnaround" },
      { value: "12%", label: "lift in viewership engagement" },
      { value: "95%", label: "of activity delivered on target" },
      { value: "97%", label: "client retention across the year" },
    ],
    visual: "media",
  },
  {
    id: "aeo",
    number: "02",
    title: "B2B visibility for AI search",
    tags: ["B2B & CRM", "Digital"],
    blurb: "Making a B2B brand easier for answer engines to find, read and trust.",
    employer: "Navatech",
    role: "B2B Marketing and CRM Intern",
    dates: "Jun 2026 – Aug 2026",
    context: "B2B content written for construction industry professionals, at a time when search is moving toward AI-generated answers. The MSc thesis that followed stayed with the same company: a go-to-market strategy for Navatech’s Intelligence Layer.",
    did: [
      "Optimised 15% of the website’s content for Answer Engine Optimisation.",
      "Set up off-site brand profiles, including Trustpilot, as external trust signals for AI search.",
      "Wrote 4+ blog posts a month for construction industry professionals.",
    ],
    results: [
      { value: "15%", label: "of site content optimised for AEO" },
      { value: "4+", label: "industry blog posts a month" },
    ],
    visual: "aeo",
  },
  {
    id: "journey",
    number: "03",
    title: "Customer journeys, wired into the CRM",
    tags: ["B2B & CRM"],
    blurb: "From a mapped buyer journey to the CRM stages and automations that follow it.",
    employer: "Navatech · Mediamint",
    role: "B2B Marketing and CRM Intern · Platform Support Specialist",
    dates: "2021 – 2026",
    context: "Two roles, one idea: a CRM is only as good as the journey it reflects. At Navatech the journey came first; at Mediamint the work was connecting the platforms that carry it.",
    did: [
      "Created Navatech’s customer buyer journey, which shaped the CRM set-up at each stage.",
      "Led CRM integrations for HubSpot, Mailchimp and Marketo at Mediamint.",
      "Enabled marketing automation and personalised customer journeys through those integrations.",
    ],
    results: [
      { value: "3", label: "CRM platforms integrated: HubSpot, Mailchimp, Marketo" },
      { value: "1", label: "buyer journey shaping every CRM stage" },
    ],
    visual: "journey",
  },
  {
    id: "ops",
    number: "04",
    title: "Advertising operations at scale",
    tags: ["Digital"],
    blurb: "Running paid campaigns and onboarding advertisers every month, with the customer kept happy.",
    employer: "Mediamint",
    role: "Platform Support Specialist",
    dates: "Sep 2021 – May 2024",
    context: "Day-to-day work on AdRoll across paid display, video and retargeting, for advertisers coming in from global social media channels.",
    did: [
      "Executed 150+ paid display, video and retargeting campaigns a month.",
      "Gave rapid recommendations on ad size, budgeting and targeting.",
      "Onboarded 50+ advertisers a month across ad formats and social channels.",
      "Contributed to the AdRoll and Shopify integration (12+ positive Google Play Store reviews).",
    ],
    results: [
      { value: "99.2%", label: "customer satisfaction" },
      { value: "150+", label: "campaigns executed a month" },
      { value: "50+", label: "advertisers onboarded a month" },
      { value: "4×", label: "Client’s Favourite award" },
    ],
    visual: "ops",
  },
];

export const education = [
  { title: "MSc Strategic Marketing", school: "Cranfield University, United Kingdom", dates: "Sep 2025 – Sep 2026", notes: ["15% merit scholarship", "Thesis: Go-to-Market Strategy for Navatech’s Intelligence Layer", "Managing Brands project: 2nd of 6 brand proposals"] },
  { title: "Bachelor of Business Management", school: "City Premium College, India", dates: "Jun 2018 – Aug 2021", notes: ["CGPA 9.4/10", "Specialising in marketing"] },
  { title: "PG Certification in Digital Marketing", school: "upGrad and MICA, India", dates: "Dec 2020 – Aug 2021", notes: [] },
];

export const skillGroups = [
  { title: "Media and campaigns", items: ["TV and digital planning and buying", "Paid social", "Display and retargeting", "Negotiation", "GRP analysis", "Campaign reporting"] },
  { title: "CRM and content", items: ["HubSpot", "Marketo", "Mailchimp", "SEO and AEO", "Blog writing", "Email marketing", "Customer journey mapping"] },
  { title: "Platforms and tools", items: ["Media Ocean", "AdRoll", "GA4", "GTM", "Zendesk", "Canva", "Microsoft Excel", "Microsoft PowerPoint"] },
];

export const leadership = [
  { title: "Careers Representative", org: "Cranfield University", detail: "Mobilised 100+ students to weekly career workshops over a full year." },
  { title: "Social Media & Events Head", org: "Art & Craft Society", detail: "Managed social media and 5+ open events." },
  { title: "Event Manager", org: "Hult Prize", detail: "Organised the university-level competition, including five campus events." },
  { title: "Member", org: "Walking Society and Green Society, Cranfield University", detail: "Took part in large-scale tree plantation drives." },
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
    excerpt: "Not a concept on paper: a living identity with a story, a voice and a purpose behind every decision. Our team placed 2nd of 6 competing brand proposals.",
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
