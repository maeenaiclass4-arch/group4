import { GAME_STATES, SAVE_SLOTS, DEFAULT_SAVE_STATE, EVENTS } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

/**
 * MainMenu.js
 * GDD §11. Re-renders on every MAIN_MENU entry (main.js re-invokes mount())
 * so "Continue" reflects the freshest save state without a manual refresh
 * mechanism — the whole component is cheap enough to just rebuild.
 *
 * Codex / Progress Tracker / Chapter Select / Photo Mode are locked here
 * because the story content that unlocks them (GDD §7, §12.5, §12.12)
 * doesn't exist yet — they're wired as disabled nav items so their final
 * position/behavior doesn't need to be redesigned when Milestone 4 lands.
 */
export class MainMenu {
  #eventBus;
  #gameStateManager;
  #saveManager;
  #confirmModal;
  #checkpointsPanel;
  #container;

  constructor(eventBus, gameStateManager, saveManager, confirmModal, checkpointsPanel) {
    this.#eventBus = eventBus;
    this.#gameStateManager = gameStateManager;
    this.#saveManager = saveManager;
    this.#confirmModal = confirmModal;
    this.#checkpointsPanel = checkpointsPanel;
  }

  mount(container) {
    this.#container = container;
    this.#render();
  }

  #render() {
    const hasSave = this.#saveManager.hasSave(SAVE_SLOTS.AUTOSAVE);

    mount(
      this.#container,
      h('div', { class: 'stack fade-in', style: 'gap: var(--space-7);' }, [
        h('h1', { class: 'main-menu__title' }, ['ARCHIVE : ', h('span', {}, ['FILE-001'])]),
        h('p', { class: 'main-menu__tagline' }, [t('app.tagline')]),
        h('nav', { class: 'main-menu__nav' }, [
          this.#navButton(t('menu.newArchive'), () => this.#onNewArchive(), { primary: true }),
          this.#navButton(t('menu.continue'), () => this.#onContinue(), { disabled: !hasSave }),
          this.#navButton(t('menu.checkpoints'), () => this.#checkpointsPanel.open({ allowSave: false })),
          this.#lockedItem(t('menu.chapterSelect')),
          this.#lockedItem(t('menu.progressTracker')),
          this.#lockedItem(t('menu.codex')),
          this.#lockedItem(t('menu.photoMode')),
          this.#navButton(t('menu.settings'), () => this.#gameStateManager.transition(GAME_STATES.SETTINGS)),
          this.#navButton(t('menu.credits'), () => this.#onCredits()),
        ]),
        h('div', { class: 'main-menu__footer' }, ['MILESTONE 1 — PRODUCTION FOUNDATION']),
      ]),
    );
  }

  #navButton(label, onClick, { primary = false, disabled = false } = {}) {
    return h(
      'button',
      { class: `btn btn-block ${primary ? 'btn-primary' : 'btn-secondary'}`, onClick, disabled },
      [label],
    );
  }

  #lockedItem(label) {
    return h('div', { class: 'main-menu__nav-item' }, [
      h('button', { class: 'btn btn-block btn-secondary', disabled: true }, [label]),
    ]);
  }

  async #onNewArchive() {
    const hasSave = this.#saveManager.hasSave(SAVE_SLOTS.AUTOSAVE);
    if (hasSave) {
      const confirmed = await this.#confirmModal.confirm({
        title: t('confirm.overwrite.title'),
        body: t('confirm.overwrite.body'),
        confirmLabel: t('confirm.overwrite.confirm'),
        cancelLabel: t('confirm.overwrite.cancel'),
      });
      if (!confirmed) return;
    }

    const fresh = { ...DEFAULT_SAVE_STATE, timestamp: Date.now() };
    this.#saveManager.save(SAVE_SLOTS.AUTOSAVE, fresh);
    this.#eventBus.emit(EVENTS.SAVE_WRITTEN, { slot: SAVE_SLOTS.AUTOSAVE, state: fresh, reason: 'new-archive' });
    this.#gameStateManager.transition(GAME_STATES.PLAYING, { fresh: true });
  }

  #onContinue() {
    const state = this.#saveManager.load(SAVE_SLOTS.AUTOSAVE);
    if (!state) return;
    this.#gameStateManager.transition(GAME_STATES.PLAYING, { resumed: true });
  }

  #onCredits() {
    this.#confirmModal.info({
      title: t('credits.title'),
      body: t('credits.body'),
      closeLabel: t('common.close'),
    });
  }
}
