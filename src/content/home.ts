/** All words on the home page (boards Home and HomeMobile). */
export type FeatureIcon =
  | "sparkles"
  | "page"
  | "branch"
  | "phone"
  | "chart"
  | "download"
  | "template"
  | "eye"
  | "globe";

export const home = {
  hero: {
    badge: "New",
    badgeText: "Quiz builder for everyone",
    titleStart: "Make a",
    rotatingWords: ["quiz", "survey", "form", "quiz"],
    titleHighlight: "people actually finish.",
    lede: "Build it with simple pages, share it with a link, and see every answer. No code. No credit card.",
    primary: "Create your quiz, it’s free",
    secondary: "See how it works",
    trust: ["Free to start", "No code", "Works on phones"],
  },

  phoneDemo: {
    slide1: { question: "What is your main goal?", options: ["Lose weight", "Tone my body", "Have more energy", "Feel healthier"] },
    slide2: { question: "How old are you?", value: "34", unit: "years", button: "Continue" },
    slide3: { title: "Thank you!", text: "Your answers are in." },
    floating: ["New response", "Shared with 1 link", "CSV · Excel · JSON"],
  },

  tags: [
    "Lead forms",
    "Customer feedback",
    "Product finders",
    "Event sign-ups",
    "Onboarding",
    "Surveys",
    "Quizzes with a result",
    "Contact forms",
  ],
  tagsLabel: "What people make",

  how: {
    eyebrow: "How it works",
    title: "From idea to answers in three steps.",
    sub: "No setup, no code. If you can write a message, you can build a quiz.",
    steps: [
      { title: "Build it", text: "Add pages one by one: questions, numbers, dates, text and a final thank-you." },
      { title: "Share a link", text: "Publish and copy one link. Send it by message, email or put it on your website." },
      { title: "See the answers", text: "Watch responses come in, check the charts, and download everything when you need it." },
    ],
    buildRows: ["1 · Welcome", "2 · What is your goal?", "3 · Thank you"],
    sampleLink: "quiz.basrh.com/your-quiz",
    copyLink: "Copy link",
  },

  features: {
    eyebrow: "Features",
    title: "Everything you need. Nothing you don’t.",
    items: [
      { icon: "sparkles", title: "Edit with AI", text: "Let ChatGPT, Claude or Gemini write or change your pages. You see what will change first." },
      { icon: "page", title: "Pages for any question", text: "Choices, text, numbers and dates. Add pictures when they help." },
      { icon: "branch", title: "Smart paths", text: "Show a page only to the people who need it, based on earlier answers." },
      { icon: "phone", title: "Made for phones", text: "Every quiz looks great on a phone first, and neat on a computer too." },
      { icon: "chart", title: "Answers and charts", text: "Read each response, or see the big picture in one summary." },
      { icon: "download", title: "Take your data with you", text: "Download as CSV, Excel or JSON. Your answers are always yours." },
      { icon: "template", title: "Start from a template", text: "A contact form, feedback or a quiz with a result. Change anything you like." },
      { icon: "eye", title: "Try it before you publish", text: "See your quiz as people will see it. Nothing you try is saved." },
      { icon: "globe", title: "Your brand, your domain", text: "Want it to look like your own? We’ll build a custom quiz page for you." },
    ] satisfies { icon: FeatureIcon; title: string; text: string }[],
  },

  insights: {
    eyebrow: "Know what works",
    title: "See exactly where people leave.",
    sub: "A simple chart shows every page and how many people are still with you. Fix the one that loses them.",
    stats: [
      { value: 7, label: "page types" },
      { value: 3, label: "ways to export" },
      { value: 1, label: "link to share" },
      { value: 0, label: "lines of code" },
    ],
    bars: [
      { label: "1. Welcome", percent: 100 },
      { label: "2. Main goal", percent: 91 },
      { label: "3. Age", percent: 84 },
      { label: "4. Height", percent: 78 },
      { label: "5. Weight", percent: 71 },
      { label: "6. Goal date", percent: 64 },
      { label: "7. Thank you", percent: 38 },
    ],
  },

  pricingTeaser: {
    eyebrow: "Pricing",
    title: "Start free. Make it yours later.",
    sub: "Build and share quizzes for free. When you want your own brand and domain, we’ll set it up with you.",
    free: {
      name: "Free",
      price: "$0",
      text: "Every page type, sharing by link, responses, charts and downloads.",
      cta: "Create your quiz",
    },
    custom: {
      name: "Custom",
      price: "Let’s talk",
      text: "Your domain, colors and logo, plus a quiz page designed for you.",
      cta: "See plans",
    },
  },

  faq: {
    eyebrow: "Questions",
    title: "Good to know.",
    items: [
      { question: "Do I need to know how to code?", answer: "No. You build everything by adding pages and typing your questions. There is nothing to install." },
      { question: "Is it really free?", answer: "Yes. You can build quizzes, share them and see every answer without paying. A paid custom plan is only for your own brand and domain." },
      { question: "How do people open my quiz?", answer: "Publish it and you get one link. Anyone with the link can answer, on a phone or a computer. They don’t need an account." },
      { question: "Can I take my answers with me?", answer: "Always. Download all responses as CSV, Excel or JSON whenever you like." },
      {
        question: "Can AI help me build my quiz?",
        answer:
          "Yes, on every plan. In the editor press “Edit with AI”, copy your quiz, paste it into ChatGPT, Claude or Gemini and say what to change. Paste the answer back and you see exactly what will change before anything is updated.",
      },
    ],
  },
} as const;
