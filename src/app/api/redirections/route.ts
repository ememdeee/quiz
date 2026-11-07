import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const REDIRECTIONS_PATH = path.join(process.cwd(), "public", "data", "redirections.json");

interface RedirectionRule {
  id: string;
  from: string;
  to: string;
  forwardParams: boolean;
}

interface RedirectionsConfig {
  forwardQueryParamsDefault: boolean;
  rules: RedirectionRule[];
}

const defaultConfig: RedirectionsConfig = {
  forwardQueryParamsDefault: true,
  rules: [],
};

function normalizeFrom(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      return u.pathname.replace(/\/+$/, "") || "/";
    } catch {
      return "";
    }
  }
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

function normalizeTo(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

async function readConfig(): Promise<RedirectionsConfig> {
  try {
    const content = await fs.readFile(REDIRECTIONS_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return {
      forwardQueryParamsDefault:
        typeof parsed.forwardQueryParamsDefault === "boolean"
          ? parsed.forwardQueryParamsDefault
          : true,
      rules: Array.isArray(parsed.rules)
        ? parsed.rules
            .map((r: unknown) => {
              const rule = r as Partial<RedirectionRule>;
              return {
                id: String(rule.id || ""),
                from: normalizeFrom(rule.from || ""),
                to: normalizeTo(rule.to || ""),
                forwardParams:
                  typeof rule.forwardParams === "boolean" ? rule.forwardParams : true,
              };
            })
            .filter((r: RedirectionRule) => r.from && r.to)
        : [],
    };
  } catch {
    return defaultConfig;
  }
}

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const seen = new Set<string>();
    const rules: RedirectionRule[] = Array.isArray(body.rules)
      ? body.rules
          .map((r: unknown) => {
            const rule = r as Partial<RedirectionRule>;
            return {
              id: String(rule.id || `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
              from: normalizeFrom(rule.from || ""),
              to: normalizeTo(rule.to || ""),
              forwardParams:
                typeof rule.forwardParams === "boolean" ? rule.forwardParams : true,
            };
          })
          .filter((r: RedirectionRule) => {
            if (!r.from || !r.to) return false;
            if (seen.has(r.from)) return false;
            seen.add(r.from);
            return true;
          })
      : [];

    const updated: RedirectionsConfig = {
      forwardQueryParamsDefault:
        typeof body.forwardQueryParamsDefault === "boolean"
          ? body.forwardQueryParamsDefault
          : true,
      rules,
    };

    await fs.mkdir(path.dirname(REDIRECTIONS_PATH), { recursive: true });
    await fs.writeFile(REDIRECTIONS_PATH, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error("Error saving redirections:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save redirections" },
      { status: 500 }
    );
  }
}
