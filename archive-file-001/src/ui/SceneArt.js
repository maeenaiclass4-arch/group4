import { h } from './dom.js';

/**
 * SceneArt.js
 * Procedural CSS/DOM room backgrounds built entirely from the set-dressing
 * primitives in room.css (walnut shelving, an evidence corkboard, a
 * banker's lamp, kraft-paper piles) — a real records room's vocabulary,
 * not glowing sci-fi geometry. Illustrated room art is asset production
 * work slated for Milestone 4 (GDD §16); until then this is what's
 * playable. Decorative shapes are positioned from each room's own hotspot
 * coordinates where they correspond to an interactive object, so art and
 * clickable regions can never drift out of alignment.
 */

function pct({ x, y, w, h: height }) {
  return `left:${x}%; top:${y}%; width:${w}%; height:${height}%;`;
}

function box(x, y, w, hh) {
  return `left:${x}%; top:${y}%; width:${w}%; height:${hh}%;`;
}

function findHotspot(room, id) {
  return room.hotspots.find((hs) => hs.id === id);
}

/** A short row of stacked file boxes on a shelf — pure decoration. */
function shelfWithBoxes(x, y, w, shelfHeight, boxCount, seed = 0) {
  const boxes = [];
  const gap = 1.5;
  const boxW = (w - gap * (boxCount - 1)) / boxCount;
  const tones = ['#8a6a3f', '#6f5330', '#9c7a48', '#7a5c38'];
  for (let i = 0; i < boxCount; i += 1) {
    const bh = 55 + ((seed + i * 7) % 30);
    boxes.push(
      h('span', {
        class: 'scene-file-box',
        style: `left:${i * (boxW + gap)}%; width:${boxW}%; height:${bh}%; background:${tones[(seed + i) % tones.length]};`,
      }),
    );
  }
  return h('div', { class: 'scene-shelf', style: box(x, y, w, shelfHeight) }, boxes);
}

/**
 * An evidence corkboard with pinned photos and connecting string. The
 * center slot is deliberately left empty — a room's `hs_note` hotspot (an
 * inspectable case note, not decoration) is rendered into that exact spot
 * separately, so the one pinned item that matters is also the one the
 * player can click.
 */
function evidenceBoard(x, y, w, hh) {
  return h('div', { class: 'scene-corkboard', style: box(x, y, w, hh) }, [
    h('span', { class: 'scene-photo', style: 'left:8%; top:12%; width:26%; height:34%; transform:rotate(-4deg);' }),
    h('span', { class: 'scene-photo', style: 'left:68%; top:10%; width:24%; height:34%; transform:rotate(-2deg);' }),
    h('span', { class: 'scene-pin', style: 'left:20%; top:14%;' }),
    h('span', { class: 'scene-pin', style: 'left:51%; top:22%;' }),
    h('span', { class: 'scene-pin', style: 'left:79%; top:12%;' }),
    h('span', { class: 'scene-string', style: 'left:20%; top:20%; width:32%; transform:rotate(8deg);' }),
    h('span', { class: 'scene-string', style: 'left:52%; top:26%; width:28%; transform:rotate(-11deg);' }),
  ]);
}

function dustMotes(items) {
  return items.map(([x, y, delay]) =>
    h('span', {
      class: 'scene-dust-mote',
      style: `left:${x}%; top:${y}%; animation-delay:${delay}s;`,
    }),
  );
}

const SCENES = {
  prologue_entrance(room) {
    const plaque = findHotspot(room, 'hs_plaque');
    const door = findHotspot(room, 'hs_door');
    return {
      physical: [
        h('div', { class: 'scene-wall' }),
        h('div', { class: 'scene-floor' }),
        h('div', { class: 'scene-light' }),
        h('span', {
          class: 'scene-lamp-glow',
          style: 'left:38%; top:0; width:24%; height:30%;',
        }),

        shelfWithBoxes(4, 30, 20, 4, 4, 1),
        shelfWithBoxes(4, 48, 20, 4, 5, 3),

        h('div', { class: 'scene-shape', style: pct(plaque.coords) }, [
          h('span', { style: 'position:absolute; left:8%; top:14%; width:8%; height:8%; border-radius:50%; background:var(--brass-dim);' }),
          h('span', { style: 'position:absolute; right:8%; top:14%; width:8%; height:8%; border-radius:50%; background:var(--brass-dim);' }),
          h('span', { style: 'position:absolute; left:14%; top:38%; width:72%; height:8%; background:color-mix(in srgb, var(--brass) 45%, transparent);' }),
          h('span', { style: 'position:absolute; left:14%; top:58%; width:50%; height:6%; background:color-mix(in srgb, var(--brass) 30%, transparent);' }),
        ]),

        h('div', { class: 'scene-shape scene-shape--door', style: pct(door.coords) }, [
          h('span', { style: 'position:absolute; inset:8% 12%; border:1px solid color-mix(in srgb, var(--brass) 25%, transparent);' }),
          h('div', { class: 'scene-door-seam' }),
          h('span', { class: 'scene-handle', style: 'right:10%; top:46%;' }),
        ]),

        ...dustMotes([[45, 20, 0], [52, 35, 2], [48, 50, 4], [55, 15, 6]]),
        h('div', { class: 'scene-vignette' }),
      ],
      memory: [
        h('div', { class: 'scene-grid-overlay' }),
        h(
          'div',
          {
            class: 'scene-inscription',
            style: `left:${plaque.coords.x}%; top:${plaque.coords.y + plaque.coords.h + 3}%; width:${plaque.coords.w + 10}%;`,
          },
          ['"YOU ALREADY KNOW THE WAY IN."'],
        ),
        h('div', { class: 'scene-shape accent', style: pct(door.coords) }),
      ],
    };
  },

  ch1_intake(room, getState) {
    const terminal = findHotspot(room, 'hs_terminal');
    const drawer = findHotspot(room, 'hs_drawer');
    const exitDoor = findHotspot(room, 'hs_exit_door');
    const note = findHotspot(room, 'hs_note');
    const drawerOpen = getState(drawer) === 'open';
    const exitOpen = getState(exitDoor) === 'open';

    return {
      physical: [
        h('div', { class: 'scene-wall' }),
        h('div', { class: 'scene-floor' }),
        h('div', { class: 'scene-light', style: 'left:8%; width:34%; top:-20%;' }),

        shelfWithBoxes(2, 8, 26, 5, 5, 2),
        shelfWithBoxes(2, 24, 26, 5, 4, 5),

        evidenceBoard(45, 8, 26, 34),
        note
          ? h('span', {
              class: 'scene-paper',
              style: `${pct(note.coords)} transform:rotate(-3deg); z-index:2; background:var(--paper-100);`,
            })
          : null,
        note ? h('span', { class: 'scene-pin', style: `left:${note.coords.x + note.coords.w / 2 - 1}%; top:${note.coords.y + 2}%; z-index:3;` }) : null,

        h('div', {
          class: 'scene-desk',
          style: box(terminal.coords.x - 2, terminal.coords.y + terminal.coords.h - 5, terminal.coords.w + 8, 5),
        }),
        h('div', { class: 'scene-shape', style: pct(terminal.coords) }, [
          h('div', { class: 'scene-monitor' }, [
            h('div', { class: 'scene-monitor__screen' }, [h('span', { class: 'scene-cursor' })]),
          ]),
        ]),

        h('span', { class: 'scene-lamp-shade', style: 'left:37%; top:38%; width:6%; height:9%;' }),
        h('span', { class: 'scene-lamp-glow', style: 'left:32%; top:40%; width:16%; height:20%;' }),

        h('div', { class: 'scene-paper', style: 'left:30%; top:63%; width:9%; height:12%; transform:rotate(-6deg);' }),
        h('div', { class: 'scene-paper', style: 'left:33%; top:65%; width:9%; height:12%; transform:rotate(4deg);' }),
        h('span', { class: 'scene-stamp', style: 'left:34%; top:68%; width:7%; height:9%;' }, ['CASE']),

        h(
          'div',
          { class: `scene-shape scene-shape--drawer${drawerOpen ? ' is-open' : ''}`, style: pct(drawer.coords) },
          [
            h('span', { class: 'scene-drawer-line', style: 'top:32%;' }),
            h('span', { class: 'scene-drawer-pull', style: 'top:28%;' }),
            h('span', { class: 'scene-drawer-line', style: 'top:66%;' }),
            h('span', { class: 'scene-drawer-pull', style: 'top:62%;' }),
            drawerOpen ? null : h('span', { class: 'scene-lock-icon', style: 'right:10%; top:38%;' }),
          ],
        ),

        h(
          'div',
          {
            class: `scene-shape scene-shape--door${exitOpen ? ' is-open' : ''}`,
            style: pct(exitDoor.coords),
          },
          [
            h('span', { style: 'position:absolute; inset:6% 10%; border:1px solid color-mix(in srgb, var(--brass) 25%, transparent);' }),
            h('div', { class: 'scene-door-seam' }),
            exitOpen ? null : h('span', { class: 'scene-lock-icon', style: 'left:44%; top:46%;' }),
          ],
        ),

        ...dustMotes([[55, 25, 1], [62, 45, 3], [58, 60, 5]]),
        h('div', { class: 'scene-vignette' }),
      ],
      memory: [
        h('div', { class: 'scene-grid-overlay' }),
        h('span', { class: 'scene-particle', style: 'left:20%; top:28%; animation-delay:0s;' }),
        h('span', { class: 'scene-particle', style: 'left:52%; top:62%; animation-delay:1s;' }),
        h('span', { class: 'scene-particle', style: 'left:80%; top:38%; animation-delay:2s;' }),
      ],
    };
  },
};

/**
 * @param {object} room current room definition
 * @param {(hotspot: object) => string} getState resolves a hotspot's current state
 */
export function renderScene(room, getState) {
  const build = SCENES[room.scene] ?? (() => ({ physical: [], memory: [] }));
  const { physical, memory } = build(room, getState);
  return {
    physicalLayer: h('div', { class: 'scene-layer scene-layer--physical' }, physical),
    memoryLayer: h('div', { class: 'scene-layer scene-layer--memory' }, memory),
  };
}
