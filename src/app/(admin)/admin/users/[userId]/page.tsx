import { PersonPage } from "@/components/admin/person-page";
import { MOCK_ADMIN_EMAIL } from "@/data/mock/admin";
import { getSessionUser } from "@/server/session";

export default async function AdminPersonRoute({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getSessionUser();
  // The real version compares ids; in the mock the admin's own account is the one with the admin's email
  return <PersonPage personId={userId} selfEmail={user?.email ?? MOCK_ADMIN_EMAIL} />;
}
