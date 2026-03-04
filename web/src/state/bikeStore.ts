import type { Bike } from '../types/bikes';
import type { StoreState } from '../types/state';

const STORAGE_KEY = 'motocare:v1:bikes';
const listeners = new Set<() => void>();
let state: StoreState = loadBikeState();

function loadBikeState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('No bikes found');
    const parsed = JSON.parse(raw) as StoreState;

    if (!parsed || !Array.isArray(parsed.bikes))
      throw new Error('No bikes found');

    return parsed;
  } catch {
    return { bikes: [] };
  }
}

function saveState(state: StoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function newId(): string {
  return String(Date.now());
}

function notify() {
  saveState(state);
  listeners.forEach((fn) => fn());
}

export function readBikeForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const make = String(fd.get('make') ?? '').trim();
  const model = String(fd.get('model') ?? '').trim();

  const yearRaw = String(fd.get('year') ?? '').trim();
  const year = Number(yearRaw);

  const odoRaw = String(fd.get('odo') ?? '').trim();
  const odo = Number(odoRaw);

  if (!make) throw new Error('Make is required');
  if (!model) throw new Error('Model is required');
  if (!Number.isFinite(year)) throw new Error('Year must be a number');
  if (!Number.isFinite(odo)) throw new Error('Odometer must be a number');

  return { make, year, model, odo };
}

export const bikeStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getBikes(): Bike[] {
    return [...state.bikes];
  },

  getBike(id: string): Bike | undefined {
    return state.bikes.find((b) => b.id === id);
  },

  addBike(input: Omit<Bike, 'id'>): Bike {
    if (!input.make.trim()) throw new Error('Bike name required');
    if (!Number.isFinite(input.year) || input.year < 1900)
      throw new Error('Invalid year');
    if (!input.model.trim()) throw new Error('Bike model required');
    if (!Number.isFinite(input.odo) || input.odo < 0)
      throw new Error('Invalid odometer');

    const bike: Bike = {
      id: newId(),
      make: input.make.trim(),
      year: Math.floor(input.year),
      model: input.model.trim(),
      odo: Math.floor(input.odo),
    };

    state = { ...state, bikes: [bike, ...state.bikes] };
    notify();

    return bike;
  },

  deleteBike(id: string) {
    state = { ...state, bikes: state.bikes.filter((b) => b.id !== id) };
    notify();
  },

  updateBike(id: string, patch: Partial<Omit<Bike, 'id'>>) {
    const current = state.bikes.find((b) => b.id === id);
    if (!current) throw new Error('Bike not found');

    const next: Bike = {
      ...current,
      ...patch,
    };

    if (patch.odo !== undefined && patch.odo < current.odo) {
      throw new Error('Odometer cannot decrease');
    }

    next.make = next.make.trim();
    next.model = next.model.trim();
    next.year = Math.floor(next.year);
    next.odo = Math.floor(next.odo);

    state = {
      ...state,
      bikes: state.bikes.map((b) => (b.id === id ? next : b)),
    };
    notify();
  },

  reset() {
    state = { bikes: [] };
    notify();
  },
};
