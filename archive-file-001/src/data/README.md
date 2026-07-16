# Data Layer

Everything in this directory is pure content — JSON with no logic. Adding a
room, puzzle, or Commendation is a data change, never an engine change (GDD
§14). All files below are intentionally empty (`[]`) as of Milestone 1;
content production begins at Milestone 4 (vertical slice) per the roadmap
in GDD §25.

| File / folder | Schema owner | GDD reference |
|---|---|---|
| `rooms/*.json` | `RoomSystem` | §8 |
| `puzzles/*.json` | `PuzzleEngine` | §6 |
| `terminals/*.json` | `TerminalSystem` | §12.11 |
| `items.json` | `InventorySystem` | §9 |
| `notebook-entries.json` | `NotebookSystem` | §5 |
| `achievements.json` | `AchievementSystem` | §12.1 |
| `classified-files.json` | Codex / `AchievementSystem` | §12.2 |
| `cinematics.json` | `CinematicSystem` | §12.9 |
| `strings/<lang>.json` | UI layer (`i18n.js`) | §14 |

Only `strings/en.json` has real content — it backs the Milestone 1 menu
system. Every other file here is a schema placeholder for Milestone 2+.
