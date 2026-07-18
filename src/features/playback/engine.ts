import { create } from 'zustand';
import { usePlaybackStore, TIMELINE_MAX_YEAR } from '../../store/playbackStore';
import { useEventsStore } from '../../store/eventsStore';
import type { HistoricalEvent } from '../../types/event';

/** Point-in-time events (no end year) stay visually active for this many years so they're reachable during scrubbing/playback. */
export const POINT_EVENT_SPAN_YEARS = 6;

export function getEventSpan(e: HistoricalEvent): [number, number] {
  const end = e.endYear ?? e.startYear + POINT_EVENT_SPAN_YEARS;
  return [e.startYear, Math.max(end, e.startYear)];
}

export interface ActiveEvent {
  event: HistoricalEvent;
  /** 0..1 eased progress of the real-time (duration/speed driven) trigger animation since this event became active. */
  progress: number;
  /** 0..1 position of the playhead within the event's historical year span — drives long-running spread/collapse effects. */
  rawT: number;
}

interface EngineState {
  activeEvents: ActiveEvent[];
  clock: number;
}

export const useActiveEventsStore = create<EngineState>(() => ({ activeEvents: [], clock: 0 }));

const enteredAt = new Map<string, number>();

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

let lastFrameTime: number | null = null;
let rafId: number | null = null;

function tick(now: number) {
  rafId = requestAnimationFrame(tick);
  const dt = lastFrameTime === null ? 0 : (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  const playback = usePlaybackStore.getState();
  if (playback.isPlaying) {
    const next = playback.currentYear + playback.yearsPerSecond * dt;
    if (next >= TIMELINE_MAX_YEAR) {
      usePlaybackStore.setState({ currentYear: TIMELINE_MAX_YEAR, isPlaying: false });
    } else {
      usePlaybackStore.setState({ currentYear: next });
    }
  }

  const currentYear = usePlaybackStore.getState().currentYear;
  const { events } = useEventsStore.getState();

  const stillActiveIds = new Set<string>();
  const activeEvents: ActiveEvent[] = [];

  for (const event of events) {
    const [start, end] = getEventSpan(event);
    if (currentYear < start || currentYear > end) continue;
    stillActiveIds.add(event.id);

    if (!enteredAt.has(event.id)) {
      enteredAt.set(event.id, now);
    }
    const elapsedSeconds = ((now - enteredAt.get(event.id)!) / 1000) * event.speed;
    const rawProgress = event.duration > 0 ? elapsedSeconds / event.duration : 1;
    const progress = easeOutCubic(Math.min(1, Math.max(0, rawProgress)));
    const rawT = end === start ? 1 : Math.min(1, Math.max(0, (currentYear - start) / (end - start)));

    activeEvents.push({ event, progress, rawT });
  }

  for (const id of enteredAt.keys()) {
    if (!stillActiveIds.has(id)) enteredAt.delete(id);
  }

  useActiveEventsStore.setState({ activeEvents, clock: now });
}

export function startPlaybackEngine() {
  if (rafId !== null) return;
  lastFrameTime = null;
  rafId = requestAnimationFrame(tick);
}

export function stopPlaybackEngine() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lastFrameTime = null;
}
