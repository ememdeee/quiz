import { legalLabels } from "@/content/legal/labels";
import type { LegalDocument } from "@/content/legal/types";
import { textLink, softHover } from "@/components/ui/link-styles";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";
import { Container } from "../container";

const linkClass = cn("rounded font-semibold text-slate focus-visible:outline-[3px] focus-visible:outline-slate", textLink);

/** A long legal text with a sticky table of contents (boards Terms and Privacy). */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <header className="pb-7 pt-10 sm:pb-10 sm:pt-16">
        <Container>
          <span className="text-sm font-bold uppercase tracking-[0.06em] text-mute">{legalLabels.eyebrow}</span>
          <h1 className="mt-3 text-[clamp(34px,4.6vw,52px)] font-extrabold leading-[1.06] tracking-[-0.035em]">{document.title}</h1>
          <p className="mt-3.5 text-base text-mute">{legalLabels.updated}: {document.updated}</p>
        </Container>
      </header>

      <Container>
        <div className="flex items-start gap-14 pb-14 nav:pb-24">
          <nav aria-label={legalLabels.toc} className="sticky top-24 flex w-60 flex-none flex-col gap-0.5 max-nav:hidden">
            <span className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-mute">{legalLabels.toc}</span>
            {document.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={cn("flex min-h-10 items-center rounded-[10px] px-3 text-[15px] text-ink no-underline focus-visible:outline-[3px] focus-visible:outline-slate", softHover)}
              >
                {section.title}
              </a>
            ))}
          </nav>

          <article className="min-w-0 max-w-[720px] flex-1 rounded-[20px] border border-line bg-white px-[22px] py-7 text-slate sm:px-[22px] nav:rounded-3xl nav:p-12">
            {document.sections.map((section, index) => (
              <section key={section.id}>
                <h2
                  id={section.id}
                  className={`mb-2.5 scroll-mt-24 text-2xl font-bold leading-[30px] tracking-[-0.02em] text-ink ${index === 0 ? "mt-0" : "mt-10"}`}
                >
                  {section.title}
                </h2>
                {section.blocks.map((block, i) =>
                  block.type === "p" ? (
                    <p key={i} className="mb-3.5 mt-0 text-[17px] leading-7">
                      <RichText text={block.text} linkClassName={linkClass} />
                    </p>
                  ) : (
                    <ul key={i} className="mb-3.5 mt-0 list-disc pl-[22px] text-[17px] leading-7">
                      {block.items.map((item) => (
                        <li key={item}>
                          <RichText text={item} linkClassName={linkClass} />
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ))}
          </article>
        </div>
      </Container>
    </>
  );
}
