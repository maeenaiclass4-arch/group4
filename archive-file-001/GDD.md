# ARCHIVE : FILE-001
### Game Design Document — v2.2 — **LOCKED: Creative Foundation of the Project**
**Studio Roles:** Game Direction · World Design · Environmental Art Direction · Systems/Technical Architecture
**Platform:** Browser (WebGL, Desktop-first, Mobile as a stretch target — see §14)
**Status:** This document is now the **locked creative bible** for ARCHIVE : FILE-001. Every future design or implementation decision is evaluated against it, and specifically against §1.1's tiebreaker philosophy. It remains **design-only** — no gameplay code exists yet, and none is written until this document is explicitly approved and a Case 001 vertical slice is separately greenlit (§17).

---

### Revision Notes (v2.1 → v2.2 — The Player Is Not the First)

A necessary correction: v2.1's ending, taken alone, risked reading as a "chosen one" story — the Archive existing *because of* the player, sized to a single lifetime. This pass removes that framing without discarding the emotional core of the personal-file twist. Two changes: first, a new environmental-storytelling layer (§5.4) seeds physical evidence of many prior Archivists throughout the game — abandoned workspaces, old notes, missing photographs, personal recordings, unfinished investigations — some clearly resolved cleanly, some trailing off mid-sentence, some unsettlingly recent. Second, §18's ending is rewritten: the Sub-Vault is no longer a room built *from* the player's memories — it is revealed as an ancient, vast repository the player's single file is one small part of, proving the Archive predates and will outlast any one Archivist. The ending now closes on a deliberate, permanent gap: no document in the entire game ever answers who built the Archive in the first place (§18.5), and none should be added later without a full revision of this section.

---

### Revision Notes (v2.0 → v2.1 — The Archive as Living Character)

v2.0 established the format pivot (first-person 3D exploration) and the five-case structure. This pass deepens the *creative* foundation without changing that structure: the Archive itself is elevated from "setting" to the game's true subject and central mystery (§2.1, §8, §8.1). Six additions were folded in: the building subtly, non-horror-ly alters itself over time and the player should distrust their own memory of it (§2.1); curiosity, not objectives, is named as the primary driver and pillars are reordered around it (§1); every mechanic must be taught by level design alone, with zero tutorial text/prompts (§1.2); solving a case must visibly, physically change the building — new passages, powered elevators, lit-up forgotten areas (§6.1); deliberately puzzle-free "quiet spaces" are mandated as first-class content, not filler (§10.1); an optional, non-mandatory collectible layer (photographs, badges, tapes, letters, blueprints) is added for curious players (§10.2); and — critically — the ending is now designed in full, in prose, as a design document artifact, without being implemented (§18). §1.1 also formalizes a standing tiebreaker philosophy for every future ambiguous decision.

---

### Revision Notes (v1.2 → v2.0 — Full Genre Pivot)

v1.x was a complete, polished, working 2D point-and-click puzzle game. It was rejected at the concept level, not the execution level: it read as an *indie puzzle game* — a sequence of locked-room puzzles wearing an archive skin. The direction now is a **premium first-person 3D exploration game**, structurally inspired by *The Witness* — not its puzzle grammar, but its discipline: a world worth walking through, where every solved puzzle is the payoff of *looking*, not of guessing a combination. Every system in this document is new. Nothing about "click a hotspot, open a menu, type a code" survives. The only thing explicitly carried forward is the **material and lighting language** of v1.x's final polish pass (§18/§19 of v1.2) — dark wood, old brass, dark green, paper beige, warm practical light — because that palette was correct; it was the *format* around it that was wrong.

---

## 0. Logline

> *The building is small enough to walk past without noticing. It is not small enough to ever finish walking through.*

**ARCHIVE : FILE-001** is a premium, atmospheric first-person exploration game. The player is a newly assigned Archivist walking, unguided, into a records facility that is far larger inside than its exterior allows. There is no HUD, no map, no waypoint, no dialogue tree — only rooms, light, objects, and the slow, physical work of noticing. Each case the Archivist is sent to close reveals, on completion, that it was never really separate from the others. FILE-001 — the case that gives the building its name — is not the last file in the cabinet. It is the reason the cabinet exists.

Tone reference: *The Witness* (structure, pacing, trust in the player), *The Vanishing of Ethan Carter* (environmental deduction, unhurried camera), *Layers of Fear* (lighting only — not horror mechanics), *Gone Home* (silence as narration).

---

## 1. Vision & Pillars

**Core mandate:** The Archive is the world. Every room is a case. Every puzzle is solved by observing the environment, investigating clues, and interacting with physical objects. The player never types a command, never sees a UI puzzle screen, and never enters a number they didn't first find written into the world itself.

**Pillars, in priority order:**

1. **Presence over progression.** The player should feel they have walked into a place that has existed for decades, independent of them — not a stage built for a puzzle. Nothing in a room should exist *only* because the puzzle needs it; everything the puzzle needs should look like it was always there for its own reason.
2. **The environment is the interface.** No menus, no floating icons, no on-screen puzzle widgets. If a solution is a number, that number exists physically, inscribed or arranged somewhere in the world. If it is a symbol, the player finds it by looking, not by opening an inventory.
3. **Every case has its own grammar.** No two cases are solved the same way. A case built on sound must never be solvable by staring; a case built on light must never be solvable by listening. Variety of *mechanism*, not just variety of skin.
4. **Show, never tell.** No character explains the plot. No long dialogue. The story exists in documents, photographs, the arrangement of a room, a light left on, a chair pushed back. The player assembles the story; the game never assembles it for them.
5. **Mystery, not horror.** No jump scares, no monsters, no chase sequences. The dread is architectural and epistemic: the growing, unshakeable sense that something in this building does not obey the rules the player was told it obeys.
6. **The ending recontextualizes everything.** FILE-001 is not "the last case." Its resolution should send the player back through their own memory of the building, re-reading rooms they thought they already understood.

**Explicitly rejected framings:** puzzle-after-puzzle escape room; tech demo; UI-mediated inventory/crafting game; horror game; open-world checklist game; anything requiring the player to type, enter, or memorize-and-transcribe a code outside the world itself.

### 1.1 Design Philosophy — The Standing Tiebreaker

Every future design decision — art, level layout, systems, writing — that is genuinely ambiguous is resolved by this ordering, without exception:

> **Wonder over spectacle. Atmosphere over action. Discovery over explanation. Immersion over interface. Quality over quantity. Curiosity over objectives.**

If a proposed room, mechanic, or line of text satisfies the "cooler" option on the left of any of these pairs at the cost of the principle on the right, it is rejected. The single sentence that governs all of it: **the Archive should never feel like a puzzle game. It should feel like a place that truly exists.**

### 1.2 Curiosity, Not Objectives

The player's dominant emotional state, moment to moment, should be **"I need to know what this place really is"** — not "what's my next objective." This has concrete design consequences, not just a mood requirement:
- No objective marker, no quest log, no on-screen prompt of any kind ever tells the player what to do next (this was already true of the Casebook's design in §9; it is now elevated to a pillar in its own right, not just a UI constraint).
- **Zero tutorialization.** No "Press E to interact," no popup, no highlighted first-use hint, no onboarding overlay. Every mechanic — look, move, interact, open the Casebook — is taught the way *The Witness* teaches its first line puzzle: by placing the player somewhere they can only succeed by discovering the rule themselves, using level geometry and lighting to draw the eye, never text.
- The player is never rushed. No timers, no music stinger implying urgency, no environmental countdown. Curiosity does not coexist with pressure; the moment the player feels rushed, they stop looking closely, which defeats the entire design.

---

## 2. World Identity — The Archive

### 2.1 The Archive Is the Main Character

The building is not a backdrop the cases happen inside — it is the game's protagonist in everything but name, and by the end it should be clear that **the cases were never the real mystery; the Archive itself is** (expanded in §8.1). This is expressed entirely through subtlety, never through horror or magic framing:

- **Not haunted, not magical — simply wrong.** No supernatural VFX, no ghosts, no glowing sigils. The building's aliveness reads only through small, deniable discrepancies.
- **Micro-changes over time, never mid-glance.** A painting the player passed twice is, on a third pass, hanging at a slightly different position. A chair that was pushed in is now pulled out. A corridor the player is certain ran straight now bends, almost imperceptibly. A room the player remembers as cramped now reads as a few meters larger. None of these ever happen while the player is looking directly at the object — always discovered on return, planting doubt in the player's own memory rather than presenting an effect.
- **Frequency and restraint.** These changes are rare and deliberately placed — a handful per wing, never a gimmick repeated so often it becomes a spot-the-difference minigame. Their entire power comes from scarcity and plausibility ("maybe I misremembered") rather than obviousness.
- **No character or document ever explains this.** It is never called out as "the building changes" by any text in the game. The player's growing, unspoken certainty that something is wrong with their own memory of the place *is* the horror-adjacent-but-not-horror tone target from §10.

The Archive presents, from the outside, as an unremarkable mid-sized records building — the kind of place a city would forget it owns. Inside, it is not merely large; it is **architecturally incoherent in a way that only reveals itself gradually**. Corridors run longer than the exterior footprint allows. A stairwell glimpsed from a window on one floor reappears, from the inside, three floors higher than it should be.

The game never explains this. No character says "the building is bigger on the inside." The player is the one who starts to notice — a window that shows a courtyard the player has never been able to reach from any door; a room whose skylight should be blocked by the wing above it, and isn't. Environmental contradiction is planted, not narrated.

**Wings as eras.** The Archive is organized into distinct wings, each carrying its own architectural period, materials, and institutional "personality," as though the building were expanded by different administrations decades apart and never unified:

- **The Rotunda (hub):** the oldest-feeling part of the building by *atmosphere* though nominally the "entrance" — a tall, brass-and-marble central hall that every wing gates off from. This is the only space the player returns to repeatedly, and the only place with a skylight, so it functions as the game's emotional home base and its lighting "day clock" (see §12).
- **The Registry Wing:** 1950s civic-institutional — steel shelving, frosted glass office doors, card-catalog furniture. Home to Case 001.
- **The Substrata / Sound Vaults:** older than the rest of the building reads from outside — brick-vaulted, half-converted from something that was never originally an archive (a cistern, a switching station). Home to Case 002.
- **The Conservatory Wing:** a later, glass-and-iron addition, full of skylights, mirrors, and reading tables positioned for daylight. Home to Case 003.
- **The Clockwork Wing:** a maintenance/mechanical annex with the building's clocks, pipes, and time-stamping equipment, dressed like a 1930s utility floor. Home to Case 004.
- **The Reading Room:** outwardly a conventional library floor, but its shelving, walls, and furniture are on rails and counterweights — a room built to be *rearranged*, by a prior custodian for reasons never fully explained. Home to Case 005.
- **The Sub-Vault:** beneath the Rotunda, sealed, inaccessible until late in the game — the FILE-001 vault. Its architecture quietly borrows a motif from *every other wing*, which is only recognizable as such once the player has already been through all of them.

Each wing is **visibly locked but glimpsed** from the Rotunda from the very start (through grated doors, glass, or a locked gate with light leaking under it), so the player always has a sense of the whole shape of the building and a felt list of "what's still ahead," without any UI ever stating it.

---

## 3. World Map

```
                              ┌───────────────────────┐
                              │      ROOF / SKYLIGHT    │
                              │   (Rotunda daylight,    │
                              │   visible from every    │
                              │      wing's windows)    │
                              └────────────┬────────────┘
                                           │
   ┌───────────────┐             ┌────────┴────────┐             ┌────────────────┐
   │  REGISTRY WING │─────────────┤                 ├─────────────│ SUBSTRATA WING  │
   │  (Case 001)    │   gate A    │                 │   gate B    │  (Case 002)     │
   │  Observation   │             │                 │             │  Sound          │
   └───────────────┘             │                 │             └────────────────┘
                                  │    ROTUNDA      │
   ┌────────────────┐            │      (HUB)      │            ┌─────────────────┐
   │ CONSERVATORY    │───gate C──┤                 ├──gate D────│  CLOCKWORK WING  │
   │  WING           │            │  Intake desk,   │            │  (Case 004)      │
   │  (Case 003)     │            │  entry hall,    │            │  Time            │
   │  Light          │            │  memorial wall  │            └─────────────────┘
   └────────────────┘            └────────┬────────┘
                                           │  gate E
                                  ┌────────┴────────┐
                                  │  READING ROOM    │
                                  │  (Case 005)      │
                                  │  Rearrangement   │
                                  └────────┬────────┘
                                           │  (revealed late —
                                           │   sealed at first)
                                  ┌────────┴────────┐
                                  │   SUB-VAULT      │
                                  │  (FILE-001)      │
                                  └──────────────────┘
```

The Rotunda is a true hub, not a corridor — all five case wings are reachable from it directly, and (per §6) the player is free to choose the order of Cases 001–003 immediately after the Prologue. Cases 004 and 005 gate open only once at least two of the first three are closed, and the Sub-Vault gates open only once all five are closed — see §6 for the exact gating logic.

---

## 4. Building Layout

The Rotunda is a three-story octagonal hall: a ground-floor intake desk (abandoned, a half-finished sign-in ledger on it), a mezzanine ringed with the locked wing-gates, and a skylight roof the player can see from inside every wing that has windows (the game's one consistent geometric anchor, used to quietly disprove the building's own floor plan later — a wing that should, by the exterior, be *below* the skylight instead has a window looking directly up into it).

Each wing is **not a single room but a short vertical/horizontal slice of the building** (roughly 4–8 connected spaces), so a "case" is a small explorable district, not one puzzle box. Wings are built with:
- One unmistakable **threshold space** (the gate itself, plus a short entry room that tonally sets the wing's era and mood before any puzzle content begins).
- A **non-linear core** of 2–4 interconnected rooms the player can explore in any order once inside.
- One **culmination space** where the wing's central mechanism/puzzle physically resolves (a vault door, a switchboard, a skylight aperture) — always a *physical* payoff (something visibly moves, opens, lights up), never a menu confirming "puzzle solved."

Verticality and impossible connections are used sparingly and always motivated by something the player can later verify by walking back through — never a random effect. E.g., a stair in the Clockwork Wing that descends more floors than the Rotunda's exterior height allows is later explained (never explicitly) by the Sub-Vault occupying space "borrowed" from every wing above it.

---

## 5. Story & Narrative Delivery

### 5.1 Premise
The Archive quietly closes cases nobody files a request for. The player is a newly assigned Archivist, given no orientation beyond a note pinned at the intake desk: five case folders, each referencing a room, none referencing each other. There is no dispatcher character, no radio voice, no companion. The building itself — through what has been left behind in it — is the only source of information.

### 5.2 Delivery rules
- No cutscenes, no voiced dialogue, no on-screen text boxes narrating events.
- Story exists exclusively in: physical documents (letters, memos, case folders — read by walking up to them and looking, not through a menu), photographs, the deliberate or accidental arrangement of furniture and objects, environmental audio (a recording left playing, not a "log" opened from a UI), and light (a room left lit as if someone just stepped out).
- Each case's documents are self-contained for that case's plot on first pass, but every one of them contains at least one detail (a name, a date, an object) that only becomes meaningful once two or more cases are compared — planting the FILE-001 connection without flagging it.

### 5.3 The FILE-001 Twist (setup only — full ending design in §18)
FILE-001 is not revealed as a case folder at all until the Sub-Vault. Instead, small physical inconsistencies recur across every wing — the same handwriting on a different case's intake form, the same object (a specific pocket watch, a repeated set of initials, a repeated room number) appearing where it shouldn't. None of it is pointed out by any UI or character. When the Sub-Vault finally opens, its contents make clear that all five cases were staged, arranged, or subtly altered by the same person, for the same reason, and that "FILE-001" is the name of the case the Archivist was — unknowingly — hired to close on themself. The intended player reaction is to want to walk back through the building and re-examine what they now know they misread.

### 5.4 Traces of Those Who Came Before

The player is never the first Archivist, and no line of text, document, or character ever suggests otherwise. The building must feel far older than any single person who has worked in it, and this is built entirely through environmental evidence, present in every wing from the Prologue onward:

- **Abandoned workspaces.** Desks, reading nooks, and inspection stations set up by hands other than the player's — arranged differently from wing to wing, in handwriting and object styles spanning visibly different decades, so no two feel like the same predecessor. Some are tidy, closed out, chair pushed in. Some are not.
- **Old notes.** Marginalia and corrections in other hands found inside case material — occasionally *disagreeing* with a conclusion the player is about to reach, forcing a second look rather than confirming what the player already thinks.
- **Missing photographs.** Albums and frames with a single photo conspicuously removed — a dust outline, an empty sleeve, a torn corner still pinned under the frame clip. Never explained. Never resolved.
- **Personal recordings.** Audio left behind in voices that are not the player's — mid-thought, mid-case, sometimes trailing off before finishing a sentence, exactly like a real recording interrupted rather than a scripted stop.
- **Unfinished investigations.** Side-spaces that are visibly *not* one of the five main cases — a half-solved mechanism, a corkboard mid-arrangement, a note that stops abruptly — and which the player is never given the means to finish. These stay unresolved on purpose; not every thread in the Archive is the player's to close.

**Tone discipline:** some of these predecessors clearly finished their work and left in good order. Some clearly did not — notes trailing into nothing, a room left mid-task. And a small number of details (a chair still warm-feeling in its arrangement, a room that reads as recently used rather than decades-stale, a door the player is certain they left open now closed) should plant the possibility that *someone else may still be somewhere in the building* — without this ever being confirmed, staged as an encounter, or resolved into a chase or jump scare. It stays exactly one register below certainty, consistent with §10's "mystery, not horror" pillar: the player should feel that the Archive was occupied before they arrived and will be occupied after they leave, not that they are being pursued.

---

## 6. Player Progression

Progression is **soft-gated and non-linear**, never a locked corridor with one door:

1. **Prologue:** linear, single path — arrival at the Rotunda, the intake desk, the discovery of the five case folders and the Casebook (see §9). Establishes controls, the "look, don't click a UI" grammar, and the building's first quiet impossibility.
2. **Open-choice tier (Cases 001–003):** all three gates unlock simultaneously after the Prologue. The player chooses order freely. Each case is fully self-contained in mechanism.
3. **Mid-gate (Cases 004–005):** these two gates physically unlock (a mechanism visibly disengages in the Rotunda — a beam of light, a released chain) once **any two** of Cases 001–003 are closed, not all three — so a completionist and a speed-focused player both feel the pacing is theirs.
4. **Sub-Vault gate:** opens once all five cases are closed. No countdown, no checklist UI — the gate itself changes physically (light spills from beneath it, a sound that wasn't there before) so the player *notices* the game state changed rather than being told.
5. **No fail-state, no timer, no combat.** Progression can never soft-lock: every physical object required for a solution is always reachable and never consumable in a way that can strand the player (see §8 design rules).

There are no XP, skill trees, or ability upgrades. The only thing that "levels up" is the player's own literacy in the game's visual/audio language — a deliberate choice, since a mechanical progression system would contradict pillar 1 (presence over progression).

### 6.1 The Archive Responds

Every closed case must leave a **visible, physical mark on the building itself**, not just an unlocked gate. This is how "progression" is communicated — never a checklist, always a change the player stumbles into:

- A passage that was solid wall on the way in is, on the way back through the Rotunda, an open doorway with a draft coming through it.
- A dead elevator the player noticed and dismissed early on is now lit, humming, its indicator needle moving.
- A wing that was fully sealed becomes partially accessible — one door of several, not the whole wing at once, so later cases can keep revealing more of an already-familiar space.
- Lights switch on in areas that were dark on every previous pass, redrawing rooms the player thought they had already fully seen.
- Small architectural shifts (a stairwell gaining a landing it didn't have, a skylight's light now reaching a spot it didn't before) — using the same "subtle wrongness" language as §2.1, so the building's *responsiveness* and its *wrongness* read as the same phenomenon, not two separate systems.

The design intent: the player should never think "I unlocked the next area." They should think **"the building noticed."**

---

## 7. Chapter / Case Structure

Every case follows the same five-beat shape, without ever surfacing the beats to the player as UI:

1. **Threshold** — the gate opens; a short, unhurried entry space sets era, material, and mood before any puzzle-relevant object appears.
2. **Discovery** — the player notices the case's "verb" (see §8) for the first time, usually via one deliberately obvious example, so the mechanic teaches itself.
3. **Investigation** — 2–4 non-linear rooms where the player gathers what the culmination space needs: documents, positions, sounds, alignments.
4. **Culmination** — the case's central mechanism resolves physically. This is the case's single "puzzle" in the traditional sense, but framed as an environmental payoff, not a menu.
5. **Aftermath** — a short beat, back in or near the Rotunda, where something in the hub itself has visibly changed (new light, a newly audible sound, an object added to the intake desk) — this is where the FILE-001 threads are planted, never explained.

**Chapter list:**

| Chapter | Wing | Case Personality (§8 verb) | Narrative Beat |
|---|---|---|---|
| Prologue | Rotunda (entry) | Orientation | Arrival; the five folders; the Casebook |
| Case 001 | Registry Wing | Observation | A missing person's desk, left exactly as they left it — except it isn't, quite |
| Case 002 | Substrata / Sound Vaults | Sound | A recording room where silence itself is the clue |
| Case 003 | Conservatory Wing | Light & Reflections | A room that only tells the truth at a specific hour |
| Case 004 | Clockwork Wing | Time | Two versions of the same room, decades apart, overlapping |
| Case 005 | Reading Room | Rearranging the space | A room built to be moved — and moved for a reason |
| Finale | Sub-Vault | Synthesis (all verbs at once) | FILE-001: the building's actual case, closed last |
| Epilogue | Rotunda | — | The walk back out, seen differently |

---

## 8. Puzzle Design — Philosophy & Progression

**Non-negotiable rules (§4 mandate):**
- No UI puzzle screens, no random-generated numbers, no codes the player must memorize and re-type into a menu.
- If a solution is numeric, the number is physically inscribed somewhere diegetic (a plaque, a ledger, a dial already set) — the player *aligns, sets, or matches* a physical object to it, never types it.
- If a solution is symbolic, the player finds it by observation (a shadow, a reflection, an object's shape) — never by looking it up in a codex/UI.
- The target reaction on every solve is **"that's why this object was here"** — never **"how was I supposed to know that."** This means every solution-relevant object must have a plausible in-world reason to exist independent of the puzzle (a filing clerk's own reference note, a maintenance log, a family photo) — set dressing and puzzle clue are always the same object, never separate.

**Each case introduces exactly one new "verb," which the finale then combines:**

| Case | Verb | Mechanism example (illustrative, not final content) |
|---|---|---|
| 001 — Observation | Noticing what's *wrong*, not what's hidden | A desk photographed from a fixed vantage; the player must physically move a chair/object back to match a photo pinned nearby, revealing a hidden compartment when the room matches |
| 002 — Sound | Listening and reconstructing | A row of pipes/bells only makes sense when struck in the order a nearby, still-playing recording implies — no metronome UI, just the recording itself, replayable by walking near it |
| 003 — Light & Reflections | Reading the room through light, not against it | A set of mirrors/glass panels the player physically rotates so daylight from the skylight lands on a hidden mark at a specific position, discoverable only by watching where light already falls at other times |
| 004 — Time | Cross-referencing two states of one space | Two overlapping versions of a room (an old photo held up against the current room, or a window that shows the room "as it was") reveal what object moved, and where it must be returned |
| 005 — Rearranging the space | Physically reconfiguring architecture | Rail-mounted shelving/walls the player pushes/pulls (found levers/wheels, not UI sliders) until the room's negative space forms a path or symbol |
| Finale | All of the above, recombined | The Sub-Vault reuses one object or motif from each prior case, now legible only because the player solved that case's verb first |

This creates genuine **puzzle progression**: the player isn't handed harder versions of the same lock, they accumulate a *vocabulary* of ways to look at a room, and the finale is a literacy test, not a difficulty spike.

### 8.1 The Cases Are Not the Mystery — The Archive Is

Each case is written to feel, on its own, like a complete, self-contained mini-mystery about the people involved in it. That is intentional misdirection, not a flaw: the player is meant to treat the five cases as the game's content and the building as the setting they happen in. Every case's culmination (§7, beat 4) and aftermath (beat 5) should, without ever stating it, add one more piece of evidence that **the real subject of the game is the Archive itself** — its architecture, its history, its reason for existing, its relationship to whoever the player is inside it. By the third case, an attentive player should start to feel the shift for themselves: they are no longer solving cases to close them, they are solving cases because each one is quietly answering a question about the building that no one has asked them yet. This reframing is what §18's ending pays off.

---

## 9. The Casebook (Diegetic UI)

The only persistent "interface" in the game is the **Casebook** — a physical object the Archivist carries, opened with a single dedicated input (never a floating icon). It is not an inventory system or a quest tracker in the traditional sense:

- It holds the five case folders, each showing only what the player has *physically found and placed into it* — torn ledger pages, photographs, a pressed object — never auto-generated summaries or objective text.
- There is no checklist, no "3/5 clues found" counter, no waypoint arrow. If the player wants to know what they're missing, they have to think about what they've seen, not read a progress bar.
- Small keepsake objects (a key, a photograph, a specific tool) can be tucked into the Casebook and carried between rooms — this is the entire "inventory," and it is capped intentionally low (a handful of slots, at most) so nothing is a crafting/hoarding system.
- Closing the Casebook returns the camera exactly to where the player was standing — it never pauses the world as a "menu," reinforcing that the player is still physically present in the building.

No other UI exists during play: no minimap, no compass, no waypoints, no objective marker, no health/stamina bar, no dialogue box. Camera and movement are the only persistent on-screen elements, matching the "as minimal as possible" mandate (§9 of the design mandate).

---

## 10. Atmosphere & Tone

Mystery is the primary emotional register; horror mechanics are explicitly excluded. The unsettling quality of the Archive comes from:
- **Scale contradiction** — spaces that are quietly larger or differently shaped than they should be, discovered by the player's own memory of the building, never flagged.
- **Absence with recent presence** — rooms that feel like someone just left (a lit lamp, a warm — implied, not mechanically simulated — teacup, a chair pushed back), with no one ever present.
- **Repetition** — the same object, initials, or motif recurring across unrelated wings, planting the FILE-001 connection.
- **Silence as pressure** — long stretches with only ambient building sound (settling wood, distant pipes, wind through a vent) rather than a scoring music bed, so the rare musical or vocal moment carries real weight.

No jump scares, no chase sequences, no monsters, no death. The building is never physically threatening. Its danger is entirely epistemic — the player's confidence in what they understand about the space is what erodes.

### 10.1 Quiet Spaces

Not every room contains a puzzle, and not every room should. A meaningful fraction of the Archive's built footprint is **deliberately puzzle-free**, existing solely to build atmosphere and let the player breathe: reading rooms with nothing to solve in them, an observation balcony overlooking the Rotunda skylight, long silent connecting corridors, storage halls stacked with boxes that are set dressing, not clue containers. These spaces are not padding — they are where the "presence over progression" pillar (§1) is proven, and where the player has room to notice a §2.1 micro-change without a puzzle competing for their attention. Every wing (§4) should contain at least one such space that a completionist could, in principle, walk straight through — and a curious player would linger in.

### 10.2 Exploration Rewards — Optional Collectibles

A layer of entirely optional, non-mandatory found objects rewards curiosity without ever gating progression on it: old photographs, employee badges, audio tapes, VHS-style recordings, personal letters, lost notebooks, blueprints. None of these are required to close any case or reach the ending. Many of these overlap deliberately with §5.4's predecessor traces — a found badge or letter is often the clearest evidence a given Archivist existed at all, giving the collectible layer a second purpose beyond flavor: it is how the player builds their own informal, never-summarized sense of how many people came before them. Their purpose is threefold:
- They deepen §5's environmental storytelling for players willing to look harder, often containing the clearest hints toward §8.1's building-level mystery and §18's ending.
- They reward the exact behavior the game wants to encourage (wandering into a §10.1 quiet space, checking a drawer nobody told you to check) rather than behavior aimed at a checklist.
- They are found, never announced — no collectible counter, no "12/40 photographs" UI, consistent with §9's total ban on progress-tracking interface. If the Casebook records them at all, it does so the same way it records case evidence: physically, as an object placed into it, not a tally.

---

## 11. Visual Style Guide

**Art style: Stylized Semi-Realistic.** Legible, warm, physically grounded materials with intentionally simplified geometry and hand-authored texture detail — the quality bar of premium narrative indie titles (*The Vanishing of Ethan Carter*, *What Remains of Edith Finch*, *Firewatch*'s material confidence). Explicitly not low-poly/flat-shaded, and explicitly not a photoreal/photogrammetry pipeline — both would fight the mood.

**Palette (carried forward and re-scoped from v1.2's §18/§19 tokens as material values, not CSS):**
- Dark wood (walnut/oak paneling, shelving, furniture) — primary structural material.
- Old brass (fittings, lamps, door hardware, dial mechanisms) — the game's one consistent "warm metal" accent, always slightly tarnished, never chrome/glossy.
- Dark green (leather desk pads, glass-shaded banker's lamps, painted steel shelving in the Registry Wing) — secondary accent, never dominant.
- Paper beige / cream (documents, folders, wall plaster, aged card stock) — the largest "light" surface family in the game, doing most of the bounce-lighting work.
- Warm practical light sources only — lamps, skylights, candle-adjacent fixtures, sourced daylight. No neon, no cool-toned rim lighting, no glow-as-decoration. Any cool color (moonlight through the Conservatory glass, for instance) is used sparingly and always motivated by an actual light source the player can see.
- Dust and fog used as **volumetric light-definition tools**, not horror atmosphere — visible light shafts through the Conservatory's glass, dust disturbed by the player's own movement in the Registry Wing, never fog-as-jump-scare-cover.

**Lighting doctrine (direct reference to §7's named titles):**
- Single-motivated-source lighting per space wherever possible (*The Witness* discipline) — every lit area reads as lit *by something the player can locate*.
- Long, unhurried light studies rather than busy compositions (*The Vanishing of Ethan Carter* pacing) — rooms are allowed to be dim and let one shaft or lamp carry the whole read.
- Lighting as the primary storytelling tool (*Layers of Fear*, lighting craft only) — a room's emotional temperature is set by color temperature and shadow falloff, never by a scripted "scary" trigger.

**Silhouette & prop language:** furniture and architecture read from era-appropriate real-world references (civic 1950s steel furniture, Victorian-into-Edwardian glasshouse ironwork, 1930s utility clockwork) filtered through the stylized-semi-realistic pipeline — nothing invented wholesale, everything a plausible, slightly heightened version of a real object.

---

## 12. Moodboard (Descriptive — Reference Set)

No image assets exist yet; this section describes the intended reference compositions per space so concept art / lookdev can be commissioned against a shared target.

- **Rotunda:** Grand Central Terminal's main concourse crossed with a small-town Carnegie library rotunda — brass information booth energy, a skylight doing all the emotional lighting work, marble floor worn pale in the paths people actually walked.
- **Registry Wing:** a 1950s municipal records office — steel roller shelving, frosted-glass supervisor's office, a single desk lamp left on over an unfinished form.
- **Substrata / Sound Vaults:** a decommissioned subway switching station or old cistern — brick barrel vaults, exposed conduit, the sense that the room's real purpose predates the Archive itself.
- **Conservatory Wing:** Kew Gardens' Palm House ironwork scaled down to a reading room — glass, condensation, a reading table positioned exactly where noon light lands.
- **Clockwork Wing:** a ship's engine room crossed with a clock tower's mechanism floor — brass gears at human scale, catwalks, the smell (implied visually via grime/patina) of oil and hot metal.
- **Reading Room:** a library where the shelving is on the same rail system as a theater's stage flats — visibly mechanical, visibly meant to move, unsettling exactly because a library "shouldn't" be reconfigurable.
- **Sub-Vault:** deliberately borrows one motif from each space above (a Rotunda-brass fitting, Registry-style shelving, a Conservatory pane, Clockwork gearing, Reading-Room rails) so it reads as "built from the rest of the building" without a single line of dialogue saying so.

Film/game reference set to hand to concept artists: *The Witness* (structure/pacing/color confidence), *The Vanishing of Ethan Carter* (environmental storytelling, light), *Layers of Fear* (lighting craft, not horror beats), *Gone Home* (object-driven narrative), *What Remains of Edith Finch* (heightened-real interiors), *Return of the Obra Dinn* (deduction-through-observation design ethos, not its visual style).

---

## 13. Audio Design

- **No music-as-scoring during exploration** — ambient building sound (settling structure, distant pipes, wind, birds near the Rotunda skylight) carries the moment-to-moment mood.
- **Sparse, motivated musical cues** only at case culminations and the finale — reinforcing that the rare musical beat is meaningful.
- **Positional/diegetic audio is a puzzle material in its own right** (Case 002 and, combined, the finale) — sound sources exist as objects in 3D space the player must approach, not as a mixed-down 2D track.
- **No UI sound effects in the traditional sense** — footstep, object-handling, and mechanism sounds are the entire feedback language; there is no "success chime" over a UI, because there is no UI to chime over. A puzzle's audio payoff is the mechanism itself (a latch, a door, a light switching on).

---

## 14. Technical Architecture (Recommendation)

No engine decision has been made yet; this section is a concrete recommendation for approval, not a settled fact.

**Recommended stack:** **Three.js** (WebGL) as the rendering/scene-graph layer, glTF as the asset interchange format, with a thin custom game layer on top — not a full off-the-shelf game engine (Unity/Unreal WebGL export), because browser-first load time and the ability to hand-tune every material/lighting pass matter more here than editor convenience, and the team already has a working EventBus/state-manager pattern from v1.x that generalizes cleanly to 3D.

**Why not v1.x's approach carried forward directly:** the DOM/CSS "SceneArt" procedural room rendering (`SceneArt.js`, `RoomView.js`, `room.css`) is fundamentally a 2D hotspot system and cannot represent free first-person movement, real lighting, or physical object interaction — it is being retired, not extended. The **non-rendering** parts of v1.x's architecture (EventBus pub/sub, a finite-state GameStateManager, a versioned SaveManager/SessionStore, an i18n layer) are conceptually reusable patterns and will likely be re-implemented against the new 3D scene rather than ported line-for-line, since save-state now needs to capture player position/orientation and per-wing puzzle state instead of room IDs and inventory flags.

**Key technical pillars:**
- **Streaming by wing.** Each wing loads its geometry/textures on approach through its gate, not all at once — keeps initial load time browser-appropriate and memory bounded.
- **Baked lighting where possible, real-time only where necessary.** Static architecture uses baked lightmaps for the "single motivated source" look at low runtime cost; only puzzle-relevant dynamic elements (a rotating mirror, a moving light source) use real-time lights.
- **Raycast-based interaction**, not physics-heavy simulation — objects the player can inspect/move are handled via a cursor-forward raycast against a tagged interaction layer, keeping the interaction model simple and reliable across desktop/mobile input.
- **Stylized-semi-realistic look via a restrained PBR pipeline** — physically based materials, but authored with simplified, hand-painted-leaning texture detail rather than photoscanned realism, plus a light custom tone-mapping/color-grade pass to enforce the warm palette (§11) regardless of individual asset authoring.
- **Performance ceiling set by mobile from day one**, per the platform mandate: aggressive LOD, texture atlasing, geometry instancing for repeated furniture (shelving units, chairs), and a hard budget on real-time lights and post-processing passes, validated on a mid-tier device early rather than late.
- **Audio via the Web Audio API** with positional/spatial nodes for diegetic sound-as-puzzle-material (§13).

**Recommended production sequencing:** build **Case 001 (Registry Wing) as the vertical slice** before any other content — it is the simplest verb (observation) and exercises the full pipeline (streaming, lighting, raycast interaction, Casebook UI, save/load) end-to-end. Only after that slice is validated for both look and mobile performance should the remaining wings be greenlit, since the 3D pipeline's technical risk (asset budget, load time, mobile frame rate) is unproven and should be de-risked on the smallest possible case first.

---

## 15. Accessibility & Platform

- **Desktop-first, mobile as a validated stretch target** — a 3D first-person game has materially higher performance and input-design demands on mobile than the 2D build did; mobile support is planned but gated on the Case 001 vertical slice proving acceptable frame rate and load time on a mid-tier device (§14), not assumed by default the way it was for v1.x.
- **Input:** mouse-look + WASD (or drag-look + virtual joystick on touch) for movement; a single interact input (click/tap) for all object interaction, matching the "player never types" mandate.
- **Comfort options** (to be scoped in production, not this document): field-of-view adjustment, look-sensitivity, and a reduced-camera-motion mode, since first-person movement introduces motion-comfort concerns that the 2D build never had.
- **Language/localization:** the intent to support English/Arabic (including RTL where relevant to any in-world 2D document UI, e.g. the Casebook's document pages) carries forward from v1.x, scoped to in-world text (documents, the Casebook) rather than any HUD, since the HUD itself is being removed.

---

## 16. What This Document Does Not Yet Decide

Flagged explicitly rather than silently assumed:
- Exact runtime length and total room count beyond the five-case structure above (v1.x targeted 60–90 minutes single-sitting; a 3D exploration game of this scope will likely run longer, but this needs scoping once Case 001 content is blocked out).
- Final asset production pipeline (in-house modeling vs. licensed/stock base meshes reworked to the stylized-semi-realistic target).
- Exact save-data schema for 3D player state (position/orientation/per-wing flags) — to be designed alongside the Case 001 vertical slice, not speculatively now.
- Mobile go/no-go — explicitly deferred to post-vertical-slice validation (§14), not decided here.

These are implementation-adjacent decisions appropriate to make once this design is approved and the Case 001 slice is underway — not before.

---

## 17. Roadmap

1. **This document — approval gate.** No code is written until this design is approved.
2. **Case 001 vertical slice** (Registry Wing, Prologue, Rotunda hub shell, Casebook UI, save/load, mobile performance validation) — the full pipeline proven end-to-end on the simplest case.
3. **Remaining wings (002–005), Sub-Vault finale, Epilogue** — built and greenlit only after step 2 validates the pipeline and the look.
4. **Full polish pass** (audio, lighting final pass, accessibility options, localization) — after content lock.

---

## 18. The Ending (Design — Not Implemented)

Per direct instruction, the ending is designed here in full as a creative-bible artifact. **Nothing in this section is built.** It exists so every case, document, and environmental detail built in production can be authored with the true destination in mind, without the ending itself being scripted before the vertical slice exists.

### 18.1 What the player has believed until now

Across the Prologue and Cases 001–005, the player has operated on a simple, plausible premise: they are a newly assigned Archivist, external to the building, hired to close five unrelated cold cases left behind by unnamed prior staff. The Archive's growing "wrongness" (§2.1) has been noticed but never explained. The recurring motifs planted per §5.3 — a repeated handwriting sample, a repeated set of initials, a repeated object (a specific pocket watch) turning up in every wing — have been visible but easy to read as coincidence, or as evidence that the same *prior Archivist* worked all five cases before quitting or disappearing.

### 18.2 What the Sub-Vault reveals

The Sub-Vault (§2, §4) is the only space in the building that borrows a motif from every other wing (§12), and this is the first moment that stops being a background detail and becomes the point: the room is not modeled *after* the rest of the Archive, the rest of the Archive was built *around it*, expanding outward from this room, wing by wing, each time a new case was "closed" — by someone. The player finally sees what the room actually is: not a single vault, but the mouth of a repository that extends far beyond what the player can see the end of — aisle after aisle of shelving, receding into the dark past the reach of any practical light source, holding far more files than five.

Inside, one folder is labeled FILE-001, and it is not about a stranger. Its intake form carries the player character's own handwriting — the same handwriting seen on marginalia throughout every prior case, previously read as belonging to "a prior Archivist," because in every sense that matters, it was. The five cases were the player's own memories — five periods of their life, each built around a loss or a decision they could not live with — externalized, filed, and sealed by an earlier version of themselves, the same act of self-protection that every other Archivist's file on this shelf represents for someone else.

That is the correction the room forces: this is not unique to the player, and the room does not let them believe otherwise. FILE-001 sits on a shelf among **thousands** of others — different names, different handwriting, different eras, spanning far longer than any one lifetime the player could reasonably attribute to a single institution's staff roster. Some folders are wax-sealed and brittle. Some are typed. Some are digital tape formats the player has never encountered anywhere else in the building. Filing this kind of case — a person's own weight, archived so they could go on working — is not a strange thing that happened to the player once. It is what this place has always done, for as long as it has existed, for however many people have passed through it. The Archive did not start when the player walked in, and closing FILE-001 will not end it. Somewhere in these shelves are the files of the Archivists whose abandoned desks, missing photographs, and unfinished notes (§5.4) the player has been finding all game — some closed cleanly, some, going by the state of their old workspaces, apparently not.

FILE-001 is the first memory *this player's* archive was ever built to contain, not the first thing this building ever held. Everything else the player has walked through exists because that same private ritual has worked, and been repeated, by person after person, for longer than the building's own record of itself accounts for.

### 18.3 The choice

Consistent with v1.2's precedent of non-judged, dual endings (carried forward in spirit, redesigned in substance), the Sub-Vault's culmination offers a single physical choice, made the same way every other puzzle in the game is made — by an object, not a menu. The player now makes this choice knowing it is not a first: the shelving around them is the proof that everyone who ends up here has made it before them.

- **Reintegrate.** The player physically opens FILE-001 the way every other case file was opened throughout the game. The memory is allowed back. The building, over a slow, wordless final sequence, stops being impossibly large *for the player specifically* — the wings the player personally unlocked shorten and quiet, the Rotunda's skylight brightens toward ordinary daylight — but the deeper repository the player glimpsed in §18.2 is never shown closing, because it was never the player's to close. The player exits through the same front door they never remember entering, into a small, unremarkable building that no longer offers them anything more than its exterior suggests. Bittersweet, resolved, but with something quietly lost as well as gained — and with the explicit, unstated understanding that the building continues, for the next person.
- **Reseal.** The player closes FILE-001 without opening it and leaves it exactly where they found it, back on its shelf among the others. The Archive remains exactly as vast, exactly as wrong, exactly as alive as it has been the entire game. The ending sequence shows the building from outside at dusk — small, ordinary — except for one lit window on a floor the exterior shouldn't have room for, which the player, on this playthrough, never reached. Unresolved, but not unhappy: the player chooses to keep carrying it a while longer, the same way, the shelving implies, others chose to.

Neither ending is framed as correct. Both endings end on the same final image reframed by the choice: the small building from the outside, seen for the first time the way a stranger walking past it would see it — which is exactly how the Prologue began, closing the loop without a line of dialogue needed to point it out.

### 18.4 Why this drives an immediate replay

The design goal stated for this ending is that the player should *immediately* want to replay — this is engineered structurally, not just tonally:
- Every case's documents, photographs, and micro-changes (§2.1) were, on a first playthrough, legible only as "this case's" content. On the strength of §18.2's reveal, all of it is retroactively re-readable as autobiography. A replay is not a repeat of the same information — it is the *same rooms carrying a second, now-legible layer of meaning*, which is a stronger replay hook than new content would be, and costs no additional production.
- §5.4's predecessor traces are, on a first playthrough, atmosphere. Knowing the ending, every abandoned desk and unfinished note becomes legible as *someone else's own §18.2* — a replay-motivated player will read the exact same rooms as a much larger, colder pattern the second time through.
- The optional collectibles (§10.2) are, on a first playthrough, flavor. Knowing the ending, they become the most direct evidence of who the player character is, and of who came before them — a replay-motivated player will actively seek out ones they skipped.
- A single, deliberately small post-ending detail (a light in a previously unreachable window, §18.3) functions as an explicit, diegetic invitation to look again — never a "New Game+" menu label, staying inside the game's zero-HUD discipline (§9) even at the very last frame.

### 18.5 The Final Unanswered Question

One question is deliberately never seeded with evidence anywhere in the game, in any case, document, recording, or environmental detail, on either ending: **who created the Archive in the first place?**

This is enforced as a hard production rule, not a gap to be closed later: no future case, collectible, or piece of marginalia may name, depict, or meaningfully imply an origin or founder for the institution. The one moment that comes closest — the repository glimpsed in §18.2 — is authored so its shelving recedes into unlit dark well before any "first" file could plausibly be located, and if a shelf-numbering or dating system is ever implemented, it must be built so its earliest legible entry is damaged, blank, or otherwise unreadable, never simply absent by omission. The unanswered question has to survive close reading, not just casual play.

The intended parting feeling, on either ending, is not frustration but scale: the player has spent the entire game learning to read a building, has finally learned to read it well enough to understand their own place in it, and the one thing that understanding cannot reach is the building's own beginning. That gap is the last thing the game gives the player, and it is meant to be permanent.

---

*End of v2.2 — LOCKED as the creative foundation of the project. Supersedes all prior gameplay, mechanics, and visual-identity content in v1.x (§§0–25 of GDD v1.2) and extends v2.0/v2.1's structural pivot with the principles in this revision. No gameplay code exists yet. v1.x's codebase remains on disk under `/archive-file-001/src` for historical reference only. Next step: approval of this document, followed by a separately greenlit Case 001 vertical slice (§17).*
