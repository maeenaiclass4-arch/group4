import { GAME_STATES } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

const MIN_DISPLAY_MS = 900;
const TICKER_INTERVAL_MS = 1800;

/**
 * LoadingScreen.js
 * Boot screen with the "Loading Screen Lore Ticker" enhancement (GDD
 * §12.12): rotates short in-world fragments instead of a static bar, so
 * dead time reads as atmosphere. Resolves to MAIN_MENU once every promise
 * registered via waitFor() has settled AND the minimum display time has
 * elapsed — this stops the screen from flashing by too fast on a warm
 * cache while never blocking longer than real loading requires.
 */
export class LoadingScreen {
  #eventBus;
  #gameStateManager;
  #waitables = [];
  #tickerTimer = null;

  constructor(eventBus, gameStateManager) {
    this.#eventBus = eventBus;
    this.#gameStateManager = gameStateManager;
  }

  /** Register a promise that must settle before the loading screen can finish. */
  waitFor(promise) {
    this.#waitables.push(promise.catch((error) => console.warn('[LoadingScreen] a waitFor promise rejected:', error)));
  }

  mount(container) {
    const tickerLine = h('div', { class: 'loading-screen__ticker-line' }, [t('loading.ticker')[0]]);

    mount(
      container,
      h('div', { class: 'stack fade-in', style: 'gap: var(--space-6);' }, [
        h('div', { class: 'loading-screen__mark' }, ['ARCHIVE : ', h('span', {}, ['FILE-001'])]),
        h('div', { class: 'loading-screen__status' }, [t('loading.status')]),
        h('div', { class: 'loading-screen__bar' }, [h('div', { class: 'loading-screen__bar-fill' })]),
        h('div', { class: 'loading-screen__ticker' }, [tickerLine]),
      ]),
    );

    this.#startTicker(tickerLine);
    this.#run();
  }

  #startTicker(tickerLine) {
    const lines = t('loading.ticker');
    let index = 0;
    this.#tickerTimer = setInterval(() => {
      index = (index + 1) % lines.length;
      tickerLine.textContent = lines[index];
      tickerLine.classList.remove('fade-in');
      // eslint-disable-next-line no-void
      void tickerLine.offsetWidth; // restart the CSS animation
      tickerLine.classList.add('fade-in');
    }, TICKER_INTERVAL_MS);
  }

  async #run() {
    const minDisplay = new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));
    await Promise.all([minDisplay, ...this.#waitables]);
    clearInterval(this.#tickerTimer);
    this.#gameStateManager.transition(GAME_STATES.MAIN_MENU);
  }
}
