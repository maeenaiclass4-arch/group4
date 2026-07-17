import { h, mount, clear } from './dom.js';

/**
 * ConfirmModal.js
 * Generic confirm/info dialog rendered into the shared #overlay-confirm
 * region. Any component can call `confirmModal.confirm({...})` and await
 * the player's choice — no component needs to build its own dialog markup.
 */
export class ConfirmModal {
  #container = null;
  #resolver = null;

  mount(container) {
    this.#container = container;
  }

  /**
   * @returns {Promise<boolean>} true if confirmed, false if cancelled/dismissed
   */
  confirm({ title, body, confirmLabel, cancelLabel }) {
    return new Promise((resolve) => {
      this.#open(resolve, [
        h('div', { class: 'modal__title' }, [title]),
        h('div', { class: 'modal__body' }, [body]),
        h('div', { class: 'modal__actions' }, [
          h('button', { class: 'btn btn-secondary', onClick: () => this.#close(false) }, [cancelLabel]),
          h('button', { class: 'btn btn-primary', onClick: () => this.#close(true) }, [confirmLabel]),
        ]),
      ]);
    });
  }

  /** @returns {Promise<void>} */
  info({ title, body, closeLabel }) {
    return new Promise((resolve) => {
      this.#open(
        () => resolve(),
        [
          h('div', { class: 'modal__title' }, [title]),
          h('div', { class: 'modal__body' }, [body]),
          h('div', { class: 'modal__actions' }, [
            h('button', { class: 'btn btn-primary', onClick: () => this.#close(undefined) }, [closeLabel]),
          ]),
        ],
      );
    });
  }

  #open(resolver, children) {
    this.#resolver = resolver;
    mount(this.#container, h('div', { class: 'modal rise-in', role: 'dialog', 'aria-modal': 'true' }, children));
    this.#container.hidden = false;
  }

  #close(value) {
    this.#container.hidden = true;
    clear(this.#container);
    const resolver = this.#resolver;
    this.#resolver = null;
    resolver?.(value);
  }
}
