# History Animation Studio | استوديو الرسوم التاريخية

A professional motion-graphics editor for historical map animations — built for
history creators and documentary YouTubers who want a Premiere-style timeline
and an interactive world map instead of hand-animating everything in After
Effects.

Arabic is the primary language (RTL) with full English (LTR) support.

## Features

- **Interactive world map** — country coloring, border highlighting, animated
  arrows, troop/naval movement, expansion effects, and camera pan/zoom that
  automatically frames whatever is currently animating.
- **Timeline editor** — Premiere-style tracks with draggable/resizable event
  clips, a scrubbable playhead, zoom/pan, and transport controls.
- **11 animation types** — Battle, Peace Treaty, Spread of Islam, Spread of
  Religion, Empire Expansion, New Kingdom, Empire Collapse, Naval Movement,
  Migration, Political Agreement, Conquest.
- **Event inspector** — start/end year, title, description, country or
  historical-region picker (with "pick from map" mode), color, animation
  duration and speed.
- **Curated historical regions** — modern countries plus ~25 historical
  polities (Rashidun/Umayyad/Abbasid/Ottoman Caliphates, Roman/Byzantine/
  Mongol/Mughal empires, etc.), each mapping to the modern countries it
  covered, so a single "region" can color a whole empire.

## Stack

React + TypeScript + Vite, Zustand for state, react-i18next for i18n,
Framer Motion for camera/UI motion, d3-geo + topojson for the map projection.

## Getting started

```bash
npm install
npm run dev
```

## Architecture

```
src/
  data/            country + historical-region reference data, animation type defs
  features/
    map/           MapCanvas, country/effects SVG layers, camera targeting
    timeline/       ruler, tracks, draggable clips, transport controls
    events/         event list + inspector panel
    playback/       the animation-frame engine driving playback + effects
  store/           zustand stores (events, playback, map camera, ui)
  i18n/            ar.json / en.json translations
  lib/             geo projection + color helpers
```

The engine decouples an event's **historical year span** (where it sits on
the timeline) from its **animation duration/speed** (how the effect plays out
on the map in real time), so long empires can expand gradually across
centuries while a single battle still flashes and resolves in a few seconds.
