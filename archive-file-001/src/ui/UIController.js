import { t, applyStaticTranslations, onLanguageChange } from '../core/i18n.js';

/**
 * The entire on-screen interface: a loading screen, a one-time start
 * prompt (pointer-lock requires a user gesture), a reticle/glint pair,
 * a caption line, and the Casebook overlay. Nothing else exists — no
 * HUD, no objective list, no progress bar (GDD §9).
 *
 * Captions and Casebook entries are stored/passed around as i18n *keys*,
 * not resolved text — so a language switch mid-session (or a save/load
 * round-trip) always re-resolves to the current language automatically,
 * instead of freezing whatever language was active when the text was
 * first shown.
 */
export class UIController {
  #captionTimer = null;
  #captionKey = null;
  #casebookEntries = [];
  #casebookOpen = false;

  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingFill = document.getElementById('loading-screen__fill');
    this.startPrompt = document.getElementById('start-prompt');
    this.reticle = document.getElementById('reticle');
    this.glint = document.getElementById('interact-glint');
    this.captionEl = document.getElementById('caption');
    this.casebookEl = document.getElementById('casebook');
    this.casebookContents = document.getElementById('casebook__contents');

    // Tapping the backdrop (outside the page itself) closes it — the only
    // way to close the Casebook on touch, since the on-screen Casebook
    // button sits behind this overlay's z-index while it's open.
    this.casebookEl.addEventListener('click', (e) => {
      if (e.target === this.casebookEl) this.toggleCasebook();
    });

    onLanguageChange(() => {
      applyStaticTranslations();
      this.#renderCasebook();
      if (this.#captionKey) this.captionEl.textContent = t(this.#captionKey);
    });
  }

  setLoadingProgress(ratio) {
    this.loadingFill.style.width = `${Math.round(ratio * 100)}%`;
  }

  hideLoadingScreen() {
    this.loadingScreen.classList.add('is-hidden');
    setTimeout(() => { this.loadingScreen.hidden = true; }, 850);
    this.startPrompt.hidden = false;
  }

  hideStartPrompt() {
    this.startPrompt.hidden = true;
    this.reticle.hidden = false;
  }

  showStartPrompt() {
    this.startPrompt.hidden = false;
  }

  setHovering(isHovering) {
    this.glint.hidden = !isHovering;
  }

  pulseReticle(kind = 'ok') {
    const cls = kind === 'denied' ? 'is-denied' : 'is-pulse';
    this.reticle.classList.remove('is-pulse', 'is-denied');
    // eslint-disable-next-line no-void
    void this.reticle.offsetWidth; // restart the CSS animation
    this.reticle.classList.add(cls);
  }

  /** `key` is an i18n key, e.g. 'case1.solve.caption'. */
  showCaption(key) {
    clearTimeout(this.#captionTimer);
    this.#captionKey = key;
    this.captionEl.textContent = t(key);
    this.captionEl.hidden = false;
    requestAnimationFrame(() => this.captionEl.classList.add('is-visible'));
    this.#captionTimer = setTimeout(() => {
      this.captionEl.classList.remove('is-visible');
      setTimeout(() => {
        this.captionEl.hidden = true;
        this.#captionKey = null;
      }, 650);
    }, 3800);
  }

  /** `key` is an i18n key, e.g. 'case1.key.entry'. */
  addCasebookEntry(key) {
    if (this.#casebookEntries.includes(key)) return;
    this.#casebookEntries.push(key);
    this.#renderCasebook();
  }

  hydrateCasebook(entryKeys) {
    this.#casebookEntries = [...entryKeys];
    this.#renderCasebook();
  }

  getCasebookEntries() {
    return [...this.#casebookEntries];
  }

  #renderCasebook() {
    if (this.#casebookEntries.length === 0) {
      this.casebookContents.innerHTML = `<div class="casebook__empty">${t('casebook.empty')}</div>`;
      return;
    }
    this.casebookContents.innerHTML = this.#casebookEntries
      .map((key) => `<div class="casebook__entry">${t(key)}</div>`)
      .join('');
  }

  toggleCasebook() {
    this.#casebookOpen = !this.#casebookOpen;
    this.casebookEl.classList.toggle('is-open', this.#casebookOpen);
    this.casebookEl.hidden = false;
    return this.#casebookOpen;
  }

  get isCasebookOpen() {
    return this.#casebookOpen;
  }
}
