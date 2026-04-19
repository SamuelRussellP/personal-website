// Single source of truth for Samuel Russell Prajasantosa's career data.
// Edit here to update everywhere.

export type JourneyKind = "internship" | "engineer" | "lead" | "education";

export interface JourneyStop {
  id: string;
  kind: JourneyKind;
  role: string;
  company: string;
  location: string;
  mode?: "Remote" | "Onsite" | "Hybrid";
  start: string;          // ISO or YYYY-MM
  end: string | "Present";
  headline: string;       // one-line hook
  narrative: string;      // 2-3 sentences, the "why this mattered" story
  highlights: string[];   // bullet achievements
  projects?: {
    name: string;
    period: string;
    summary: string;
    href?: string;
    cta?: string;
  }[];
  stack: string[];
}

export const profile = {
  name: "Samuel Russell Prajasantosa",
  shortName: "Samuel",
  currentRole: "Software QA Team Lead",
  currentCompany: "Paul's Job",
  currentLocation: "Jakarta, Indonesia",
  currentLocationTZ: "Asia/Jakarta",
  currentLocationShort: "Jakarta",
  currentLocationTZLabel: "WIB",
  companyLocation: "Berlin, Germany",
  origin: "Semarang, Indonesia",
  tagline:
    "Building quality into software — from Semarang to Kuala Lumpur to Jakarta, now shipping with Berlin.",
  intro:
    "I'm a Software QA Team Lead based in Jakarta, leading quality remote for a Berlin startup. Grew up in Semarang, studied in Malaysia, tested payments at Shopee. This is the journey so far.",
  email: "samuel.prajasantosa@gmail.com",
  phone: "+62 817 9050 400",
  links: {
    github: "https://github.com/SamuelRussellP",
    linkedin: "https://www.linkedin.com/in/samuelrussellprajasantosa/",
    thesis:
      "https://www.springerprofessional.de/en/differentialfault-analysis-of-tinyjambu/50737738",
  },
};

// Ordered chronologically — earliest first. The timeline renders in this order.
export const journey: JourneyStop[] = [
  {
    id: "xmu",
    kind: "education",
    role: "B.Eng. Software Engineering (Honours)",
    company: "Xiamen University Malaysia",
    location: "Sepang, Malaysia",
    start: "2018-09",
    end: "2022-09",
    headline: "Foundation — where the engineering instinct was forged.",
    narrative:
      "Four years of computer science rigor on a 50% merit scholarship I maintained throughout. Graduated with a 3.35 CGPA and a thesis good enough for Springer.",
    highlights: [
      "50% Merit Scholarship — maintained all four years",
      "CGPA: 3.35",
      "Thesis GPA: 4.0",
      "Built a 2D shooter with AI-driven enemies as a team capstone",
    ],
    projects: [
      {
        name: "Undergraduate Thesis",
        period: "Sep 2021 – Jan 2022",
        summary:
          "Differential Fault Attacks on Lightweight Authenticated Encryption Stream Cipher TinyJAMBU. Published April 2025 by Springer Nature Switzerland in Information Security in a Connected World.",
      },
      {
        name: "Game Design & Development",
        period: "Sep 2020 – Jan 2021",
        summary:
          "Designed and built a 2D shooter with five progressive levels, a storyline, and AI enemies with distinct attack patterns.",
      },
    ],
    stack: ["C++", "C#", "Python", "Cryptography", "Unity", "AI"],
  },
  {
    id: "blibli",
    kind: "internship",
    role: "Software Development Engineer in Test — Intern",
    company: "BliBli.com",
    location: "Jakarta, Indonesia",
    mode: "Onsite",
    start: "2022-03",
    end: "2022-07",
    headline: "First taste of production — and the discipline of automation.",
    narrative:
      "Five months inside one of Indonesia's largest e-commerce platforms. Learned that shipping fast means testing faster, and wrote my first real automation framework.",
    highlights: [
      "Built an internal automated UI testing framework from scratch",
      "Designed and executed test cases directly from product requirements",
      "Translated manual test cases into repeatable Selenium + Cucumber BDD suites",
    ],
    projects: [
      {
        name: "Internal Website UI Automation",
        period: "Mar – Jul 2022",
        summary:
          "Developed an internal automated UI testing framework used by the team to regression-test their admin tooling.",
      },
    ],
    stack: ["Java", "Selenium", "Cucumber BDD", "Jira", "Slack", "MS Teams"],
  },
  {
    id: "shopee",
    kind: "engineer",
    role: "Software QA Engineer — Full Time",
    company: "Shopee",
    location: "Jakarta, Indonesia",
    mode: "Onsite",
    start: "2022-08",
    end: "2023-10",
    headline:
      "ShopeePay: where every bug is a payment that didn't go through.",
    narrative:
      "Fourteen months on Shopee Indonesia's Payment Processing Team inside Sea Labs. Backend, APIs, databases — the machinery behind millions of real transactions every day. Three major projects integrating with banks, accounting, and Shopee's own cloud.",
    highlights: [
      "Backend + API testing for the ShopeePay payment module",
      "Led QA for a Java → Golang rewrite of the callback service (faster response, tighter logic)",
      "Coordinated with ShopeePay ID, Payment Module, and Bank teams — 4-party integration",
      "Shipped real-time accounting integration and a full GCP → SPACE cloud migration",
    ],
    projects: [
      {
        name: "Callback Service Rewrite",
        period: "Apr – Jun 2023",
        summary:
          "Rewrote payment callbacks from Java to Golang with improved logic. Four-party integration: User, ShopeePay ID, Payment Module, and Banks.",
      },
      {
        name: "Accounting Integration",
        period: "Jan – Mar 2023",
        summary:
          "Real-time payment data pipeline so the Accounting team could reconcile based on live user payment events.",
      },
      {
        name: "GCP → SPACE Migration",
        period: "Sep – Oct 2022",
        summary:
          "Migrated ShopeePay services and data from GCP to Shopee's in-house cloud platform for cost efficiency.",
      },
    ],
    stack: [
      "Go",
      "Python",
      "Java",
      "MySQL",
      "Redis",
      "Jenkins",
      "Jira",
      "Mattermost",
      "macOS Terminal",
    ],
  },
  {
    id: "pauls-freelance",
    kind: "engineer",
    role: "Freelance QA",
    company: "Paul's Job",
    location: "Frankfurt / Remote",
    mode: "Remote",
    start: "2023-03",
    end: "2023-10",
    headline: "Moonlighting across time zones — a Frankfurt startup needed QA.",
    narrative:
      "Overlapped with my Shopee role. A relationship-management startup out of Frankfurt needed someone to steady the ship during a product revamp. I took them on evenings and weekends, helped them ship confidently, and earned a full-time offer out of it.",
    highlights: [
      "Brought structured QA into a fast-moving startup",
      "Authored the automation foundation that scaled into the full-time role",
    ],
    stack: ["Selenium", "Cucumber BDD", "Java", "Postman", "Jira"],
  },
  {
    id: "pauls-fulltime",
    kind: "engineer",
    role: "Software QA Engineer — Full Time",
    company: "Paul's Job",
    location: "Berlin, Germany",
    mode: "Remote",
    start: "2023-11",
    end: "2024-08",
    headline:
      "Europe, formally. Owning QA for a talent platform getting rebuilt from the ground up.",
    narrative:
      "Converted from freelance to full-time. Drove daily test execution across the SDLC, ran regression on legacy and in-development products, and stood up a proper Selenium + Cucumber automation framework with Serenity reporting. Integrated ChatGPT for message automation and Twilio for comms — the kind of 'test the whole product' work I love.",
    highlights: [
      "Daily test-case authoring and execution throughout the SDLC",
      "Built UI regression automation with Selenium + Cucumber BDD + Serenity",
      "QA'd ChatGPT + Twilio integration for automated messaging",
      "Github Actions + Cron jobs for scheduled test runs",
    ],
    projects: [
      {
        name: "Company Product Revamp",
        period: "Mar 2023 – ongoing",
        summary:
          "New platform for talent communities, channels, and job promotions — rebuilt on top of the legacy business model with new flows and a smoother UX.",
      },
      {
        name: "Legacy Product Regression",
        period: "Mar – May 2023",
        summary:
          "Regression on the legacy product to guarantee business-critical flows held up during the revamp. Bug reporting was the critical path.",
      },
    ],
    stack: [
      "Selenium",
      "Cucumber BDD",
      "Java",
      "Serenity",
      "Postman",
      "PostgreSQL",
      "DBeaver",
      "Github Actions",
      "Twilio",
      "ChatGPT API",
      "Cron",
    ],
  },
  {
    id: "pauls-lead",
    kind: "lead",
    role: "Software QA Team Lead",
    company: "Paul's Job",
    location: "Berlin, Germany",
    mode: "Remote",
    start: "2024-08",
    end: "Present",
    headline:
      "Leading quality into the AI-agent era — automation, metrics, and Hydra shipping alongside us.",
    narrative:
      "Promoted to Team Lead. Responsible for automation strategy across multiple products, quality metrics that actually drive decisions, and keeping developers, PMs, and QA engineers rowing in the same direction. Proposed Hydra — a Jira-driven QA agent on Claude and Codex — and led the QA team building it as our move to meet the AI-agent era head-on. Now live on staging and still actively evolving. Frees the team to spend their hours on test strategy and edge-case thinking instead of manual regression.",
    highlights: [
      "Rolled out automated testing frameworks across multiple products",
      "Own quality metrics — surfacing data that product and engineering act on",
      "Coordinate cross-functional delivery between dev, product, and QA",
      "Mentoring and scaling the QA practice as the product grows",
      "Initiated Hydra and led the team building it — a Jira-driven QA agent now live on staging, validating tickets across backend, frontend, and hybrid flows",
      "Codified the team's QA discipline as reusable agent skills: systematic debugging, TDD, verification-before-completion, parallel dispatch",
    ],
    projects: [
      {
        name: "Hydra — QA Validation Agent",
        period: "Live · 2026 – ongoing",
        summary:
          "A Jira-driven QA agent I designed and the QA team I lead built. Takes a ticket key and routes it through the right validation head — backend API verification, frontend UI verification, or a hybrid flow. Captures discovery notes, Postman collections, and test reports, then publishes the evidence bundle to cloud storage for reviewers. Live on staging, still actively growing new heads.",
        href: "/hydra",
        cta: "Read the full Hydra case study",
      },
      {
        name: "QA Skill System",
        period: "2026 – ongoing",
        summary:
          "The playbook Hydra runs on — a library of composable agent skills built on Claude Code that encode our QA engineering practices: brainstorming, writing & executing plans, systematic debugging, test-driven development, requesting code review, parallel agent dispatch. Symlinked across Claude Code and Cursor so the whole team works from the same source of truth.",
      },
    ],
    stack: [
      "Strategy",
      "Mentoring",
      "Claude",
      "Codex",
      "Claude Code",
      "Cursor",
      "AI Agents",
      "MCP",
      "Context7",
      "Python",
      "uv",
      "Jira API",
      "Postman",
      "GCS",
      "Selenium",
      "Cucumber",
      "Serenity",
      "CI/CD",
      "Metrics & Reporting",
    ],
  },
];

/* ---------------------------------------------------------------------------
 * Hydra — dedicated case study data
 * ------------------------------------------------------------------------- */

export const hydra = {
  name: "Hydra",
  codename: "QA Validation Agent",
  status: "Live on staging · Actively growing new heads",
  statusShort: "LIVE",
  period: "2026 – ongoing",
  origin: "Self-initiated",

  tagline:
    "A multi-headed QA agent we built to meet the AI-agent era head-on — Jira in, validated tickets out.",

  elevator:
    "Hydra is a QA agent I proposed and the team I lead built on Claude and Codex — our move in the AI-agent era reshaping our craft. Drop it a Jira ticket key: it routes the ticket through the right validation head (backend, frontend, or hybrid), runs the checks against staging, captures evidence, and publishes the bundle back to reviewers. It's live, it's evolving, and it's freeing the team to do the work only humans can.",

  problem:
    "Manual regression doesn't scale. Every ticket on staging needed human eyes for API contracts, UI flows, or both — hours of repetitive click-through that crowded out test strategy, edge-case hunting, and the work that actually moves quality forward. Meanwhile, AI agents were getting good enough to matter.",

  solution:
    "I pitched and designed the approach; the QA team I lead built it — no one assigned us. A Jira-driven agent that takes over the repetitive half so the team can focus on the human half. Trigger it with a ticket key; it figures out what to test, runs the checks, captures the evidence, and hands back a clean report. Built on Claude Code's skills model so the behavior is readable, testable, and improves every sprint.",

  heads: [
    {
      id: "be",
      name: "Backend Head",
      trigger: "test-be",
      tagline: "API, auth, DB, contracts.",
      description:
        "Endpoint verification, validation rules, authentication flows, database assertions, and contract testing. Runs against staging with the ticket's acceptance criteria as a spec.",
    },
    {
      id: "fe",
      name: "Frontend Head",
      trigger: "test-fe",
      tagline: "Components, interaction, permissions, responsive.",
      description:
        "UI component verification, interaction flows, permission boundaries, and responsive behavior. Drives the app the way a user would — but with perfect memory of every ticket that came before.",
    },
    {
      id: "hybrid",
      name: "Hybrid Head",
      trigger: "test (routes both)",
      tagline: "Full-stack tickets end-to-end.",
      description:
        "For tickets that cross the stack, the orchestrator routes to both heads and stitches the evidence together. One command, two verification paths, one report.",
    },
  ],

  flow: [
    {
      step: "01",
      title: "Jira ticket → entry point",
      detail:
        "Trigger with a ticket key. Hydra fetches the ticket, reads the acceptance criteria, and decides what kind of validation it needs.",
    },
    {
      step: "02",
      title: "Route to the right head",
      detail:
        "Backend, frontend, or hybrid — each with its own verification playbook and tooling.",
    },
    {
      step: "03",
      title: "Validate against staging",
      detail:
        "Exercises the ticket: hits APIs with the right payloads, clicks through UI flows, checks DB state, verifies permissions.",
    },
    {
      step: "04",
      title: "Capture evidence",
      detail:
        "Discovery notes, Postman collections, screenshots, and structured test reports — everything a reviewer needs to trust the result.",
    },
    {
      step: "05",
      title: "Publish to GCS",
      detail:
        "The evidence bundle ships to Google Cloud Storage under a per-ticket folder. Reviewers get a single link with everything attached.",
    },
    {
      step: "06",
      title: "Comment back on Jira",
      detail:
        "A structured comment lands on the ticket: verdict, links to evidence, and any follow-ups the team needs to handle.",
    },
  ],

  principles: [
    {
      label: "Meet the team where they already are",
      detail:
        "Hydra's entry point is a Jira ticket — the artifact every engineer, PM, and QA already interacts with. Zero new UX for the team to adopt.",
    },
    {
      label: "Route, then validate",
      detail:
        "A thin orchestrator decides which head to call; each head specializes in its own verification discipline. Changing how we test backend doesn't touch frontend logic.",
    },
    {
      label: "Evidence-first",
      detail:
        "Every run ships a structured artifact bundle — not just pass/fail. Reviewers trust what they can audit.",
    },
    {
      label: "Human-in-the-loop",
      detail:
        "Hydra proposes verdicts and surfaces findings. Humans approve, override, or escalate. The agent never ships to production on its own.",
    },
    {
      label: "Capabilities as skills, not scripts",
      detail:
        "Every capability is a composable skill with a contract — so the playbook improves every sprint without a rewrite.",
    },
    {
      label: "Portable by design",
      detail:
        "What-to-test is decoupled from how-to-test. The architecture travels to whatever product the team works on next.",
    },
  ],

  engineeringSkills: [
    "Brainstorming",
    "Writing & executing plans",
    "Systematic debugging",
    "Test-driven development",
    "Verification before completion",
    "Requesting code review",
    "Using git worktrees",
    "Parallel agent dispatch",
  ],

  stack: [
    { label: "Claude", category: "Model" },
    { label: "Codex", category: "Model" },
    { label: "Claude Code", category: "Runtime" },
    { label: "Cursor", category: "Runtime" },
    { label: "MCP", category: "Protocol" },
    { label: "Context7", category: "Knowledge" },
    { label: "Python", category: "Language" },
    { label: "uv", category: "Tooling" },
    { label: "Jira API", category: "Integration" },
    { label: "Postman", category: "Testing" },
    { label: "Google Cloud Storage", category: "Infra" },
  ],

  proudOf: [
    "Took the initiative — nobody assigned Hydra. I saw the AI-agent moment and rallied the team to build our answer.",
    "Live on staging — not a demo, not a slide deck. Real traffic is running through it.",
    "Growing every sprint — new heads, new skills, new coverage.",
    "Frees the team for higher-value work — the thinking humans are uniquely strong at.",
  ],
};

export const skills = {
  languages: [
    { name: "Python", level: 4 },
    { name: "Java", level: 5 },
    { name: "SQL", level: 4 },
    { name: "Golang", level: 3 },
    { name: "C++", level: 2 },
    { name: "C#", level: 2 },
  ],
  qa: [
    "Selenium",
    "Cucumber BDD",
    "Serenity Report",
    "Postman",
    "API Testing",
    "Regression Testing",
    "Backend Testing",
    "Test Case Design",
  ],
  tools: [
    "Jira",
    "GitHub",
    "GitHub Actions",
    "Jenkins",
    "Cron",
    "DBeaver",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Twilio",
    "Slack",
    "Mattermost",
  ],
  spoken: [
    { name: "English", level: 5 },
    { name: "Bahasa Indonesia", level: 5 },
    { name: "Mandarin", level: 3 },
  ],
  qualities: ["Strong Analytical Skills", "Adaptive", "Persistent Learner"],
};
