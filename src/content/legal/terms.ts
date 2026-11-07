import type { LegalDocument } from "./types";

export const terms: LegalDocument = {
  title: "Terms of Service",
  updated: "November 6, 2026",
  sections: [
    {
      id: "t1",
      title: "1. Agreeing to these terms",
      blocks: [
        { type: "p", text: "These terms apply when you use Quiz (“Quiz”, “we”, “us”) to create, share or take quizzes. By creating an account or using the service you agree to them. If you don’t agree, please don’t use Quiz." },
      ],
    },
    {
      id: "t2",
      title: "2. Your account",
      blocks: [
        { type: "p", text: "You need an account to create quizzes. You must give us a real email address and keep your login details safe. You are responsible for what happens under your account. Tell us right away if you think someone else has access to it." },
        { type: "p", text: "You must be old enough to enter a binding contract where you live, and at least 16 years old." },
      ],
    },
    {
      id: "t3",
      title: "3. The service",
      blocks: [
        { type: "p", text: "Quiz lets you build quizzes and forms, share them with a link, collect answers and download them. We may add, change or remove features over time." },
      ],
    },
    {
      id: "t4",
      title: "4. Your quizzes and content",
      blocks: [
        { type: "p", text: "You own your quizzes, your pictures and the answers you collect. You give us permission to store, process and display that content, but only to run the service for you." },
        { type: "p", text: "You are responsible for your content. You promise that you have the right to use it, and that it doesn’t break the law or anyone else’s rights." },
      ],
    },
    {
      id: "t5",
      title: "5. Responses and personal data",
      blocks: [
        { type: "p", text: "When people answer your quiz, you decide what to ask and why. That makes you responsible for those answers. You must tell people what you collect and how you use it, and follow the privacy laws that apply to you. We handle the answers on your behalf, as described in our [Privacy Policy](page:Privacy)." },
        { type: "p", text: "Don’t ask for sensitive information such as passwords, payment card numbers or government ID numbers in a quiz." },
      ],
    },
    {
      id: "t6",
      title: "6. Acceptable use",
      blocks: [
        { type: "p", text: "Please don’t use Quiz to:" },
        {
          type: "ul",
          items: [
            "break the law, or ask people to do something illegal;",
            "send spam, scams or misleading content;",
            "collect data from people who don’t know you are collecting it;",
            "upload viruses, or try to break, overload or get around our systems;",
            "harass, threaten or discriminate against anyone.",
          ],
        },
        { type: "p", text: "We may remove content or close accounts that break these rules." },
      ],
    },
    {
      id: "t7",
      title: "7. Plans and payments",
      blocks: [
        { type: "p", text: "The Free plan costs nothing. The Custom plan is agreed with you in writing before any work starts, including the price, what we will build and when. Unless we agree otherwise, Custom work is paid in advance or in the stages we agree together." },
      ],
    },
    {
      id: "t8",
      title: "8. Availability and changes",
      blocks: [
        { type: "p", text: "We work to keep Quiz running, but we can’t promise it will always be available or free of errors. We may pause the service for maintenance or updates. Please keep your own copy of important answers by downloading them from time to time." },
      ],
    },
    {
      id: "t9",
      title: "9. Ending your account",
      blocks: [
        { type: "p", text: "You can delete your account at any time from your account settings. When you do, we delete your quizzes and the answers you collected, except where the law requires us to keep something." },
        { type: "p", text: "We may suspend or close an account that breaks these terms. If we do, we will tell you why where we can." },
      ],
    },
    {
      id: "t10",
      title: "10. Our responsibility",
      blocks: [
        { type: "p", text: "Quiz is provided “as is”. To the fullest extent the law allows, we are not responsible for indirect or lost profits, lost data or business losses that come from using the service. Our total responsibility to you for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits responsibility that cannot be limited by law." },
      ],
    },
    {
      id: "t11",
      title: "11. Changes to these terms",
      blocks: [
        { type: "p", text: "We may update these terms. If a change is important, we will tell you by email or in the dashboard before it starts. If you keep using Quiz after that, you accept the new terms." },
      ],
    },
    {
      id: "t12",
      title: "12. Contact",
      blocks: [
        { type: "p", text: "Questions about these terms? Write to us at [basurah@basrh.com](mailto:basurah@basrh.com)." },
      ],
    },
  ],
};
