import type { Metadata } from "next";
import { EditorPage } from "@/components/editor/editor-page";

export const metadata: Metadata = { title: "Quiz settings · Quiz", robots: { index: false } };

/** The settings are a panel over the editor, so this address opens the editor with that panel already open. */
export default async function SettingsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return <EditorPage quizId={quizId} openSettings />;
}
