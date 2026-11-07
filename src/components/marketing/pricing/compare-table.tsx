import { CheckIcon } from "@/components/ui/icons";
import { pricing } from "@/content/pricing";
import { Container } from "../container";
import { SectionHeading } from "../section-heading";

const row =
  "grid grid-cols-[minmax(0,1.5fr)_56px_56px] items-center gap-3 border-t border-line px-4 py-3.5 text-[15px] first:border-t-0 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] sm:px-6 sm:py-4 sm:text-base";

function Cell({ value }: { value: boolean | string }) {
  const { compare } = pricing;
  return (
    <span role="cell" className="flex justify-center text-center">
      {value === true ? (
        <>
          <CheckIcon size={20} className="text-slate" />
          <span className="sr-only">{compare.included}</span>
        </>
      ) : value === false ? (
        <>
          <span aria-hidden="true" className="text-ctrl">–</span>
          <span className="sr-only">{compare.notIncluded}</span>
        </>
      ) : (
        value
      )}
    </span>
  );
}

export function CompareTable() {
  const { compare } = pricing;
  return (
    <section className="py-20 max-[700px]:py-14">
      <Container>
        <SectionHeading eyebrow={compare.eyebrow} title={compare.title} align="center" />
        <div role="table" aria-label={compare.title} className="scroll-rise mt-10 overflow-hidden rounded-[22px] border border-line bg-white">
          <div role="row" className={`${row} bg-page text-sm font-bold uppercase tracking-[0.04em] text-mute max-sm:text-xs max-sm:tracking-normal`}>
            <span role="columnheader">{compare.columns.feature}</span>
            <span role="columnheader" className="text-center">{compare.columns.free}</span>
            <span role="columnheader" className="text-center">{compare.columns.custom}</span>
          </div>
          {compare.rows.map((item) => (
            <div role="row" key={item.feature} className={row}>
              <span role="cell">{item.feature}</span>
              <Cell value={item.free} />
              <Cell value={item.custom} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
