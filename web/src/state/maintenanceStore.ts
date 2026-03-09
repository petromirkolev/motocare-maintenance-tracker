import type { Maintenance } from '../types/maintenance';
import type { MaintenanceLog } from '../types/maintenanceLog';
import { getState, updateState, newId } from './stateStorage';
import { bikeStore } from './bikeStore';
import { appState } from '../types/state';

export function readMaintenanceLogForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const date = String(fd.get('doneAt') ?? '').trim();
  const odo = String(fd.get('odo') ?? '').trim();

  if (!date) throw new Error('Date is required');
  if (!odo) throw new Error('Odo is required');

  return { date, odo };
}

export function getMaintenanceTask(
  bikeId: string,
  name: string,
): Maintenance | undefined {
  return getState().maintenance.find(
    (a: any) => a.bikeId === bikeId && a.name === name,
  );
}

export const maintenanceStore = {
  addMaintenanceTask(input: any, bikeId: string) {
    const maintenanceItem = appState.currentMaintenanceItem;

    const selectedBike = bikeStore.getBike(bikeId);
    if (!selectedBike) throw new Error('No bike selected');

    if (!input.date.trim()) throw new Error('Date is required');
    if (
      !Number.isFinite(Number(input.odo)) ||
      Number(input.odo) < selectedBike.odo
    ) {
      throw new Error('Invalid odometer');
    }

    const currentMaintenanceItem: Maintenance = {
      id: newId(),
      bikeId: selectedBike?.id,
      name: maintenanceItem,
      odo: input.odo,
      date: input.date,
      nextOdo: null,
      nextDate: null,
    };

    const currentMaintenanceLog: MaintenanceLog = currentMaintenanceItem;

    updateState((prev) => ({
      ...prev,
      maintenance: [currentMaintenanceItem, ...prev.maintenance],
      maintenanceLog: [currentMaintenanceLog, ...prev.maintenanceLog],
    }));
  },

  updateMaintenanceTask(
    id: string,
    patch: Partial<Omit<Maintenance, 'id' | 'bikeId' | 'name'>>,
  ) {
    const current = getState().maintenance.find((m) => m.id === id);
    if (!current) throw new Error('Maintenance task not found');
    console.log(current);

    const next: Maintenance = {
      ...current,
      ...patch,
    };

    const currentMaintenanceLog: MaintenanceLog = next;

    updateState((prev) => ({
      ...prev,
      maintenance: prev.maintenance.map((m) => (m.id === id ? next : m)),
      maintenanceLog: [currentMaintenanceLog, ...prev.maintenanceLog],
    }));
  },

  updateTaskInfo(bikeId: string) {
    document.querySelectorAll('.mcard').forEach((cardEl) => {
      const card = cardEl as HTMLElement;

      const taskName = card.dataset.name;
      if (!taskName) return;

      const lastVal = card.querySelector<HTMLElement>(
        '[data-field="last"] .metaVal',
      );
      const dueVal = card.querySelector<HTMLElement>(
        '[data-field="due"] .metaVal',
      );
      if (!lastVal || !dueVal) return;

      const task = getMaintenanceTask(bikeId, taskName);
      if (!task) {
        lastVal.textContent = 'Never logged';
        dueVal.textContent = 'Not done yet';
        return;
      }

      lastVal.textContent =
        task.date && task.odo !== null
          ? `On ${task.date} at ${task.odo} km.`
          : 'Never logged';
    });
  },

  updateRecentHistory() {},

  updateMaintenanceItemProgress() {},

  updateOverallProgress() {},

  schedule() {
    console.log('log scheduled');
  },
};
