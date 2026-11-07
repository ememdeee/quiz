import type { LegalDocument } from "./types";

export const privacy: LegalDocument = {
  title: "Privacy Policy",
  updated: "November 6, 2026",
  sections: [
    {
      id: "p1",
      title: "1. Who we are",
      blocks: [
        { type: "p", text: "Quiz (“Quiz”, “we”, “us”) is a service for building and sharing quizzes and forms. This policy explains what information we collect, why, and what you can do about it. It covers people who have a Quiz account, and people who answer a quiz made with Quiz." },
      ],
    },
    {
      id: "p2",
      title: "2. What we collect",
      blocks: [
        { type: "p", text: "**Account information.** Your name, email address and password (stored in a protected form). If you log in with Google, we receive your name, email address and profile picture from Google." },
        { type: "p", text: "**Your quizzes.** The pages, questions, pictures and settings you create." },
        { type: "p", text: "**Quiz answers.** The answers people give when they take a quiz, the time they answered, and how far they got. Which questions are asked is up to the quiz owner." },
        { type: "p", text: "**Usage and device information.** Basic technical data such as browser type, device type, pages visited and approximate location from your IP address. We use it to keep the service working and to understand how it is used." },
        { type: "p", text: "**Messages.** What you send us when you contact us." },
      ],
    },
    {
      id: "p3",
      title: "3. How we use it",
      blocks: [
        {
          type: "ul",
          items: [
            "to run the service: create accounts, host quizzes, save and show answers;",
            "to send you emails about your account, like verifying your email or resetting your password;",
            "to answer your messages and give support;",
            "to keep Quiz safe, prevent abuse and fix problems;",
            "to improve the service.",
          ],
        },
        { type: "p", text: "We do not sell your personal information, and we do not use quiz answers for advertising." },
      ],
    },
    {
      id: "p4",
      title: "4. Quiz answers and your role",
      blocks: [
        { type: "p", text: "If you take a quiz, the quiz owner decides what is asked and how the answers are used. We store and process those answers for the owner. If you have questions about your answers, please contact the quiz owner first." },
        { type: "p", text: "If you own a quiz, you are responsible for telling people what you collect and why, and for following the privacy laws that apply to you. See our [Terms of Service](page:Terms)." },
      ],
    },
    {
      id: "p5",
      title: "5. Who we share it with",
      blocks: [
        { type: "p", text: "We share information only with:" },
        {
          type: "ul",
          items: [
            "service providers that help us run Quiz, such as hosting, email delivery and error monitoring, who may only use it for us;",
            "the quiz owner, for answers to their quiz;",
            "authorities, when the law requires it, or to protect people’s safety and our rights;",
            "a new owner, if Quiz is ever sold or merged. We would tell you first.",
          ],
        },
      ],
    },
    {
      id: "p6",
      title: "6. How long we keep it",
      blocks: [
        { type: "p", text: "We keep your account and quizzes until you delete them. When you delete a quiz or your account, we delete the related quizzes and answers, except for what we must keep to follow the law, which we then keep only as long as needed." },
      ],
    },
    {
      id: "p7",
      title: "7. Your choices and rights",
      blocks: [
        { type: "p", text: "Depending on where you live, you may have the right to see, correct, download or delete your information, to object to some uses, and to withdraw consent. You can change your details and delete your account in your account settings. For anything else, or for answers you gave in someone else’s quiz, write to us and we will help." },
      ],
    },
    {
      id: "p8",
      title: "8. Cookies",
      blocks: [
        { type: "p", text: "We only use the cookies and storage the service needs: one keeps you logged in, and one remembers where you stopped in a quiz so you can continue on the same device. We don’t use advertising cookies. We measure how the service is used with a tool that doesn’t use cookies and doesn’t follow you across other sites, so we don’t need a cookie banner." },
      ],
    },
    {
      id: "p9",
      title: "9. Security",
      blocks: [
        { type: "p", text: "We protect your information with measures such as encrypted connections and restricted access. No service is completely secure, so please use a strong, unique password." },
      ],
    },
    {
      id: "p10",
      title: "10. Children",
      blocks: [
        { type: "p", text: "Quiz is not meant for children under 16, and we don’t knowingly collect their information for accounts. If you think a child has given us personal information, contact us and we will delete it." },
      ],
    },
    {
      id: "p11",
      title: "11. Changes",
      blocks: [
        { type: "p", text: "We may update this policy. When the changes matter, we will tell you by email or in the dashboard. The date at the top shows when it was last changed." },
      ],
    },
    {
      id: "p12",
      title: "12. Contact",
      blocks: [
        { type: "p", text: "Questions or requests about your privacy? Write to us at [basurah@basrh.com](mailto:basurah@basrh.com)." },
      ],
    },
  ],
};
