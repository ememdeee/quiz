"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/lib/courseSchemas";
import ScrollReveal from "./ScrollReveal";

const FILTERS = ["All Programs", "Beginner", "Advanced"] as const;
type Filter = typeof FILTERS[number];

/* ------------------------------------------------------------------ */
/* Course Card                                                           */
/* ------------------------------------------------------------------ */
function CourseCard({ course, token }: { course: Course; token: string }) {
  const href = `/members/course/${course.slug}?token=${token}`;

  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative aspect-video mb-6 overflow-hidden rounded-xl bg-[#e7e8e9]">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[#0F4D3A]">fitness_center</span>
          </div>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-[#0F4D3A]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-[#0F4D3A] font-bold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span className="material-symbols-outlined text-sm">play_circle</span>
            Start Training
          </span>
        </div>

        {course.level && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full text-[#0F4D3A]">
              {course.level}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-[#4a4455]/60 tracking-widest uppercase">
            {course.videos.length.toString().padStart(2, "0")} Videos
          </span>
          <span className="w-1 h-1 rounded-full bg-[#ccc3d8]/30" />
          {course.totalDuration && (
            <span className="text-[10px] font-bold text-[#4a4455]/60 tracking-widest uppercase">
              {course.totalDuration}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-[#191c1d] mb-2 group-hover:text-[#0F4D3A] transition-colors duration-200">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-[#4a4455] text-sm mb-6 line-clamp-2">{course.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          {course.instructor && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#DFF3EC] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-base text-[#0F4D3A]">fitness_center</span>
              </div>
              <span className="text-xs font-semibold text-[#191c1d]">{course.instructor}</span>
            </div>
          )}
          <span className="text-[#0F4D3A] text-sm font-bold tracking-tight flex items-center gap-1 group-hover:gap-2 transition-all duration-200 ml-auto">
            Start Training{" "}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Course Grid with filter tabs                                          */
/* ------------------------------------------------------------------ */
export default function CourseGrid({ courses, token }: { courses: Course[]; token: string }) {
  const [active, setActive] = useState<Filter>("All Programs");

  const filtered = active === "All Programs"
    ? courses
    : courses.filter((c) => c.level?.toLowerCase() === active.toLowerCase());

  return (
    <>
      {/* Header + filter tabs */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#191c1d] mb-2">
              Your Training Programs
            </h2>
            <p className="text-[#4a4455]">
              Science-backed workouts designed by certified trainers. No equipment needed.
            </p>
          </div>
          <div className="flex gap-1 bg-[#f3f4f5] p-1 rounded-lg">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                  ${active === f
                    ? "bg-white text-[#0F4D3A] font-semibold shadow-sm"
                    : "text-[#4a4455] hover:text-[#191c1d]"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((course, i) => (
            <ScrollReveal key={course.id} delay={i * 80}>
              <CourseCard course={course} token={token} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-[#0F4D3A]/30 mb-4">fitness_center</span>
          <p className="text-[#4a4455] font-medium">No {active} programs yet.</p>
          <button
            onClick={() => setActive("All Programs")}
            className="mt-4 text-sm text-[#0F4D3A] font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer"
          >
            View all programs
          </button>
        </div>
      )}
    </>
  );
}
