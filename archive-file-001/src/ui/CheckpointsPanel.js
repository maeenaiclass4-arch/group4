import { SAVE_SLOTS, GAME_STATES } from '../core/Config.js';
import { h, mount } from './dom.js';

const SLOT_LABELS = {
  [SAVE_SLOTS.CHECKPOINT_1]: 'Checkpoint I',
  [SAVE_SLOTS.CHECKPOINT_2]: 'Checkpoint II',
  [SAVE_SLOTS.CHECKPOINT_3]: 'Checkpoint III',
};

/**
 * CheckpointsPanel.js
 * The 3 manual "Archive Checkpoint" slots (GDD §10, §11) — independent of
 * autosave, so a player can branch-explore without losing their
 * autosave position. Functional against real localStorage today even
 * though there's no room content yet to save mid-scene: from the Main
 * Menu a slot can only be Loaded; once PLAYING exists (Milestone 2+) the
 * "Save Here" action becomes available from the Pause Menu.
 */
export class CheckpointsPanel {
  #eventBus;
  #saveManager;
  #gameStateManager;
  #container;

  constructor(eventBus, saveManager, gameStateManager) {
    this.#eventBus = eventBus;
    this.#saveManager = saveManager;
    this.#gameStateManager = gameStateManager;
  }

  mount(container) {
    this.#container = container;
  }

  open({ allowSave } = { allowSave: false }) {
    this.#render(allowSave);
    this.#container.hidden = false;
  }

  close() {
    this.#container.hidden = true;
  }

  #render(allowSave) {
    const rows = this.#saveManager.listCheckpoints().map((entry) => this.#renderRow(entry, allowSave));

    mount(
      this.#container,
      h('div', { class: 'panel rise-in' }, [
        h('div', { class: 'settings-panel__title' }, ['Archive Checkpoints']),
        h('div', { class: 'settings-panel__section' }, rows),
        h('div', { class: 'settings-panel__footer' }, [
          h('button', { class: 'btn btn-secondary', onClick: () => this.close() }, ['Close']),
        ]),
      ]),
    );
  }

  #renderRow(entry, allowSave) {
    const label = SLOT_LABELS[entry.slot];
    const status = entry.empty
      ? h('span', { class: 'settings-row__hint' }, ['Empty'])
      : h('span', { class: 'settings-row__hint' }, [
          `Room: ${entry.currentRoomId ?? 'unknown'} — ${new Date(entry.timestamp).toLocaleString()}`,
        ]);

    const actions = [];
    if (!entry.empty) {
      actions.push(
        h(
          'button',
          {
            class: 'btn btn-secondary',
            onClick: () => this.#load(entry.slot),
          },
          ['Load'],
        ),
      );
    }
    if (allowSave) {
      actions.push(
        h(
          'button',
          { class: 'btn btn-primary', onClick: () => this.#save(entry.slot) },
          [entry.empty ? 'Save Here' : 'Overwrite'],
        ),
      );
    }

    return h('div', { class: 'settings-row' }, [
      h('div', {}, [h('div', { class: 'settings-row__label' }, [label]), status]),
      h('div', { style: 'display:flex; gap: var(--space-2);' }, actions),
    ]);
  }

  #load(slot) {
    const state = this.#saveManager.load(slot);
    if (!state) return;
    this.close();
    this.#gameStateManager.transition(GAME_STATES.PLAYING, { fromCheckpoint: slot });
  }

  #save(slot) {
    // Milestone 2+: pull live state from the active session rather than autosave.
    const active = this.#saveManager.load(SAVE_SLOTS.AUTOSAVE);
    if (!active) return;
    this.#saveManager.save(slot, active);
    this.#render(true);
  }
}
