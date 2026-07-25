/**
 * StoryController — framework-agnostic orchestrator for the Investigation Story Viewer.
 *
 * Manages:
 *  - Current paragraph index
 *  - Speech Synthesis (narration)
 *  - Typewriter completion tracking
 *  - 2-second delay + auto-scroll trigger
 *  - Pause / Resume / Replay / Mute controls
 *
 * React integration: use the `useStoryController` hook.
 */

export type StoryPhase = "idle" | "intro" | "playing" | "paused" | "complete";

export interface StoryControllerState {
  phase: StoryPhase;
  currentIndex: number;
  isMuted: boolean;
  /** How many paragraphs have been revealed (always >= currentIndex + 1 once started) */
  revealedCount: number;
  /** Incremented on replay to signal the Typewriter to restart */
  restartKey: number;
}

type Listener = (state: StoryControllerState) => void;

export class StoryController {
  private paragraphs: string[];
  private listeners: Set<Listener> = new Set();

  private state: StoryControllerState = {
    phase: "idle",
    currentIndex: 0,
    isMuted: false,
    revealedCount: 0,
    restartKey: 0,
  };

  /** Whether narration for the current paragraph has ended */
  private narrationDone = false;
  /** Whether the typewriter for the current paragraph has completed */
  private typewriterDone = false;
  /** Pending timeout ID for the 2-second delay before advancing */
  private advanceTimer: ReturnType<typeof setTimeout> | null = null;
  /** The currently-speaking utterance */
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(paragraphs: string[]) {
    this.paragraphs = paragraphs;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Begin from paragraph 0. Call after the intro animation has finished. */
  start(): void {
    this.setState({ phase: "playing", currentIndex: 0, revealedCount: 1 });
    this.beginParagraph(0);
  }

  pause(): void {
    if (this.state.phase !== "playing") return;
    this.setState({ phase: "paused" });
    if (!this.state.isMuted) {
      window.speechSynthesis.pause();
    }
    // Typewriter pause is handled by the component reading `phase` from state
  }

  resume(): void {
    if (this.state.phase !== "paused") return;
    this.setState({ phase: "playing" });
    if (!this.state.isMuted) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Restart the current paragraph:
   *  1. Cancel ongoing narration
   *  2. Reset completion flags
   *  3. Increment restartKey to signal Typewriter to restart
   *  4. Re-speak if not muted
   */
  replay(): void {
    if (
      this.state.phase !== "playing" &&
      this.state.phase !== "paused"
    )
      return;

    this.cancelAdvanceTimer();
    this.cancelNarration();

    this.narrationDone = false;
    this.typewriterDone = false;

    // Ensure we are back to playing (in case we were paused)
    this.setState({
      phase: "playing",
      restartKey: this.state.restartKey + 1,
    });

    this.speakParagraph(this.state.currentIndex);
  }

  mute(): void {
    this.setState({ isMuted: true });
    this.cancelNarration();
    // Mark narration as done so we don't wait for it forever
    if (!this.narrationDone) {
      this.narrationDone = true;
      this.tryAdvance();
    }
  }

  unmute(): void {
    this.setState({ isMuted: false });
  }

  /** Called by Typewriter component when animation finishes */
  markTypewriterDone(): void {
    if (this.typewriterDone) return;
    this.typewriterDone = true;
    this.tryAdvance();
  }

  /** Returns a snapshot of current state (for useSyncExternalStore) */
  getSnapshot(): StoryControllerState {
    return this.state;
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Clean up all side effects — call on component unmount */
  dispose(): void {
    this.cancelAdvanceTimer();
    this.cancelNarration();
    this.listeners.clear();
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private setState(patch: Partial<StoryControllerState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  private beginParagraph(index: number): void {
    this.narrationDone = false;
    this.typewriterDone = false;
    this.cancelAdvanceTimer();
    this.speakParagraph(index);
  }

  private speakParagraph(index: number): void {
    this.cancelNarration();

    if (this.state.isMuted) {
      // Skip narration — mark done immediately so typewriter drives advancement
      this.narrationDone = true;
      return;
    }

    const text = this.paragraphs[index];
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      this.narrationDone = true;
      this.tryAdvance();
    };

    utterance.onerror = () => {
      // Treat errors as completion to avoid getting stuck
      this.narrationDone = true;
      this.tryAdvance();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private cancelNarration(): void {
    if (this.utterance) {
      this.utterance.onend = null;
      this.utterance.onerror = null;
      this.utterance = null;
    }
    window.speechSynthesis.cancel();
  }

  private cancelAdvanceTimer(): void {
    if (this.advanceTimer !== null) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
  }

  /**
   * Called whenever typewriter or narration completes.
   * Advances only when BOTH are done AND we are still in "playing" phase.
   */
  private tryAdvance(): void {
    if (this.state.phase !== "playing") return;
    if (!this.narrationDone || !this.typewriterDone) return;
    if (this.advanceTimer !== null) return; // already scheduled

    this.advanceTimer = setTimeout(() => {
      this.advanceTimer = null;
      this.advance();
    }, 2000);
  }

  private advance(): void {
    const nextIndex = this.state.currentIndex + 1;

    if (nextIndex >= this.paragraphs.length) {
      // Story complete
      this.setState({ phase: "complete" });
      return;
    }

    this.setState({
      currentIndex: nextIndex,
      revealedCount: nextIndex + 1,
    });

    this.beginParagraph(nextIndex);
  }
}
