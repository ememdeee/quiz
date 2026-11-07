import { notFound } from "next/navigation";
import { getCourses, findCourseBySlug } from "@/lib/courseSchemas";
import CoursePlayer from "../../components/CoursePlayer";
import MembersNavbar from "../../components/MembersNavbar";
import MembersFooter from "../../components/MembersFooter";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateStaticParams() {
  const { courses } = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getCourses();
  const course = findCourseBySlug(data, slug);
  if (!course) return { title: "Course Not Found" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token = "" } = await searchParams;

  const data = await getCourses();
  const course = findCourseBySlug(data, slug);
  if (!course) notFound();

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen flex flex-col antialiased selection:bg-[#0F4D3A] selection:text-white">

      <MembersNavbar token={token} activeLink="playing" />

      {/* ── Two-panel player ── */}
      <main className="pt-16 flex-1 flex flex-col md:flex-row">
        <CoursePlayer course={course} token={token} />
      </main>

      <MembersFooter />
    </div>
  );
}
