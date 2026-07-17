import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';
import { classifiedFiles } from '../data/index.js';

/**
 * ReaderOverlay.js
 * Full-screen diegetic document reader (GDD §5). Classified Files (§12.2)
 * get the redacted-cover "declassify" reveal the first time they're
 * opened — a solid cover wipes away over the content rather than the
 * text simply appearing, giving the discovery a beat of its own.
 */
export class ReaderOverlay {
  #container;

  mount(container) {
    this.#container = container;
  }

  /** @param {string} fileId */
  open(fileId) {
    const def = classifiedFiles.get(fileId);
    if (!def) {
      console.error(`[ReaderOverlay] unknown classified file "${fileId}"`);
      return;
    }

    mount(
      this.#container,
      h('div', { class: 'panel reader-panel rise-in' }, [
        h('div', { class: 'reader-panel__content' }, [
          h('div', { class: 'reader-panel__title' }, [t(def.titleKey)]),
          ...def.bodyKeys.map((key) => h('p', { class: 'reader-panel__body' }, [t(key)])),
          h('div', { class: 'reader-panel__cover is-declassifying' }, [
            h('span', {}, [t('reader.declassify')]),
          ]),
        ]),
        h('div', { class: 'settings-panel__footer' }, [
          h('button', { class: 'btn btn-primary', onClick: () => this.close() }, [t('common.close')]),
        ]),
      ]),
    );
    this.#container.hidden = false;
  }

  close() {
    this.#container.hidden = true;
  }
}
