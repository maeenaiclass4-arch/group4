import { GAME_STATES, SAVE_SLOTS, DEFAULT_SAVE_STATE, EVENTS } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

/**
 * MainMenu.js
 * GDD §11. Presented as a case-file index rather than an app menu: one
 * stamped primary action, the rest a ledger of rows. Re-renders on every
 * MAIN_MENU entry (main.js re-invokes mount()) so "Continue" reflects the
 * freshest save state without a manual refresh mechanism.
 *
 * Codex / Progress Tracker / Chapter Select / Photo Mode are locked here
 * because the story content that unlocks them (GDD §7, §12.5, §12.12)
 * doesn't exist yet — they're wired as disabled rows so their final
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
      h('div', { class: 'stack fade-in', style: 'gap: var(--space-6);' }, [
        h('div', { class: 'main-menu__seal', 'aria-hidden': 'true' }),
        h('h1', { class: 'main-menu__title' }, ['ARCHIVE : ', h('span', {}, ['FILE-001'])]),
        h('p', { class: 'main-menu__tagline' }, [t('app.tagline')]),

        h(
          'button',
          { class: 'main-menu__primary', onClick: () => this.#onNewArchive() },
          [t('menu.newArchive')],
        ),

        h('nav', { class: 'main-menu__ledger' }, [
          this.#row(t('menu.continue'), () => this.#onContinue(), { disabled: !hasSave }),
          this.#row(t('menu.checkpoints'), () => this.#checkpointsPanel.open({ allowSave: false })),
          this.#row(t('menu.chapterSelect'), null, { locked: true }),
          this.#row(t('menu.progressTracker'), null, { locked: true }),
          this.#row(t('menu.codex'), null, { locked: true }),
          this.#row(t('menu.photoMode'), null, { locked: true }),
          this.#row(t('menu.settings'), () => this.#gameStateManager.transition(GAME_STATES.SETTINGS)),
          this.#row(t('menu.credits'), () => this.#onCredits()),
        ]),

        h('div', { class: 'main-menu__footer' }, ['ARCHIVE SYSTEMS — INTAKE DIVISION']),
      ]),
    );
  }

  #row(label, onClick, { disabled = false, locked = false } = {}) {
    return h(
      'button',
      {
        class: `main-menu__row${locked ? ' is-locked' : ''}`,
        onClick: onClick ?? undefined,
        disabled: disabled || locked,
        title: locked ? t('menu.locked') : undefined,
      },
      [
        h('span', { class: 'main-menu__row-label' }, [label]),
        locked
          ? h('span', { class: 'main-menu__row-lock', 'aria-hidden': 'true' })
          : h('span', { class: 'main-menu__row-arrow', 'aria-hidden': 'true' }, ['›']),
      ],
    );
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
