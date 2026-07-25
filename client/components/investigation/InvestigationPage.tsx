"use client";

import StoryViewer from "@/components/investigation/StoryViewer/StoryViewer";
import DetectiveNotebook from "@/components/investigation/Notebook/DetectiveNotebook";
import NotebookDrawer from "@/components/investigation/Notebook/NotebookDrawer";
import { storyParagraphs, caseTitle, caseId } from "@/data/story";

export default function InvestigationPage() {
  const handleBriefingComplete = () => {
    // TODO: emit socket event or update room store to move to Discussion phase
    console.log("[InvestigationPage] Briefing complete — ready for discussion");
  };

  return (
    // h-screen + overflow-hidden = window never scrolls; all scrolling is internal
    <div className="flex h-screen w-full overflow-hidden bg-[#070707]">
      {/* ── Story Viewer (left column) ───────────────────────────────── */}
      <div className="h-full w-full md:w-[60%]">
        <StoryViewer
          paragraphs={storyParagraphs}
          caseTitle={caseTitle}
          caseId={caseId}
          onComplete={handleBriefingComplete}
        />
      </div>

      {/* ── Detective Notebook (right column, desktop only) ──────────── */}
      <div className="hidden h-full md:flex md:w-[40%] md:flex-col md:p-4">
        <DetectiveNotebook className="flex-1" />
      </div>

      {/* ── Mobile: floating button + bottom-sheet drawer ────────────── */}
      <NotebookDrawer />
    </div>
  );
}

