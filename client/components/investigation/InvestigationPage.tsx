"use client";

import StoryViewer from "@/components/investigation/StoryViewer/StoryViewer";
import DetectiveNotebook from "@/components/investigation/Notebook/DetectiveNotebook";
import NotebookDrawer from "@/components/investigation/Notebook/NotebookDrawer";
import InvestigationHUD from "@/components/investigation/InvestigationHUD";
import { useCaseStore } from "@/stores/case-store";

export default function InvestigationPage() {
  const { story } = useCaseStore();

  // Guard against the rare edge case where the phase transitions before
  // the case-data event is processed (e.g. page refresh mid-investigation).
  if (!story) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707]">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-600 animate-pulse">
          Retrieving case files&hellip;
        </p>
      </div>
    );
  }

  return (
    // h-screen + overflow-hidden = window never scrolls; all scrolling is internal
    <div className="flex h-screen w-full overflow-hidden bg-[#070707]">
      {/* ── Story Viewer (left column) ───────────────────────────────── */}
      <div className="h-full w-full md:w-[60%]">
        <StoryViewer
          paragraphs={story.paragraphs}
          caseTitle={story.title}
          caseId={story.caseId}
        />
      </div>

      {/* ── Detective Notebook (right column, desktop only) ──────────── */}
      <div className="hidden h-full md:flex md:w-[40%] md:flex-col md:p-4">
        <DetectiveNotebook className="flex-1" />
      </div>

      {/* ── Mobile: floating button + bottom-sheet drawer ────────────── */}
      <NotebookDrawer />

      {/* ── Investigation HUD (fixed, top-center of viewport) ────────── */}
      <InvestigationHUD />
    </div>
  );
}
