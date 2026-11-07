import { NO_OVERRIDES } from "@/lib/plan/limits";
import type { AdminPerson, AdminQuiz } from "@/lib/admin/types";

/** The email of the logged-in admin in the mock session (`server/session.ts`). The admin cannot suspend or delete this account. */
export const MOCK_ADMIN_EMAIL = "admin@quiz.test";

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

const quiz = (id: string, name: string, status: AdminQuiz["status"], responses: number, pages: number, updatedAgo: number, now: number): AdminQuiz => ({
  id,
  name,
  status,
  pages,
  responses,
  updatedAt: new Date(now - updatedAgo).toISOString(),
});

type Seed = Partial<AdminPerson> & Pick<AdminPerson, "id" | "name" | "email"> & { agoMs: number };

/** About 40 made-up people, as in handover 2.0: the ones on the boards first, then a spread of plans, limits and sign-up days. */
export function seedPeople(now: number = Date.now()): AdminPerson[] {
  const base = (seed: Seed, quizzes: AdminQuiz[]): AdminPerson => {
    const { agoMs, ...rest } = seed;
    return {
      plan: "free",
      brandColors: false,
      hidePoweredBy: false,
      customDomain: null,
      overrides: NO_OVERRIDES,
      emailVerified: true,
      signedUpAt: new Date(now - agoMs).toISOString(),
      signsInWithGoogle: false,
      suspendedAt: null,
      notes: "",
      quizzes,
      ...rest,
    };
  };
  const q = (id: string, name: string, status: AdminQuiz["status"], responses: number, pages: number, updatedAgo: number) => quiz(id, name, status, responses, pages, updatedAgo, now);

  const named: AdminPerson[] = [
    base({ id: "u-sarah-lee", name: "Sarah Lee", email: "sarah@example.com", agoMs: 2 * HOUR, emailVerified: false }, [q("sl1", "Welcome survey", "not_published", 0, 4, HOUR)]),
    base({ id: "u-budi", name: "Budi Santoso", email: "budi@example.com", agoMs: 5 * HOUR }, [q("bs1", "Product feedback", "open", 38, 6, 3 * DAY), q("bs2", "Event signup", "open", 10, 5, 4 * DAY)]),
    base(
      {
        id: "u-maria",
        name: "Maria Gomez",
        email: "maria@example.com",
        agoMs: 1.3 * DAY,
        plan: "custom",
        brandColors: true,
        hidePoweredBy: true,
        customDomain: "quiz.mariastudio.com",
        overrides: { maxQuizzes: 50, maxPages: 60, maxResponses: 10000 },
        signsInWithGoogle: true,
        notes: "Agreed price by email on Nov 5. Domain set up by us. Review in 3 months.",
      },
      [q("mg1", "Studio intake", "open", 1420, 12, 2 * DAY), q("mg2", "Find your style", "open", 482, 9, 3 * DAY), q("mg3", "Summer promo", "closed", 0, 5, 20 * DAY), q("mg4", "Draft: referral form", "not_published", 0, 3, 35 * DAY)],
    ),
    base({ id: "u-daniel", name: "Daniel Kim", email: "daniel@example.com", agoMs: 1.6 * DAY }, [
      q("dk1", "Customer check-in", "open", 470, 14, DAY),
      q("dk2", "Onboarding", "open", 18, 8, 6 * DAY),
      q("dk3", "Exit survey", "closed", 22, 5, 14 * DAY),
      q("dk4", "NPS", "open", 55, 4, 9 * DAY),
      q("dk5", "Beta signup", "open", 107, 6, 12 * DAY),
    ]),
    base({ id: "u-putri", name: "Putri Ayu", email: "putri@example.com", agoMs: 2 * DAY, signsInWithGoogle: true }, [
      q("pa1", "Wedding RSVP", "open", 150, 7, 5 * DAY),
      q("pa2", "Menu choices", "open", 40, 4, 5 * DAY),
      q("pa3", "Guest book", "closed", 22, 3, 30 * DAY),
    ]),
    base(
      { id: "u-alex", name: "Alex Morgan", email: "alex@example.com", agoMs: 4 * DAY, plan: "custom", brandColors: true, overrides: { maxQuizzes: 30, maxPages: null, maxResponses: 20000 } },
      Array.from({ length: 11 }, (_, i) => q(`am${i}`, `Campaign ${i + 1}`, i % 4 === 3 ? "closed" : "open", 600 + i * 70, 6 + (i % 5), (i + 1) * DAY)),
    ),
    base({ id: "u-rina", name: "Rina Wijaya", email: "rina@example.com", agoMs: 5 * DAY }, [q("rw1", "Class feedback", "open", 7, 5, 5 * DAY)]),
    base({ id: "u-tom", name: "Tom Becker", email: "tom@example.com", agoMs: 6 * DAY, emailVerified: false }, [q("tb1", "Garage sale", "open", 60, 4, 6 * DAY), q("tb2", "Neighbour poll", "open", 36, 3, 6 * DAY)]),
    base({ id: "u-self", name: "Muhammad Basurah", email: MOCK_ADMIN_EMAIL, agoMs: 120 * DAY, signsInWithGoogle: true }, [q("ms1", "Test quiz", "open", 12, 5, 8 * DAY)]),
    base(
      { id: "u-demo", name: "Sarah Miller", email: "demo@quiz.test", agoMs: 60 * DAY },
      [q("sm1", "Body Reset", "open", 128, 7, 2 * DAY), q("sm2", "Debug quiz", "closed", 12, 4, 21 * DAY), q("sm3", "Customer feedback", "not_published", 0, 2, 10_000)],
    ),
    base({ id: "u-suspended", name: "Kevin Ross", email: "kevin@example.com", agoMs: 50 * DAY, suspendedAt: new Date(now - 3 * DAY).toISOString(), notes: "Reported by two people for phishing links." }, [
      q("kr1", "Prize draw", "closed", 90, 3, 3 * DAY),
    ]),
  ];

  const first = ["Ayu", "Bima", "Chloe", "Dewi", "Evan", "Farah", "Gita", "Hugo", "Indra", "Jenny", "Kiran", "Lena", "Mateo", "Nina", "Omar", "Priya", "Quinn", "Rafi", "Sofia", "Tariq", "Uma", "Victor", "Wulan", "Xavier", "Yuki", "Zara", "Andre", "Bella", "Citra", "Dimas", "Elena"];
  const last = ["Nguyen", "Pratama", "Silva", "Haddad", "Okafor", "Larsen", "Wijaya", "Rossi", "Tanaka", "Moreau", "Kurniawan", "Mensah"];
  let seed = 11;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const generated = first.map((name, i) => {
    const surname = last[i % last.length];
    const custom = i % 9 === 4;
    const count = custom ? 3 + Math.floor(next() * 5) : Math.floor(next() * 4);
    const quizzes = Array.from({ length: count }, (_, k) => q(`g${i}-${k}`, `${name}’s quiz ${k + 1}`, next() < 0.7 ? "open" : next() < 0.5 ? "closed" : "not_published", Math.floor(next() * (custom ? 3000 : 220)), 3 + Math.floor(next() * 8), Math.floor(next() * 40 * DAY)));
    return base(
      {
        id: `u-${name.toLowerCase()}`,
        name: `${name} ${surname}`,
        email: `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
        agoMs: (7 + i * 1.2 + next() * 2) * DAY,
        plan: custom ? "custom" : "free",
        brandColors: custom,
        emailVerified: i % 7 !== 3,
        signsInWithGoogle: i % 5 === 0,
      },
      quizzes,
    );
  });

  return [...named, ...generated];
}
