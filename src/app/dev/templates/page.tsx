import type { Metadata } from "next";
import Link from "next/link";
import { quizTemplates } from "@/data/mock/templates";
import { templateContents } from "@/content/dashboard/quizzes";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Templates · Quiz", robots: { index: false } };

/** Dev only: what each starting template contains (board TemplateContents), straight from the template data. */
export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-dash font-inter text-slate">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-9 py-9">
        <div>
          <Link href={routes.dev} className="text-sm font-semibold underline">Test links</Link>
          <h1 className="m-0 mt-2 text-[30px] font-extrabold leading-9 tracking-[-0.02em] text-ink">{templateContents.title}</h1>
          <p className="m-0 mt-1 text-base text-mute">{templateContents.subtitle}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {quizTemplates.map((template) => (
            <section key={template.id} className="rounded-[20px] border border-line bg-white p-6">
              <h2 className="m-0 text-[22px] font-bold text-ink">{template.name}</h2>
              <p className="m-0 mb-4 mt-1 text-[15px] text-mute">{template.tagline}</p>
              <ol className="m-0 list-none p-0">
                {template.pages.map((page, index) => (
                  <li key={page.title} className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                    <span className="grid size-[26px] flex-none place-items-center rounded-full bg-soft text-xs font-bold">{index + 1}</span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{page.title}</span>
                      <span className="text-[13px] text-mute">{page.kind}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
