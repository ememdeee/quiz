import { UsersPage } from "@/components/admin/users-page";
import type { PeopleFilter } from "@/lib/admin/types";

const filters: PeopleFilter[] = ["everyone", "free", "custom", "unverified"];

/** `/admin/users`, optionally opened on a filter (`?filter=unverified`) from the Overview counters. */
export default async function AdminUsersRoute({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const initial = filters.find((f) => f === filter) ?? "everyone";
  return <UsersPage initialFilter={initial} />;
}
