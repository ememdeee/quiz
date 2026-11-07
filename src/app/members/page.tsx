import Link from "next/link";
import { getCourses } from "@/lib/courseSchemas";
import MembersNavbar from "./components/MembersNavbar";
import MembersFooter from "./components/MembersFooter";
import ScrollReveal from "./components/ScrollReveal";
import CourseGrid from "./components/CourseGrid";
import fs from "fs/promises";
import path from "path";

async function getQuizUrl(): Promise<string> {
  try {
    const settingsPath = path.join(process.cwd(), "public", "data", "settings.json");
    const raw = await fs.readFile(settingsPath, "utf-8");
    const settings = JSON.parse(raw);
    return settings.homePageQuiz ? `/quiz/${settings.homePageQuiz}` : "/quiz";
  } catch {
    return "/quiz";
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const { courses } = await getCourses();
  const quizUrl = await getQuizUrl();

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen">

      <MembersNavbar token={token} activeLink="training" />

      <main className="pt-16">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[#DFF3EC] py-24 md:py-32">
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#0F4D3A]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#C9F84B]/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <span
                className="text-xs font-bold tracking-[0.15em] text-[#0F4D3A] uppercase mb-4 block opacity-0 animate-fade-in-up"
                style={{ animationDelay: "50ms" }}
              >
                YOUR TRAINING DASHBOARD
              </span>
              <h1
                className="text-5xl md:text-7xl font-black tracking-tighter text-[#0F4D3A] leading-[1.05] mb-8 opacity-0 animate-fade-in-up"
                style={{ animationDelay: "150ms" }}
              >
                Transform your body{" "}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#155F4A] to-[#C9F84B] italic">
                  at home.
                </span>
              </h1>
              <p
                className="text-xl text-[#155F4A] leading-relaxed mb-10 max-w-xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: "250ms" }}
              >
                Your personalized fitness program is ready. Follow the video sessions, track your progress, and build the body you want — no gym needed.
              </p>
              <div
                className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up"
                style={{ animationDelay: "350ms" }}
              >
                <a
                  href="#courses"
                  className="bg-[#0F4D3A] text-white px-8 py-4 rounded-full font-bold transition-all duration-200 hover:bg-[#155F4A] hover:scale-105 active:scale-95 shadow-xl shadow-[#0F4D3A]/20 w-full text-center sm:w-fit"
                >
                  Start Training
                </a>
                <Link
                  href={quizUrl}
                  className="bg-white border border-[#0F4D3A]/10 text-[#0F4D3A] px-8 py-4 rounded-full font-bold transition-all duration-200 hover:bg-white/80 active:scale-[0.98] shadow-sm w-full text-center sm:w-fit"
                >
                  Take the Body Quiz
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Course Index ── */}
        <section id="courses" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <CourseGrid courses={courses} token={token} />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-[#DFF3EC]">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <div className="bg-[#0F4D3A] rounded-2xl p-12 md:p-20 relative overflow-hidden text-center flex flex-col items-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#C9F84B]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                <span className="text-[#C9F84B] font-bold tracking-widest uppercase text-xs mb-4 relative z-10">
                  Stay Consistent
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6 max-w-2xl relative z-10 uppercase leading-[0.95]">
                  Ready to Transform <br />
                  <span className="text-[#C9F84B]">Your Body?</span>
                </h2>
                <p className="text-white/70 mb-10 max-w-lg relative z-10 text-lg">
                  Get weekly workout tips, nutrition advice, and motivation delivered to your inbox. Join 50,000+ members already crushing their goals.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md relative z-10">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9F84B]/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-[#C9F84B] text-[#0F4D3A] px-8 py-4 rounded-full font-black transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <MembersFooter />
    </div>
  );
}
