/**
 * dom.js — a tiny, dependency-free element-builder shared by every UI
 * component. Not a framework: no virtual DOM, no reactivity — components
 * re-render by rebuilding their own subtree, which is cheap at this scale
 * (a handful of menu screens) and keeps the "vanilla ES modules, no
 * framework" decision in GDD §15 honest.
 */

/**
 * @param {string} tag
 * @param {object} [props] attributes; `class`/`className`, `dataset`, and
 *   `on<Event>` handlers are special-cased, everything else is setAttribute.
 * @param {(Node|string)[]} [children]
 */
export function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class' || key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') {
      el.innerHTML = value;
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (child == null || child === false) continue;
    el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return el;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function mount(container, node) {
  clear(container);
  container.appendChild(node);
}
