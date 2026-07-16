import { GAME_STATES } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

/**
 * PlaceholderRoomView.js
 * NOT a real game screen — this exists solely so Milestone 1 can prove the
 * full loop (New Archive / Continue → "in-session" state → Pause → Settings
 * → Main Menu, with autosave firing) end-to-end before RoomSystem exists.
 * Delete this file the moment Milestone 2's RoomSystem renders a real
 * first room; nothing else in the codebase depends on it.
 */
export class PlaceholderRoomView {
  #gameStateManager;

  constructor(gameStateManager) {
    this.#gameStateManager = gameStateManager;
  }

  mount(container) {
    mount(
      container,
      h('div', { class: 'room-view-placeholder fade-in' }, [
        h(
          'button',
          {
            class: 'btn btn-icon room-view-placeholder__pause',
            'aria-label': t('pause.title'),
            onClick: () => this.#gameStateManager.transition(GAME_STATES.PAUSED),
          },
          ['⏸'],
        ),
        h('div', { class: 'room-view-placeholder__badge' }, [t('placeholder.roomView.title')]),
        h('p', { class: 'room-view-placeholder__body' }, [t('placeholder.roomView.body')]),
        h('p', { class: 'room-view-placeholder__body' }, [t('placeholder.roomView.pauseHint')]),
      ]),
    );
  }
}
