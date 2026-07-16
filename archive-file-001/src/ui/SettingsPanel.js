import { EVENTS, GAME_STATES } from '../core/Config.js';
import { t, setLanguage } from '../core/i18n.js';
import { h, mount } from './dom.js';

const TABS = ['audio', 'text', 'accessibility', 'controls'];

/**
 * SettingsPanel.js — GDD §11.
 * Every control writes through `#commit()`, which persists via SaveManager
 * (settings are global, independent of any save slot) and pushes live
 * audio changes to AudioManager and live motion/lang changes to the
 * document root — so a slider drag is reflected immediately, not just on
 * next boot.
 */
export class SettingsPanel {
  #eventBus;
  #gameStateManager;
  #saveManager;
  #audioManager;
  #container;
  #settings;
  #activeTab = 'audio';

  constructor(eventBus, gameStateManager, saveManager, audioManager) {
    this.#eventBus = eventBus;
    this.#gameStateManager = gameStateManager;
    this.#saveManager = saveManager;
    this.#audioManager = audioManager;
    this.#settings = saveManager.loadSettings();
  }

  /** Applied once at boot, before any UI exists, so motion/lang are correct from frame one. */
  get settings() {
    return this.#settings;
  }

  mount(container) {
    this.#container = container;
    this.#render();
  }

  #commit(patch) {
    this.#settings = { ...this.#settings, ...patch };
    this.#saveManager.saveSettings(this.#settings);

    if ('audioMaster' in patch || 'audioMusic' in patch || 'audioSfx' in patch || 'audioVoice' in patch) {
      this.#audioManager.applyVolumes(this.#settings);
    }
    if ('reduceMotion' in patch) {
      document.documentElement.dataset.reduceMotion = String(this.#settings.reduceMotion);
    }
    if ('layerAssist' in patch) {
      document.documentElement.dataset.layerAssist = String(this.#settings.layerAssist);
    }
    if ('language' in patch) {
      setLanguage(this.#settings.language);
      // Re-renders every other currently-mounted screen so the switch is
      // visible everywhere immediately, not just next time each opens.
      this.#eventBus.emit(EVENTS.LANGUAGE_CHANGED, { language: this.#settings.language });
    }
    this.#render();
  }

  #render() {
    mount(
      this.#container,
      h('div', { class: 'panel rise-in' }, [
        h('div', { class: 'settings-panel__title' }, [t('settings.title')]),
        h(
          'div',
          { class: 'settings-panel__tabs', role: 'tablist' },
          TABS.map((tab) =>
            h(
              'button',
              {
                class: 'settings-panel__tab',
                role: 'tab',
                'aria-selected': String(tab === this.#activeTab),
                onClick: () => {
                  this.#activeTab = tab;
                  this.#render();
                },
              },
              [t(`settings.tab.${tab}`)],
            ),
          ),
        ),
        this.#renderSection(),
        h('div', { class: 'settings-panel__footer' }, [
          h(
            'button',
            { class: 'btn btn-primary', onClick: () => this.#gameStateManager.closeSettings() },
            [t('settings.back')],
          ),
        ]),
      ]),
    );
  }

  #renderSection() {
    switch (this.#activeTab) {
      case 'audio':
        return this.#audioSection();
      case 'text':
        return this.#textSection();
      case 'accessibility':
        return this.#accessibilitySection();
      case 'controls':
        return this.#controlsSection();
      default:
        return h('div');
    }
  }

  #slider(key, labelKey) {
    return h('div', { class: 'settings-row' }, [
      h('label', { class: 'settings-row__label', for: key }, [t(labelKey)]),
      h('input', {
        id: key,
        class: 'slider',
        type: 'range',
        min: '0',
        max: '1',
        step: '0.05',
        value: String(this.#settings[key]),
        oninput: (event) => this.#commit({ [key]: Number(event.target.value) }),
      }),
    ]);
  }

  #toggle(key, labelKey, hintKey) {
    return h('div', { class: 'settings-row' }, [
      h('div', {}, [
        h('div', { class: 'settings-row__label' }, [t(labelKey)]),
        hintKey ? h('div', { class: 'settings-row__hint' }, [t(hintKey)]) : null,
      ]),
      h('label', { class: 'toggle' }, [
        h('input', {
          type: 'checkbox',
          checked: this.#settings[key] === true,
          onChange: (event) => this.#commit({ [key]: event.target.checked }),
        }),
        h('span', { class: 'toggle__track' }),
        h('span', { class: 'toggle__thumb' }),
      ]),
    ]);
  }

  #audioSection() {
    return h('div', { class: 'settings-panel__section' }, [
      this.#slider('audioMaster', 'settings.audio.master'),
      this.#slider('audioMusic', 'settings.audio.music'),
      this.#slider('audioSfx', 'settings.audio.sfx'),
      this.#slider('audioVoice', 'settings.audio.voice'),
    ]);
  }

  #textSection() {
    return h('div', { class: 'settings-panel__section' }, [
      this.#toggle('subtitles', 'settings.text.subtitles'),
      h('div', { class: 'settings-row' }, [
        h('label', { class: 'settings-row__label', for: 'textScale' }, [t('settings.text.size')]),
        h('input', {
          id: 'textScale',
          class: 'slider',
          type: 'range',
          min: '0.85',
          max: '1.3',
          step: '0.05',
          value: String(this.#settings.textScale),
          oninput: (event) => {
            const scale = Number(event.target.value);
            document.documentElement.style.setProperty('--user-text-scale', String(scale));
            this.#commit({ textScale: scale });
          },
        }),
      ]),
      h('div', { class: 'settings-row' }, [
        h('label', { class: 'settings-row__label', for: 'language' }, [t('settings.text.language')]),
        h(
          'select',
          {
            id: 'language',
            class: 'select-input',
            onChange: (event) => this.#commit({ language: event.target.value }),
          },
          [
            h('option', { value: 'en', selected: this.#settings.language === 'en' }, ['English']),
            h('option', { value: 'ar', selected: this.#settings.language === 'ar' }, ['العربية']),
          ],
        ),
      ]),
    ]);
  }

  #accessibilitySection() {
    return h('div', { class: 'settings-panel__section' }, [
      this.#toggle('layerAssist', 'settings.accessibility.layerAssist'),
      this.#toggle('reduceMotion', 'settings.accessibility.reduceMotion'),
      this.#toggle('colorblindSafeMode', 'settings.accessibility.colorblindSafe'),
      h('div', { class: 'settings-row' }, [
        h('label', { class: 'settings-row__label', for: 'hintFrequency' }, [
          t('settings.accessibility.hintFrequency'),
        ]),
        h(
          'select',
          {
            id: 'hintFrequency',
            class: 'select-input',
            onChange: (event) => this.#commit({ hintFrequency: event.target.value }),
          },
          [
            h('option', { value: 'normal', selected: this.#settings.hintFrequency === 'normal' }, ['Normal']),
            h('option', { value: 'reduced', selected: this.#settings.hintFrequency === 'reduced' }, ['Reduced']),
          ],
        ),
      ]),
    ]);
  }

  #controlsSection() {
    return h('div', { class: 'settings-panel__section' }, [
      h('p', { class: 'settings-row__hint' }, [t('settings.controls.hint')]),
    ]);
  }
}
