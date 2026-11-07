import { brandIcon } from "@/lib/brand-icon";

const sizes: Record<string, { size: number; shape: "square" | "maskable" }> = { "192": { size: 192, shape: "square" }, "512": { size: 512, shape: "square" }, "maskable": { size: 512, shape: "maskable" } };

/** The icons listed in the web app manifest (192, 512 and a maskable 512). */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const choice = sizes[(await params).size];
  return choice ? brandIcon(choice.size, choice.shape) : new Response(null, { status: 404 });
}
