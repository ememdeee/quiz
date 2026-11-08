import { UsersPage } from "@/components/admin/users-page";
import { usersPage } from "@/content/admin";
import type { PeopleFilter } from "@/lib/admin/types";

const filters = Object.keys(usersPage.filters) as PeopleFilter[];

/** `/admin/users`, optionally opened on a filter (`?filter=unverified`) from the Overview counters. */
export default async function AdminUsersRoute({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const initial = filters.find((f) => f === filter) ?? "everyone";
  return <UsersPage initialFilter={initial} />;
}
