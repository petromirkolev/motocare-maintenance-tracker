/* Maintenance store manages the maintenance tasks and logs for each bike. It provides functions to add new maintenance logs, update existing ones, and schedule future maintenance tasks. The store also includes logic to calculate due dates and mark tasks as due or overdue based on the last service date and the defined intervals. It interacts with the bike store to ensure that maintenance records are associated with the correct bike. */

import type {
  Maintenance,
  MaintenanceLogInput,
  MaintenanceLogPatch,
  MaintenanceScheduleInput,
  MaintenanceSchedulePatch,
} from '../types/maintenance';
import type { MaintenanceLog } from '../types/maintenance-log';
import { getState, updateState, newId } from './state-storage';
import { bikeStore } from './bike-store';
import { appState } from '../types/state';
import { checkDueStatus } from '../utils/service-due-helper';
import { checkOverdueStatus } from '../utils/service-overdue-helper';
import { checkServiceItemsStatus } from '../utils/service-items-helper';
import { markDueTasks, markOverdueTasks } from '../utils/dom-helper';

export function readMaintenanceLogForm(
  form: HTMLFormElement,
): MaintenanceLogInput {
  const fd = new FormData(form);

  const date: string = String(fd.get('doneAt') ?? '').trim();
  const odoRaw: string = String(fd.get('odo') ?? '').trim();
  const odo = Number(odoRaw);

  if (!date) throw new Error('Date is required');
  if (!odo) throw new Error('Odo is required');

  return { date, odo };
}

export function readMaintenanceScheduleForm(
  form: HTMLFormElement,
): MaintenanceScheduleInput {
  const fd = new FormData(form);

  const intervalDays: string = String(fd.get('intervalDays') ?? '').trim();
  const intervalKmRaw: string = String(fd.get('intervalKm') ?? '').trim();
  const intervalKm = Number(intervalKmRaw);

  if (!intervalDays) throw new Error('Interval days are required');
  if (!intervalKm) throw new Error('Interval kilometers are required');

  return { intervalDays, intervalKm };
}

export function getMaintenanceTask(
  bikeId: string,
  name: string,
): Maintenance | undefined {
  return getState().maintenance.find(
    (a) => a.bikeId === bikeId && a.name === name,
  );
}

export const maintenanceStore = {
  addMaintenanceTask(input: MaintenanceLogInput, bikeId: string) {
    const maintenanceItem = appState.currentMaintenanceItem;

    const selectedBike = bikeStore.getBike(bikeId);
    if (!selectedBike) throw new Error('No bike selected');

    if (!input.odo || !input.date) return;

    if (!input.date.trim()) throw new Error('Date is required');
    if (!Number.isFinite(input.odo) || input.odo < 0) {
      throw new Error('Invalid odometer');
    }

    const currentMaintenanceItem: Maintenance = {
      id: newId(),
      bikeId: selectedBike?.id,
      name: maintenanceItem,
      odo: input.odo,
      date: input.date,
      intervalKm: null,
      intervalDays: null,
    };

    const currentMaintenanceLog: MaintenanceLog = currentMaintenanceItem;

    updateState((prev) => ({
      ...prev,
      maintenance: [currentMaintenanceItem, ...prev.maintenance],
      maintenanceLog: [currentMaintenanceLog, ...prev.maintenanceLog],
    }));
  },

  updateMaintenanceTask(id: string, patch: MaintenanceLogPatch) {
    const current = getState().maintenance.find((m) => m.id === id);
    if (!current) throw new Error('Maintenance task not found');

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
        dueVal.textContent = 'Not scheduled yet';
        return;
      }

      if (task.date && task.odo !== null) {
        lastVal.textContent = `On ${task.date} at ${task.odo} km.`;
      } else {
        lastVal.textContent = 'Never logged';
      }

      if (!task.date || task.odo === null) {
        if (task.intervalDays && task.intervalKm) {
          dueVal.textContent = `Every ${task.intervalDays} days or ${task.intervalKm} km.`;
        } else if (task.intervalDays) {
          dueVal.textContent = `Every ${task.intervalDays} days.`;
        } else if (task.intervalKm) {
          dueVal.textContent = `Every ${task.intervalKm} km.`;
        } else {
          dueVal.textContent = 'Not done yet';
        }
        return;
      }

      const dueParts: string[] = [];

      if (task.intervalDays) {
        const nextDate = new Date(task.date);
        nextDate.setDate(nextDate.getDate() + Number(task.intervalDays));
        dueParts.push(`On ${nextDate.toISOString().slice(0, 10)}`);
      }

      if (task.intervalKm) {
        dueParts.push(`at ${Number(task.intervalKm) + Number(task.odo)} km`);
      }

      dueVal.textContent =
        dueParts.length > 0 ? dueParts.join(' or ') + '.' : 'Not done yet';
    });
  },

  updateOverallProgress(dom: any) {
    const items = getState();

    const selectedBike = appState.selectedBikeId;
    if (!selectedBike) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastServicedItem = items.maintenanceLog.find(
      (item) => item.bikeId === selectedBike,
    );

    const totalServiceItems = items.maintenance.filter((item) =>
      checkServiceItemsStatus(item, selectedBike),
    );

    const totalDueItems = items.maintenance.filter((item) =>
      checkDueStatus(item, selectedBike, today),
    );

    const totalOverdueItems = items.maintenance.filter((item) =>
      checkOverdueStatus(item, selectedBike, today),
    );

    /** Update "Recent History"
     * - If there are maintenance logs, show the most recent one with its date and odo.
     * - If there are no logs, show a message encouraging the user to log their first service.
     */
    if (lastServicedItem !== undefined) {
      dom.maintenanceHistory.querySelector('.empty__title').textContent =
        lastServicedItem.name
          ?.split('-')
          .map((a) => a.toUpperCase())
          .join(' ');
      dom.maintenanceHistory.querySelector('.empty__sub').textContent =
        `Done on ${lastServicedItem.date} @ ${lastServicedItem.odo} km.`;
    } else {
      dom.maintenanceHistory.querySelector('.empty__title').textContent =
        'No service history yet';
      dom.maintenanceHistory.querySelector('.empty__sub').textContent =
        'Log a service to start building your maintenance timeline.';
    }

    /* Update Overdue / Due Soon / On Track */
    dom.maintenanceOnTrack.textContent =
      totalServiceItems.length - totalOverdueItems.length;
    dom.maintenanceDueSoon.textContent = totalDueItems.length;
    dom.maintenanceOverdue.textContent = totalOverdueItems.length;

    /* Mark overdue tasks with red and due soon tasks with orange in the maintenance list. */
    markOverdueTasks(totalOverdueItems);
    markDueTasks(totalDueItems);
  },

  scheduleTask(
    bikeId: string,
    currentTask: string,
    patch: MaintenanceSchedulePatch,
  ) {
    const current = getState().maintenance.find((item) => {
      return item.bikeId === bikeId && item.name === currentTask;
    });

    if (!current) {
      const created: Maintenance = {
        id: newId(),
        bikeId,
        name: currentTask,
        date: null,
        odo: null,
        intervalKm: patch.intervalKm ?? null,
        intervalDays: patch.intervalDays ?? null,
      };

      updateState((prev) => ({
        ...prev,
        maintenance: [created, ...prev.maintenance],
      }));

      return created;
    }

    const next: Maintenance = {
      ...current,
      ...patch,
    };

    updateState((prev) => ({
      ...prev,
      maintenance: prev.maintenance.map((item) =>
        item.id === current.id ? next : item,
      ),
    }));

    return next;
  },
};
