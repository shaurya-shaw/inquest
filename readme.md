# Inquest

Inquest is a AI powered multiplayer murder mystery game where each player privately interrogates an AI-controlled suspect, then the group reconvenes to compare findings and vote on the murderer. Every suspect is a stateful conversational agent — not a static chatbot — governed by an interrogation engine that tracks psychological state, gates what information can be accessed, and reassembles the suspect's behavior turn by turn based on what the player has actually earned.

## How the Interrogation Engine Works

Every suspect reply is generated through a six-stage pipeline that runs per turn, per player:

1. **Intent Classification** — Incoming player message is analyzed to determine intent type (rapport building, pressure application, evidence confrontation, deflection probe, or generic question). This classification feeds the emotional update system.

2. **Evidence Resolution** — If the player presented physical evidence from the board, the resolver checks whether it triggers an `unknownFact` for this suspect. If matched, the fact is unlocked, a pre-authored reaction instruction is activated, and a composure penalty is applied. Evidence must be explicitly presented — suspects cannot be confronted about something just by asking.

3. **Emotional Engine** — Three independent metrics are updated based on intent and evidence interaction:
   - **Trust**: Increases with rapport-building questions, decreases under pressure or accusatory language
   - **Pressure**: Increases with confrontational messages and evidence presentation, decays slowly with softer approaches
   - **Composure**: Drops when unknownFacts are triggered or under sustained pressure, recovers minimally with rapport

4. **Psychology Gate Evaluation** — Three behavioral thresholds are checked each turn. Once opened, they persist for the session:
   - **Rationalization Gate** (trust ≥ 60, composure ≤ 40): Suspect begins morally justifying their actions if they are the murderer
   - **Deflection Gate** (pressure ≥ 70, trust < 40): Suspect actively steers suspicion toward another suspect using pre-authored angles
   - **Emotional Crack** (composure ≤ 20): Suspect shows visible distress but does not confess

5. **Context Assembly** — A system prompt is constructed from:
   - Base suspect profile (personality, speaking style, current emotional state)
   - Public alibi and motive
   - Known facts (always accessible)
   - Unlocked `unknownFacts` and their reaction instructions (earned through evidence)
   - Current trust/pressure/composure metrics
   - Active psychology gate flags
   - Compressed conversation history (summarized via LLM if token budget exceeded)
   - Interrogation constraints (role, secrets, leak canaries)

6. **Generation + Leak Guard** — The assembled prompt is sent for generation. The raw response is then scanned against a set of deterministic leak signatures tied to the suspect's secrets (pre-defined phrases that would only appear if the model is about to break character or confess outright). If a canary is detected, the response is rejected and regenerated with an explicit warning injected into the system prompt. This runs independently of the generative model's instruction-following.

### Session Scoping

State is stored per suspect per room, not per player. If multiple detectives interrogate the same suspect, they share:
- Evidence unlocks (unknownFacts already triggered)
- Emotional metrics (trust, pressure, composure)
- Psychology gate states (rationalization, deflection, crack)
- Conversation history

A suspect's psychological state evolves across all interrogators. The guard does not reset between players.

## Design Principles

**Evidence Gating**: Suspects cannot respond to evidence they have not been confronted with. Players must physically select and present items from an evidence board. Each piece of evidence has a `superficiallyImplicates` field (who it appears to incriminate) and a hidden `trueSequenceOfEvents` field (what actually happened). Innocent suspects have pre-authored `innocentExplanation` strings. The guilty suspect's unknownFacts tie to specific evidence IDs — presenting the right evidence at the right time unlocks a reaction, applies a composure penalty, and opens the door to behavioral shifts.

**Psychology Model**: The three-metric system is modeled on structured interrogation methodology, not sentiment analysis. Trust measures rapport and perceived safety. Pressure measures perceived threat and confrontation intensity. Composure measures emotional control and willingness to reveal guarded information. The psychology gates represent discrete behavioral thresholds supported by interrogation research: suspects rationalize under high trust and low composure (Reid Technique cognitive dissonance), deflect under high pressure and low trust (blame-shifting defense mechanism), and crack under sustained composure loss without the cognitive scaffolding to rationalize or deflect.

**Deterministic Guardrails**: Leak detection is a post-generation filter, not a prompt instruction. Each suspect has a `secrets` array containing exact `leakCanaries` — phrases that indicate the model is about to reveal protected information. If any canary substring appears in the generated response, the response is discarded and regenerated with an explicit "you were about to leak X, do not do that" instruction. This operates independently of the model's ability to follow instructions in the initial prompt.

## Stack

**Server**: Node.js, TypeScript, Socket.IO, Google GEMINI API (interrogation generation)  
**Client**: Next.js 16, React, TypeScript, Zustand (state management), Tailwind CSS, Framer Motion  
**Data**: Case files stored as JSON schemas in `server/data/cases/`

### Running Locally

**Server:**
```bash
cd server
npm install
# Add GEMINI_API_KEY to .env
npm run dev  # Runs on :5000
```

**Client:**
```bash
cd client
npm install
npm run dev  # Runs on :3000
```

**Case Structure**: See `server/data/cases/the-last-call.json` for the schema. Each case includes:
- Story paragraphs (revealed during investigation phase)
- Victim profile
- Suspect array with public data, unknownFacts, secrets, memories, interrogationConstraints, emotionalVulnerability, moralJustification (murderer only), deflectionTarget (innocents only)
- Evidence catalog with superficial implications and hidden truth
- Timeline with public/hidden events
- Suspect location accounting per hour

### Game Flow

1. **Lobby**: Host selects a case, players join
2. **Investigation** (5 min): Players read the case story and review evidence
3. **Interrogation** (5 min per player): Each player is assigned one suspect for private interrogation
4. **Discussion** (3 min): Players compare findings in group chat, review their notes and Players vote who they think the murderer is.
6. **Results**: Votes are revealed, correct murderer is shown, win/loss determined
