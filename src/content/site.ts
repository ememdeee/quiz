import { CONTACT_EMAIL, mailto, routes } from "@/lib/routes";

/** Words and links shared by every website page: menu, footer, call-to-action band. */
export const siteNavLinks = [
  { label: "How it works", href: routes.howItWorks },
  { label: "Features", href: routes.features },
  { label: "Pricing", href: routes.pricing },
  { label: "Contact", href: routes.contact },
] as const;

export const siteLabels = {
  logIn: "Log in",
  createQuiz: "Create your quiz",
  myQuizzes: "My quizzes",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menu: "Menu",
  mainNav: "Main",
  accountMenu: "Account menu",
} as const;

export const accountMenuItems = {
  settings: "Account settings",
  plans: "Plans and pricing",
  help: "Help and contact",
  admin: "Admin",
  adminNote: "Only you see this",
  logOut: "Log out",
} as const;

export const siteFooter = {
  tagline: "Make a quiz people actually finish. Free to start, simple to share.",
  copyright: "© 2026 Quiz. All rights reserved.",
  motto: "Made for people who ask good questions.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "How it works", href: routes.howItWorks },
        { label: "Features", href: routes.features },
        { label: "Pricing", href: routes.pricing },
      ],
    },
    {
      title: "Get started",
      links: [
        { label: "Create your quiz", href: routes.register },
        { label: "Log in", href: routes.login },
        { label: "Create an account", href: routes.register },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Contact", href: routes.contact },
        { label: CONTACT_EMAIL, href: mailto() },
        { label: "Terms", href: routes.terms },
        { label: "Privacy", href: routes.privacy },
      ],
    },
  ],
} as const;

export const ctaBand = {
  title: ["Your first quiz is free.", "Start in under a minute."],
  text: "Name it, pick a start, and build. Log in to save and share it.",
  button: "Create your quiz",
} as const;
