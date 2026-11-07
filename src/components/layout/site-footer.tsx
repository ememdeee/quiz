import Link from "next/link";
import { textLink } from "@/components/ui/link-styles";
import { siteFooter } from "@/content/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const linkClass = cn(
  "inline-flex min-h-9 items-center rounded text-base text-ink focus-visible:outline-[3px] focus-visible:outline-slate",
  textLink,
);

/** Website footer (boards SiteFooter and SiteFooterMobile: the columns simply wrap on a phone). */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white px-6 pb-9 pt-14 text-ink">
      <div className="mx-auto flex max-w-[1096px] flex-wrap justify-between gap-x-16 gap-y-10">
        <div className="flex max-w-[340px] flex-[1_1_260px] flex-col gap-4">
          <Logo height={34} />
          <p className="m-0 text-base leading-[25px] text-mute">{siteFooter.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-14 gap-y-8">
          {siteFooter.columns.map((column) => (
            <div key={column.title} className="flex min-w-[130px] flex-col gap-1.5">
              <span className="mb-1.5 text-[13px] font-bold uppercase tracking-[0.06em] text-mute">{column.title}</span>
              {column.links.map((link) =>
                link.href.startsWith("mailto:") ? (
                  <a key={link.label} href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1096px] flex-wrap justify-between gap-2 border-t border-line pt-6 text-sm text-mute">
        <span>{siteFooter.copyright}</span>
        <span>{siteFooter.motto}</span>
      </div>
    </footer>
  );
}
