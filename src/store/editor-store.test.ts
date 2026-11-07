import { describe, expect, it } from "vitest";
import { quizTemplates } from "@/lib/quiz/templates";
import { createEditorStore, TYPING_GROUP_MS } from "./editor-store";

const doc = quizTemplates[1].document;
const make = () => {
  let time = 0;
  const store = createEditorStore(doc, () => time);
  return { store, tick: (ms: number) => (time += ms) };
};
const recommend = (store: ReturnType<typeof make>["store"]) => {
  const page = store.getState().doc.pages.find((p) => p.id === "recommend");
  return page?.type === "number" ? page.question : "";
};

describe("editor store", () => {
  it("starts on the first page with nothing to undo", () => {
    const { store } = make();
    expect(store.getState().selectedId).toBe("start");
    expect(store.getState().canUndo()).toBe(false);
  });

  it("makes one Undo step per action and undoes it", () => {
    const { store } = make();
    store.getState().add("info");
    store.getState().duplicate("experience");
    expect(store.getState().doc.pages).toHaveLength(7);
    store.getState().undo();
    expect(store.getState().doc.pages).toHaveLength(6);
    store.getState().undo();
    expect(store.getState().doc).toEqual(doc);
    expect(store.getState().canUndo()).toBe(false);
  });

  it("selects the page it just added or copied", () => {
    const { store } = make();
    const page = store.getState().add("text");
    expect(store.getState().selectedId).toBe(page.id);
  });

  it("groups quick typing in one field into one step, and splits it after a pause", () => {
    const { store, tick } = make();
    store.getState().edit("recommend", (p) => void (p.type === "number" && (p.question = "A")), "question");
    tick(100);
    store.getState().edit("recommend", (p) => void (p.type === "number" && (p.question = "AB")), "question");
    expect(store.getState().past).toHaveLength(1);
    tick(TYPING_GROUP_MS + 10);
    store.getState().edit("recommend", (p) => void (p.type === "number" && (p.question = "ABC")), "question");
    expect(store.getState().past).toHaveLength(2);
    store.getState().undo();
    expect(recommend(store)).toBe("AB");
  });

  it("does not group typing in two different fields or on two pages", () => {
    const { store } = make();
    store.getState().edit("recommend", (p) => void (p.type === "number" && (p.question = "A")), "question");
    store.getState().edit("more", (p) => void (p.type === "text" && (p.question = "B")), "question");
    expect(store.getState().past).toHaveLength(2);
  });

  it("bumps the revision on every change and on undo", () => {
    const { store } = make();
    store.getState().add("info");
    const after = store.getState().revision;
    store.getState().undo();
    expect(store.getState().revision).toBeGreaterThan(after);
  });

  it("moves pages and reports a blocked move without changing anything", () => {
    const { store } = make();
    expect(store.getState().move("more", 1)).toBeNull();
    expect(store.getState().doc.pages[1].id).toBe("more");
    expect(store.getState().move("start", 2)).toBe("locked");
    expect(store.getState().past).toHaveLength(1);
  });

  it("selects a neighbour when the selected page is deleted, and brings it back on Undo", () => {
    const { store } = make();
    store.getState().select("recommend");
    store.getState().remove("recommend");
    expect(store.getState().selectedId).toBe("more");
    store.getState().undo();
    expect(store.getState().doc.pages.some((p) => p.id === "recommend")).toBe(true);
  });

  it("remembers which choice pages show picture slots", () => {
    const { store } = make();
    store.getState().setAnswerPictures("experience", true);
    expect(store.getState().answerPictures.experience).toBe(true);
    expect(store.getState().past).toHaveLength(0);
  });
});
