"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ErrorCard } from "@/components/dashboard/error-card";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Select, Input } from "@/components/ui/field";
import { DownloadIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { overviewPage, usersPage } from "@/content/admin";
import { loadAllPeople, usePeople, type PeoplePage } from "@/hooks/use-admin";
import { dayLabel, peopleCsv, peopleFileName, showingRange } from "@/lib/admin/people";
import type { PeopleFilter } from "@/lib/admin/types";
import { formatNumber } from "@/lib/format";
import { planName } from "@/lib/plan/limits";
import { saveFile } from "@/lib/responses/export/download";
import { adminHref } from "@/lib/routes";
import { AdminTitle } from "./admin-shell";

const filterOptions = (Object.keys(usersPage.filters) as PeopleFilter[]).map((value) => ({ value, label: usersPage.filters[value] }));

/** `/admin/users`: everyone, with search, filters and pages (board AdminUsers). */
export function UsersPage({ initialFilter }: { initialFilter: PeopleFilter }) {
  const words = usersPage;
  const [typed, setTyped] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PeopleFilter>(initialFilter);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const { state, reload } = usePeople({ search, filter, page });

  // The table keeps showing the last rows while the next ones load, so it does not jump
  const last = useRef<PeoplePage | null>(null);
  if (state.status === "ready") last.current = state.data;
  const shown = state.status === "ready" ? state.data : last.current;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(typed);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [typed]);

  const download = async () => {
    setDownloading(true);
    const result = await loadAllPeople({ search, filter });
    setDownloading(false);
    if (result.ok) saveFile(new Blob([peopleCsv(result.data)], { type: "text/csv;charset=utf-8" }), peopleFileName());
  };

  const [from, to] = shown ? showingRange(shown.page, shown.total) : [0, 0];

  return (
    <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-8 pb-16 pt-8">
      <AdminTitle title={words.title} subtitle={shown ? words.count(shown.total) : undefined}>
        <Button shape="box" variant="secondary" size="sm" loading={downloading} onClick={download} className="gap-2">
          <DownloadIcon size={16} />
          {words.csv}
        </Button>
      </AdminTitle>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          shape="box"
          type="search"
          aria-label={words.search}
          placeholder={words.searchPlaceholder}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="min-h-11 min-w-0 flex-[1_1_280px] text-[15px]"
        />
        <Segmented
          aria-label={words.filterLabel}
          options={filterOptions}
          value={filter}
          onValueChange={(value) => {
            setFilter(value as PeopleFilter);
            setPage(1);
          }}
        />
        <Select aria-label={words.sortLabel} className="min-h-11 w-auto" defaultValue="newest">
          <option value="newest">{words.newestFirst}</option>
        </Select>
      </div>

      {state.status === "error" ? (
        <ErrorCard
          title={overviewPage.errorTitle}
          action={
            <Button shape="box" variant="secondary" size="sm" onClick={reload}>
              {overviewPage.tryAgain}
            </Button>
          }
        >
          {overviewPage.loadFailed}
        </ErrorCard>
      ) : !shown ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : shown.total === 0 ? (
        <p role="status" className="m-0 rounded-2xl border border-line bg-white px-6 py-10 text-center text-[15px] text-mute">
          {words.none}
        </p>
      ) : (
        <>
          <div className={state.status === "loading" ? "opacity-60 transition-opacity" : undefined}>
            <Table>
              <TableHead>
                <TableRow className="even:bg-transparent">
                  <TableHeadCell>{words.columns.person}</TableHeadCell>
                  <TableHeadCell>{words.columns.plan}</TableHeadCell>
                  <TableHeadCell>{words.columns.quizzes}</TableHeadCell>
                  <TableHeadCell>{words.columns.responses}</TableHeadCell>
                  <TableHeadCell>{words.columns.signedUp}</TableHeadCell>
                  <TableHeadCell>{words.columns.email}</TableHeadCell>
                  <TableHeadCell>
                    <span className="sr-only">{words.open}</span>
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shown.rows.map(({ person, quizzes, responses }) => (
                  <TableRow key={person.id} className="even:bg-white">
                    <TableCell>
                      <span className="block font-semibold text-ink">{person.name}</span>
                      <span className="block text-[13px] text-mute">{person.email}</span>
                    </TableCell>
                    <TableCell>
                      <Pill tone={person.plan === "custom" ? "solid" : "neutral"} className="px-2.5 py-[3px] text-xs">
                        {planName(person.plan)}
                      </Pill>
                    </TableCell>
                    <TableCell>{formatNumber(quizzes)}</TableCell>
                    <TableCell>{formatNumber(responses)}</TableCell>
                    <TableCell>{dayLabel(person.signedUpAt)}</TableCell>
                    <TableCell>
                      <Pill tone={person.emailVerified ? "soft" : "neutral"} className="px-2.5 py-[3px] text-xs">
                        {person.emailVerified ? words.verified : words.notVerified}
                      </Pill>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={adminHref.user(person.id)}
                        aria-label={words.openPerson(person.name)}
                        className="text-sm font-semibold text-slate focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
                      >
                        {words.open}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-mute">
            <span>{words.showing(from, to, shown.total)}</span>
            <span className="inline-flex gap-2">
              <Button shape="box" variant="secondary" size="sm" disabled={shown.page <= 1} onClick={() => setPage(shown.page - 1)}>
                {words.previous}
              </Button>
              <Button shape="box" variant="secondary" size="sm" disabled={shown.page >= shown.pages} onClick={() => setPage(shown.page + 1)}>
                {words.next}
              </Button>
            </span>
          </div>
        </>
      )}
    </main>
  );
}
