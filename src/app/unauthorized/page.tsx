import Image from "next/image";
import Link from "next/link";
import fs from "fs/promises";
import path from "path";

export const metadata = {
  title: "Members Only - Quiz",
};

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

export default async function UnauthorizedPage() {
  const quizUrl = await getQuizUrl();

  return (
    <div className="bg-[#DFF3EC] text-[#191c1d] selection:bg-[#C9F84B] selection:text-[#0F4D3A] min-h-screen flex flex-col">
      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden bg-white rounded-2xl shadow-xl">

          {/* Left: Visual Anchor */}
          <div className="md:col-span-5 relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F4D3A] to-[#155F4A] opacity-90 z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
              alt="Home workout training"
            />
            <div className="relative z-20 h-full p-12 flex flex-col justify-between text-white">
              <div>
                <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center">
                  <Image src="/logo/WHITE.png" alt="logo fit home" width={40} height={40} />
                  <span className="text-[#C9F84B] ml-2">Fit</span>Home
                </Link>
              </div>
              <div className="space-y-4">
                <div className="h-1 w-12 bg-white/30" />
                <p className="text-sm font-medium leading-relaxed opacity-80">
                  Your personalized training programs are reserved for active Quiz members.
                  Complete the body quiz to get started.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="md:col-span-7 bg-white p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-8">
              {/* Lock icon */}
              <span className="inline-flex items-center justify-center p-3 rounded-full bg-[#DFF3EC] text-[#0F4D3A] mb-6">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
              </span>

              <h2 className="text-4xl font-extrabold tracking-tight text-[#0F4D3A] mb-4">
                Members Only
              </h2>
              <p className="text-[#4a4455] text-lg leading-relaxed max-w-md">
                This training program is available exclusively to Quiz members.
                Take the body quiz to get your personalized plan and access all courses.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={quizUrl}
                className="w-full py-4 bg-[#0F4D3A] text-white font-semibold rounded-full shadow-sm transition-all duration-200 hover:bg-[#155F4A] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                Take the Body Quiz
              </Link>
              <Link
                href="/"
                className="w-full py-4 bg-[#DFF3EC] text-[#0F4D3A] font-semibold rounded-full transition-all duration-200 hover:bg-[#c8eee0] active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Back to Home
              </Link>
            </div>

            {/* Footer link */}
            <div className="mt-12 pt-8 border-t border-[#DFF3EC]">
              <p className="text-sm text-[#4a4455]">
                Already a member?{" "}
                <a
                  href="#"
                  className="text-[#0F4D3A] font-medium underline underline-offset-4 hover:opacity-80"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-[#0F4D3A]/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tighter text-[#0F4D3A] uppercase">
            <span className="text-[#155F4A]">Fit</span>Home
          </Link>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy", "Terms", "Help Center", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-[#0F4D3A]/60 hover:text-[#0F4D3A] transition-colors duration-200 underline underline-offset-4"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="text-sm text-[#0F4D3A]/60">© 2026 Quiz Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
