import { EVENTS } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

/**
 * PuzzleOverlay.js
 * Numeric keypad UI for the "code" puzzle type (GDD §6). Wrong entries get
 * a neutral shake + clear — never a penalty, never a reset of progress
 * elsewhere. The 3-tier hint drawer is inline here rather than a separate
 * component since this vertical slice has exactly one puzzle instance;
 * HintDrawer.js remains the planned standalone component once multiple
 * concurrent puzzle types exist (Milestone 3+).
 */
export class PuzzleOverlay {
  #eventBus;
  #puzzleEngine;
  #container;
  #puzzleDef = null;
  #roomId = null;
  #onSolved = null;
  #input = '';
  #hintTier = 0;
  #shake = false;

  constructor(eventBus, puzzleEngine) {
    this.#eventBus = eventBus;
    this.#puzzleEngine = puzzleEngine;
  }

  mount(container) {
    this.#container = container;
  }

  /** @param {object} puzzleDef @param {string} roomId @param {{onSolved?: () => void}} [opts] */
  open(puzzleDef, roomId, { onSolved } = {}) {
    this.#puzzleDef = puzzleDef;
    this.#roomId = roomId;
    this.#onSolved = onSolved ?? null;
    this.#input = '';
    this.#hintTier = 0;
    this.#shake = false;
    this.#render();
    this.#container.hidden = false;
  }

  close() {
    this.#container.hidden = true;
    this.#puzzleDef = null;
  }

  #digit(d) {
    if (this.#shake || this.#input.length >= this.#puzzleDef.digits) return;
    this.#input += String(d);
    this.#render();
    if (this.#input.length === this.#puzzleDef.digits) this.#submit();
  }

  #clear() {
    this.#input = '';
    this.#render();
  }

  #submit() {
    if (this.#puzzleEngine.checkSolution(this.#puzzleDef, this.#input)) {
      const puzzleDef = this.#puzzleDef;
      const roomId = this.#roomId;
      const onSolved = this.#onSolved;
      this.#puzzleEngine.solve(puzzleDef, roomId);
      this.close();
      onSolved?.();
      return;
    }
    this.#eventBus.emit(EVENTS.PUZZLE_FAILED, { puzzleId: this.#puzzleDef.id });
    this.#shake = true;
    this.#render();
    setTimeout(() => {
      this.#shake = false;
      this.#input = '';
      this.#render();
    }, 420);
  }

  #revealHint() {
    if (!this.#puzzleDef || this.#hintTier >= this.#puzzleDef.hints.length) return;
    this.#hintTier += 1;
    this.#eventBus.emit(EVENTS.HINT_USED, { puzzleId: this.#puzzleDef.id, tier: this.#hintTier });
    this.#render();
  }

  #render() {
    if (!this.#puzzleDef) return;

    const dots = Array.from({ length: this.#puzzleDef.digits }, (_, i) =>
      h('span', { class: `puzzle-code__dot${i < this.#input.length ? ' is-filled' : ''}` }),
    );

    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
      h('button', { class: 'btn puzzle-keypad__key', onClick: () => this.#digit(n) }, [String(n)]),
    );
    keys.push(
      h('button', { class: 'btn btn-ghost puzzle-keypad__key', onClick: () => this.#clear() }, [t('puzzle.clear')]),
      h('button', { class: 'btn puzzle-keypad__key', onClick: () => this.#digit(0) }, ['0']),
      h('button', { class: 'btn btn-ghost puzzle-keypad__key', onClick: () => this.#revealHint() }, [
        t('puzzle.hint.reveal'),
      ]),
    );

    const hintLines = this.#puzzleDef.hints
      .slice(0, this.#hintTier)
      .map((key) => h('p', { class: 'puzzle-hint-line' }, [t(key)]));

    mount(
      this.#container,
      h('div', { class: `panel puzzle-panel rise-in${this.#shake ? ' is-shake' : ''}` }, [
        h('div', { class: 'settings-panel__title' }, [t(this.#puzzleDef.titleKey)]),
        h('p', { class: 'puzzle-prompt' }, [t(this.#puzzleDef.promptKey)]),
        h('div', { class: 'puzzle-code__dots' }, dots),
        h('div', { class: 'puzzle-keypad' }, keys),
        hintLines.length ? h('div', { class: 'puzzle-hints' }, hintLines) : null,
        h('div', { class: 'settings-panel__footer' }, [
          h('button', { class: 'btn btn-secondary', onClick: () => this.close() }, [t('common.close')]),
        ]),
      ]),
    );
  }
}
