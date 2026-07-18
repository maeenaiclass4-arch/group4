import { create } from 'zustand';

export const TIMELINE_MIN_YEAR = -3000;
export const TIMELINE_MAX_YEAR = 2030;

interface PlaybackState {
  currentYear: number;
  isPlaying: boolean;
  /** How many historical years advance per real second while playing. */
  yearsPerSecond: number;
  /** Visible window of the timeline editor, in years. */
  viewStartYear: number;
  viewEndYear: number;

  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (year: number) => void;
  step: (deltaYears: number) => void;
  setYearsPerSecond: (v: number) => void;
  setView: (start: number, end: number) => void;
  zoom: (factor: number, pivotYear?: number) => void;
  pan: (deltaYears: number) => void;
}

const clampYear = (y: number) => Math.min(TIMELINE_MAX_YEAR, Math.max(TIMELINE_MIN_YEAR, y));

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentYear: 610,
  isPlaying: false,
  yearsPerSecond: 20,
  viewStartYear: 550,
  viewEndYear: 1600,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  seek: (year) => set({ currentYear: clampYear(year) }),
  step: (deltaYears) => set((state) => ({ currentYear: clampYear(state.currentYear + deltaYears) })),
  setYearsPerSecond: (v) => set({ yearsPerSecond: Math.max(1, Math.min(500, v)) }),

  setView: (start, end) => {
    const minSpan = 5;
    if (end - start < minSpan) end = start + minSpan;
    set({
      viewStartYear: clampYear(start),
      viewEndYear: clampYear(end),
    });
  },

  zoom: (factor, pivotYear) => {
    const { viewStartYear, viewEndYear } = get();
    const span = viewEndYear - viewStartYear;
    const pivot = pivotYear ?? (viewStartYear + viewEndYear) / 2;
    const newSpan = Math.max(10, Math.min(TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR, span * factor));
    const ratio = (pivot - viewStartYear) / span;
    const newStart = pivot - newSpan * ratio;
    const newEnd = newStart + newSpan;
    get().setView(newStart, newEnd);
  },

  pan: (deltaYears) => {
    const { viewStartYear, viewEndYear } = get();
    get().setView(viewStartYear + deltaYears, viewEndYear + deltaYears);
  },
}));
