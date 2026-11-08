/** All words on the pricing page (boards WebPricing and WebPricingMobile). */
export const pricing = {
  hero: {
    eyebrow: "Pricing",
    titleLines: ["Start free.", "Make it yours when you’re ready."],
    lede: "Build and share quizzes for free. If you want a quiz that looks and feels like your brand, we’ll build it with you.",
  },

  free: {
    name: "Free",
    text: "Everything you need to make a quiz and collect answers.",
    price: "$0",
    features: [
      "All page types: questions, numbers, dates, text, info and end pages",
      "Show a page only to some people",
      "Change your quiz with an AI chat, like ChatGPT or Claude",
      "Share your quiz with a link",
      "See every response, with a summary and charts",
      "Download your data as CSV, Excel or JSON",
      "Works on phones and computers",
      "Up to 5 quizzes, 15 pages in each, and 500 finished responses per quiz",
    ],
    note: "“Powered by Quiz” shows on the first and last page",
    cta: "Create your quiz",
  },

  custom: {
    badge: "For your brand",
    name: "Custom",
    text: "Your quiz, built for your brand, with us doing the work.",
    price: "Depends on what you need",
    priceNote: "Tell us what you want and we’ll send a price.",
    lead: "Everything in Free, plus:",
    features: [
      "Your own domain, like quiz.yourbrand.com",
      "Your colors, logo and fonts on every page",
      "“Powered by Quiz” removed",
      "A custom quiz page designed and built for you",
      "Help setting everything up",
      "More quizzes, pages and responses, as you need",
    ],
    cta: "Contact us",
  },

  compare: {
    eyebrow: "Compare",
    title: "What’s in each plan.",
    columns: { feature: "Feature", free: "Free", custom: "Custom" },
    notIncluded: "Not included",
    included: "Included",
    rows: [
      { feature: "Build quizzes with every page type", free: true, custom: true },
      { feature: "Show a page only to some people", free: true, custom: true },
      { feature: "Edit with AI", free: true, custom: true },
      { feature: "Share with a link", free: true, custom: true },
      { feature: "Responses, summary and charts", free: true, custom: true },
      { feature: "Download as CSV, Excel or JSON", free: true, custom: true },
      { feature: "Quizzes", free: "5", custom: "As needed" },
      { feature: "Pages in one quiz", free: "15", custom: "As needed" },
      { feature: "Finished responses in one quiz", free: "500", custom: "As needed" },
      { feature: "Your own domain", free: false, custom: true },
      { feature: "Your colors, logo and fonts", free: false, custom: true },
      { feature: "“Powered by Quiz” removed", free: false, custom: true },
      { feature: "A custom quiz page built for you", free: false, custom: true },
      { feature: "Help setting everything up", free: false, custom: true },
    ] as { feature: string; free: boolean | string; custom: boolean | string }[],
  },

  steps: {
    eyebrow: "Custom plan",
    title: "How we build it with you.",
    items: [
      { title: "Tell us what you need", text: "Send a short message about your brand, your domain and what the quiz is for." },
      { title: "We design and build", text: "We make your quiz page look like your brand and set up your own domain." },
      { title: "You go live", text: "Share your link. You still manage everything from the same dashboard." },
    ],
  },

  faq: {
    eyebrow: "Questions",
    title: "Good to know.",
    items: [
      { question: "Can I start free and switch later?", answer: "Yes. Everything you build on Free stays. When you want your own brand and domain, contact us and we’ll move your quiz over." },
      { question: "How much does Custom cost?", answer: "It depends on what you need, like a domain, a custom look or a fully custom quiz page. Tell us what you want and we’ll send you a price." },
      { question: "Do I need my own domain?", answer: "Not on Free. On Custom, we can use a domain you already own or help you pick one." },
      { question: "Who owns my answers?", answer: "You do. You can download every response as CSV, Excel or JSON at any time, on any plan." },
      {
        question: "Can AI help me build my quiz?",
        answer:
          "Yes, on every plan. In the editor press “Edit with AI”, copy your quiz, paste it into ChatGPT, Claude or Gemini and say what to change. Paste the answer back and you see exactly what will change before anything is updated.",
      },
      {
        question: "What happens when I reach a limit?",
        answer:
          "Nothing you have is lost. To add more, delete something you don’t need or contact us. A quiz that reaches 500 finished responses stops taking new answers. People who leave halfway don’t count, and you can still download everything.",
      },
    ],
  },
} as const;
