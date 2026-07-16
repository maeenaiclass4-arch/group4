/**
 * data/index.js
 * Central content registry. Room/puzzle/terminal JSON files are
 * auto-registered via import.meta.glob (GDD §15) — dropping a new file
 * into rooms/, puzzles/, or terminals/ is enough to make it loadable, no
 * manual index to maintain. The remaining content types are small enough
 * to stay as flat arrays and are just normalized into id-keyed maps here.
 */

function eagerGlobToMap(globResult) {
  const map = new Map();
  for (const mod of Object.values(globResult)) {
    const def = mod.default ?? mod;
    map.set(def.id, def);
  }
  return map;
}

function arrayToMap(arr) {
  return new Map(arr.map((entry) => [entry.id, entry]));
}

const roomModules = import.meta.glob('./rooms/*.json', { eager: true });
const puzzleModules = import.meta.glob('./puzzles/*.json', { eager: true });
const terminalModules = import.meta.glob('./terminals/*.json', { eager: true });

export const rooms = eagerGlobToMap(roomModules);
export const puzzles = eagerGlobToMap(puzzleModules);
export const terminals = eagerGlobToMap(terminalModules);

import itemsArr from './items.json';
import classifiedFilesArr from './classified-files.json';
import notebookEntriesArr from './notebook-entries.json';
import achievementsArr from './achievements.json';
import cinematicsArr from './cinematics.json';

export const items = arrayToMap(itemsArr);
export const classifiedFiles = arrayToMap(classifiedFilesArr);
export const notebookEntries = arrayToMap(notebookEntriesArr);
export const achievements = achievementsArr;
export const cinematics = arrayToMap(cinematicsArr);
