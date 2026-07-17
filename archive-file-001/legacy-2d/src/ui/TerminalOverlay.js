import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

const TYPE_SPEED_MS = 16;

/**
 * Reveals `text` into `el` character by character. Instant when Reduce
 * Motion is on, since a slow typewriter effect is exactly the kind of
 * motion that setting exists to remove.
 * @returns {Promise<void>}
 */
function typeInto(el, text) {
  return new Promise((resolve) => {
    if (document.documentElement.dataset.reduceMotion === 'true') {
      el.textContent = text;
      resolve();
      return;
    }
    let i = 0;
    el.textContent = '';
    const timer = setInterval(() => {
      el.textContent += text[i];
      i += 1;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, TYPE_SPEED_MS);
  });
}

/**
 * TerminalOverlay.js
 * Retro-CRT terminal, restyled as pure story flavor (GDD Priority 3
 * revision): the player selects a record from a fixed set of buttons —
 * nothing to type, nothing to guess or misspell. Typed-out responses are
 * kept for atmosphere. Renders its shell once per open() and appends to
 * the log directly afterward — re-mounting on every selection would wipe
 * scroll position and history.
 */
export class TerminalOverlay {
  #terminalSystem;
  #container;
  #def = null;
  #busy = false;
  #queue = [];

  /** @param {import('../systems/TerminalSystem.js').TerminalSystem} terminalSystem */
  constructor(terminalSystem) {
    this.#terminalSystem = terminalSystem;
  }

  mount(container) {
    this.#container = container;
  }

  async open(terminalId) {
    const def = this.#terminalSystem.loadTerminal(terminalId);
    if (!def) return;
    this.#def = def;
    this.#queue = [];
    this.#renderShell();
    this.#container.hidden = false;

    // Busy during boot too, so a selection made mid-boot queues instead of
    // interleaving with the boot lines still being printed.
    this.#busy = true;
    for (const key of def.bootLines) {
      // eslint-disable-next-line no-await-in-loop
      await this.#printLine(t(key), 'boot');
    }
    this.#busy = false;

    const next = this.#queue.shift();
    if (next !== undefined) this.#run(next);
  }

  close() {
    this.#container.hidden = true;
    this.#def = null;
  }

  get isOpen() {
    return this.#def !== null;
  }

  /**
   * A selection made while the previous response is still typing is never
   * dropped — it queues and runs the instant the terminal frees up.
   * @param {string} recordId
   */
  async #run(recordId) {
    if (this.#busy) {
      this.#queue.push(recordId);
      return;
    }
    const record = this.#def.records.find((r) => r.id === recordId);
    if (!record) return;

    this.#busy = true;
    this.#appendStatic(`▸ ${t(record.labelKey)}`, 'command');
    const responseKey = this.#terminalSystem.runRecord(this.#def, recordId);
    if (responseKey) await this.#printLine(t(responseKey), 'response');
    this.#busy = false;

    const next = this.#queue.shift();
    if (next !== undefined) this.#run(next);
  }

  #renderShell() {
    mount(
      this.#container,
      h('div', { class: 'panel terminal-panel rise-in' }, [
        h('div', { class: 'terminal-panel__log' }),
        h('p', { class: 'terminal-panel__hint' }, [t('terminal.hint')]),
        h(
          'div',
          { class: 'terminal-panel__records' },
          this.#def.records.map((record) =>
            h(
              'button',
              {
                class: 'btn btn-secondary terminal-panel__record-btn',
                type: 'button',
                onClick: () => this.#run(record.id),
              },
              [t(record.labelKey)],
            ),
          ),
        ),
        h('div', { class: 'settings-panel__footer' }, [
          h('button', { class: 'btn btn-secondary', type: 'button', onClick: () => this.close() }, [
            t('common.close'),
          ]),
        ]),
      ]),
    );
  }

  #logEl() {
    return this.#container.querySelector('.terminal-panel__log');
  }

  #appendStatic(text, kind) {
    const log = this.#logEl();
    log.appendChild(h('div', { class: `terminal-line terminal-line--${kind}` }, [text]));
    log.scrollTop = log.scrollHeight;
  }

  async #printLine(text, kind) {
    const log = this.#logEl();
    const line = h('div', { class: `terminal-line terminal-line--${kind}` });
    log.appendChild(line);
    await typeInto(line, text);
    log.scrollTop = log.scrollHeight;
  }
}
