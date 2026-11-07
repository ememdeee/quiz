import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const VideoSchema = z.object({
  id: z.string().min(1, "Video ID is required"),
  title: z.string().min(1, "Video title is required"),
  description: z.string().optional(),
  wistiaId: z.string().min(1, "Wistia ID is required"),
  duration: z.string().optional(),
});

export const CourseSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly (lowercase, numbers, hyphens)"),
  title: z.string().min(1, "Course title is required"),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  instructor: z.string().optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  totalDuration: z.string().optional(),
  videos: z.array(VideoSchema).min(1, "Course must have at least one video"),
});

export const CoursesJsonSchema = z.object({
  courses: z.array(CourseSchema).min(1, "courses.json must contain at least one course"),
});

export type Video = z.infer<typeof VideoSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type CoursesJson = z.infer<typeof CoursesJsonSchema>;

/**
 * Validates and returns parsed courses data.
 * Throws a descriptive ZodError on schema violations.
 */
export function validateCoursesJson(raw: unknown): CoursesJson {
  return CoursesJsonSchema.parse(raw);
}

/**
 * Reads and validates courses from public/data/courses.json at runtime.
 * Use this in server components and API routes instead of a static import.
 */
export async function getCourses(): Promise<CoursesJson> {
  const filePath = path.join(process.cwd(), "public", "data", "courses.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return validateCoursesJson(JSON.parse(raw));
}

/**
 * Finds a single course by slug from validated data.
 */
export function findCourseBySlug(data: CoursesJson, slug: string): Course | undefined {
  return data.courses.find((c) => c.slug === slug);
}
