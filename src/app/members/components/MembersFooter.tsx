import Link from "next/link";
import Image from "next/image";

export default function MembersFooter() {
  return (
    <footer className="w-full py-12 border-t border-[#0F4D3A]/10 bg-[#DFF3EC]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter text-[#0F4D3A] uppercase flex items-center"
          >
            <Image src="/logo/LOGO.png" alt="Quiz logo" width={28} height={28} />
            <span className="text-[#155F4A] ml-2">Fit</span>Courses
          </Link>
          <span className="text-sm text-[#0F4D3A]/60">© 2026 Quiz Inc. All rights reserved.</span>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {["Privacy", "Terms", "Help Center", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-[#0F4D3A]/60 hover:text-[#0F4D3A] underline underline-offset-4 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
