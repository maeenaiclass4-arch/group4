# ARCHIVE : FILE-001
### Game Design Document — v1.0 (Pre-Production)
**Studio Roles:** Game Direction · Software Architecture · UI/UX · Narrative Design
**Platform:** Browser (Desktop + Mobile, responsive HTML5)
**Status:** Design-only. No gameplay code has been written yet.

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
  ambientAudio,
  hotspots: [ { id, shape, coords[desktop/mobile variants], type, state-dependent sprite, action } ],
  items: [ itemId... ]        // items obtainable in this room
  puzzles: [ puzzleId... ]     // puzzle definitions solved in this room
  exitCondition: puzzleId | flag,
  notebookEntries: [ ... ]     // auto-added when triggered
  whispers: [ optional collectible defs ]
}
```

- **One-screen-per-room** philosophy: no scrolling/panning camera in v1 (keeps mobile parity trivial and touch targets predictable). Very large scenes are split into two connected rooms instead.
- Rooms declare **layout-independent hotspot coordinates** (percentage-based polygons, not pixels) so the same room data renders correctly at any viewport (see §19 Responsive Strategy).
- Room count for FILE-001: **1 Prologue + 10 rooms across 5 chapters (2 each) + 1 Epilogue = 12 rooms.**

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
  "schemaVersion": 1,
  "currentRoomId": "ch2_office",
  "flags": { "ch1_puzzle_lock_solved": true },
  "inventory": ["torn_photo", "brass_key"],
  "notebook": ["code_4471", "sketch_symbol_a"],
  "whispersFound": ["w_ch1_a"],
  "settings": { "audioVol": 0.8, "subtitles": true, "layerAssist": false },
  "endingChosen": null,
  "timestamp": 1737000000
}
```
- **3 manual save slots** ("Archive Checkpoints") in addition to autosave, letting players branch-explore near the two endings without losing the autosave point.
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
├─ Codex / Archive Index   (documents, audio logs, Whispers, achievements)
├─ Settings
│   ├─ Audio (Master / Music / SFX / Voice sliders)
│   ├─ Text & Subtitles (size, subtitle toggle, language)
│   ├─ Accessibility (Layer-Toggle Assist glow, hint frequency, reduce motion, colorblind-safe puzzle mode)
│   └─ Controls (rebind hint for desktop, sensitivity N/A — point & click only)
└─ Credits

Pause Menu (in-room, Esc / pause icon)
├─ Resume
├─ Settings (same panel as above, layered)
├─ Hint (opens 3-tier hint drawer for current puzzle)
├─ Checkpoints
└─ Return to Main Menu (confirms unsaved-risk, though autosave makes this low-risk)
```

---

## 12. UI Flow

```
[Boot / Loading Screen]
        ↓
[Main Menu] ──Settings/Credits/Codex──→ (modal overlays, return to Main Menu)
        ↓ New Archive / Continue
[Room View] ←────────────────────────────┐
   │  hotspot tap → [Zoom Inspect] ───────┤
   │  item tap → [Inventory Dock]         │
   │  document hotspot → [Reader Overlay] │
   │  tape hotspot → [Audio Log Player]   │
   │  layer-toggle → [Memory Layer swap]  │
   │  pause icon → [Pause Menu] ──────────┤
   │  puzzle solved → [Fragment Reveal] ──┘
   ↓ chapter exit
[Transition Wipe] → next [Room View] … → [Epilogue Choice] → [Ending Sequence] → [Codex unlock] → [Main Menu]
```

**Flow principles:**
- Every overlay (Reader, Audio Player, Zoom Inspect, Pause) is dismissible with a consistent single gesture: `Esc` on desktop, a top-corner "×" tap-target on mobile (also swipe-down for bottom-sheet-style overlays).
- No more than **one overlay deep** at a time — opening a document from within a zoom-inspect closes the zoom first — to avoid modal-stacking confusion on small screens.
- All destructive actions (New Archive over an existing save, overwrite checkpoint) require a confirm step.

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
│  │  ├─ InputManager.js      ← unifies mouse/touch/keyboard
│  │  └─ AudioManager.js
│  ├─ systems/
│  │  ├─ RoomSystem.js
│  │  ├─ HotspotSystem.js
│  │  ├─ InventorySystem.js
│  │  ├─ PuzzleEngine.js
│  │  ├─ NotebookSystem.js
│  │  └─ LayerToggleSystem.js
│  ├─ ui/
│  │  ├─ MainMenu.js
│  │  ├─ PauseMenu.js
│  │  ├─ SettingsPanel.js
│  │  ├─ InventoryDock.js
│  │  ├─ ReaderOverlay.js
│  │  ├─ AudioLogPlayer.js
│  │  ├─ Codex.js
│  │  └─ HintDrawer.js
│  ├─ data/                   ← pure content, no logic
│  │  ├─ rooms/               ← one JSON per room
│  │  ├─ puzzles/             ← one JSON per puzzle definition
│  │  ├─ items.json
│  │  ├─ notebook-entries.json
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
  - **`EventBus`** — pub/sub; systems never call each other directly (e.g., `PuzzleEngine` emits `puzzle:solved`, `RoomSystem` and `NotebookSystem` both listen — decoupled, testable).
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
| **M0 — Pre-Production** *(this document)* | Vision, story, systems, architecture, visual identity all defined. | GDD approved. |
| **M1 — Core Engine Skeleton** | `GameStateManager`, `EventBus`, `InputManager`, `RoomSystem`, `SaveManager` scaffolded; stage/letterbox responsive shell built with placeholder art; one dummy room renders and transitions correctly on desktop + mobile. | A blank room loads, resizes correctly at all 4 test viewports, and autosaves a dummy flag. |
| **M2 — Puzzle & Inventory Systems** | `PuzzleEngine` with all 8 puzzle-type classes (placeholder art), `InventorySystem` + dock/sheet UI, `NotebookSystem`, Document Reader, Audio Log Player. | One fully playable placeholder room demonstrating pickup → combine → solve → unlock, on both input modes. |
| **M3 — Menu & UX Shell** | Main Menu, Pause Menu, Settings (incl. Accessibility), Codex shell, Hint Drawer, save-slot UI. | Full UI flow (§12) navigable end-to-end with no dead ends, keyboard- and touch-operable. |
| **M4 — Vertical Slice (Prologue + Chapter 1)** | Final art, audio, and narrative content for 3 rooms; layer-toggle mechanic fully realized; transitions polished. | Prologue–Ch.1 playable start-to-finish at final visual/audio bar — this slice sets the quality benchmark for all remaining content. |
| **M5 — Content Production Ch.2–3** | 4 rooms, 2 chapters worth of puzzles/art/audio/narrative. | Ch.2–3 integrated, playtested internally. |
| **M6 — Content Production Ch.4–5 + Epilogue** | Remaining 5 rooms, both endings implemented, Deep Archive remix variants stubbed. | Full critical path completable, both endings reachable and saved distinctly. |
| **M7 — Responsive & Accessibility Pass** | Full audit across the 4-device test matrix; colorblind mode, reduced motion, subtitle/text-size, RTL (Arabic) pass. | No cropped/stretched layout at any tested viewport; accessibility settings verified functional. |
| **M8 — Performance & Polish** | Asset compression pass, Lighthouse budget compliance, animation timing pass, audio mix pass, VFX pooling. | Meets §23 performance budgets; Lighthouse ≥ 90. |
| **M9 — QA / Bug Bash** | Full linear playthrough ×3 (fresh state, mid-save resume, Deep Archive), soft-lock audit, save-corruption resilience test. | Zero known soft-locks; save/load verified across all 12 rooms. |
| **M10 — Launch** | Deploy to web (itch.io-style hosting), analytics/error logging wired, marketing/store page assets. | Public release of ARCHIVE : FILE-001. |
| **Post-Launch** | Monitor telemetry/error reports, hotfix window, begin FILE-002 pre-production using this same engine. | Stable live build; FILE-002 GDD kicked off. |

---

*End of Game Design Document — v1.0. No gameplay code has been implemented as part of this document; this is the design and architecture foundation for all subsequent production milestones.*
