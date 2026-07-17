# Real images (optional)

Drop real image files here and the app will automatically use them instead
of the drawn placeholders — no code changes needed. If a file is missing,
the app quietly falls back to the drawn version, so this folder can stay
partially filled.

- `assets/mascots/{year}.png` — official mascot image for that World Cup
  (e.g. `assets/mascots/2022.png`).
- `assets/jerseys/{year}.png` — jersey photo for that edition's top scorer
  (e.g. `assets/jerseys/2018.png`).
- `assets/players/{الاسم بالعربي}.png` — a player's photo, keyed by the
  *exact* Arabic name used in `data.js` / `headball.js` (e.g.
  `assets/players/ليونيل ميسي.png`). This single photo is reused both in
  the player search results and as that player's head in the Head Ball
  game.

PNG or JPG both work. Square-ish images look best for player photos (the
Head Ball game crops them into a circle).
