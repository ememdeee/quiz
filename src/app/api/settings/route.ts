import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "public", "data", "settings.json");

interface ProjectSettings {
  projectName: string;
  projectDescription: string;
  logoUrl: string;
  homePageQuiz: string;
}

const defaultSettings: ProjectSettings = {
  projectName: "LogicFlow",
  projectDescription: "",
  logoUrl: "",
  homePageQuiz: "",
};

async function readSettings(): Promise<ProjectSettings> {
  try {
    const content = await fs.readFile(SETTINGS_PATH, "utf-8");
    return { ...defaultSettings, ...JSON.parse(content) };
  } catch {
    return defaultSettings;
  }
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error reading settings:", error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current = await readSettings();

    const updated: ProjectSettings = {
      projectName: typeof body.projectName === "string" ? body.projectName : current.projectName,
      projectDescription: typeof body.projectDescription === "string" ? body.projectDescription : current.projectDescription,
      logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : current.logoUrl,
      homePageQuiz: typeof body.homePageQuiz === "string" ? body.homePageQuiz : current.homePageQuiz,
    };

    await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}
