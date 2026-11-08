"use client";

import { useState, useSyncExternalStore } from "react";
import { defaultFlags, readFlags, subscribeFlags, writeFlags, type MockFlags } from "@/server/repos/mock/flags";
import { emptyList, fillToLimit, makeGoogleOnly, resetAll, setBodyResetResponses } from "@/server/repos/mock/dev";

const btn =
  "flex min-h-11 items-center rounded-[10px] border border-line bg-white px-3.5 text-left text-[15px] font-medium text-slate hover:bg-soft focus-visible:outline-[3px] focus-visible:outline-slate";

const switches: { key: keyof MockFlags; label: string }[] = [
  { key: "slow", label: "Slow loading (3 seconds, to see the grey blocks)" },
  { key: "failNextLoad", label: "Next list load fails (“We couldn’t load your quizzes”)" },
  { key: "offline", label: "Pretend offline (the offline bar)" },
  { key: "suspended", label: "Pretend suspended (“Your account is suspended”)" },
  { key: "loggedOut", label: "Pretend logged out (“You’ve been logged out”)" },
  { key: "failNextSave", label: "Next quiz answer fails to save (“We couldn’t save your answer”)" },
  { key: "failNextQuizLoad", label: "Next quiz link fails to open (“Something went wrong”)" },
  { key: "conflictNextSave", label: "Next editor save says “changed somewhere else” (no board yet)" },
];

/** Dev only: puts the dashboard's dummy data and switches into a known state. Nothing here is saved anywhere real. */
export function DashboardDevTools() {
  const flags = useSyncExternalStore(subscribeFlags, () => JSON.stringify(readFlags()), () => JSON.stringify(defaultFlags));
  const current: MockFlags = JSON.parse(flags);
  const [done, setDone] = useState("");

  const run = (label: string, action: () => void) => () => {
    action();
    setDone(label);
  };

  return (
    <div className="mt-3 flex flex-col gap-4">
      <div className="flex flex-wrap gap-2.5">
        <button type="button" className={btn} onClick={run("Dummy data reset (3 quizzes, all switches off)", resetAll)}>Reset the dummy data</button>
        <button type="button" className={btn} onClick={run("List is now empty", emptyList)}>Empty list (no quizzes)</button>
        <button type="button" className={btn} onClick={run("List is now full (5 of 5)", fillToLimit)}>Fill to the limit (5 of 5)</button>
        <button type="button" className={btn} onClick={run("Body Reset has 450 finished responses (almost full banner)", () => setBodyResetResponses(450))}>Body Reset: 450 responses</button>
        <button type="button" className={btn} onClick={run("Body Reset has 500 finished responses (full banner)", () => setBodyResetResponses(500))}>Body Reset: 500 responses</button>
        <button type="button" className={btn} onClick={run("The account now logs in with Google only", makeGoogleOnly)}>Account: Google only</button>
      </div>
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {switches.map(({ key, label }) => (
          <li key={key}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border border-line bg-white px-3.5 text-[15px]">
              <input type="checkbox" checked={current[key]} onChange={(e) => writeFlags({ [key]: e.target.checked })} className="size-[18px] accent-slate" />
              {label}
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className="m-0 min-h-5 text-sm text-mute">{done}</p>
    </div>
  );
}
