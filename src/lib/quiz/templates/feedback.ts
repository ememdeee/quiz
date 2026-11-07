import { FORMAT, type QuizDocument } from "../schema";

export const feedback: QuizDocument = {
  format: FORMAT,
  name: "Feedback",
  pages: [
    { id: "start", type: "welcome", title: "Tell us what you think", text: "Your answers help us do better.", picture: null },
    {
      id: "experience",
      type: "choice",
      question: "How was your experience?",
      answers: [
        { id: "great", text: "Great", picture: null },
        { id: "good", text: "Good", picture: null },
        { id: "okay", text: "Okay", picture: null },
        { id: "poor", text: "Poor", picture: null },
      ],
      multiple: false,
      required: true,
      picture: null,
    },
    { id: "recommend", type: "number", question: "How likely are you to recommend us?", kind: "number", unit: null, min: 0, max: 10, required: true },
    { id: "more", type: "text", question: "Anything else you’d like to add?", input: "any", hint: "Type your answer", required: false },
    { id: "end", type: "end", style: "thanks", title: "Thank you!", text: "We got your answers. You can close this page now.", picture: null },
  ],
};
