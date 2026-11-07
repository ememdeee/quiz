import type { CSSProperties } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { home } from "@/content/home";
import { cn } from "@/lib/utils";

const slide = "absolute inset-0 flex animate-[cycle_9s_infinite] flex-col px-5 pb-6 pt-[34px]";
const vars = (v: Record<string, string>) => v as CSSProperties;

function ProgressBar({ percent, delay }: { percent: string; delay?: string }) {
  return (
    <div className="mb-[22px] h-[5px] rounded-full bg-line">
      <i
        className="block h-[5px] w-full origin-left animate-[fill_9s_infinite] rounded-full bg-slate"
        style={{ ...vars({ "--w": percent }), transform: "scaleX(var(--w))", animationDelay: delay }}
      />
    </div>
  );
}

/** The animated phone on the home page: three quiz pages that take turns. Decoration only. */
export function PhoneDemo() {
  const { slide1, slide2, slide3, floating } = home.phoneDemo;
  return (
    <div className="enter relative grid min-h-[620px] place-items-center nav:min-h-[600px]" style={vars({ "--d": "300ms" })}>
      <div
        aria-hidden="true"
        className="relative h-[580px] w-[290px] animate-[float_7s_ease-in-out_infinite_alternate] overflow-hidden rounded-[44px] border-[9px] border-slate bg-white shadow-[0_40px_80px_rgba(51,65,85,0.28)]"
      >
        <div className={cn(slide, "opacity-100")}>
          <ProgressBar percent="0.3" />
          <h3 className="mb-[18px] text-[22px] font-bold leading-7">{slide1.question}</h3>
          {slide1.options.map((option, i) => (
            <div
              key={option}
              className={cn(
                "mb-2.5 flex min-h-12 items-center gap-2.5 rounded-[13px] border-2 border-line px-3.5 text-[15px] font-medium",
                i === 1 && "animate-[pick_9s_infinite]",
              )}
            >
              <i
                className={cn(
                  "box-border size-[18px] flex-none rounded-full border-2 border-ctrl",
                  i === 1 && "animate-[pickdot_9s_infinite]",
                )}
              />
              {option}
            </div>
          ))}
        </div>

        <div className={cn(slide, "opacity-0 [animation-delay:-6s]")}>
          <ProgressBar percent="0.66" delay="-6s" />
          <h3 className="mb-[18px] text-[22px] font-bold leading-7">{slide2.question}</h3>
          <div className="mt-[26px] flex items-baseline justify-center gap-2 border-b-[3px] border-slate pb-2.5 pt-[34px]">
            <b className="text-[56px] font-extrabold leading-[64px]">{slide2.value}</b>
            <span className="ml-1 inline-block h-12 w-[3px] translate-y-2 animate-[blink_1s_steps(1)_infinite] bg-slate" />
            <span className="text-lg text-mute">{slide2.unit}</span>
          </div>
          <div className="mt-auto grid min-h-12 place-items-center rounded-[13px] bg-slate text-base font-semibold text-white">{slide2.button}</div>
        </div>

        <div className={cn(slide, "opacity-0 [animation-delay:-3s]")}>
          <div className="m-auto text-center">
            <div className="mx-auto mb-4 grid size-[74px] animate-[pop_9s_infinite] place-items-center rounded-full bg-slate text-white [animation-delay:-3s]">
              <CheckIcon size={36} />
            </div>
            <h3 className="mb-1.5 text-[26px] font-bold leading-7">{slide3.title}</h3>
            <span className="text-[15px] text-mute">{slide3.text}</span>
          </div>
        </div>
      </div>

      {floating.map((text, i) => (
        <span
          key={text}
          aria-hidden="true"
          className={cn(
            "absolute inline-flex animate-[float_5s_ease-in-out_infinite_alternate] items-center gap-2 whitespace-nowrap rounded-[14px] border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-[0_14px_34px_rgba(51,65,85,0.16)] max-nav:hidden",
            i === 0 && "left-[calc(50%-193px)] top-[60px] [animation-delay:-1s]",
            i === 1 && "right-[calc(50%-185px)] top-[250px] [animation-delay:-2.5s]",
            i === 2 && "bottom-[60px] left-[calc(50%-175px)] [animation-delay:-4s]",
          )}
        >
          {i === 0 ? <i className="ping size-2 rounded-full bg-slate" /> : null}
          {text}
        </span>
      ))}
    </div>
  );
}
