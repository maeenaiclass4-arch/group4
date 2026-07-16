import { EVENTS, GAME_STATES } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h } from './dom.js';
import { renderScene } from './SceneArt.js';

/**
 * RoomView.js
 * The one place a room actually gets drawn and interacted with. Data
 * (which room, what's in it) lives in RoomSystem/HotspotSystem; this
 * class turns that data into DOM, wires hotspot clicks to the right
 * system (terminal / puzzle / inventory / exit), and sequences the
 * discovery beats (cinematic → item pickup → document reveal) that make
 * solving the room's one puzzle feel like an event rather than a flag flip.
 */
export class RoomView {
  #captionTimer = null;

  constructor(deps) {
    this.eventBus = deps.eventBus;
    this.gameStateManager = deps.gameStateManager;
    this.roomSystem = deps.roomSystem;
    this.hotspotSystem = deps.hotspotSystem;
    this.layerToggleSystem = deps.layerToggleSystem;
    this.inventorySystem = deps.inventorySystem;
    this.inventoryDock = deps.inventoryDock;
    this.puzzleEngine = deps.puzzleEngine;
    this.puzzleOverlay = deps.puzzleOverlay;
    this.terminalOverlay = deps.terminalOverlay;
    this.readerOverlay = deps.readerOverlay;
    this.cinematicSystem = deps.cinematicSystem;
    this.sessionStore = deps.sessionStore;
    this.closeRoomOverlays = deps.closeRoomOverlays;
  }

  mount() {
    this.sceneEl = document.getElementById('room-scene');
    this.hotspotsEl = document.getElementById('room-hotspots');
    this.captionEl = document.getElementById('room-caption');
    this.pauseBtn = document.getElementById('room-pause-btn');
    this.layerBtn = document.getElementById('room-layer-btn');

    this.pauseBtn.addEventListener('click', () => this.gameStateManager.transition(GAME_STATES.PAUSED));
    this.layerBtn.addEventListener('click', () => this.layerToggleSystem.toggle());

    this.eventBus.on(EVENTS.ROOM_ENTERED, () => {
      this.layerToggleSystem.reset();
      this.inventoryDock.clearSelection();
      this.render();
    });
    this.eventBus.on(EVENTS.LAYER_CHANGED, ({ layer }) => {
      this.layerBtn.classList.toggle('is-memory', layer === 'memory');
      this.render();
    });
  }

  render() {
    const room = this.roomSystem.currentRoom;
    if (!room || !this.sceneEl) return;

    const layer = this.layerToggleSystem.layer;
    const getState = (hotspot) => this.hotspotSystem.resolveState(hotspot, this.sessionStore.state);
    const { physicalLayer, memoryLayer } = renderScene(room, getState);
    this.sceneEl.replaceChildren(physicalLayer, memoryLayer);
    this.sceneEl.dataset.layer = layer;

    this.renderHotspots();
  }

  renderHotspots() {
    const room = this.roomSystem.currentRoom;
    const layer = this.layerToggleSystem.layer;
    const visible = this.hotspotSystem.getVisible(room.hotspots, layer);

    this.hotspotsEl.replaceChildren(
      ...visible.map((hotspot) => {
        const state = this.hotspotSystem.resolveState(hotspot, this.sessionStore.state);
        return h('button', {
          class: `room-hotspot${state === 'open' ? ' is-open' : ''}${state === 'locked' ? ' is-locked' : ''}`,
          style: `left:${hotspot.coords.x}%; top:${hotspot.coords.y}%; width:${hotspot.coords.w}%; height:${hotspot.coords.h}%;`,
          'aria-label': hotspot.id,
          onClick: () => this.handleHotspotClick(hotspot, state),
        });
      }),
    );
  }

  handleHotspotClick(hotspot, state) {
    const action = hotspot.action;
    switch (action.type) {
      case 'narration':
        this.showCaption(t(action.textKey));
        break;

      case 'exit':
        this.showCaption(t(action.textKey));
        setTimeout(() => this.roomSystem.loadRoom(action.targetRoom), 700);
        break;

      case 'terminal':
        this.closeRoomOverlays();
        this.terminalOverlay.open(action.terminalId);
        break;

      case 'puzzle':
        if (state === 'open') {
          this.showCaption(t('hotspot.drawer.labelOpen'));
          break;
        }
        this.closeRoomOverlays();
        this.puzzleOverlay.open(this.puzzleEngine.getPuzzle(action.puzzleId), this.roomSystem.currentRoom.id, {
          onSolved: () => this.handlePuzzleSolved(hotspot),
        });
        break;

      case 'useItem':
        this.handleUseItem(hotspot, action);
        break;

      default:
        console.warn(`[RoomView] unhandled hotspot action type "${action.type}"`);
    }
  }

  handleUseItem(hotspot, action) {
    const selected = this.inventoryDock.selectedItemId;
    this.inventoryDock.clearSelection();

    if (selected === action.requiresItem) {
      this.eventBus.emit(EVENTS.FLAG_SET, { key: `hotspot_opened_${hotspot.id}`, value: true });
      this.showCaption(t(action.onSuccess.textKey));
      this.renderHotspots();
      if (action.onSuccess.cinematicBeat) this.cinematicSystem.playBeat(action.onSuccess.cinematicBeat);
    } else {
      this.showCaption(t(action.onFailure.textKey));
    }
  }

  async handlePuzzleSolved(hotspot) {
    const effects = hotspot.action.onSolve;
    if (!effects) return;

    for (const itemId of effects.grantItems ?? []) this.inventorySystem.collect(itemId);
    this.renderHotspots();

    if (effects.cinematicBeat) await this.cinematicSystem.playBeat(effects.cinematicBeat);

    if (effects.grantClassifiedFile) {
      this.eventBus.emit(EVENTS.CLASSIFIED_FILE_FOUND, { fileId: effects.grantClassifiedFile });
      this.closeRoomOverlays();
      this.readerOverlay.open(effects.grantClassifiedFile);
    }
  }

  showCaption(text) {
    clearTimeout(this.#captionTimer);
    this.captionEl.textContent = text;
    this.captionEl.hidden = false;
    this.captionEl.classList.remove('fade-in');
    // eslint-disable-next-line no-void
    void this.captionEl.offsetWidth; // restart the CSS animation
    this.captionEl.classList.add('fade-in');
    this.#captionTimer = setTimeout(() => {
      this.captionEl.hidden = true;
    }, 4200);
  }
}
