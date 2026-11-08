/** Words of Edit with AI (boards AiHelper, AiHelperCheck, AiHelperStates). All fixed English; never part of the quiz data. */
export const aiHelper = {
  title: "Edit your quiz with AI",
  intro: "Use any AI chat you already have, like ChatGPT, Claude or Gemini. Ask it for the changes you want, then paste its answer back here. Nothing changes until you say so.",
  close: "Close",
  step1: {
    title: "Copy your quiz",
    text: "This copies your pages and a few short instructions that tell the AI how to answer.",
    copy: "Copy for AI",
    copyData: "Copy the quiz data only",
    copied: "Copied",
    copiedNote: "Now open your AI chat and paste.",
    note: "“Quiz data only” is for people who want to write their own instructions.",
    failed: "Your browser didn’t let us copy.",
    failedNote: "Select the text below and copy it yourself.",
    selectAll: "Select all the text",
    textLabel: "The text to copy",
  },
  step2: {
    title: "Paste it into your AI chat and say what to change",
    text: "Paste, then type your request under the pasted text. One kind of change at a time works best. Some ideas:",
    ideas: [
      "Add 3 questions about sleep after page 3",
      "Make every question shorter and friendlier",
      "Show the height page only to people who chose “Lose weight”",
      "Translate my questions and answers to Indonesian",
      "Check my quiz for spelling mistakes",
      "Write a 6-question quiz about sleep habits",
    ],
  },
  step3: {
    title: "Paste the AI’s answer here",
    text: "Paste the whole answer. Extra words or a box around it are fine, we find the quiz inside.",
    label: "The AI’s answer",
    check: "Check it",
    note: "You’ll see what will change before anything is updated.",
    checking: "Checking the answer…",
    checkingNote: "Takes a second. The Check button is off while we look.",
  },
  good: {
    title: "Good to know",
    items: [
      "Only your pages go to the AI. Your responses and settings are not copied.",
      "The AI can’t see or add pictures. Pictures you added stay on their pages. Add new ones yourself afterwards.",
      "Buttons and system messages, like “Continue” and error messages, are built in and stay in English. The AI only changes the text you wrote.",
      "Your AI chat has its own privacy rules for what you paste into it.",
    ],
  },
} as const;

export const aiMessages = {
  noQuiz: {
    title: "We couldn’t find a quiz in that text",
    text: "The AI may have answered in sentences instead of sending the quiz. Ask it:",
    quote: "“Send the whole quiz again as data, in one code box.”",
    after: "Then paste its new answer.",
    copy: "Copy that message to the AI",
    again: "Paste again",
  },
  cutOff: {
    title: "The answer stops in the middle",
    before: "Long answers sometimes get cut off. Ask the AI to",
    quote: "“continue”",
    after: ", or ask for a smaller change, then paste the whole answer.",
    copy: "Copy “continue”",
    again: "Paste again",
  },
  problems: {
    title: (count: number) => `${count} ${count === 1 ? "thing needs" : "things need"} fixing`,
    note: "Nothing was changed. Let the AI fix them:",
    back: "Back",
    copy: "Copy these for the AI",
  },
  tooMany: {
    title: (count: number) => `This would make ${count} pages`,
    text: (limit: number) => `The Free plan allows ${limit} pages in a quiz. Ask the AI to keep it to ${limit} pages or fewer, or contact us for a bigger plan.`,
    copy: "Copy that message to the AI",
    contact: "Contact us",
  },
  stale: {
    title: "You changed your quiz after you copied it",
    text: "If you update now, those changes are replaced by the AI’s version. Copy your quiz again to start from what you have now.",
    anyway: "Update anyway",
    again: "Copy my quiz again",
  },
  copied: "Copied. Now paste it into your AI chat.",
} as const;

export const aiCheck = {
  title: "Here’s what will change",
  text: "We read the AI’s answer. This is what your quiz looks like after the update. Nothing has changed yet.",
  counts: {
    added: (n: number) => (n === 1 ? "Page added" : "Pages added"),
    changed: (n: number) => (n === 1 ? "Page changed" : "Pages changed"),
    removed: (n: number) => (n === 1 ? "Page removed" : "Pages removed"),
    same: "Stay the same",
  },
  kinds: { added: "Added", changed: "Changed", removed: "Removed" },
  pagesAfter: (count: number, max: number) => `${count} of ${max} pages`,
  afterUpdate: "after the update",
  plan: "Free plan",
  draftBefore: "Still a draft. People keep seeing the published version until you press",
  publishChanges: "Publish changes",
  draftMiddle: ". If you don’t like the result, press",
  undo: "Undo",
  draftAfter: "in the editor.",
  back: "Back",
  update: "Update my quiz",
  leftOut: (count: number) => `${count} ${count === 1 ? "picture was" : "pictures were"} left out.`,
  leftOutText: (pages: number[]) =>
    `${pages.length === 1 ? `Page ${pages[0]} pointed` : `Pages ${pages.join(", ")} pointed`} to a picture that isn’t in your library, so ${pages.length === 1 ? "the page has" : "those pages have"} no picture now. You can add one yourself.`,
  /** No board for an answer that changes nothing (gap G2/G20). */
  nothing: { title: "Nothing would change", text: "The AI’s answer is the same as your quiz right now.", back: "Back" },
} as const;

export const aiToast = {
  updated: (added: number, changed: number, removed: number) => {
    const parts = [added && `${added} ${added === 1 ? "page" : "pages"} added`, changed && `${changed} changed`, removed && `${removed} removed`].filter(Boolean);
    return `Quiz updated · ${parts.join(", ")}`;
  },
} as const;
