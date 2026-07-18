import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoricalEvent, HistoricalEventDraft, Track } from '../types/event';

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

const DEFAULT_TRACKS: Track[] = [
  { id: 'track_political', name: 'political', order: 0, color: '#3f5566' },
  { id: 'track_military', name: 'military', order: 1, color: '#7a2e33' },
  { id: 'track_religious', name: 'religious', order: 2, color: '#2f6b63' },
];

const SEED_EVENTS: HistoricalEvent[] = [
  {
    id: 'evt_hijra',
    trackId: 'track_religious',
    title: 'الهجرة النبوية',
    description: 'هجرة النبي محمد ﷺ من مكة إلى المدينة المنورة، حدث مفصلي أسس بداية التقويم الهجري.',
    startYear: 622,
    endYear: 622,
    region: '682',
    targetRegion: '682',
    animationType: 'migration',
    color: '#a6532f',
    duration: 4,
    speed: 1,
  },
  {
    id: 'evt_badr',
    trackId: 'track_military',
    title: 'غزوة بدر الكبرى',
    description: 'أول معركة فاصلة بين المسلمين وقريش في السنة الثانية للهجرة.',
    startYear: 624,
    endYear: 624,
    region: '682',
    targetRegion: '682',
    animationType: 'battle',
    color: '#8c1f28',
    duration: 3.5,
    speed: 1,
  },
  {
    id: 'evt_rashidun_expansion',
    trackId: 'track_political',
    title: 'اتساع الخلافة الراشدة',
    description: 'توسع الدولة الإسلامية في عهد الخلفاء الراشدين ليشمل بلاد الشام والعراق ومصر وفارس.',
    startYear: 632,
    endYear: 661,
    region: 'rashidun-caliphate',
    animationType: 'empireExpansion',
    color: '#a67c27',
    duration: 6,
    speed: 1,
  },
  {
    id: 'evt_spread_islam',
    trackId: 'track_religious',
    title: 'انتشار الإسلام في شمال أفريقيا',
    description: 'انتشار الدين الإسلامي عبر شمال أفريقيا خلال الفتوحات الأموية.',
    startYear: 647,
    endYear: 711,
    region: 'umayyad-caliphate',
    animationType: 'spreadOfIslam',
    color: '#2f6b63',
    duration: 6,
    speed: 1,
  },
  {
    id: 'evt_andalus_conquest',
    trackId: 'track_military',
    title: 'فتح الأندلس',
    description: 'عبور طارق بن زياد إلى شبه الجزيرة الأيبيرية وفتح الأندلس.',
    startYear: 711,
    endYear: 718,
    region: '504',
    targetRegion: 'al-andalus',
    animationType: 'conquest',
    color: '#7a2e33',
    duration: 4,
    speed: 1,
  },
  {
    id: 'evt_abbasid',
    trackId: 'track_political',
    title: 'قيام الدولة العباسية',
    description: 'سقوط الدولة الأموية وقيام الخلافة العباسية ببغداد.',
    startYear: 750,
    endYear: 750,
    region: 'abbasid-caliphate',
    animationType: 'newKingdom',
    color: '#3f5566',
    duration: 3.5,
    speed: 1,
  },
  {
    id: 'evt_mongol_invasion',
    trackId: 'track_military',
    title: 'سقوط بغداد على يد المغول',
    description: 'اجتياح هولاكو خان لبغداد وسقوط الخلافة العباسية.',
    startYear: 1258,
    endYear: 1258,
    region: 'mongol-empire',
    targetRegion: '368',
    animationType: 'conquest',
    color: '#7a2e33',
    duration: 4,
    speed: 1,
  },
  {
    id: 'evt_abbasid_collapse',
    trackId: 'track_political',
    title: 'انهيار الخلافة العباسية',
    description: 'تفكك السلطة المركزية للخلافة العباسية تدريجياً حتى سقوطها.',
    startYear: 1194,
    endYear: 1258,
    region: 'abbasid-caliphate',
    animationType: 'empireCollapse',
    color: '#5a4a3a',
    duration: 5,
    speed: 1,
  },
  {
    id: 'evt_ottoman_constantinople',
    trackId: 'track_military',
    title: 'فتح القسطنطينية',
    description: 'فتح السلطان محمد الفاتح للقسطنطينية وسقوط الإمبراطورية البيزنطية.',
    startYear: 1453,
    endYear: 1453,
    region: 'ottoman-empire',
    targetRegion: '792',
    animationType: 'conquest',
    color: '#7a2e33',
    duration: 4,
    speed: 1,
  },
  {
    id: 'evt_ottoman_expansion',
    trackId: 'track_political',
    title: 'توسع الدولة العثمانية',
    description: 'اتساع رقعة الدولة العثمانية لتشمل البلقان وشمال أفريقيا وبلاد الشام.',
    startYear: 1453,
    endYear: 1566,
    region: 'ottoman-empire',
    animationType: 'empireExpansion',
    color: '#a67c27',
    duration: 6,
    speed: 1,
  },
  {
    id: 'evt_treaty_westphalia',
    trackId: 'track_political',
    title: 'صلح وستفاليا',
    description: 'معاهدة السلام التي أنهت حرب الثلاثين عاماً في أوروبا وأرست مبدأ سيادة الدول.',
    startYear: 1648,
    endYear: 1648,
    region: '276',
    targetRegion: '250',
    animationType: 'peaceTreaty',
    color: '#1f5c46',
    duration: 3,
    speed: 1,
  },
  {
    id: 'evt_naval_discovery',
    trackId: 'track_political',
    title: 'رحلات الاكتشاف البحرية البرتغالية',
    description: 'الرحلات البحرية البرتغالية حول أفريقيا نحو الهند.',
    startYear: 1497,
    endYear: 1498,
    region: '620',
    targetRegion: '356',
    animationType: 'navalMovement',
    color: '#2e3a59',
    duration: 5,
    speed: 1,
  },
];

interface EventsState {
  tracks: Track[];
  events: HistoricalEvent[];
  selectedEventId: string | null;
  addEvent: (draft: HistoricalEventDraft) => string;
  updateEvent: (id: string, patch: Partial<HistoricalEventDraft>) => void;
  removeEvent: (id: string) => void;
  selectEvent: (id: string | null) => void;
  addTrack: (name: string) => void;
  renameTrack: (id: string, name: string) => void;
  removeTrack: (id: string) => void;
  resetToSeed: () => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      tracks: DEFAULT_TRACKS,
      events: SEED_EVENTS,
      selectedEventId: null,

      addEvent: (draft) => {
        const id = makeId('evt');
        set((state) => ({ events: [...state.events, { ...draft, id }], selectedEventId: id }));
        return id;
      },

      updateEvent: (id, patch) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },

      removeEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
          selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
        }));
      },

      selectEvent: (id) => set({ selectedEventId: id }),

      addTrack: (name) => {
        const { tracks } = get();
        const id = makeId('track');
        set({
          tracks: [...tracks, { id, name, order: tracks.length, color: '#9c7a3d' }],
        });
      },

      renameTrack: (id, name) => {
        set((state) => ({
          tracks: state.tracks.map((t) => (t.id === id ? { ...t, name } : t)),
        }));
      },

      removeTrack: (id) => {
        set((state) => ({
          tracks: state.tracks.filter((t) => t.id !== id),
          events: state.events.filter((e) => e.trackId !== id),
        }));
      },

      resetToSeed: () => set({ tracks: DEFAULT_TRACKS, events: SEED_EVENTS, selectedEventId: null }),
    }),
    { name: 'has-events-store-v1' },
  ),
);
