import { h } from './dom.js';

/**
 * SceneArt.js
 * Procedural CSS/DOM room backgrounds. Illustrated room art is asset
 * production work slated for Milestone 4 (GDD §16, §25); until then,
 * every scene is composed from the same shape primitives (styled in
 * styles/components/room.css) so the game is fully playable and
 * atmospheric without a single image file. Decorative shapes are
 * positioned from each room's own hotspot coordinates so the art and the
 * clickable regions can never drift out of alignment.
 */

function pct({ x, y, w, h: height }) {
  return `left:${x}%; top:${y}%; width:${w}%; height:${height}%;`;
}

function findHotspot(room, id) {
  return room.hotspots.find((hs) => hs.id === id);
}

const SCENES = {
  prologue_entrance(room) {
    const plaque = findHotspot(room, 'hs_plaque');
    const door = findHotspot(room, 'hs_door');
    return {
      physical: [
        h('div', { class: 'scene-light' }),
        h('div', { class: 'scene-shape', style: pct(plaque.coords) }),
        h('div', { class: 'scene-shape scene-shape--door', style: pct(door.coords) }, [
          h('div', { class: 'scene-door-seam' }),
          h('span', { class: 'scene-handle', style: 'right:12%; top:48%;' }),
        ]),
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
    const drawerOpen = getState(drawer) === 'open';
    const exitOpen = getState(exitDoor) === 'open';

    return {
      physical: [
        h('div', { class: 'scene-light', style: 'left:15%; width:45%;' }),
        h('div', {
          class: 'scene-desk',
          style: `left:${terminal.coords.x - 2}%; top:${terminal.coords.y + terminal.coords.h - 5}%; width:${terminal.coords.w + 8}%; height:5%;`,
        }),
        h('div', { class: 'scene-shape', style: pct(terminal.coords) }, [
          h('div', { class: 'scene-monitor' }, [h('span', { class: 'scene-cursor' })]),
        ]),
        h(
          'div',
          { class: `scene-shape scene-shape--drawer${drawerOpen ? ' is-open' : ''}`, style: pct(drawer.coords) },
          [
            h('span', { class: 'scene-drawer-line', style: 'top:35%;' }),
            h('span', { class: 'scene-drawer-line', style: 'top:65%;' }),
            drawerOpen ? null : h('span', { class: 'scene-lock-icon', style: 'right:12%; top:36%;' }),
          ],
        ),
        h(
          'div',
          {
            class: `scene-shape scene-shape--door${exitOpen ? ' is-open' : ''}`,
            style: pct(exitDoor.coords),
          },
          [
            h('div', { class: 'scene-door-seam' }),
            exitOpen ? null : h('span', { class: 'scene-lock-icon', style: 'left:44%; top:46%;' }),
          ],
        ),
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
