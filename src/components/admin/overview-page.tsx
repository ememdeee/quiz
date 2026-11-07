"use client";

import Link from "next/link";
import { ErrorCard } from "@/components/dashboard/error-card";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { overviewPage } from "@/content/admin";
import { useAdminOverview } from "@/hooks/use-admin";
import { formatNumber } from "@/lib/format";
import { adminHref } from "@/lib/routes";
import { planName } from "@/lib/plan/limits";
import { dayLabel } from "@/lib/admin/people";
import type { AdminOverviewData } from "@/lib/admin/types";
import { AdminTitle } from "./admin-shell";

const card = "rounded-2xl border border-line bg-white p-[22px]";

/** `/admin`: how many people use Quiz (board AdminOverview). */
export function OverviewPage() {
  const { state, reload } = useAdminOverview();
  const words = overviewPage;

  return (
    <main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-8 pb-16 pt-8">
      <AdminTitle title={words.title} subtitle={words.subtitle} />
      {state.status === "loading" ? <OverviewSkeleton /> : null}
      {state.status === "error" ? (
        <ErrorCard
          title={words.errorTitle}
          action={
            <Button shape="box" variant="secondary" size="sm" onClick={reload}>
              {words.tryAgain}
            </Button>
          }
        >
          {words.loadFailed}
        </ErrorCard>
      ) : null}
      {state.status === "ready" ? <Overview data={state.data} /> : null}
    </main>
  );
}

function Overview({ data }: { data: AdminOverviewData }) {
  const words = overviewPage;
  const stats: [string, number][] = [
    [words.stats.signedUp, data.signedUp],
    [words.stats.week, data.newThisWeek],
    [words.stats.month, data.newThisMonth],
    [words.stats.custom, data.custom],
    [words.stats.quizzes, data.quizzes],
    [words.stats.responses, data.responses],
  ];
  const tallest = Math.max(1, ...data.daily);

  return (
    <>
      <dl className="m-0 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(([label, value]) => (
          <div key={label} className={card}>
            <dd className="m-0 text-[34px] font-extrabold leading-10 tracking-[-0.02em] text-ink">{formatNumber(value)}</dd>
            <dt className="text-sm text-mute">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className={card}>
          <h2 className="m-0 mb-1 text-lg font-bold text-ink">{words.chartTitle}</h2>
          <p className="m-0 mb-4 text-sm text-mute">{words.chartSub}</p>
          <div className="flex h-[180px] items-end gap-1.5 border-b border-line" role="img" aria-label={words.chartTitle}>
            {data.daily.map((count, index) => (
              <div
                key={index}
                title={words.bar(count, 29 - index)}
                className="min-w-0 flex-1 rounded-t bg-bar"
                style={{ height: `${Math.max(count > 0 ? 4 : 0, (count / tallest) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-mute">
            <span>{words.chartStart}</span>
            <span>{words.chartEnd}</span>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <Counter value={data.unverified} label={words.unverified} href={`${adminHref.users}?filter=unverified`} />
          <Counter value={data.nearLimit} label={words.nearLimit} href={`${adminHref.users}?filter=near-limit`} />
        </div>
      </div>

      <section className={card}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="m-0 text-lg font-bold text-ink">{words.newest}</h2>
          <Link href={adminHref.users} className="text-[15px] font-semibold text-slate">
            {words.seeEveryone}
          </Link>
        </div>
        <ul className="m-0 mt-2 list-none p-0">
          {data.newest.map((person) => (
            <li key={person.id} className="grid grid-cols-[minmax(0,1.5fr)_90px_110px] items-center gap-3 border-t border-soft py-3 text-[15px] first:border-t-0">
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink">{person.name}</span>
                <span className="block truncate text-[13px] text-mute">{person.email}</span>
              </span>
              <span>
                <Pill tone={person.plan === "custom" ? "solid" : "neutral"} className="px-2.5 py-[3px] text-xs">
                  {planName(person.plan)}
                </Pill>
              </span>
              <span className="text-sm text-mute">{dayLabel(person.signedUpAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Counter({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link href={href} className={`${card} flex items-center justify-between gap-3 text-inherit no-underline hover:bg-dash focus-visible:outline-[3px] focus-visible:outline-slate`}>
      <span>
        <b className="block text-[28px] font-extrabold text-ink">{formatNumber(value)}</b>
        <span className="text-sm text-mute">{label}</span>
      </span>
      <ChevronRightIcon size={20} className="text-mute" />
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[98px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-2xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  );
}
