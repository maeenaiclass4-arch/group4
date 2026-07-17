/**
 * The entire on-screen interface: a loading screen, a one-time start
 * prompt (pointer-lock requires a user gesture), a reticle/glint pair,
 * a caption line, and the Casebook overlay. Nothing else exists — no
 * HUD, no objective list, no progress bar (GDD §9).
 */
export class UIController {
  #captionTimer = null;
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

  showCaption(text) {
    clearTimeout(this.#captionTimer);
    this.captionEl.textContent = text;
    this.captionEl.hidden = false;
    requestAnimationFrame(() => this.captionEl.classList.add('is-visible'));
    this.#captionTimer = setTimeout(() => {
      this.captionEl.classList.remove('is-visible');
      setTimeout(() => { this.captionEl.hidden = true; }, 650);
    }, 3800);
  }

  addCasebookEntry(text) {
    if (this.#casebookEntries.includes(text)) return;
    this.#casebookEntries.push(text);
    this.#renderCasebook();
  }

  hydrateCasebook(entries) {
    this.#casebookEntries = [...entries];
    this.#renderCasebook();
  }

  getCasebookEntries() {
    return [...this.#casebookEntries];
  }

  #renderCasebook() {
    if (this.#casebookEntries.length === 0) {
      this.casebookContents.innerHTML = '<div class="casebook__empty">Nothing filed yet.</div>';
      return;
    }
    this.casebookContents.innerHTML = this.#casebookEntries
      .map((entry) => `<div class="casebook__entry">${entry}</div>`)
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
