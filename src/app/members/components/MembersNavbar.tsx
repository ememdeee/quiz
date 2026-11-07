import Link from "next/link";
import Image from "next/image";

interface MembersNavbarProps {
  token: string;
  /** Which nav link should appear "active" */
  activeLink: "training" | "playing";
}

export default function MembersNavbar({ token, activeLink }: MembersNavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#0F4D3A]/5 animate-slide-down">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/members"
            className="text-xl font-black tracking-tighter text-[#0F4D3A] uppercase flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <Image src="/logo/LOGO.png" alt="Quiz logo" width={28} height={28} />
            <span className="text-[#155F4A] ml-2">Fit</span>Courses
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/members?token=${token}`}
              className={
                activeLink === "training"
                  ? "text-[#0F4D3A] font-semibold border-b-2 border-[#0F4D3A] pb-0.5 text-sm transition-colors duration-200"
                  : "text-[#4a4455] hover:text-[#0F4D3A] transition-colors duration-200 text-sm font-medium"
              }
            >
              My Training
            </Link>

            {activeLink === "playing" && (
              <span className="text-[#0F4D3A] font-semibold border-b-2 border-[#0F4D3A] pb-0.5 text-sm cursor-default">
                Now Playing
              </span>
            )}

            <Link
              href="/"
              className="text-[#4a4455] hover:text-[#0F4D3A] transition-colors duration-200 text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Call button */}
        <a
          href="tel:+6285155334644"
          title="Call Us"
          aria-label="Call us"
          className="flex items-center gap-2 text-[#0F4D3A] px-3 py-2 rounded-full hover:bg-[#DFF3EC] transition-colors duration-200 font-semibold text-sm"
        >
          <span className="material-symbols-outlined text-[#0F4D3A]">call</span>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">Call Us</span>
        </a>
      </div>
    </nav>
  );
}
