import { setLanguage, getLanguage } from '../core/i18n.js';

/**
 * Language + brightness — the two settings actually requested. Opening it
 * always releases pointer lock (a slider/button needs a real visible
 * cursor on desktop) and pauses world interaction while open, the same
 * way the Casebook does.
 */
export class SettingsPanel {
  constructor({ settingsStore, onExposureChange, onOpenChange }) {
    this.settingsStore = settingsStore;
    this.onExposureChange = onExposureChange;
    this.onOpenChange = onOpenChange;
    this.settings = settingsStore.load();

    this.root = document.getElementById('settings-panel');
    this.openBtn = document.getElementById('settings-btn');
    this.closeBtn = document.getElementById('settings-close-btn');
    this.langButtons = {
      en: document.getElementById('settings-lang-en'),
      ar: document.getElementById('settings-lang-ar'),
    };
    this.brightnessSlider = document.getElementById('settings-brightness');

    this.brightnessSlider.value = this.settings.exposure;
    this.#updateLangButtons();

    this.openBtn.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close();
    });

    for (const [lang, btn] of Object.entries(this.langButtons)) {
      btn.addEventListener('click', () => this.#setLanguage(lang));
    }

    this.brightnessSlider.addEventListener('input', () => {
      const value = Number(this.brightnessSlider.value);
      this.settings.exposure = value;
      this.onExposureChange?.(value);
      this.settingsStore.save(this.settings);
    });
  }

  /** Applies the persisted language/exposure once the scene exists — called once at boot. */
  applyInitial() {
    setLanguage(this.settings.language);
    this.onExposureChange?.(this.settings.exposure);
  }

  #setLanguage(lang) {
    this.settings.language = lang;
    setLanguage(lang);
    this.settingsStore.save(this.settings);
    this.#updateLangButtons();
  }

  #updateLangButtons() {
    const active = getLanguage();
    for (const [lang, btn] of Object.entries(this.langButtons)) {
      btn.classList.toggle('is-active', lang === active);
    }
  }

  open() {
    this.root.hidden = false;
    this.root.classList.add('is-open');
    this.onOpenChange?.(true);
  }

  close() {
    this.root.classList.remove('is-open');
    this.onOpenChange?.(false);
  }

  get isOpen() {
    return this.root.classList.contains('is-open');
  }
}
