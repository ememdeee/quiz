// Copy + data for the home page. Kept in one file so wording can be tuned
// without touching layout or motion code. Messaging follows
// plan/project_business.md (women 40+, food-first, hormone-aware, no extremes).

export const NAV_LINKS = [
    { id: "how", label: "How it works" },
    { id: "benefits", label: "Benefits" },
    { id: "reviews", label: "Reviews" },
    { id: "faq", label: "FAQ" },
] as const;

/** Hero: each phrase gets struck through — "Without ~~extreme dieting~~". */
export const STRIKE_WORDS = [
    "extreme dieting",
    "punishing cardio",
    "calorie counting",
    "hour-long workouts",
    "food guilt",
];

export const MARQUEE_A = [
    "No extreme dieting",
    "No punishing cardio",
    "No equipment",
    "Made for women 40+",
    "Food-first",
];

export const MARQUEE_B = [
    "Metabolism support",
    "Hormone-aware",
    "Short home routines",
    "Feel like yourself again",
    "Beginner friendly",
];

export type PainIcon =
    | "rotate"
    | "target"
    | "battery"
    | "clock"
    | "heart"
    | "cookie"
    | "shirt"
    | "footprints";

export const PAINS: { id: string; icon: PainIcon; label: string; insight: string }[] = [
    {
        id: "diets",
        icon: "rotate",
        label: "Diets that used to work don't anymore",
        insight: "Eating less isn't the whole story after 40. Body Reset focuses on what to add to your plate.",
    },
    {
        id: "belly",
        icon: "target",
        label: "Stubborn belly fat that won't budge",
        insight: "Stubborn areas respond to metabolism support — not to more restriction.",
    },
    {
        id: "energy",
        icon: "battery",
        label: "Running on empty by mid-afternoon",
        insight: "Steady, food-first meals are built to keep your energy from crashing.",
    },
    {
        id: "time",
        icon: "clock",
        label: "No time for long workouts",
        insight: "The optional routines are short and done at home — no gym trips.",
    },
    {
        id: "hormones",
        icon: "heart",
        label: "My body changed after 40",
        insight: "Hormone-aware guidance is built in, because your body isn't the same as at 25.",
    },
    {
        id: "cravings",
        icon: "cookie",
        label: "Cravings & emotional eating",
        insight: "Satisfying, simple meals make cravings easier to handle — without willpower wars.",
    },
    {
        id: "clothes",
        icon: "shirt",
        label: "Clothes don't fit like they used to",
        insight: "Early momentum matters — the quick-start phase is designed to get you there.",
    },
    {
        id: "cardio",
        icon: "footprints",
        label: "Cardio leaves me exhausted",
        insight: "Low-impact sessions that support your body instead of draining it.",
    },
];

// Images are 4:5 (public/images/body-reset/, sources in IMAGE-SOURCES.md).
// `focus` is the object-position that keeps the subject in frame when a
// container crops tighter than 4:5 (sticky stage, mobile cards).
export const PHASES = [
    {
        n: "01",
        title: "Quick-Start Reset",
        body: "Kick things off by adding metabolism-supportive foods to your plate — not by cutting everything out. Early momentum you can feel.",
        tag: "Food-first",
        image: "/images/body-reset/phase-01-food-first-reset.jpg",
        alt: "Wooden bowl of kale, chickpeas, roasted carrots, lemon and microgreens",
        focus: "50% 45%",
    },
    {
        n: "02",
        title: "Clean Phase",
        body: "A short follow-up phase that supports your body's natural reset, so it starts responding again.",
        tag: "Metabolism",
        image: "/images/body-reset/phase-02-metabolism-support.jpg",
        alt: "Woman in her 50s doing a gentle standing balance stretch at home",
        focus: "50% 22%",
    },
    {
        n: "03",
        title: "Guided Meal Plan",
        body: "Easy, hormone-aware meals for the weeks ahead — so you never have to guess what to eat next.",
        tag: "Hormone-aware",
        image: "/images/body-reset/phase-03-guided-meal-plan.jpg",
        alt: "Two women laughing as they share a fresh salad in the kitchen",
        focus: "50% 40%",
    },
    {
        n: "04",
        title: "Home Routines",
        body: "Optional short, low-impact sessions you can do in your living room. No equipment, beginner friendly.",
        tag: "At home",
        image: "/images/body-reset/phase-04-home-routines.jpg",
        alt: "Woman relaxing cross-legged on a yoga mat in a warm, sunlit room",
        focus: "50% 32%",
    },
];

export const OLD_WAY = ["Eat less", "Do more cardio", "Count every calorie", "Cut out food groups"];
export const NEW_WAY = ["Add the right foods", "Support your metabolism", "Short home routines", "Hormone-aware guidance"];

export const STATS = [
    { from: 0, to: 40, suffix: "+", label: "Made for women over 40" },
    { from: 0, to: 4, suffix: "", label: "Simple, guided phases" },
    { from: 99, to: 0, suffix: "", label: "Gym memberships needed" },
    { from: 0, to: 1, suffix: "", label: "Plan built from your answers" },
];

export type Review = {
    name: string;
    tag: string;
    text: string;
    /** Avatar image (e.g. /images/reviews/sarah-m.jpg). Initials show when omitted. */
    photo?: string;
};

// PLACEHOLDER — sample reviews for the portfolio/design build. The avatars are
// AI-generated (not real people, see public/images/reviews/IMAGE-SOURCES.md).
// Swap in real customer reviews + photos (with permission) before using this
// page to sell Body Reset.
export const REVIEWS: Review[] = [
    {
        name: "Sarah M.",
        tag: "Lost 10lbs in 4 weeks",
        text: "The home workouts completely changed my routine. I don't need a gym anymore to see real results.",
        photo: "/images/reviews/sarah-m.jpg",
    },
    {
        name: "Jessica K.",
        tag: "Toned & stronger",
        text: "I was skeptical about home fitness, but the science-backed approach here is undeniable. Highly recommend!",
        photo: "/images/reviews/jessica-k.jpg",
    },
    {
        name: "Emily R.",
        tag: "Busy mom approved",
        text: "Finally a program that fits into my crazy schedule. 20 minutes a day and I feel amazing.",
        photo: "/images/reviews/emily-r.jpg",
    },
    {
        name: "Rachel P.",
        tag: "Feeling lighter",
        text: "The flexibility modules are top notch. My posture has improved significantly in just a month.",
        photo: "/images/reviews/rachel-p.jpg",
    },
];

export const FAQS = [
    {
        q: "I've tried everything. Why would this be different?",
        a: "Most plans tell you to eat less and move more. Body Reset focuses on what to add — metabolism-supportive foods, hormone-aware guidance and realistic routines — so you work with your body instead of against it.",
    },
    {
        q: "I'm over 40. Can my body still change?",
        a: "Body Reset was designed specifically for women 40+ dealing with a slower metabolism and hormone-related body changes. The whole plan is built around the body you have now.",
    },
    {
        q: "Will I have to follow a strict diet?",
        a: "No extreme dieting and no calorie obsession. The plan is food-first: you'll learn what to add to your meals, not just what to cut out.",
    },
    {
        q: "Do I need equipment or a gym?",
        a: "No. The optional home routines are short, low-impact and completely equipment-free.",
    },
    {
        q: "Is it beginner friendly?",
        a: "Yes. Every routine is low-impact and easy to follow, whatever your starting point.",
    },
    {
        q: "Is it safe?",
        a: "Body Reset is built around whole foods and gentle routines. If you have a medical condition or take medication, check with your doctor before starting any new nutrition or exercise plan.",
    },
    {
        q: "What if it doesn't work for me?",
        a: "Body Reset comes with a money-back guarantee, so you can try it risk-free.",
    },
    {
        q: "How do I get started?",
        a: "Take the free quiz. It asks about your body, habits and goals, then builds a plan around your answers.",
    },
];

export const SOCIALS = [
    { name: "Instagram", href: "https://www.instagram.com/quiz/" },
    { name: "Facebook", href: "https://www.facebook.com/Quiz" },
    { name: "TikTok", href: "https://www.tiktok.com/@quiz.mp4" },
    { name: "YouTube", href: "https://www.youtube.com/@Quiz.mp4" },
] as const;
