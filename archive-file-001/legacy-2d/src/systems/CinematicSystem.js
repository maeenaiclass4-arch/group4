import { EVENTS } from '../core/Config.js';
import { cinematics } from '../data/index.js';
import { t } from '../core/i18n.js';
import { h, mount } from '../ui/dom.js';

const REDUCED_DURATION_MS = 900;

/**
 * CinematicSystem.js
 * GDD §12.9 — brief (2-4s), always-skippable discovery beats: a held,
 * dimmed full-stage frame with a single line of text, no video assets.
 * Listens for EVENTS.CINEMATIC_BEAT_REQUESTED so any future system can
 * trigger a beat just by emitting one event, and playBeat() returns a
 * Promise so a caller (e.g. RoomView opening the Reader right after) can
 * sequence off its completion.
 */
export class CinematicSystem {
  #eventBus;
  #container;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  mount(container) {
    this.#container = container;
  }

  init() {
    this.#eventBus.on(EVENTS.CINEMATIC_BEAT_REQUESTED, ({ beatId }) => this.playBeat(beatId));
  }

  /** @param {string} beatId @returns {Promise<void>} resolves when the beat finishes or is skipped */
  playBeat(beatId) {
    const def = cinematics.get(beatId);
    if (!def || !this.#container) return Promise.resolve();

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.#container.hidden = true;
        this.#container.removeEventListener('click', finish);
        window.removeEventListener('keydown', onKey);
        resolve();
      };
      const onKey = (event) => {
        if (event.key === 'Escape') finish();
      };

      mount(
        this.#container,
        h('div', { class: 'cinematic-beat' }, [
          h('p', { class: 'cinematic-beat__text' }, [t(def.textKey)]),
          h('span', { class: 'cinematic-beat__hint' }, [t('common.skip')]),
        ]),
      );
      this.#container.hidden = false;
      this.#container.addEventListener('click', finish);
      window.addEventListener('keydown', onKey);

      const reduced = document.documentElement.dataset.reduceMotion === 'true';
      setTimeout(finish, reduced ? REDUCED_DURATION_MS : def.duration);
    });
  }
}
