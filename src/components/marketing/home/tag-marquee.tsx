import { home } from "@/content/home";

/** Scrolling row of things people make with Quiz. The second copy only fills the loop. */
export function TagMarquee() {
  return (
    <div aria-label={home.tagsLabel} className="overflow-hidden border-y border-line bg-white py-[18px]">
      <div className="flex w-max animate-[marq_34s_linear_infinite] gap-3.5">
        {[0, 1].map((copy) =>
          home.tags.map((tag) => (
            <span
              key={`${copy}-${tag}`}
              aria-hidden={copy === 1 || undefined}
              className="inline-flex items-center whitespace-nowrap rounded-full border border-line bg-page px-[18px] py-2.5 text-[15px] font-semibold text-slate"
            >
              {tag}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
