import { msg } from '../../../constants/constants';
import type { Bike } from '../types/bikes';
import { getState, setState } from './state-store';

export function readBikeForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const make: string = String(fd.get('make') ?? '').trim();
  const model: string = String(fd.get('model') ?? '').trim();

  const yearRaw: string = String(fd.get('year') ?? '').trim();
  const year: number = Number(yearRaw);

  const odoRaw: string = String(fd.get('odo') ?? '').trim();
  const odo: number = Number(odoRaw);

  if (!make) throw new Error(msg.BIKE_MAKE_REQ);
  if (!model) throw new Error(msg.BIKE_MODEL_REQ);
  if (!year) throw new Error(msg.BIKE_YEAR_REQ);
  if (!Number.isFinite(year)) throw new Error(msg.BIKE_YEAR_NUM);
  if (!Number.isFinite(odo)) throw new Error(msg.BIKE_ODO_NUM);

  return { make, year, model, odo };
}

export const bikeStore = {
  getBikes(): Bike[] {
    return [...getState().bikes];
  },

  getBike(id: string): Bike | undefined {
    return getState().bikes.find((b) => b.id === id);
  },

  reset() {
    setState({ bikes: [], maintenance: [], maintenanceLog: [] });
  },
};
