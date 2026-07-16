import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

const CARD_DURATION_MS = 3200;
const REDUCED_DURATION_MS = 1200;
const CARD_KEYS = ['intro.card1', 'intro.card2', 'intro.card3', 'intro.card4'];

/**
 * IntroSequence.js
 * The cinematic intro (GDD: "Create the complete introduction sequence").
 * A short run of full-screen title cards shown once, on New Archive only
 * — Continue and Checkpoints skip straight to the saved room. Auto-
 * advances card to card; a single tap/click or Esc skips the whole thing
 * immediately, never just one card, matching the on-screen skip hint.
 */
export class IntroSequence {
  #container;

  mount(container) {
    this.#container = container;
  }

  /** @returns {Promise<void>} resolves once the sequence finishes or is skipped */
  play() {
    return new Promise((resolve) => {
      const reduced = document.documentElement.dataset.reduceMotion === 'true';
      const duration = reduced ? REDUCED_DURATION_MS : CARD_DURATION_MS;
      let index = 0;
      let done = false;
      let timer = null;

      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        this.#container.hidden = true;
        this.#container.removeEventListener('click', finish);
        window.removeEventListener('keydown', onKey);
        resolve();
      };
      const onKey = (event) => {
        if (event.key === 'Escape') finish();
      };

      const showCard = () => {
        if (index >= CARD_KEYS.length) {
          finish();
          return;
        }
        mount(
          this.#container,
          h('div', { class: 'intro-sequence' }, [
            h('p', { class: 'intro-sequence__line fade-in' }, [t(CARD_KEYS[index])]),
            h('span', { class: 'intro-sequence__hint' }, [t('intro.skipHint')]),
          ]),
        );
        timer = setTimeout(() => {
          index += 1;
          showCard();
        }, duration);
      };

      this.#container.hidden = false;
      this.#container.addEventListener('click', finish);
      window.addEventListener('keydown', onKey);
      showCard();
    });
  }
}
