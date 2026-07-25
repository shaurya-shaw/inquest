"use client";

import StoryViewer from "@/components/investigation/StoryViewer/StoryViewer";
import { storyParagraphs, caseTitle, caseId } from "@/data/story";

export default function InvestigationPage() {
  const handleBriefingComplete = () => {
    // TODO: emit socket event or update room store to move to Discussion phase
    console.log("[InvestigationPage] Briefing complete — ready for discussion");
  };

  return (
    <StoryViewer
      paragraphs={storyParagraphs}
      caseTitle={caseTitle}
      caseId={caseId}
      onComplete={handleBriefingComplete}
    />
  );
}

