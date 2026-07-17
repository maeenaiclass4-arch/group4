import { EVENTS } from '../core/Config.js';
import { h } from './dom.js';

/**
 * AchievementToast.js
 * Queued, non-blocking "Commendation Logged" toast (GDD §12.1). The
 * queueing/render logic is real — only the content is scaffolding, since
 * data/achievements.json is currently empty (Milestone 2+ authors real
 * Commendations). Wired to EVENTS.ACHIEVEMENT_UNLOCKED now so nothing
 * about the toast pipeline needs to change once that event actually fires.
 */
const DISPLAY_MS = 4000;

export class AchievementToast {
  #container;
  #queue = [];
  #showing = false;

  mount(container) {
    this.#container = container;
  }

  init(eventBus) {
    eventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, (payload) => this.#enqueue(payload));
  }

  #enqueue(payload) {
    this.#queue.push(payload);
    if (!this.#showing) this.#dequeue();
  }

  #dequeue() {
    const next = this.#queue.shift();
    if (!next) {
      this.#showing = false;
      return;
    }
    this.#showing = true;

    const node = h('div', { class: 'toast' }, [
      h('span', { class: 'toast__icon', 'aria-hidden': 'true' }, ['◆']),
      h('div', {}, [
        h('span', { class: 'toast__title' }, ['Commendation Logged']),
        h('span', { class: 'toast__body' }, [next.title ?? next.id ?? '']),
      ]),
    ]);
    this.#container.appendChild(node);

    setTimeout(() => {
      node.remove();
      this.#dequeue();
    }, DISPLAY_MS);
  }
}
