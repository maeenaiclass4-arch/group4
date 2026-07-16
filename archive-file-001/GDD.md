# ARCHIVE : FILE-001
### Game Design Document — v1.1 (Pre-Production)
**Studio Roles:** Game Direction · Software Architecture · UI/UX · Narrative Design
**Platform:** Browser (Desktop + Mobile, responsive HTML5)
**Status:** Design document through §12.12; Milestones 1–2 implemented — see `/archive-file-001/src`. A playable vertical slice exists (intro, Prologue, and Chapter 1's first room with a working terminal, puzzle, and Classified File); most content, puzzle types, and collection-screen UI still lie ahead (§25).

---

### Revision Notes (v1.0 → v1.1)

A critical pass on v1.0 found the design **structurally sound but ceremonially thin**: the two-ending Epilogue was the only moment the game acknowledged the player's specific choices, there was no beat that made a discovery *feel* like a discovery (no cinematic weight), and nothing rewarded a second playthrough beyond a puzzle-difficulty remix. §12.1–§12.12 below close those gaps: an achievement layer, a two-tier collectible system (Whispers + Classified Files), secret rooms, Easter eggs, a chapter-completion ritual, an end-game statistics report, second-playthrough-only content, a hidden third ending, curated cinematic beats, a state-reactive ambient audio system, and a reusable interactive terminal component. All of them are designed as **data-driven extensions of existing systems** (EventBus listeners, JSON content, reusable UI components) — none require new engine paradigms, so they slot into the roadmap without a redesign.

---

## 0. Logline

> *You are not restoring a file. You are restoring yourself — one locked room at a time.*

**ARCHIVE : FILE-001** is a premium, atmospheric point-and-click puzzle-mystery. The player is an "Archivist" hired to recover a single corrupted memory file from a decommissioned, semi-sentient records vault. Each room is a physical/digital hybrid memory-chamber that must be solved through observation, cipher-cracking, and item logic. The twist: the file being recovered belongs to the player.

Tone reference: *Rusty Lake*, *Return of the Obra Dinn*, *The Room*, *Gone Home* — slow-burn dread, elegant minimalism, no jump-scares, no combat, no fail-states that punish curiosity.

---

## 1. Overall Vision

- **Premium indie feel, not "browser game" feel.** Every screen should look like a $20 Steam release: full-bleed illustrated rooms, no default browser chrome, no visible seams, deliberate typography, motion with purpose.
- **Calm tension.** The player should feel like they are trespassing somewhere important. No timers, no death, no combat. Pressure comes from *mystery*, not from mechanics.
- **Diegetic-first UI.** As much interface as possible is presented as an in-world object (a notebook, a terminal, a film reel) rather than a floating HUD.
- **One file, one sitting.** FILE-001 is a complete, ~60–90 minute experience (Prologue + 5 Chapters + Epilogue), designed as the first entry in an episodic series (FILE-002, FILE-003…).
- **Equal-citizen platforms.** Desktop and mobile are both first-class. Neither is a "port" of the other — the same design system adapts to both from day one.

**Pillars (in priority order):**
1. **Legibility of mystery** — the player always understands *what* they don't yet understand.
2. **Tactile puzzles** — every puzzle has a physical or logical metaphor, never an arbitrary combination lock.
3. **No dead ends** — the game never allows an unsolvable or soft-locked state.
4. **Silence is a design tool** — negative space, ambient audio, and pacing carry as much weight as content.

---

## 2. Story

### 2.1 Premise
The Archive is a private institution that, decades ago, offered a service: for a price, it would surgically remove a memory from a person's mind and store it as a "File," sealed in a room built from the memory's own imagery. The Archive went dark after an internal incident and was never decommissioned. The player character, **the Archivist**, is contracted anonymously to enter the facility through its last operational terminal and retrieve **FILE-001** — reportedly the very first file the Archive ever sealed.

### 2.2 Three-Act Structure
- **Act I — Intake (Prologue + Ch.1–2):** The Archivist logs in remotely, wakes inside a liminal reception space, and descends through the outer chambers: a waiting room, a records hall. Puzzles are gentle, establishing the language of the world (light/dark toggle, document reading, item combination).
- **Act II — Descent (Ch.3–4):** Rooms become more personal and specific — a childhood bedroom rendered in file-cabinet architecture, a flooded office. Environmental storytelling reveals the Archive is not just a warehouse but *alive*, reacting to the player. Fragments of audio logs suggest FILE-001 was sealed under duress, not by choice.
- **Act III — Revelation (Ch.5 + Epilogue):** The final vault. The Archivist discovers FILE-001's true owner is themself — the "Archivist" role was a fabricated identity given to the player upon entry so they could safely retrieve their own erased trauma. The epilogue lets the player choose to **reintegrate** the memory (canon-light ending, sets up FILE-002) or **reseal** it (bittersweet ending, stand-alone closure). Both are valid, non-judged outcomes — no "good/bad" ending framing.

### 2.3 Narrative Delivery
No cutscenes. Story is delivered entirely through:
- **Environmental storytelling** (room composition, object placement).
- **Found documents** (letters, intake forms, sticky notes) — rendered in a diegetic "Reader" overlay.
- **Audio logs** (mono, degraded recordings) played from found cassette/reel objects.
- **The Archive itself**, a dry, unsettling narrator-UI voice (text-only, terminal-style) that comments sparingly between rooms.

---

## 3. World Building

- **The Archive** exists in a fictional "just-off reality" — architecture is physically impossible (a hallway that is also a filing cabinet drawer; a office suspended in water that isn't wet). This licenses stylized, budget-conscious art without breaking believability.
- **Two overlaid layers per room:** the **Physical Layer** (dusty, analog, brutalist concrete/wood/paper) and the **Memory Layer** (a faint cyan hologram overlay revealing hidden text, hotspots, or altered object states). The player toggles between them with a single dedicated action — this is the game's signature mechanic (see §5).
- **Factions/entities (light-touch, environmental only):** The Archive's automated custodian systems (never seen, only implied via sound and locked mechanisms), and "Prior Archivists" (implied through left-behind tools and notes — never other living characters; this is a single-character experience).
- **Series framing:** The world bible reserves room for FILE-002+ to explore other sealed files/other Archivists, but FILE-001 is self-contained and requires no sequel to feel complete.

---

## 4. Gameplay Loop

**Micro-loop (per room, ~5–12 min):**
1. **Establish** — room fades in, ambient audio starts, camera settles on a static illustrated scene.
2. **Observe** — player scans for hotspots (subtle idle-glint affordance, never a glowing outline — see §16 Accessibility note for an optional assist toggle).
3. **Collect** — click/tap hotspots to inspect, zoom, or pick up items into the Inventory.
4. **Combine / Deduce** — combine items, read documents, toggle Memory Layer, cross-reference clues written automatically into the **Notebook**.
5. **Solve** — apply a solution to a lock/mechanism/terminal.
6. **Reward** — puzzle-solve feedback (sound + animation) → a **Memory Fragment** unlocks (short narrative beat) → the exit opens.
7. **Transition** — stylized wipe/transition into the next room; autosave fires.

**Macro-loop (session):**
Prologue → Chapter 1 → … → Chapter 5 → Epilogue, gated linearly, but each chapter contains 1–2 **optional secrets** ("Whispers") that don't block progress and feed the Codex/achievements — giving replay-minded players something to hunt without punishing straight-through players.

---

## 5. Core Mechanics

| Mechanic | Description |
|---|---|
| **Point-and-click navigation** | Static-scene rooms with hotspot-driven interaction; no free-roam movement. |
| **Memory Layer Toggle** | Single input (Space/tap-hold on a dedicated UI button) cross-fades the scene between Physical and Memory layers, revealing/hiding hotspots, text, and object states. Core signature mechanic, reused and remixed in every chapter. |
| **Inventory & Combination** | Bottom dock (desktop) / bottom sheet (mobile) holds collected items. Drag-drop (desktop) or tap-select-then-tap-target (mobile) to combine two items or apply an item to a hotspot. |
| **Notebook** | Auto-populated, player-readable log of codes, sketches, and clues discovered — removes the need for the player to keep external notes (a common friction point in the genre). |
| **Document Reader** | Full-screen diegetic overlay for reading letters/forms, styled per-document (typewriter, handwritten, printed). |
| **Audio Log Player** | Diegetic tape/reel UI; scrub bar styled as physical tape; ducks ambient music while playing. |
| **Zoom Inspect** | Certain hotspots open a close-up view with its own sub-hotspots (e.g., a locked drawer's keyhole). |

---

## 6. Puzzle Mechanics

Eight reusable puzzle archetypes, mixed 2–4 per room so the toolkit never feels repetitive:

1. **Observation puzzles** — find the discrepancy between Physical and Memory layers (e.g., a painting's subject count differs between layers).
2. **Cipher/code puzzles** — substitution ciphers, book ciphers keyed to found documents, rotated/mirrored text.
3. **Mechanical lock puzzles** — dial locks, tumbler sequences, physical key-shape matching.
4. **Audio puzzles** — reconstruct a sequence from a degraded recording (e.g., counting tones, matching Morse-like knocks).
5. **Light/Layer puzzles** — direct use of the Memory Layer toggle to solve (e.g., a shadow only exists in one layer and points to a hotspot).
6. **Logic/sequence puzzles** — classic light-the-symbols-in-order, weight-balance, piping.
7. **Item-combination puzzles** — craft/repair an item needed elsewhere (e.g., mend a torn photograph to reveal a location).
8. **Pattern-recall puzzles** — memorize a pattern shown briefly (a heartbeat monitor, a film strip) and reproduce it.

**Design rules:**
- Every puzzle's solution is **discoverable from within the current room or the Notebook** — never requires knowledge from a future room.
- A **context-sensitive hint system** (3-tier: nudge → clue → near-solution) is available on demand, never forced, and never shames the player (see §12 Progression).
- No punitive fail-states: wrong combinations simply don't combine; wrong codes give a neutral "not yet" cue, never a penalty or reset.

---

## 7. Progression System

- **Linear chapter gating** — Prologue + 5 Chapters + Epilogue. No grinding, no XP.
- **Archive Integrity meter** — a soft, diegetic percentage (shown in the pause menu, not the HUD) that fills as Memory Fragments are restored; purely a narrative/completion indicator, not a gameplay gate.
- **Whispers (optional collectibles)** — 2 per chapter, hidden lore snippets that expand the Codex without gating story progress.
- **Codex / Archive Index** — unlocked from the Main Menu after Prologue; a persistent library of recovered documents, audio logs, and Whispers, re-readable at any time (this is the "collection room" premium indie games use to reward completionists).
- **Hint usage is tracked but never scored/shamed** — no "no-hints" achievement that punishes accessibility users; instead, achievements reward *exploration* (finding all Whispers) and *completion* (finishing each ending).
- **Two endings** (Reintegrate / Reseal) are both fully valid completions and both awarded a distinct Codex entry + achievement — no "true ending" gate that requires a second playthrough, respecting the player's time.
- **Post-completion:** "Deep Archive" replay mode unlocks alternate, harder cipher variants for the same rooms (puzzle remix, not new content) for engaged players, plus a Chapter Select for revisiting specific rooms.

---

## 8. Room Structure

Each room is a **self-contained data unit**, not a hardcoded scene, so content scales without new engine code.

```
Room {
  id, chapterId, title,
  background: { physicalLayer, memoryLayer },
  ambientAudio: { base, tension, discovery, memoryLayer }  // dynamic stems, §12.10
  hotspots: [ { id, shape, coords[desktop/mobile variants], type, state-dependent sprite, action } ],
  items: [ itemId... ]        // items obtainable in this room
  puzzles: [ puzzleId... ]     // puzzle definitions solved in this room
  exitCondition: puzzleId | flag,
  notebookEntries: [ ... ]     // auto-added when triggered
  whispers: [ optional collectible defs ],       // §12.2
  classifiedFileId: itemId | null,               // §12.2, gated behind a secondary puzzle step
  terminals: [ terminalId... ],                  // §12.11, references data/terminals/<id>.json
  cinematicBeats: [ { triggerEvent, beatId } ],   // §12.9
  isSecret: false,                                // true for the 2 secret rooms, §12.3
  discoveredVia: { type, condition } | null,      // required when isSecret: true
  requiresCompletionFlag: null | "hasCompletedOnce" // gates second-playthrough-only rooms, §12.7
}
```

- **One-screen-per-room** philosophy: no scrolling/panning camera in v1 (keeps mobile parity trivial and touch targets predictable). Very large scenes are split into two connected rooms instead.
- Rooms declare **layout-independent hotspot coordinates** (percentage-based polygons, not pixels) so the same room data renders correctly at any viewport (see §19 Responsive Strategy).
- Room count for FILE-001: **1 Prologue + 10 rooms across 5 chapters (2 each) + 1 Epilogue = 12 critical-path rooms**, plus **2 secret rooms** (§12.3, one of which requires `hasCompletedOnce`) that sit outside the critical path entirely.

---

## 9. Inventory System

- **Capacity:** unlimited (genre convention — the frustration of inventory management adds nothing here; the *puzzles* are the challenge, not resource juggling).
- **Presentation:**
  - Desktop: a slide-out dock, bottom-anchored, horizontally scrollable, keyboard-navigable (arrow keys + Enter).
  - Mobile: a collapsible bottom sheet (swipe-up), large touch targets (min 56×56px), horizontally scrollable.
- **Interaction model:**
  - Desktop: drag item onto hotspot/item, or click item then click target ("selected" cursor state) for accessibility.
  - Mobile: tap to select (item lifts/highlights) → tap target to apply. No drag-and-drop required on touch (avoids accidental drags on scroll).
- **Item states:** items can be "examined" (shows a description/zoom), "combined" (produces a new item, originals consumed or not per recipe), or "used" (consumed on a hotspot).
- **Visual feedback:** selected item gets a persistent glow/outline across both platforms so the player always knows what's "in hand."

---

## 10. Save System

- **Autosave** after every puzzle solve, room transition, and item pickup — the player should never be able to lose progress by closing the tab.
- **Storage:** `localStorage` (primary, v1) with a versioned JSON schema:
```json
{
  "schemaVersion": 2,
  "currentRoomId": "ch2_office",
  "flags": { "ch1_puzzle_lock_solved": true },
  "inventory": ["torn_photo", "brass_key"],
  "notebook": ["code_4471", "sketch_symbol_a"],
  "whispersFound": ["w_ch1_a"],
  "classifiedFilesFound": ["cf_ch1"],
  "secretRoomsFound": ["secret_archivist_lounge"],
  "easterEggsFound": ["egg_nitro_rush"],
  "achievements": { "unlocked": ["comm_first_whisper"], "progress": { "comm_all_whispers": 3 } },
  "terminalsUnlockedCommands": { "term_ch1_desk": ["HELP", "LOG"] },
  "stats": {
    "playtimeSeconds": 1620,
    "chapterTimes": { "prologue": 240, "ch1": 890 },
    "hintsUsed": 1,
    "completionsLog": []
  },
  "hasCompletedOnce": false,
  "hiddenEndingUnlocked": false,
  "devCommentaryUnlocked": false,
  "photoModeUnlocked": false,
  "endingChosen": null,
  "settings": { "audioVol": 0.8, "subtitles": true, "layerAssist": false },
  "timestamp": 1737000000
}
```
- **Schema versioning:** `schemaVersion` increments whenever the save shape changes (v1.1 design bumps it to `2` for the fields above); `SaveManager` runs a migration step on load that fills in missing fields with safe defaults rather than invalidating older saves.
- **3 manual save slots** ("Archive Checkpoints") in addition to autosave, letting players branch-explore near the endings without losing the autosave point.
- **Corrupted-save resilience:** schema is versioned; a failed parse falls back to "start from last known room" rather than a hard reset, and the raw broken blob is preserved under a `*_backup` key before being overwritten.
- **Cross-device stretch goal (not v1):** optional account-linked cloud save (see §22 Future Expansion) — architecture keeps `SaveManager` behind an interface so a remote adapter can be swapped in later without touching game logic.

---

## 11. Menu Structure

```
Main Menu
├─ New Archive            (starts Prologue; warns + confirms if a save exists)
├─ Continue                (resumes latest autosave)
├─ Checkpoints             (3 manual slots — load/overwrite)
├─ Chapter Select          (unlocked after first completion)
├─ Progress Tracker        (Archive Index ledger — §12.5)
├─ Codex / Archive Index   (documents, audio logs, Whispers, Classified Files, Commendations)
├─ Photo Mode              (unlocked post-Ch.1 — §12.12, launched from in-room pause only)
├─ Settings
│   ├─ Audio (Master / Music / SFX / Voice sliders)
│   ├─ Text & Subtitles (size, subtitle toggle, language)
│   ├─ Accessibility (Layer-Toggle Assist glow, hint frequency, reduce motion, colorblind-safe puzzle mode)
│   ├─ Controls (rebind hint for desktop, sensitivity N/A — point & click only)
│   └─ Developer Commentary toggle (unlocked after first completion — §12.12)
└─ Credits

Pause Menu (in-room, Esc / pause icon)
├─ Resume
├─ Settings (same panel as above, layered)
├─ Hint (opens 3-tier hint drawer for current puzzle)
├─ Progress Tracker
├─ Photo Mode (if unlocked)
├─ Checkpoints
└─ Return to Main Menu (confirms unsaved-risk, though autosave makes this low-risk)
```

---

## 12. UI Flow

```
[Boot / Loading Screen (lore ticker)]
        ↓
[Main Menu] ──Settings/Credits/Codex/Progress Tracker──→ (modal overlays, return to Main Menu)
        ↓ New Archive / Continue
[Room View] ←────────────────────────────────────────┐
   │  hotspot tap → [Zoom Inspect]  ───────────────────┤
   │  item tap → [Inventory Dock]                      │
   │  document hotspot → [Reader Overlay]               │
   │  tape hotspot → [Audio Log Player]                 │
   │  terminal hotspot → [Terminal Overlay] ────────────┤
   │  layer-toggle → [Memory Layer swap]                │
   │  major discovery → [Cinematic Beat] (brief, skippable) │
   │  achievement condition met → [Commendation Toast] (non-blocking) │
   │  pause icon → [Pause Menu] ─────────────────────────┤
   │  puzzle solved → [Fragment Reveal] ──────────────────┘
   ↓ chapter exit
[Chapter Completion Screen] → [Transition Wipe] → next [Room View] …
        … → [Epilogue Choice] → [Ending Sequence / Cinematic] → [End-Game Statistics] → [Codex unlock] → [Main Menu]
```

**Flow principles:**
- Every overlay (Reader, Audio Player, Zoom Inspect, Pause) is dismissible with a consistent single gesture: `Esc` on desktop, a top-corner "×" tap-target on mobile (also swipe-down for bottom-sheet-style overlays).
- No more than **one overlay deep** at a time — opening a document from within a zoom-inspect closes the zoom first — to avoid modal-stacking confusion on small screens.
- All destructive actions (New Archive over an existing save, overwrite checkpoint) require a confirm step.

---

## 12.1 Achievement System — "Commendations"

Framed diegetically: the Archive's automated evaluation system logs **Commendations**, not generic trophies — a toast never says "Achievement Unlocked," it says something like *"COMMENDATION LOGGED — The Archive notes your attention to detail."*

- **Four tiers:** *Story* (major beats, always eventually unlocked by any completion), *Discovery* (Whispers, Classified Files, secret rooms), *Mastery* (chapter cleared hint-free, Deep Archive completion, hidden ending), *Curiosity* (Easter eggs).
- **Fully decoupled:** `AchievementSystem` only ever *listens* — it subscribes to `EventBus` topics (`puzzle:solved`, `whisper:found`, `classifiedFile:found`, `secretRoom:entered`, `easterEgg:triggered`, `chapter:completed`, `hint:used`, `ending:reached`) and cross-references `data/achievements.json` condition rules. No other system needs to know achievements exist — a hard requirement given how much content will be added post-launch (§24).
- **Presentation:** a queued, non-blocking toast (bottom-corner desktop / top-banner mobile) styled as a terminal print (typed-out, monospace), auto-dismissing after 4s or tap-to-dismiss; queued if several fire within the same beat so they never overlap.
- **Secret Commendations** (tied to Easter eggs and the hidden ending) show only a redacted title (`█████████`) in the Codex until unlocked, protecting the surprise.
- **Never punitive:** no "no hints used" achievement gates a real ending — hint usage is tracked for the End-Game Statistics (§12.6) flavor text only, never withheld as a shame mechanic (reaffirms §7's existing stance).

## 12.2 Collectibles: Whispers & Classified Files

v1.0 had a single collectible tier (Whispers). Splitting collectibles into two tiers gives low-effort *and* high-effort curiosity its own payoff, and gives the hidden ending (§12.8) a concrete, fair unlock trail.

| | **Whispers** | **Classified Files** *(new)* |
|---|---|---|
| Count | 2 per chapter (12 total) | 1 per chapter (6 total) |
| Discovery | A hidden hotspot or document, low friction | Gated behind a genuine secondary puzzle step — solving the room's puzzle a harder/alternate way, or a combination not required for critical path |
| Content | A short lore snippet (1–2 sentences) | A full multi-page in-world document, meaningfully recontextualizing the chapter |
| Presentation | Listed plainly in the Codex once found | Codex shows a **redacted cover** (black-bar thumbnail) even before discovery, which visibly "declassifies" — bars animate away — on unlock |
| Role | Texture and atmosphere | Backbone of the hidden-ending trail and second-playthrough content (§12.7/§12.8) |

Both roll up into the Progress Tracker (§12.5) and the completion percentage without ever gating the critical path — matching Pillar 3 (No dead ends).

## 12.3 Secret Rooms

Two secret rooms exist outside the 12-room critical path, reached through world-logic discovery rather than a marked door — e.g., using the Memory Layer toggle in a spot with no marked hotspot, or applying an item combination that isn't required anywhere on the main path. They contain **no critical-path puzzles** (they can never block completion), only atmosphere, a Classified File, and/or a unique Commendation.

Room schema gains `isSecret: true` and `discoveredVia: { type, condition }` (see updated §8 schema). Secret rooms are excluded from the Chapter Completion Screen's "required" tally but counted toward the Progress Tracker's separate "true completion" percentage, so hunting them stays optional but visibly rewarding.

## 12.4 Easter Eggs

Small, zero-lore-weight discoveries that exist purely for delight — a joke intake form, a dev-team in-joke terminal command, or a wink at the studio's other in-repo prototype (an Archive intake form for a "vehicle file," classification: *JOYRIDE*, surfaced only via a hidden terminal `SEARCH` command). They carry no narrative weight and are never required for any ending or completion metric — purely a "reward curiosity" touch that premium indie titles use to earn word-of-mouth. Tracked via `easterEgg:triggered` and feed the *Curiosity* Commendation tier only.

## 12.5 Progress Tracker & Chapter Completion Screen

- **Progress Tracker** — reachable from the Pause Menu and Main Menu, presented as a diegetic "Archive Index" ledger: per-chapter room completion, Whispers found (X/2), Classified File found (Y/N), secret room found (Y/N). Undiscovered entries show only a redacted silhouette and a count, never a title — the tracker motivates without spoiling.
- **Chapter Completion Screen** *(missing entirely from v1.0 — a genuine gap for the genre)* — a full-screen diegetic interstitial after a chapter's final puzzle, before the transition to the next chapter: chapter title card, a short "restored memory" thumbnail collage, and that chapter's stats (time spent, Whispers found, hints used), ending on a "Continue" prompt. This is the *Hades*/*Inside*/*Firewatch*-style chapter-card beat that gives the player a moment to breathe and feel progress — a load-bearing premium-feel moment v1.0 skipped.

## 12.6 End-Game Statistics

On reaching any ending, a diegetic **"Session Report"** (framed as the Archive's own printout) shows: total playtime, per-chapter time breakdown, Whispers found (X/12), Classified Files declassified (X/6), secret rooms found (X/2), Easter eggs found (X/N), total hints used, which ending was reached, and a **personalized flavor line** that reacts to play style (e.g., *"You solved every lock without a single hint. The Archive is impressed, and slightly unsettled."*). Completions are logged historically (`stats.completionsLog[]`) so a second playthrough's report can compare against the first (*"Last time: 74 minutes. This time: 51."*) — a direct, low-cost hook into replay value.

## 12.7 Replay Value & Second-Playthrough-Only Secrets

Deep Archive mode (v1.0, §7) gets a diegetic companion: once `hasCompletedOnce` is true, the Archive "trusts" a returning Archivist with material it withheld the first time. This unlocks, on a fresh playthrough:
- An alternate opening narration line acknowledging the return.
- A subtly recolored Main Menu accent (rewards recognize-it players without spelling it out).
- The **second** secret room (the first remains discoverable on any playthrough).
- **2 additional Classified Files** that recontextualize Chapter 3–4 events, discoverable only post-first-completion.

This is a diegetic justification for NG+-gated content rather than an arbitrary flag, and it directly satisfies "secrets only discoverable on a second playthrough" without requiring a second story branch — budget-conscious for an indie-scope title.

## 12.8 Hidden Ending — "Archive Zero"

A third ending, unlocked only by finding **all 6 Classified Files + both secret rooms**, then using a specific item combination (surfaced only through the Classified Files trail) at the final choice instead of Reintegrate or Reseal. It reveals the Archive has sealed Archivists in a recurring loop, and lets the player choose to break it. Rewarded with its own Commendation, a unique End-Game Statistics flavor line, and a distinct Codex "Ending Archive" entry. It's a reward for attentiveness and curiosity — not grinding — keeping it consistent with Pillar 1.

## 12.9 Cinematic Moments (Discovery Beats)

For a curated ~6–8 major discoveries only (over-use kills impact) — first Whisper, first Classified File, the Ch.3 photograph reveal, the Ch.5 identity revelation, each ending's final beat — control briefly cedes for 2–4 seconds: the scene desaturates except the discovered object, ambient audio swells/ducks, and a held frame plays before returning control. Lightweight by construction: CSS/canvas-driven only, no video assets, so it stays inside the performance budget (§23).

Implemented as a reusable `CinematicSystem.playBeat(beatId)`, data-driven via `data/cinematics.json` (`{ id, duration, desaturate, audioCue, holdFrame }`) and triggered by specific `EventBus` events — adding a new beat later is a data change, not an engine change. Always skippable (tap/click/Esc) and respects `prefers-reduced-motion` / the manual Settings toggle, falling back to a simple audio sting + fade with no visual hold.

## 12.10 Dynamic Ambient Audio System

Extends v1.0's "one ambient bed per chapter" (§17) into a **state-reactive layered mix**: each room's bed is 3–4 stems — base drone, tension layer, discovery layer, and the existing Memory-Layer stem — cross-faded by room state rather than played flat. The tension layer fades in subtly if the player is idle beyond a threshold with no puzzle progress; the discovery layer swells briefly after a solve; the Memory-Layer stem is the toggle-tied layer already specified in §17.

Managed through `AudioManager.setRoomState(roomId, stateFlags)`, called by `RoomSystem`/`PuzzleEngine` on relevant events — the audio system stays purely reactive and never gameplay-aware. This turns ambient sound into another environmental-storytelling channel at a modest asset cost (a handful of extra stems per chapter, not per room).

## 12.11 Interactive Archive Terminals

A recurring diegetic terminal object (1–2 per chapter) with a realistic retro-CRT interface: blinking cursor, typed-out (not instant) responses, and a small fixed command set (`HELP`, `LOG`, `STATUS`, `SEARCH <term>`, plus room-specific commands unlocked as puzzle rewards). It serves three roles at once: **narrative delivery** (the Archive's dry narrator voice lives here rather than as floating text), **puzzle interface** (some cipher/code puzzles are entered through the terminal instead of a physical dial, unifying two puzzle archetypes under one polished component), and **Easter-egg surface** (hidden `SEARCH` commands surface Easter eggs and secret-room hints without cluttering the visual scene).

Built as one reusable `TerminalSystem`/`TerminalOverlay` component (Plex Mono, reusing the scanline/grain VFX from §21), data-driven per instance (`data/terminals/<id>.json`: command list, responses, unlock states) — one component serving every terminal in the game, matching the "reusable puzzle-type" philosophy of §6.

## 12.12 Additional Studio Ideas

Five low-cost, high-impact additions proposed for immersion and replay value, each reusing an existing component rather than introducing new engineering surface:

- **Photo Mode** — unlocked after Chapter 1: a non-interactive capture tool (hide UI, adjust vignette/filter, export PNG) built entirely on the existing VFX `<canvas>` layer. Near-zero engineering cost, high word-of-mouth/screenshot-marketing value for a premium indie title.
- **"The Archive Remembers You"** — small meta touches keyed off save history: the Main Menu narration line changes based on `hasCompletedOnce`/hidden-ending state, and save-slot metadata is referenced diegetically ("Last session: 51 minutes. The Archive noted your patience.") instead of a generic timestamp.
- **Developer Commentary Mode** — unlocked after first completion: optional small "director's note" hotspots per room (text or audio), reusing the existing Document Reader / Audio Log Player components. A genre-standard premium touch (Valve/Portal-style) at near-zero new engineering cost.
- **Loading Screen Lore Ticker** — loading screens rotate short in-world fragments ("Intake Form #0231 — REDACTED") instead of a static bar, turning dead time into atmosphere. Feeds directly into Milestone 1's Loading Screen deliverable.
- **Idle Observation Audio Cue** — if the player is idle past a threshold with no progress, a subtle one-shot ambient cue plays (never a jump scare), reusing the Dynamic Ambient Audio System's tension layer (§12.10) at no additional asset cost — reinforces "the Archive is aware of you" without breaking the no-jump-scare pillar.

---

## 13. Folder Architecture

Project lives in its own top-level directory (`/archive-file-001/`) to stay fully isolated from any other project in this repository.

```
archive-file-001/
├─ GDD.md                     ← this document
├─ index.html
├─ src/
│  ├─ core/                   ← engine-agnostic systems
│  │  ├─ GameStateManager.js
│  │  ├─ EventBus.js
│  │  ├─ SaveManager.js
│  │  ├─ SessionStore.js      ← live save-state; turns gameplay events into persisted state
│  │  ├─ InputManager.js      ← unifies mouse/touch/keyboard
│  │  ├─ AudioManager.js
│  │  ├─ i18n.js
│  │  └─ Config.js            ← constants, event names, storage keys
│  ├─ systems/
│  │  ├─ RoomSystem.js        ← current room + room graph (data/state only)
│  │  ├─ HotspotSystem.js     ← pure hotspot visibility/state resolution
│  │  ├─ InventorySystem.js
│  │  ├─ PuzzleEngine.js      ← puzzle-type registry; "code" archetype implemented
│  │  ├─ NotebookSystem.js
│  │  ├─ LayerToggleSystem.js
│  │  ├─ AchievementSystem.js   ← §12.1, listens only, never called into
│  │  ├─ StatsSystem.js         ← §12.6, aggregates playtime/hints/collectibles
│  │  ├─ TerminalSystem.js      ← §12.11, data-driven terminal instances
│  │  └─ CinematicSystem.js     ← §12.9, playBeat(beatId), also owns its own overlay render
│  ├─ ui/
│  │  ├─ dom.js                ← tiny h()/mount() element-builder shared by every component
│  │  ├─ LoadingScreen.js
│  │  ├─ MainMenu.js
│  │  ├─ PauseMenu.js
│  │  ├─ SettingsPanel.js
│  │  ├─ ConfirmModal.js
│  │  ├─ CheckpointsPanel.js
│  │  ├─ RoomView.js           ← the one place a room actually gets drawn + interacted with
│  │  ├─ SceneArt.js           ← procedural CSS/DOM room backgrounds (pre-illustrated-art)
│  │  ├─ IntroSequence.js      ← the cinematic intro's title cards
│  │  ├─ InventoryDock.js
│  │  ├─ PuzzleOverlay.js      ← "code" puzzle keypad UI
│  │  ├─ ReaderOverlay.js
│  │  ├─ AudioLogPlayer.js
│  │  ├─ TerminalOverlay.js
│  │  ├─ Codex.js
│  │  ├─ HintDrawer.js
│  │  ├─ ProgressTracker.js     ← §12.5
│  │  ├─ ChapterCompleteScreen.js ← §12.5
│  │  ├─ EndGameStats.js        ← §12.6
│  │  ├─ AchievementToast.js    ← §12.1
│  │  └─ PhotoMode.js           ← §12.12
│  ├─ data/                   ← pure content, no logic
│  │  ├─ index.js             ← central registry; import.meta.glob auto-registers rooms/puzzles/terminals
│  │  ├─ rooms/               ← one JSON per room (incl. secret rooms)
│  │  ├─ puzzles/             ← one JSON per puzzle definition
│  │  ├─ terminals/           ← one JSON per terminal instance, §12.11
│  │  ├─ items.json
│  │  ├─ notebook-entries.json
│  │  ├─ achievements.json    ← §12.1
│  │  ├─ classified-files.json ← §12.2
│  │  ├─ cinematics.json      ← §12.9
│  │  └─ strings/             ← localization tables (en.json, ar.json, ...)
│  └─ main.js                 ← composition root / bootstrap
├─ assets/
│  ├─ images/
│  │  ├─ rooms/<chapter>/<room>-physical.webp
│  │  ├─ rooms/<chapter>/<room>-memory.webp
│  │  ├─ items/
│  │  ├─ ui/
│  │  └─ documents/
│  ├─ audio/
│  │  ├─ ambient/
│  │  ├─ sfx/
│  │  ├─ logs/
│  │  └─ music/
│  └─ fonts/
├─ styles/
│  ├─ tokens.css              ← design tokens (color, type, spacing scale)
│  ├─ base.css
│  ├─ layout.css              ← responsive grid/stage rules
│  ├─ components/             ← one file per UI component
│  └─ animations.css
└─ tests/
   ├─ unit/
   └─ fixtures/
```

---

## 14. File Structure Conventions

- **One room = one JSON file** (`src/data/rooms/ch2_office.json`) + a matching image pair (`-physical.webp`, `-memory.webp`). Adding content never means touching engine code.
- **One puzzle type = one class** under `PuzzleEngine` (`CipherPuzzle.js`, `LockPuzzle.js`, `SequencePuzzle.js`, …), instantiated from data (`type: "cipher"` in JSON) rather than one-off per-room scripts.
- **Naming convention:** `chX_roomname` for room ids, `pz_chX_roomname_a` for puzzle ids, `itm_name` for items — keeps cross-references greppable.
- **No inline styles/scripts** — all presentation in `/styles`, all behavior in `/src`; HTML is a thin shell with mount points.
- **Localization-ready from day one**: no hardcoded UI or document strings in JS; everything keys into `strings/en.json` (Arabic included from the start given the studio's existing RTL work, with `dir="rtl"` handled at the layout-token level).

---

## 15. JavaScript Architecture

- **Vanilla ES2022 modules** — no framework dependency. A narrative point-and-click game doesn't need React/Vue's reactivity overhead; DOM updates are infrequent and scene-driven. Keeps the bundle premium-lean (see §20 Performance).
- **Pattern: lightweight ECS-adjacent + central EventBus**, not a monolithic god-object:
  - **`GameStateManager`** — finite-state machine (`BOOT → MENU → PLAYING → PAUSED → CUTSCENE_REVEAL → ENDING`), the only thing allowed to change top-level state.
  - **`EventBus`** — pub/sub; systems never call each other directly (e.g., `PuzzleEngine` emits `puzzle:solved`, and `RoomSystem`, `NotebookSystem`, `AchievementSystem`, and `StatsSystem` all listen independently — decoupled, testable, and safely extensible: `AchievementSystem`, `StatsSystem`, `TerminalSystem`, and `CinematicSystem` (§12.1–§12.11) are pure listeners bolted on without touching puzzle/room logic).
  - **`SaveManager`** — subscribes to all mutation events, debounced serialize-to-localStorage; exposes `load()/save()/exportSlot()` behind an interface so storage backend is swappable.
  - **`RoomSystem`** — loads a room's JSON + image pair, renders hotspots, owns the Physical/Memory layer cross-fade.
  - **`InputManager`** — normalizes `pointerdown/up/move` (covers both mouse and touch via the Pointer Events API) so gameplay code never branches on device type.
  - **`PuzzleEngine`** — registry of puzzle-type classes, each implementing a small interface: `render(container)`, `checkSolution(input)`, `serialize()/deserialize()`.
  - **UI components** — small, dependency-free classes that mount/unmount into designated DOM containers; communicate only via `EventBus`, never reach into each other.
- **Rendering approach:** DOM + CSS for all UI and room backgrounds (keeps text crisp, accessible, and SEO/screen-reader friendly); a single `<canvas>` overlay reserved *only* for ambient particle/grain/glitch VFX, composited above the DOM layer with `pointer-events: none` so it never interferes with interaction.
- **Build tooling:** Vite (dev server + bundling, ESM-native, zero-config for this scope), with `import.meta.glob` to auto-register room/puzzle JSON — adding a room file is enough, no manual index to maintain.
- **Testing:** unit tests for `PuzzleEngine` puzzle-type logic and `SaveManager` serialization (pure functions, easy to isolate); manual QA checklist for room-by-room playtesting (see roadmap).

---

## 16. Asset Planning

| Category | Notes |
|---|---|
| Room backgrounds | 12 rooms × 2 layers (Physical/Memory) = 24 illustrated scenes. Painterly-digital style, 1920×1080 source, exported WebP. |
| Item icons | ~35–45 unique items across the game, flat-shaded icon style consistent with room art's palette. |
| UI chrome | Frames, buttons, cursors, dock, sheet, overlays — one cohesive component sheet (see §17 Visual Identity). |
| Documents | ~20 readable in-world documents (letters, forms, sketches) as high-res layered images for the Reader overlay. |
| VFX | Dust motes, light shafts, CRT scanline/grain overlay, glitch-wipe transition frames. |
| Fonts | Self-hosted subset (see §18 Typography) to avoid FOIT/CDN dependency. |
| Iconography | Achievement icons, hint-tier icons, settings icons — single SVG icon sprite for crisp scaling at any DPI. |

Asset production is chaptered: Ch.1 art/audio is a full vertical-slice pass before Ch.2–5 begin, so the visual/audio bar is locked early rather than discovered late.

---

## 17. Sound Planning

- **Ambient beds** — one evolving drone/soundscape per chapter (not per room) that subtly shifts on the Memory Layer toggle (e.g., a faint reversed-choir texture fades in on Memory Layer), reinforcing the mechanic audibly, not just visually.
- **Diegetic SFX** — paper rustle, lock tumblers, drawer slides, tape reel spin-up — every interactable has a bespoke sound, no generic "click" reused everywhere.
- **UI feedback** — a minimal 3-sound set (confirm / deny / notify) shared across all menus for consistency.
- **Audio logs** — treated as degraded mono recordings (light wow/flutter + tape hiss processing) for authenticity; ducking system lowers ambient bed to -18dB while a log plays.
- **Music** — sparse, use only at chapter transitions and the two endings; the rest of the game is intentionally near-silent but for ambience, per Pillar 4.
- **Mix targets:** LUFS-normalized master bus (~-16 LUFS for web playback consistency), independent Master/Music/SFX/Voice sliders in Settings, and a hard mute-on-tab-blur behavior (pause audio when the browser tab loses focus) as a courtesy default.

---

## 18. Visual Identity

**Art direction: "Analog Futurism."** Brutalist concrete-and-paper archive architecture, photographed-collage texture work, intersected by a faint cyan holographic Memory Layer. Think *Control* meets *Firewatch* meets an old university records basement.

- Compositions are **static, painterly, high-contrast**, always with one clear focal read even before any hotspot is found.
- Every room has exactly **one accent color** drawn from the palette below, chosen to match its chapter's emotional beat (see §19).
- UI chrome stays **consistent and restrained** across all 12 rooms — the environment art changes; the interface frame never distracts from it.

---

## 19. Color Palette

**Base neutrals (Physical Layer):**
| Token | Hex | Use |
|---|---|---|
| `--ink-950` | `#0B0D10` | Deepest background / letterbox bars |
| `--ink-900` | `#12151A` | Base room shadow tone |
| `--paper-200` | `#E8E2D6` | Document/paper surfaces |
| `--paper-100` | `#F5F1E8` | Reader overlay background |
| `--stone-600` | `#4A4E57` | Architecture midtones |

**Memory Layer accent (the signature hologram color):**
| Token | Hex | Use |
|---|---|---|
| `--memory-cyan` | `#4FE3D0` | Default Memory Layer glow, hotspot highlight-assist |
| `--memory-cyan-dim` | `#2B7A72` | Memory Layer shadow/secondary |

**Per-chapter emotional accents** (used sparingly — one accent object/light source per room, never a full wash):
| Chapter | Accent | Hex | Meaning |
|---|---|---|---|
| Prologue / Ch.1 | Amber | `#D9A55C` | Warmth, invitation |
| Ch.2 | Cyan (default) | `#4FE3D0` | Investigation, clarity |
| Ch.3 | Violet | `#8B7FD6` | Uncertainty, memory distortion |
| Ch.4 | Rust Red | `#B4543A` | Corruption, danger (used minimally — no jump-scare palette) |
| Ch.5 / Epilogue | Warm White | `#F2EBDD` | Revelation, resolution |

**Semantic / system colors:**
| Token | Hex | Use |
|---|---|---|
| `--success` | `#6FCF97` | Puzzle solved, item combined |
| `--deny` | `#C97A6A` | Invalid action (soft, never alarming red) |
| `--hint` | `#E3C567` | Hint drawer accent |

**Accessibility:** all accent/semantic pairs are checked against `--ink-950`/`--paper-100` backgrounds for WCAG AA contrast; a colorblind-safe puzzle mode (§11 Settings) ensures no puzzle solution is color-only — always paired with shape/pattern/label.

---

## 20. Typography

Three-role type system, self-hosted subsets (no runtime CDN dependency, better performance + offline resilience):

| Role | Typeface | Use |
|---|---|---|
| **Diegetic / documents** | *Spectral* (serif, variable weight) | In-world letters, forms, Codex entries — feels "written," not "designed." |
| **System / terminal** | *IBM Plex Mono* | The Archive's narrator text, code/cipher puzzle displays, save-slot metadata. |
| **UI chrome** | *Sora* (geometric sans) | Menus, buttons, settings, HUD labels — clean and neutral so it never competes with room art. |
| **Arabic/RTL support** | *Tajawal* (paired with Sora metrics) | Reuses the studio's existing localization groundwork; full `dir="rtl"` layout support from the token layer. |

**Scale:** a modular type scale using CSS `clamp()` (e.g., `clamp(0.9rem, 0.8rem + 0.4vw, 1.15rem)` for body) so text scales fluidly rather than jumping at breakpoints — critical for the responsive strategy below.

---

## 21. Animation Planning

- **Room transition:** a 600ms "film-burn" wipe (radial mask + grain) between rooms — signature transition, reused everywhere for consistency.
- **Layer toggle:** 350ms cross-fade + chromatic-aberration pulse, synced with a subtle audio swell — the single most-repeated animation in the game, so it must feel *good* on the 50th use, not just the 1st.
- **Item pickup:** item icon flies from world-position to inventory dock with an ease-out arc + dock "pulse" (150ms) — standard genre affordance, kept snappy so it never feels laggy on repetition.
- **Puzzle solve:** a bespoke micro-animation per puzzle *type* (not per instance) — e.g., all lock puzzles share one "tumblers click + door creaks" resolution beat.
- **Document reader open/close:** paper "unfolds" on open (desktop) / slides up as a sheet (mobile), 250ms ease.
- **Idle affordance:** hotspots emit a barely-perceptible 4s-cycle glint (opacity 0→0.15→0) — intentionally subtle so it rewards attentive players without turning the scene into a checklist of glowing outlines (full glow available as an Accessibility toggle).
- **Reduced-motion mode:** every animation above has a "reduced" variant (cross-fade only, no parallax/shake) bound to `prefers-reduced-motion` and the manual Settings toggle.

---

## 22. Responsive Strategy — Desktop & Mobile

**Guiding rule: one design system, two input adapters — never two separate builds.**

- **Fixed-aspect "stage" model:** the game renders inside a `16:9` stage container that scales-to-fit its viewport via `aspect-ratio` + `object-fit: contain` logic, letterboxing (with in-theme decorative bars, never blank black) on mismatched aspect ratios rather than stretching or cropping art — this directly satisfies "no stretched layouts, no cropped interface."
- **Percentage-based hotspot coordinates** (declared in §8 room schema) mean a hotspot's clickable polygon scales perfectly with the stage at any resolution — no per-breakpoint hotspot redefinition needed.
- **Layout breakpoints** (content reflow, not just scaling):
  - **Desktop (≥1024px):** side-anchored inventory dock, hover states enabled, keyboard shortcuts active (`Esc`, `Space` for layer toggle, `I` for inventory focus).
  - **Tablet (600–1023px):** bottom inventory dock, larger touch targets, hover states disabled.
  - **Mobile (<600px):** bottom-sheet inventory (collapsed by default to maximize scene visibility), single-column menus, orientation-aware — landscape is the intended orientation (matches the 16:9 stage); a portrait mode is still fully supported via a rotated-safe UI layout (stage shrinks, menus stack vertically) rather than forcing rotation, since forced-rotation prompts are poor mobile UX.
- **Touch-specific affordances:** minimum 44×44px (56×56px for primary actions) hit areas even where the visual icon is smaller; tap-and-hold for "examine" vs. tap for "interact" is avoided in favor of a single consistent tap-to-act + a separate explicit "examine" (magnifier) icon, since hidden gestures are a common mobile-UX failure in this genre.
- **Input abstraction:** `InputManager` (see §15) means gameplay/puzzle code is 100% input-agnostic — mouse, touch, and keyboard all resolve to the same `interact(hotspotId)` calls, so there is no parallel "mobile logic."
- **Testing matrix:** iPhone SE (smallest common viewport), a mid-size Android, iPad, and 1080p/1440p desktop are the four required checkpoints for every UI change.

---

## 23. Performance Optimization Plan

- **Budget targets:** first meaningful paint < 1.5s, interactive < 3s on a throttled 4G profile; initial JS payload < 200KB gzipped (Vite code-splits per chapter — Chapter 3's data/assets aren't fetched until Chapter 2 completes).
- **Image strategy:** WebP/AVIF primary with a lazy-loaded PNG fallback path only if format support fails; room images sized to actual stage resolution tiers (not one oversized master); the *next* room's assets are prefetched during the current room's idle time, not blocking initial load.
- **Audio strategy:** compressed OGG/AAC, ambient beds streamed rather than fully buffered; only the current + adjacent room's SFX are kept decoded in memory.
- **Rendering discipline:** all animation via `transform`/`opacity` only (GPU-composited, no layout thrash); the VFX `<canvas>` layer runs its particle system at a capped 30fps with object pooling (no per-frame allocation) even though UI/game logic can run at display refresh rate.
- **Memory hygiene:** room data/images are released (`URL.revokeObjectURL` / reference drop) once a room is two-or-more rooms behind the player, since the game is linear and rarely needs deep backtracking.
- **Idle cost:** when the tab is backgrounded, ambient audio pauses and the VFX canvas RAF loop halts entirely — a background browser tab should cost ~0% CPU.
- **Regression guard:** Lighthouse CI budget check wired into the build pipeline (performance ≥ 90 target) before any milestone is considered "done."

---

## 24. Future Expansion Ideas

- **FILE-002, FILE-003…** — episodic follow-ups reusing the engine; each file explores a different sealed memory/Archivist, sold as a season or bundle.
- **Archive Together** — light asynchronous co-op: share a hint or a solved-puzzle "echo" with a friend via a shareable code, without full real-time multiplayer complexity.
- **Community Room Editor** — expose the JSON room/puzzle schema (already data-driven per §8/§13) as a lightweight in-browser editor for community-made bonus rooms.
- **Cloud saves + account linking** — swap the `SaveManager` storage adapter (already interface-bound, §10/§15) to a backend service for cross-device continuation.
- **Steam premium build** — wrap via Electron/Tauri for a paid storefront release with native achievements/cloud saves, reusing the same web codebase.
- **Full narrator / audio-description mode** — accessibility expansion reading room descriptions and document text aloud, for low-vision players.
- **Companion ARG website** — an in-fiction "Archive public terminal" website that seeds lore ahead of FILE-002's release, tying marketing directly into the world.

---

## 25. Development Roadmap

| Milestone | Scope | Exit Criteria |
|---|---|---|
| **M0 — Pre-Production** *(this document)* | Vision, story, systems, architecture, visual identity, and the v1.1 refinement pass (§12.1–§12.12) all defined. | GDD v1.1 approved. |
| **M1 — Core Engine & Production Foundation** *(done)* | `GameStateManager`, `EventBus`, `InputManager`, `SaveManager` (v2 schema), `AudioManager`, `Config` implemented; responsive stage/letterbox shell; Loading Screen (with lore ticker), Main Menu, Settings Menu fully functional. | Menu → Settings → Save/Load flow verified end-to-end on desktop + mobile with no gameplay content. |
| **M2 — Vertical Slice: Prologue + First Room** *(done)* | Real `RoomSystem`/`HotspotSystem`/`LayerToggleSystem`, `InventorySystem` + dock, `PuzzleEngine` (the "code" lock archetype), `TerminalOverlay` (typed responses, command queueing, HELP/LOG/STATUS/SEARCH incl. one Easter egg), `ReaderOverlay` with the Classified File declassify reveal, `CinematicSystem` + `IntroSequence`, `AchievementSystem` condition-matching wired to 2 real Commendations, `SessionStore` (live save state + autosave). Content: a cinematic intro, the Prologue "Reception" room, and Chapter 1's "Intake Records" room (one terminal, one puzzle, one Classified File, one item), all rendered with procedural CSS/DOM scene art (no illustrated assets yet — GDD §16). | Full loop verified in a real browser, desktop + mobile: intro → Prologue → Memory Layer toggle → Ch.1 room → terminal commands → puzzle solve → cinematic → document reveal → inventory → item-on-door → Pause → Main Menu → Continue resumes with state intact. Zero console errors either platform. |
| **M3 — Puzzle & System Breadth** | Remaining puzzle-type classes (cipher, audio, layer, sequence, combination, pattern-recall), `NotebookSystem` viewer, Codex (incl. redacted Classified File covers), Progress Tracker, Chapter Completion Screen, End-Game Statistics screen, Audio Log Player, `HintDrawer` as a standalone component. | Puzzle variety demonstrated across a second room; full UI flow (§12) navigable end-to-end with no dead ends, keyboard- and touch-operable. |
| **M4 — Content Production Ch.2–3** | 4 rooms, secret room #1, Cinematic Beats for these chapters, puzzles/narrative; first illustrated-art pass begins (replacing procedural CSS scene art — GDD §16). | Ch.2–3 integrated, playtested internally; secret room #1 discoverable. |
| **M5 — Content Production Ch.4–5 + Epilogue** | Remaining 5 rooms, both primary endings, hidden ending trail (§12.8), Deep Archive remix variants, second-playthrough-only content (§12.7) stubbed behind `hasCompletedOnce`. | Full critical path completable; all three endings reachable and saved distinctly. |
| **M6 — Responsive & Accessibility Pass** | Full audit across the 4-device test matrix; colorblind mode, reduced motion (incl. Cinematic Beat fallback), subtitle/text-size, RTL (Arabic) pass. | No cropped/stretched layout at any tested viewport; accessibility settings verified functional. |
| **M7 — Performance & Polish** | Asset compression pass, Lighthouse budget compliance, animation timing pass, audio mix pass, VFX pooling, Photo Mode, Developer Commentary Mode. | Meets §23 performance budgets; Lighthouse ≥ 90. |
| **M8 — QA / Bug Bash** | Full linear playthrough ×4 (fresh state, mid-save resume, Deep Archive, hidden-ending trail), soft-lock audit, save-corruption/migration resilience test. | Zero known soft-locks; save/load verified across all 12 critical-path rooms + 2 secret rooms. |
| **M9 — Launch** | Deploy to web (itch.io-style hosting), analytics/error logging wired, marketing/store page assets. | Public release of ARCHIVE : FILE-001. |
| **Post-Launch** | Monitor telemetry/error reports, hotfix window, begin FILE-002 pre-production using this same engine. | Stable live build; FILE-002 GDD kicked off. |

---

*End of Game Design Document — v1.1. Design and architecture foundation for all production milestones. Milestones 1–2 are implemented in `/archive-file-001/src`: the production foundation plus a playable vertical slice (cinematic intro, the Prologue room, and Chapter 1's first room with a working terminal, puzzle, Classified File, and inventory item). Room art is procedural CSS/DOM pending Milestone 4's illustrated-asset pass; puzzle variety, the Notebook/Codex/Progress Tracker viewers, and further chapters begin at Milestone 3.*
