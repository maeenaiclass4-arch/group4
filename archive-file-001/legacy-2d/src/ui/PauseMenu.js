import { GAME_STATES, SAVE_SLOTS } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

/**
 * PauseMenu.js — GDD §11.
 */
export class PauseMenu {
  #eventBus;
  #gameStateManager;
  #saveManager;
  #checkpointsPanel;
  #container;

  constructor(eventBus, gameStateManager, saveManager, checkpointsPanel) {
    this.#eventBus = eventBus;
    this.#gameStateManager = gameStateManager;
    this.#saveManager = saveManager;
    this.#checkpointsPanel = checkpointsPanel;
  }

  mount(container) {
    this.#container = container;
    this.#render();
  }

  #render() {
    mount(
      this.#container,
      h('div', { class: 'panel rise-in' }, [
        h('div', { class: 'pause-menu__title' }, [t('pause.title')]),
        h('nav', { class: 'pause-menu__nav' }, [
          h('button', { class: 'btn btn-block btn-primary', onClick: () => this.#resume() }, [t('pause.resume')]),
          h(
            'button',
            { class: 'btn btn-block btn-secondary', onClick: () => this.#gameStateManager.transition(GAME_STATES.SETTINGS) },
            [t('pause.settings')],
          ),
          h(
            'button',
            { class: 'btn btn-block btn-secondary', onClick: () => this.#checkpointsPanel.open({ allowSave: true }) },
            [t('menu.checkpoints')],
          ),
          h(
            'button',
            { class: 'btn btn-block btn-secondary', onClick: () => this.#toMainMenu() },
            [t('pause.mainMenu')],
          ),
        ]),
      ]),
    );
  }

  #resume() {
    this.#gameStateManager.transition(GAME_STATES.PLAYING);
  }

  #toMainMenu() {
    const active = this.#saveManager.load(SAVE_SLOTS.AUTOSAVE);
    if (active) this.#saveManager.flushAutosave(active);
    this.#gameStateManager.transition(GAME_STATES.MAIN_MENU);
  }
}
